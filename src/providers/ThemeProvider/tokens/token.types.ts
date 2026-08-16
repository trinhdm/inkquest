import { COLOR_TOKENS, THEME_SCHEMES } from './scales'
import type { CSSProperties } from 'react'
import type { CSSVars } from '@/types/shared'
import type { ThemeName } from '../theme.types'

export type ColorScheme =
	keyof typeof COLOR_TOKENS

export type ColorScaleKey = {
	[K in ColorScheme]: (typeof COLOR_TOKENS)[K] extends readonly string[] ? K : never
}[ColorScheme]
// 'ink' | 'oxblood' | 'ghost' | 'paper' | 'crimson' | 'ghost'

export type FlatColorKey =
	Exclude<ColorScheme, ColorScaleKey>
// 'danger' | 'success' | 'warning' | 'info'

export type PaletteName =
	typeof THEME_SCHEMES[number]
// 'ink' | 'paper' — only the tagged ones


export type TokenVar =
	`var(${keyof CSSVars})`

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
