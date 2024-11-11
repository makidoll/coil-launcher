import { Context, Hono } from "hono";
import PocketBase from "pocketbase";

export function apiLauncherRoutes(pb: PocketBase) {
	const launcher = pb.collection("launcher_builds");

	const osPrefixMap: { [os: string]: string } = {
		windows: "nsis",
		linux: "appimage",
	};

	const osKeys = Object.keys(osPrefixMap);

	const app = new Hono();

	app.get("/api/launcher/latest", async (c: Context) => {
		const os = c.req.query("os") ?? "";
		if (!osKeys.includes(os)) {
			return c.json(
				{ error: "Invalid 'os' query: " + osKeys.join(", ") },
				404,
			);
		}

		const latest = await launcher.getFirstListItem(
			`${osPrefixMap[os]} != ""`,
			{ sort: "-created" },
		);

		if (latest == null) {
			return c.json({ error: "No releases found" }, 404);
		}

		const updateUrl = pb.getFileUrl(latest, latest[osPrefixMap[os]]);

		return c.json({
			version: latest.version,
			pub_date: new Date(latest.created).toISOString(),
			url: updateUrl,
			signature: latest[osPrefixMap[os] + "Sig"],
			notes: "",
		});
	});

	app.get("/download/:os", async (c: Context) => {
		const os = c.req.param("os") ?? "";
		if (!osKeys.includes(os)) {
			return c.json(
				{ error: "Invalid 'os' parameter: " + osKeys.join(", ") },
				404,
			);
		}

		const latest = await launcher.getFirstListItem(
			`${osPrefixMap[os]} != ""`,
			{ sort: "-created" },
		);

		if (latest == null) {
			return c.json({ error: "No releases found" }, 404);
		}

		const updateUrl = pb.getFileUrl(latest, latest[osPrefixMap[os]]);

		return c.redirect(updateUrl);
	});

	return app;
}
