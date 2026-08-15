import { formatToken } from '../format/tokenName'
import { PREFIX_CSS_SELECTOR } from '@/utils/constants'
import type { CSSVars } from '@/types/shared'

export type TokenVar = `var(${keyof CSSVars})`

const getTokenVar = (path: string[], prefix?: string): TokenVar =>
	`var(${formatToken({ path, prefix })})`

/** Unprefixed reference into a raw/primitive scale token — baseVar('ink', '600') -> var(--ink-600). */
export const baseVar = (...path: string[]): TokenVar =>
	getTokenVar(path)

/** Prefixed reference into an already-built semantic/alias token — aliasVar('accent') -> var(--inkq-accent). */
export const aliasVar = (...path: string[]): TokenVar =>
	getTokenVar(path, PREFIX_CSS_SELECTOR)
