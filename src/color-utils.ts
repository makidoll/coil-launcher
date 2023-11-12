import { clamp, lerp } from "./utils";

export function hexColorMix(hexA: string, hexB: string, amount: number) {
	const colors = [hexA, hexB].map(hexCode => {
		let matches = hexCode
			.trim()
			.match(/^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i);

		if (matches != null) {
			return [
				parseInt(matches[1], 16),
				parseInt(matches[2], 16),
				parseInt(matches[3], 16),
			];
		}

		matches = hexCode
			.trim()
			.match(/^#?([0-9a-f]{1})([0-9a-f]{1})([0-9a-f]{1})$/i);

		if (matches != null) {
			return [
				parseInt(matches[1] + matches[1], 16),
				parseInt(matches[2] + matches[2], 16),
				parseInt(matches[3] + matches[3], 16),
			];
		}

		return null;
	});

	if (colors[0] == null) return;
	if (colors[1] == null) return;

	const clamped = clamp(amount, 0, 1);

	const r = Math.floor(lerp(colors[0][0], colors[1][0], clamped));
	const g = Math.floor(lerp(colors[0][1], colors[1][1], clamped));
	const b = Math.floor(lerp(colors[0][2], colors[1][2], clamped));

	return (
		"#" +
		r.toString(16).padStart(2, "0") +
		g.toString(16).padStart(2, "0") +
		b.toString(16).padStart(2, "0")
	);
}

export function printHexPalette(palette: { [weight: number]: string }) {
	for (const [weight, color] of Object.entries(palette)) {
		const message = String(weight).padStart(3, " ") + ": " + color;
		console.log(
			"%c        %c " + message,
			"font-family: monospace; background-color: " + color,
			"font-family: monospace;",
		);
	}
}

// 360, 100, 100
interface HSV {
	h: number;
	s: number;
	v: number;
}

// 255, 255, 255
interface RGB {
	r: number;
	g: number;
	b: number;
}

export function hsv(h: number, s: number, v: number): HSV {
	return { h, s, v };
}

function rgb(r: number, g: number, b: number): RGB {
	return { r, g, b };
}

export function printHsvPalette(palette: { [weight: number]: HSV }) {
	for (const [weight, hsv] of Object.entries(palette)) {
		const { h, s, v } = hsv;
		const message =
			String(weight).padStart(3, " ") +
			`: ${Math.floor(h)}, ${Math.floor(s)}, ${Math.floor(v)}`;
		console.log(
			"%c        %c " + message,
			"font-family: monospace; background-color: " + hsv2hex(hsv),
			"font-family: monospace;",
		);
	}
}

// https://stackoverflow.com/a/54024653

// prettier-ignore
export function hsv2rgb({ h, s, v }: HSV) {
	s /= 100; v /= 100;
	let f= (n,k=(n+h/60)%6) => v - v*s*Math.max( Math.min(k,4-k,1), 0);
	return rgb(
		Math.floor(f(5) * 255),
		Math.floor(f(3) * 255),
		Math.floor(f(1) * 255)
	);
}

// prettier-ignore
// export function rgb2hsv(rgb: RGB) {
// 	let r = rgb[0] / 255; let g = rgb[1] / 255; let b = rgb[2] / 255;
// 	let v=Math.max(r,g,b), c=v-Math.min(r,g,b);
// 	let h= c && ((v==r) ? (g-b)/c : ((v==g) ? 2+(b-r)/c : 4+(r-g)/c));
// 	return [60*(h<0?h+6:h), v&&c/v, v];
// }

export function hsv2hex(hsv: HSV) {
	const {r,g,b} = hsv2rgb(hsv);
	return (
		"#" +
		r.toString(16).padStart(2, "0") +
		g.toString(16).padStart(2, "0") +
		b.toString(16).padStart(2, "0")
	);
}

export function hsvMix(a: HSV, b: HSV, amount: number): HSV {
	const clamped = clamp(amount, 0, 1);
	return {
		h: lerp(a.h, b.h, clamped),
		s: lerp(a.s, b.s, clamped),
		v: lerp(a.v, b.v, clamped),
	};
}

export function hsvPaletteToHex(palette: { [weight: number]: HSV }) {
	let newPalette: { [weight: number]: string } = {};
	for (const [weight, hsv] of Object.entries(palette)) {
		newPalette[weight] = hsv2hex(hsv);
	}
	return newPalette;
}
