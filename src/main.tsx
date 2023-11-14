import {
	ChakraProvider,
	extendTheme,
	withDefaultColorScheme,
} from "@chakra-ui/react";
import "@fontsource/inter/100.css";
import "@fontsource/inter/200.css";
import "@fontsource/inter/300.css";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";
import "@fontsource/inter/800.css";
import "@fontsource/inter/900.css";
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { hsv, hsvMix, hsvPaletteToHex, printHsvPalette } from "./color-utils";
import { generateStripe } from "@chakra-ui/theme-tools";

if (globalThis.localStorage != null) {
	globalThis.localStorage.setItem("chakra-ui-color-mode", "dark");
}

const brandBehindBase = hsv(227, 30, 12); // #15171e battle.net bg
const brandBehindLight = hsv(227, 0, 100);

const brandBehind = {
	50: hsvMix(brandBehindLight, brandBehindBase, 0.1),
	100: hsvMix(brandBehindLight, brandBehindBase, 0.2),
	200: hsvMix(brandBehindLight, brandBehindBase, 0.3),
	300: hsvMix(brandBehindLight, brandBehindBase, 0.4),
	400: hsvMix(brandBehindLight, brandBehindBase, 0.5),
	500: hsvMix(brandBehindLight, brandBehindBase, 0.6),
	600: hsvMix(brandBehindLight, brandBehindBase, 0.7),
	700: hsvMix(brandBehindLight, brandBehindBase, 0.8),
	800: hsvMix(brandBehindLight, brandBehindBase, 0.9),
	850: hsvMix(brandBehindLight, brandBehindBase, 0.95),
	900: brandBehindBase,
};

// printHsvPalette(brandBehind);

const theme = extendTheme(
	{
		initialColorMode: "dark",
		useSystemColorMode: false,
		colors: {
			// tomorrow: "#1d1f21",
			// hexcorp: "#ff64ff",
			// hexcorpDark: "#231929",
			// justKindaDark: "#111111",
			// material design pink
			brand: {
				50: "#fce4ec",
				100: "#f8bbd0",
				200: "#f48fb1",
				300: "#f06292",
				400: "#ec407a",
				500: "#e91e63",
				600: "#d81b60",
				700: "#c2185b",
				800: "#ad1457",
				900: "#880e4f",
				// a100: "#ff80ab",
				// a200: "#ff4081",
				// a400: "#f50057",
				// a700: "#c51162",
			},
			brandBehind: hsvPaletteToHex(brandBehind),
		},
		styles: {
			global: {
				body: {
					// bg: "justKindaDark",
					bg: "transparent",
					color: "white",
				},
			},
		},
		fonts: {
			heading: "Inter",
			body: "Inter",
		},
		components: {
			// Heading: {
			// 	baseStyle: {
			// 		// letterSpacing: "-0.05em",
			// 		fontWeight: "400",
			// 	},
			// },
			Link: {
				baseStyle: {
					color: "brand.500",
					_hover: {
						textDecoration: "none",
					},
				},
			},
			Progress: {
				baseStyle: {
					track: {
						bg: "brandBehind.700",
					},
					filledTrack: {
						backgroundColor: "brand.500",
						...generateStripe("1rem", "rgba(255,255,255,0.2)"),
					},
				},
			},
		},
	},
	withDefaultColorScheme({
		colorScheme: "brand",
	}),
);

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
	// strict will double render
	// <React.StrictMode>
	<ChakraProvider theme={theme}>
		<App />
	</ChakraProvider>,
	// </React.StrictMode>,
);
