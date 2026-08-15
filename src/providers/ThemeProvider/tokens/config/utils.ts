import type { ThemeName } from '../../theme.types'

export const colorMix = (mixColor: string, percent: number, target: string): string =>
	`color-mix(in oklab, ${mixColor} ${percent}%, ${target})`

export const byScheme = <T>(name: ThemeName, values: Record<ThemeName, T>): T =>
	values[name]
