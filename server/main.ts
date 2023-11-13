import { Context, Hono } from "hono";
import { getMimeType } from "hono/mime";
import * as path from "path";
import PocketBase from "pocketbase";
import { launcherRoutes } from "./launcher-routes.ts";
import { indexRoutes } from "./index-routes.ts";

const __dirname = new URL(".", import.meta.url).pathname;

const pb = new PocketBase("https://coil.mechanyx.co/pb");
const app = new Hono();

app.route("/", launcherRoutes(pb));
app.route("/", indexRoutes());

app.get("*", async (c: Context) => {
	const url = new URL(c.req.url);
	const filename = decodeURI(url.pathname).replace(/^\//, "");
	const filePath = path.resolve(__dirname, "static", filename);

	try {
		const file = await Deno.open(filePath);
		const mimeType = getMimeType(filePath);
		if (mimeType) {
			c.header("Content-Type", mimeType);
		}
		return c.body(file.readable);
	} catch (error) {}
});

Deno.serve(app.fetch);
