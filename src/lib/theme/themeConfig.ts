import type { ColorScheme, ThemeName } from './types'

export interface ThemeConfig {
	readonly name: ThemeName
	readonly scheme: ColorScheme
}

export const THEME_CONFIGS: Record<ColorScheme, ThemeConfig> = {
	dark: {
		name: 'ink',
		scheme: 'dark',
	},
	light: {
		name: 'paper',
		scheme: 'light',
	},
}

export const ALT_THEME: Record<ThemeName, ThemeName> = {
	ink: 'paper',
	paper: 'ink',
}
