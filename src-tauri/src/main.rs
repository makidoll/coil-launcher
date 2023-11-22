// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::env;
use std::fs;
use std::io::Cursor;
use std::io::Write;
use std::path::PathBuf;

use futures_util::StreamExt;
use serde::Serialize;
use std::process::{Command, Stdio};
use tauri::{AppHandle, Manager};

// https://tauri.app/v1/guides/features/command/

fn get_install_path_as_pathbuf(app_handle: &AppHandle, slug: &String) -> Result<PathBuf, String> {
    let app_local_data_dir = app_handle.path_resolver().app_local_data_dir().unwrap();
    let install_path = app_local_data_dir.as_path().join(slug.as_str());
    return Ok(install_path);
}

#[tauri::command]
fn get_install_path(app_handle: AppHandle, slug: String) -> Result<String, String> {
    let path = get_install_path_as_pathbuf(&app_handle, &slug)?;
    return Ok(path.into_os_string().into_string().unwrap());
}

#[derive(Serialize, Clone)]
pub struct Progress {
    pub slug: String,
    pub percentage: u8,
}

fn emit_progress(app_handle: &AppHandle, slug: &String, percentage: u8) {
    app_handle
        .emit_all(
            "download-progress",
            Progress {
                slug: slug.clone(),
                percentage,
            },
        )
        .unwrap()
}

#[tauri::command]
async fn install_or_update_game(
    app_handle: AppHandle,
    slug: String,
    download_url: String,
) -> Result<String, String> {
    let install_path = get_install_path_as_pathbuf(&app_handle, &slug)?;

    // delete all files and make folder

    let _ = fs::remove_dir_all(&install_path);
    let _ = fs::create_dir_all(&install_path);

    // get zip file

    let res = reqwest::get(download_url)
        .await
        .map_err(|err| err.to_string())?;

    let content_length: usize = res.content_length().unwrap().try_into().unwrap();

    let mut downloaded: usize = 0;
    let mut stream = res.bytes_stream();

    let mut buffer = Cursor::new(vec![0; content_length]);

    while let Some(item) = stream.next().await {
        let chunk = item.map_err(|err| err.to_string())?;
        buffer.write_all(&chunk).map_err(|err| err.to_string())?;
        downloaded += chunk.len();

        let percentage = (downloaded as f32 / content_length as f32 * 50.0) as u8;
        emit_progress(&app_handle, &slug, percentage);
    }

    // unzip file

    let mut archive = zip::ZipArchive::new(buffer).map_err(|err| err.to_string())?;
    let archive_length = archive.len();

    let mut final_size: u64 = 0;

    for i in 0..archive_length {
        let file = archive.by_index(i).map_err(|err| err.to_string())?;
        final_size += file.size()
    }

    let mut unarchived_size: u64 = 0;

    for i in 0..archive_length {
        let mut file = archive.by_index(i).map_err(|err| err.to_string())?;

        let file_name = file.enclosed_name().unwrap().to_path_buf();

        if file.is_file() {
            // make path if missing first

            let file_path = install_path.as_path().join(&file_name);
            let file_dir = file_path.parent().unwrap();
            let _ = fs::create_dir_all(file_dir);

            let mut out_file = fs::File::create(&file_path).unwrap();
            std::io::copy(&mut file, &mut out_file).unwrap();

            // set file permissions as well
            #[cfg(unix)]
            {
                use std::os::unix::fs::PermissionsExt;

                if let Some(mode) = file.unix_mode() {
                    fs::set_permissions(&file_path, fs::Permissions::from_mode(mode)).unwrap();
                }
            }
        } else if file.is_dir() {
            let _ = fs::create_dir_all(&file_name);

            // set file permissions as well
            #[cfg(unix)]
            {
                use std::os::unix::fs::PermissionsExt;

                if let Some(mode) = file.unix_mode() {
                    fs::set_permissions(&file_name, fs::Permissions::from_mode(mode)).unwrap();
                }
            }
        }

        unarchived_size += file.size();

        // let percentage = (i as f32 / archive_length as f32 * 50.0) as u8 + 50;
        let percentage = (unarchived_size as f32 / final_size as f32 * 50.0) as u8 + 50;

        emit_progress(&app_handle, &slug, percentage);
    }

    return Ok(install_path.into_os_string().into_string().unwrap());
}

#[tauri::command]
async fn delete_game(app_handle: AppHandle, slug: String) -> Result<(), String> {
    let install_path = get_install_path_as_pathbuf(&app_handle, &slug)?;
    fs::remove_dir_all(&install_path).map_err(|err| err.to_string())?;
    return Ok(());
}

#[tauri::command]
async fn launch_game(
    app_handle: AppHandle,
    slug: String,
    auth_token: String,
) -> Result<(), String> {
    let install_path = get_install_path_as_pathbuf(&app_handle, &slug)?;

    let files = fs::read_dir(&install_path).map_err(|err| err.to_string())?;

    let mut found_exe = String::new();

    for entry in files {
        let file = entry.map_err(|err| err.to_string())?;
        let file_type = file.file_type().map_err(|err| err.to_string())?;

        if !file_type.is_file() {
            continue;
        }

        let file_name = file.file_name().into_string().unwrap();

        // unless we end up having a game called crash something lol
        if file_name.to_lowercase().contains("crash") {
            continue;
        }

        #[cfg(target_os = "windows")]
        {
            if file_name.ends_with(".exe") {
                found_exe = file_name;
            }
        }

        #[cfg(target_os = "linux")]
        {
            if file_name.ends_with(".x86_64") {
                found_exe = file_name;
            }
        }
    }

    if found_exe.is_empty() {
        return Err("Failed to find executable".to_string());
    }

    let exe_path = install_path.as_path().join(found_exe);

    println!(
        "Launching {}",
        exe_path.clone().into_os_string().into_string().unwrap()
    );

    #[cfg(unix)]
    {
        use std::os::unix::fs::PermissionsExt;
        fs::set_permissions(&exe_path, fs::Permissions::from_mode(0o755)).unwrap();
    }

    let _ = Command::new(&exe_path)
        .stdin(Stdio::null())
        .stdout(Stdio::null())
        .stderr(Stdio::null())
        .env("COIL_AUTH_TOKEN", auth_token)
        .spawn()
        .map_err(|err| err.to_string())?;

    return Ok(());
}

fn main() {
    if env::consts::OS == "linux" {
        // https://github.com/tauri-apps/tauri/issues/5143
        // https://bugs.webkit.org/show_bug.cgi?id=180739
        env::set_var("WEBKIT_DISABLE_COMPOSITING_MODE", "1");
    }

    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            get_install_path,
            install_or_update_game,
            delete_game,
            launch_game,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
