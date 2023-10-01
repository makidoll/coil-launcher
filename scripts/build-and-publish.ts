import * as path from "https://deno.land/std@0.203.0/path/mod.ts";
import * as fs from "https://deno.land/std@0.203.0/fs/mod.ts";
import mime from "npm:mime";
import { S3Client } from "https://deno.land/x/s3_lite_client@0.6.1/mod.ts";
import {
	ClientOptions,
	ObjectMetadata,
} from "https://deno.land/x/s3_lite_client@0.6.1/client.ts";

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
	// return "/home/maki/git/mechanyx-coil/src-tauri/target/release/bundle/";
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

const minio: ClientOptions = {
	bucket: "mechanyx-coil",
	endPoint: "minio.hotmilk.space",
	accessKey: "coil-launcher-put",
	secretKey: "fg2DVcFlgQmz5LYc1RxgigIs8VP57tSwIAJzAw9p",
	port: 443,
	useSSL: true,
	region: "",
	pathStyle: true,
};

const allowedExts = [".AppImage", ".tar.gz", ".sig", ".zip", ".exe"];

const bundleDir = path.resolve(
	await makeBuild(),
	isWindows ? "nsis" : "appimage",
);

const filesToUpload: {
	name: string;
	buffer: Uint8Array;
	noCache?: boolean;
}[] = [];

for await (const file of Deno.readDir(bundleDir)) {
	if (!file.isFile) continue;

	for (const ext of allowedExts) {
		if (!file.name.endsWith(ext)) continue;

		const buffer = await Deno.readFile(path.resolve(bundleDir, file.name));

		filesToUpload.push({
			name: file.name,
			buffer,
		});
	}
}

// make update json file

const version = JSON.parse(
	await Deno.readTextFile(
		path.resolve(__dirname, "../src-tauri/tauri.conf.json"),
	),
).package.version;

const updateFileExt = isWindows ? ".zip" : ".tar.gz";

const updateFile = filesToUpload.find(f => f.name.endsWith(updateFileExt));
if (updateFile == null) throw new Error(`Failed to find ${updateFileExt} file`);

const updateSigFile = filesToUpload.find(f =>
	f.name.endsWith(updateFileExt + ".sig"),
);

if (updateSigFile == null) {
	throw new Error(`Failed to find ${updateFileExt}.sig file`);
}

const updateFileUrl =
	"https://" +
	minio.endPoint +
	"/" +
	minio.bucket +
	"/launcher/" +
	updateFile?.name;

const updateFileJson = {
	version,
	pub_date: new Date().toISOString(),
	url: updateFileUrl,
	signature: new TextDecoder().decode(updateSigFile.buffer),
	notes: "No release notes",
};

const updateFilename = Deno.build.os + ".json";

filesToUpload.push({
	name: updateFilename,
	buffer: new TextEncoder().encode(JSON.stringify(updateFileJson, null, 4)),
});

// upload files

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
