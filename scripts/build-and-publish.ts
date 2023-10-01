import * as path from "https://deno.land/std@0.203.0/path/mod.ts";
import * as fs from "https://deno.land/std@0.203.0/fs/mod.ts";
import mime from "npm:mime";
import { S3Client } from "https://deno.land/x/s3_lite_client@0.6.1/mod.ts";
import {
	ClientOptions,
	ObjectMetadata,
} from "https://deno.land/x/s3_lite_client@0.6.1/client.ts";

const __dirname = new URL(".", import.meta.url).pathname;

async function betterExists(path: string) {
	try {
		return await fs.exists(path);
	} catch (err) {
		return false;
	}
}

async function makeBuild() {
	// return "/home/maki/git/mechanyx-coil/src-tauri/target/release/bundle/";

	const bundleDir = path.resolve(
		__dirname,
		"../src-tauri/target/release/bundle",
	);

	if (await betterExists(bundleDir)) {
		await Deno.remove(bundleDir, {
			recursive: true,
		});
	}

	const build = await new Deno.Command("yarn", {
		args: ["tauri", "build"],
		cwd: path.resolve(__dirname, ".."),
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
	region: "us-east-1", // default for minio lmao
};

const allowedExts = [".AppImage", ".tar.gz", ".sig"];

const isWindows = Deno.build.os == "windows";

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

const tarGzFile = filesToUpload.find(f => f.name.endsWith(".tar.gz"));
if (tarGzFile == null) throw new Error("Failed to find .tar.gz file");

const tarGzSigFile = filesToUpload.find(f => f.name.endsWith(".tar.gz.sig"));
if (tarGzSigFile == null) throw new Error("Failed to find .tar.gz.sig file");

const updateFileUrl =
	"https://" +
	minio.endPoint +
	"/" +
	minio.bucket +
	"/launcher/" +
	tarGzFile?.name;

const updateFileJson = {
	version,
	pub_date: new Date().toISOString(),
	url: updateFileUrl,
	signature: new TextDecoder().decode(tarGzSigFile.buffer),
	notes: "No release notes",
};

const updateFilename = Deno.build.os + ".json";

filesToUpload.push({
	name: updateFilename,
	buffer: new TextEncoder().encode(JSON.stringify(updateFileJson, null, 4)),
});

// upload files

const s3Client = new S3Client({
	...minio,
	pathStyle: true,
});

for (const file of filesToUpload) {
	const object = "launcher/" + file.name;

	let metadata: ObjectMetadata = {
		"Content-Type":
			mime.getType(path.extname(file.name)) ?? "binary/octet-stream",
	};

	if (file.noCache) {
		metadata["Cache-Control"] = "no-cache";
	}

	await s3Client.putObject(object, file.buffer, {
		bucketName: minio.bucket,
		metadata,
	});

	console.log("Uploaded: " + file.name);
}