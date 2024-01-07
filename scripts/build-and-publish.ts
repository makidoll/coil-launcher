import * as dotenv from "https://deno.land/std@0.203.0/dotenv/mod.ts";
import * as fs from "https://deno.land/std@0.203.0/fs/mod.ts";
import * as path from "https://deno.land/std@0.203.0/path/mod.ts";
import PocketBase, { ClientResponseError, RecordModel } from "npm:pocketbase";
import { getDirname, prettier } from "./utils.ts";

const env = await dotenv.load({ allowEmptyValues: true });

function getEnvOrFail(key: string) {
	const value = Deno.env.get(key) ?? env[key];
	if (value == null) {
		console.log(key + " not set");
		Deno.exit(1);
	}
	return value;
}

const __dirname = getDirname(import.meta);

const isWindows = Deno.build.os == "windows";

const debug = false;

async function betterExists(path: string) {
	try {
		return await fs.exists(path);
	} catch (err) {
		return false;
	}
}

async function makeBuild() {
	// return "/home/maki/git/mechanyx-coil/src-tauri/target/release/bundle/";
	// return "C:\\git\\coil\\src-tauri\\target\\release\\bundle\\";

	const bundleDir = path.resolve(
		__dirname,
		"../src-tauri/target/" + (debug ? "debug" : "release") + "/bundle",
	);

	if (await betterExists(bundleDir)) {
		await Deno.remove(bundleDir, {
			recursive: true,
		});
	}

	const cwd = path.resolve(__dirname, "..");

	const installArgs = ["pnpm", "install", "--frozen-lockfile"];
	if (isWindows) installArgs.unshift("cmd", "/c");

	await new Deno.Command(installArgs[0], {
		args: installArgs.slice(1),
		cwd,
		stdout: "inherit",
		stderr: "inherit",
	}).output();

	const buildArgs = ["pnpm", "tauri", "build", ...(debug ? ["--debug"] : [])];
	if (isWindows) buildArgs.unshift("cmd", "/c");

	const build = await new Deno.Command(buildArgs[0], {
		args: buildArgs.slice(1),
		cwd,
		stdout: "inherit",
		stderr: "inherit",
		env: {
			TAURI_PRIVATE_KEY: getEnvOrFail("TAURI_PRIVATE_KEY"),
			TAURI_KEY_PASSWORD: getEnvOrFail("TAURI_KEY_PASSWORD"),
		},
	}).output();

	if (!build.success) {
		Deno.exit(1);
	}

	return bundleDir;
}

// https://tauri.app/v1/guides/distribution/updater

const bundleDir = path.resolve(
	await makeBuild(),
	isWindows ? "nsis" : "appimage",
);

const version = JSON.parse(
	await Deno.readTextFile(
		path.resolve(__dirname, "../src-tauri/tauri.conf.json"),
	),
).package.version;

// init pocketbase

const pb = new PocketBase("https://coil.mechanyx.co/pb");

await pb.admins.authWithPassword(
	getEnvOrFail("PB_PUBLISH_EMAIL"),
	getEnvOrFail("PB_PUBLISH_PASSWORD"),
);

const launcher = pb.collection("launcher_builds");

async function getDbEntry(version: string): Promise<RecordModel> {
	try {
		return await launcher.getFirstListItem('version="' + version + '"');
	} catch (error) {
		if (error instanceof ClientResponseError && error.data.code == 404) {
			return await launcher.create({ version });
		} else {
			throw error;
		}
	}
}

// find files and map them

const filesInBundleDir: string[] = [];
for await (const filename of Deno.readDir(bundleDir)) {
	if (filename.isFile) filesInBundleDir.push(filename.name);
}

const fileExtToAttributeMap = [
	{ ext: ".exe", attr: "nsisSetup" },
	{ ext: ".nsis.zip", attr: "nsisUpdate" },
	{ ext: ".nsis.zip.sig", attr: "nsisSig", text: true },
	{ ext: ".AppImage", attr: "appimageSetup" },
	{ ext: ".AppImage.tar.gz", attr: "appimageUpdate" },
	{ ext: ".AppImage.tar.gz.sig", attr: "appimageSig", text: true },
];

// update public key

{
	const jsonPath = path.resolve(__dirname, "../src-tauri/tauri.conf.json");
	const json = JSON.parse(await Deno.readTextFile(jsonPath));
	json.tauri.updater.pubkey = getEnvOrFail("TAURI_PUBLIC_KEY");
	await Deno.writeTextFile(jsonPath, JSON.stringify(json, null, 4));
	prettier(jsonPath);
}

// create or update record

let versionRecord = await getDbEntry(version);

const formData = new FormData();

for (const { ext, attr, text } of fileExtToAttributeMap) {
	const filename = filesInBundleDir.find(name => name.endsWith(ext));
	if (filename == null) continue;

	if (versionRecord[attr] != "") {
		console.log(
			`Error: Already uploaded "${attr}" to version "${version}"`,
		);
		Deno.exit(1);
	}

	const filePath = path.resolve(bundleDir, filename);

	if (text) {
		formData.set(attr, await Deno.readTextFile(filePath), filename);
	} else {
		formData.set(attr, new Blob([await Deno.readFile(filePath)]), filename);
	}

	console.log("Adding: " + filename);
}

console.log("Uploading...");
versionRecord = await launcher.update(versionRecord.id, formData);

// upload!

console.log(versionRecord);
