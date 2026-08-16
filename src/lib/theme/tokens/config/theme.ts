import type { PaletteName, ThemeName } from '../../types'

export interface ThemeConfig {
	readonly name: ThemeName
	readonly scheme: PaletteName
}

export const THEME_CONFIGS: Record<ThemeName, ThemeConfig> = {
	dark: {
		name: 'dark',
		scheme: 'ink',
	},
	light: {
		name: 'light',
		scheme: 'paper',
	},
}

export const ALT_THEME: Record<PaletteName, PaletteName> = {
	ink: 'paper',
	paper: 'ink',
}
