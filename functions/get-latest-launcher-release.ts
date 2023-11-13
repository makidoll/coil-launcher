import { Application, Context } from "https://deno.land/x/oak@v12.6.1/mod.ts";
import PocketBase from "npm:pocketbase";

const pbUrl = "https://coil.mechanyx.co";
const pb = new PocketBase(pbUrl);
const launcher = pb.collection("launcher");

const app = new Application();

const osPrefixMap: { [os: string]: string } = {
	windows: "nsis",
	linux: "appimage",
};

const osKeys = Object.keys(osPrefixMap);

function json(ctx: Context, obj: any) {
	ctx.response.headers.set("Content-Type", "application/json");
	ctx.response.body = JSON.stringify(obj);
}

async function handleLauncherUpdate(ctx: Context, url: URL) {
	const reqOs = url.searchParams.get("os") ?? "";

	if (!osKeys.includes(reqOs)) {
		ctx.response.status = 404;
		json(ctx, {
			error: "Add ?os= parameter of: " + osKeys.join(", "),
		});
		return;
	}

	const latest = await launcher.getFirstListItem(
		`${osPrefixMap[reqOs]}Update != ""`,
		{ sort: "-created" },
	);

	if (latest == null) {
		ctx.response.status = 404;
		json(ctx, { error: "No releases found" });
		return;
	}

	const updateUrl =
		pbUrl +
		"/api/files/" +
		latest.collectionId +
		"/" +
		latest.id +
		"/" +
		latest[osPrefixMap[reqOs] + "Update"];

	json(ctx, {
		version: latest.version,
		pub_date: new Date(latest.created).toISOString(),
		url: updateUrl,
		signature: latest[osPrefixMap[reqOs] + "Sig"],
		notes: "",
	});
}

async function handleLauncherDownload(ctx: Context, reqOs: string) {
	const latest = await launcher.getFirstListItem(
		`${osPrefixMap[reqOs]}Setup != ""`,
		{ sort: "-created" },
	);

	if (latest == null) {
		ctx.response.status = 404;
		json(ctx, { error: "No releases found" });
		return;
	}

	const setupUrl =
		pbUrl +
		"/api/files/" +
		latest.collectionId +
		"/" +
		latest.id +
		"/" +
		latest[osPrefixMap[reqOs] + "Setup"];

	// json(ctx, { url: setupUrl });

	ctx.response.redirect(setupUrl);
}

app.use(async ctx => {
	const url = new URL(ctx.request.url);

	if (url.pathname == "/api/launcher/latest") {
		return await handleLauncherUpdate(ctx, url);
	}

	const os = url.pathname.replace(/^\/download\//, "");
	if (osKeys.includes(os)) {
		return await handleLauncherDownload(ctx, os);
	}

	ctx.response.status = 404;
	json(ctx, { error: "Not found" });
});

const port = 8080;
console.log("Listening on 0.0.0.0:" + port);

await app.listen({ port });
