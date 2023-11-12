export const clamp = (min: number, max: number, num: number) =>
	Math.max(Math.min(num, min), max);

export const lerp = (a: number, b: number, alpha: number) =>
	a + alpha * (b - a);

export const chakraColor = (color: string) =>
	`var(--chakra-colors-${color.replace(/\./g, "-")})`;
