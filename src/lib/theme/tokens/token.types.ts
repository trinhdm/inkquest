import type { CSSProperties } from 'react'
import type { CSSVars } from '@/types/shared'
import type { ThemeName } from '../types'

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
