import type { CSSProperties } from 'react'
import type { CSSVars } from '@/types/shared'
import type { ColorScaleStep, PaletteName } from './types'
import type { ThemeName } from '../../theme.types'

export type ThemeTokens<V = unknown> =
	Record<ThemeName | 'base', CSSVars<V>>

type TokenItem<T extends keyof CSSProperties> =
	CSSProperties[T]

export interface TokenStatesList<T extends keyof CSSProperties> {
	base: TokenItem<T>
	hover: TokenItem<T>
	active?: TokenItem<T>
	disabled?: TokenItem<T>
	focus?: TokenItem<T>
	pressed?: TokenItem<T>
	selected?: TokenItem<T>
}

export type TokenGroup<T extends keyof CSSProperties> =
	| TokenItem<T>
	| TokenStatesList<T>

export interface ThemeConfig {
	readonly name: ThemeName
	readonly scheme: PaletteName
	readonly mixer: '#FFF' | '#000'
	readonly background: {
		readonly page: ColorScaleStep
		readonly cardBase: ColorScaleStep
	}
}

export const THEME_CONFIGS: Record<ThemeName, ThemeConfig> = {
	dark: {
		name: 'dark',
		scheme: 'ink',
		mixer: '#FFF',
		background: { page: '100', cardBase: '300' },
	},
	light: {
		name: 'light',
		scheme: 'paper',
		mixer: '#000',
		background: { page: '300', cardBase: '100' },
	},
}

export const ALT_THEME: Record<PaletteName, PaletteName> = {
	ink: 'paper',
	paper: 'ink',
}
