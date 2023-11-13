import { Context, Hono } from "hono";
import { html } from "hono/html";

export function indexRoutes() {
	const app = new Hono();

	app.get("/", (c: Context) => {
		return c.html(
			html`<html>
				<head>
					<title>Mechanyx Coil</title>
					<meta charset="utf-8" />
					<meta
						name="viewport"
						content="width=device-width, initial-scale=1"
					/>
					<link
						rel="preconnect"
						href="https://fonts.googleapis.com"
					/>
					<link
						rel="preconnect"
						href="https://fonts.gstatic.com"
						crossorigin
					/>
					<link
						href="https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500;600;700;800;900&display=swap"
						rel="stylesheet"
					/>
					<style>
						* {
							margin: 0;
						}

						body {
							background: #15171e;
							color: #fff;
							font-family: "Inter", sans-serif;
						}

						.content {
							width: 100%;
							height: 100%;
							display: flex;
							align-items: center;
							justify-content: center;
							flex-direction: column;
						}

						p {
							font-weight: 400;
							font-size: 20px;
							opacity: 0.6;
							letter-spacing: -0.2px;
						}
					</style>
				</head>
				<body>
					<div class="content">
						<img src="/logo-light.svg" width="400" />
						<!-- <p style="margin-top: 24px">
							Signing in with Discord...
						</p> -->
					</div>
				</body>
			</html>`,
		);
	});

	return app;
}
