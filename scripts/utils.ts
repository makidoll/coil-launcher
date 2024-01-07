import * as path from "https://deno.land/std@0.203.0/path/mod.ts";

export function getDirname(importMeta: ImportMeta) {
	return path.dirname(path.fromFileUrl(importMeta.url));
}

export async function prettier(pathToFile: string) {
	const installArgs = ["prettier", "-w", pathToFile];
	if (Deno.build.os == "windows") installArgs.unshift("cmd", "/c");

	await new Deno.Command(installArgs[0], {
		args: installArgs.slice(1),
		cwd: path.resolve(getDirname(import.meta), "../"),
	}).output();
}
