import * as path from "https://deno.land/std@0.203.0/path/mod.ts";

const __dirname = new URL(".", import.meta.url).pathname;

const date = new Date();
const version =
	date.getFullYear() +
	"." +
	(date.getMonth() + 1) +
	"." +
	date.getDate() +
	"-t" +
	date.getHours() +
	"." +
	date.getMinutes();

async function prettier(path: string) {
	await new Deno.Command("prettier", {
		args: ["-w", path],
		cwd: __dirname,
	}).output();
}

{
	const jsonPath = path.resolve(__dirname, "../package.json");
	const json = JSON.parse(await Deno.readTextFile(jsonPath));
	json.version = version;
	await Deno.writeTextFile(jsonPath, JSON.stringify(json));
	prettier(jsonPath);
}

{
	const jsonPath = path.resolve(__dirname, "../src-tauri/tauri.conf.json");
	const json = JSON.parse(await Deno.readTextFile(jsonPath));
	json.package.version = version;
	await Deno.writeTextFile(jsonPath, JSON.stringify(json, null, 4));
	prettier(jsonPath);
}

{
	const tomlPath = path.resolve(__dirname, "../src-tauri/Cargo.toml");
	let toml = await Deno.readTextFile(tomlPath);
	let tomlPackage = (toml.match(/\[package\][^]+?\n\[/i) as string[])[0];
	tomlPackage = tomlPackage.replace(
		/\nversion\s=\s\"[^]+?\"\s?\n/i,
		'\nversion = "' + version + '"\n',
	);
	toml = toml.replace(/\[package\][^]+?\n\[/i, tomlPackage);
	await Deno.writeTextFile(tomlPath, toml);
}

console.log("Updated 3 files to version: " + version);
