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

	const latestFound = await launcher.getList(1, 1, { sort: "-created" });

	if (latestFound.totalItems == 0) {
		ctx.response.status = 404;
		json(ctx, { error: "No releases found" });
		return;
	}

	const latest = latestFound.items[0];

	const updateUrl =
		pbUrl +
		"/api/files/" +
		latest.collectionId +
		"/" +
		latest.id +
		"/" +
		latest[osPrefixMap[reqOs] + "_update"];

	json(ctx, {
		version: latest.version,
		pub_date: latest.created,
		url: updateUrl,
		signature: latest[osPrefixMap[reqOs] + "_sig"],
		notes: "",
	});
}

async function handleLauncherDownload(ctx: Context, os: string) {
	const latestFound = await launcher.getList(1, 1, { sort: "-created" });

	if (latestFound.totalItems == 0) {
		ctx.response.status = 404;
		json(ctx, { error: "No releases found" });
		return;
	}

	const latest = latestFound.items[0];

	const setupUrl =
		pbUrl +
		"/api/files/" +
		latest.collectionId +
		"/" +
		latest.id +
		"/" +
		latest[osPrefixMap[os] + "_setup"];

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
