import { Context, Hono } from "hono";
import { getMimeType } from "hono/mime";
import * as path from "path";
import * as dotenv from "dotenv";
import PocketBase from "pocketbase";
import { apiLauncherRoutes } from "./api-launcher-routes.ts";
import { indexRoutes } from "./index-routes.ts";

const env = await dotenv.load({ allowEmptyValues: true });

function getEnvOrFail(key: string) {
	const value = Deno.env.get(key) ?? env[key];
	if (value == null) {
		console.log(key + " not set");
		Deno.exit(1);
	}
	return value;
}

const __dirname = new URL(".", import.meta.url).pathname;

const pb = new PocketBase("https://coil.mechanyx.co/pb");
await pb.admins.authWithPassword(
	getEnvOrFail("PB_PUBLISH_EMAIL"),
	getEnvOrFail("PB_PUBLISH_PASSWORD"),
);

const app = new Hono();

app.route("/", apiLauncherRoutes(pb));

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
