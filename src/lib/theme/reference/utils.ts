import { PREFIX_CSS_SELECTOR } from '@/utils/constants'
import { formatToken } from '../format'
import type { TokenVar } from '../types/token.types'

const getTokenVar = (path: string[], prefix?: string): TokenVar =>
	`var(${formatToken({ path, prefix })})`

/** Unprefixed reference into a raw/primitive scale token — baseVar('ink', '600') -> var(--ink-600). */
export const baseVar = (...path: string[]): TokenVar =>
	getTokenVar(path)

/** Prefixed reference into an already-built semantic/alias token — aliasVar('primary') -> var(--inkq-primary). */
export const aliasVar = (...path: string[]): TokenVar =>
	getTokenVar(path, PREFIX_CSS_SELECTOR)


/** A node the generator collapses into a single `font` shorthand var — see SHORTHAND_KEYS. */
type ShorthandNode = Record<'fontFamily' | 'fontSize' | 'fontWeight' | 'lineHeight', string>

type LeafPath<T> =
	T extends readonly unknown[] ? [] :
	T extends ShorthandNode
		? []
		: T extends object
			?
				| ('base' extends keyof T ? [] : never)
				| { [K in Exclude<keyof T & string, 'base'>]: [K, ...LeafPath<T[K]>] }[Exclude<keyof T & string, 'base'>]
			: []

type PathOf<K> = K extends object ? LeafPath<K> : [K]
type StatePathOf<K> = K extends object ? LeafPath<K> : [K] | []
type Builder = (...path: string[]) => TokenVar

const buildAccessor = (build: Builder, category: string[]) =>
	(...path: string[]): TokenVar => build(...category, ...path)

/** A required-path accessor, e.g. primitive.lineHeight('lg') or, given a nested shape, alias.font.size('heading', 'h1'). */
export const createAccessor = <K>(build: Builder, ...category: string[]) =>
	buildAccessor(build, category) as (...path: PathOf<K>) => TokenVar

/** An optional-path accessor where omitting it entirely means "base" — alias.primary() / alias.primary('hover'). */
export const createStateAccessor = <K>(build: Builder, ...category: string[]) =>
	buildAccessor(build, category) as (...path: StatePathOf<K> | []) => TokenVar

export const createValueRef = (build: Builder, ...category: string[]) =>
	buildAccessor(build, category) as () => TokenVar

/** Accessor-factory kinds for building token maps — tokenPath.get<K>(build, ...category). */
export const token = {
	path: createAccessor,
	optPath: createStateAccessor,
	endPath: createValueRef,
}
