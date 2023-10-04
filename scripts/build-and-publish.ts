import * as fs from "https://deno.land/std@0.203.0/fs/mod.ts";
import * as path from "https://deno.land/std@0.203.0/path/mod.ts";
import PocketBase, { ClientResponseError, RecordModel } from "npm:pocketbase";

const __dirname = path.dirname(path.fromFileUrl(import.meta.url));

const isWindows = Deno.build.os == "windows";

async function betterExists(path: string) {
	try {
		return await fs.exists(path);
	} catch (err) {
		return false;
	}
}

async function makeBuild() {
	return "/home/maki/git/mechanyx-coil/src-tauri/target/release/bundle/";
	// return "C:\\git\\coil\\src-tauri\\target\\release\\bundle\\";

	const bundleDir = path.resolve(
		__dirname,
		"../src-tauri/target/release/bundle",
	);

	if (await betterExists(bundleDir)) {
		await Deno.remove(bundleDir, {
			recursive: true,
		});
	}

	const cwd = path.resolve(__dirname, "..");

	const installArgs = ["yarn"];
	if (isWindows) installArgs.unshift("cmd", "/c");

	await new Deno.Command(installArgs[0], {
		args: installArgs.slice(1),
		cwd,
	}).output();

	const buildArgs = ["yarn", "tauri", "build"];
	if (isWindows) buildArgs.unshift("cmd", "/c");

	const build = await new Deno.Command(buildArgs[0], {
		args: buildArgs.slice(1),
		cwd,
		stdout: "inherit",
		stderr: "inherit",
		env: {
			TAURI_PRIVATE_KEY:
				"dW50cnVzdGVkIGNvbW1lbnQ6IHJzaWduIGVuY3J5cHRlZCBzZWNyZXQga2V5ClJXUlRZMEl5MXJVL3ZyMXFwM0pmdU9idWp5OGd6Z3l1WDYrUEZZNXNZSmhBQWdqTVRiRUFBQkFBQUFBQUFBQUFBQUlBQUFBQVdJSXNGV3UyM1hOVDFCUVpTQ3BoMG9XRWtsdWZIOWtGY3RyRkJjOU9rVUdMTEIxaEZqU3F3Znp0cUdVeC9PWlFqcEhxN0x1L2FDWk5vZGdHampSbXZlTzVXZ0pQUE1xalRNVEJNaTFnWVdldGphajUySU81UVlHTzIzbmlIdkNCUFpXRFc3OTdPMjA9Cg==",
			TAURI_KEY_PASSWORD: "",
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

// make update json file

const version = JSON.parse(
	await Deno.readTextFile(
		path.resolve(__dirname, "../src-tauri/tauri.conf.json"),
	),
).package.version;

/*
const updateFileExt = isWindows ? ".zip" : ".tar.gz";

const updateFile = filesToUpload.find(f => f.name.endsWith(updateFileExt));
if (updateFile == null) throw new Error(`Failed to find ${updateFileExt} file`);

const updateSigFile = filesToUpload.find(f =>
	f.name.endsWith(updateFileExt + ".sig"),
);

if (updateSigFile == null) {
	throw new Error(`Failed to find ${updateFileExt}.sig file`);
}

const updateFileJson = {
	version,
	pub_date: new Date().toISOString(),
	url: updateFileUrl,
	signature: new TextDecoder().decode(updateSigFile.buffer),
	notes: "",
};

const updateFilename = Deno.build.os + ".json";

filesToUpload.push({
	name: updateFilename,
	buffer: new TextEncoder().encode(JSON.stringify(updateFileJson, null, 4)),
});
*/

// upload files

/*
const s3Client = new S3Client(minio);

for (const file of filesToUpload) {
	const object = "launcher/" + file.name;

	let metadata: ObjectMetadata = {
		"Content-Type":
			mime.getType(path.extname(file.name)) ?? "binary/octet-stream",
	};

	if (file.noCache) {
		metadata["Cache-Control"] = "no-cache";
	}

	try {
		await s3Client.putObject(object, file.buffer, {
			metadata,
		});

		console.log("Uploaded: " + file.name);
	} catch (error) {
		console.error(error);
	}
}
*/

// init pocketbase

const pb = new PocketBase("https://coil.mechanyx.co");

await pb.admins.authWithPassword(
	"build@mechanyx.localhost",
	"fcDVeV0CxONEYU7gJNSvOElPYlMQ9jH7",
);

const launcher = pb.collection("launcher");

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
	{ ext: ".exe", attr: "nsis_setup" },
	{ ext: ".exe.zip", attr: "nsis_update" },
	{ ext: ".exe.zip.sig", attr: "nsis_sig", text: true },
	{ ext: ".AppImage", attr: "appimage_setup" },
	{ ext: ".AppImage.tar.gz", attr: "appimage_update" },
	{ ext: ".AppImage.tar.gz.sig", attr: "appimage_sig", text: true },
];

let versionEntry = await getDbEntry(version);

for (const { ext, attr, text } of fileExtToAttributeMap) {
	const filename = filesInBundleDir.find(name => name.endsWith(ext));
	if (filename == null) continue;

	const filePath = path.resolve(bundleDir, filename);

	const formData = new FormData();

	if (text) {
		formData.set(attr, await Deno.readTextFile(filePath), filename);
	} else {
		formData.set(attr, new Blob([await Deno.readFile(filePath)]), filename);
	}

	versionEntry = await launcher.update(versionEntry.id, formData);
	console.log("Uploaded: " + filename);
}

// upload!

console.log(versionEntry);
