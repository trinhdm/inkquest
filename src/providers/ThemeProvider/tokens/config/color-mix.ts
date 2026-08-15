
export const colorMix = (mixColor: string, percent: number, target: string): string =>
	`color-mix(in oklab, ${mixColor} ${percent}%, ${target})`
