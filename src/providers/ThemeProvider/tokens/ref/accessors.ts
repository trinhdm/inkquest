import type { ColorStepLabels, PaddedIndexLabels } from '../config/types'
import type { TokenVar } from './shared'

type Builder = (...path: string[]) => TokenVar

const withKey = (category: string[], key?: string): string[] =>
	key ? [...category, key] : category

/** A required-key accessor, e.g. tkn.lineHeight('lg'). */
export const createAccessor = <K extends string>(build: Builder, ...category: string[]) =>
	(key: K): TokenVar => build(...withKey(category, key))

/** An optional-key accessor where omitting the key means "base" — alias.accent() / alias.accent('hover'). */
export const createStateAccessor = <K extends string>(build: Builder, ...category: string[]) =>
	(key?: K): TokenVar => build(...withKey(category, key))

/**
 * One accessor per top-level key in `scales`, built via `factory`
 * (createAccessor or createStateAccessor). This is the one place any of the
 * five groups below actually construct anything at runtime — they differ
 * only in which mapped type they assert the result as, i.e. which key shape
 * a category's steps have. `M` is asserted, not inferred, for the same
 * reason THEME_NAMES.reduce() is elsewhere in this proposal: a runtime
 * .map() can't be inferred down to per-key literal types on its own.
 */
const createAccessorGroup = <M>(
	build: Builder,
	scales: Record<string, unknown>,
	factory: (build: Builder, category: string) => unknown
): M =>
	Object.fromEntries(
		Object.keys(scales).map(name => [name, factory(build, name)])
	) as M

// --- Registry-driven builders ---
// Each pairs one mapped type (the key-derivation rule for that category
// style — see scale-registry.ts for which categories use which) with a
// one-line call into createAccessorGroup. Adding a new key-derivation style
// is adding one such pair; adding a category to an existing style is one
// line in scale-registry.ts — neither touches createAccessorGroup.

/** Step label = array position, in hundreds ('100', '200', ...). For hex-color scales (brand/ink/paper). */
export type PositionAccessors<T extends Record<string, readonly unknown[]>> = {
	[K in keyof T]: (key: ColorStepLabels<T[K]>) => TokenVar
}
export const createPositionAccessors = <T extends Record<string, readonly unknown[]>>(
	build: Builder, scales: T
): PositionAccessors<T> =>
	createAccessorGroup(build, scales, createAccessor)

/** Step label = array position, zero-padded ('01', '02', ...) — small scales like radius. */
export type PaddedPositionAccessors<T extends Record<string, readonly unknown[]>> = {
	[K in keyof T]: (key: PaddedIndexLabels<T[K]>) => TokenVar
}
export const createPaddedPositionAccessors = <T extends Record<string, readonly unknown[]>>(
	build: Builder, scales: T
): PaddedPositionAccessors<T> =>
	createAccessorGroup(build, scales, createAccessor)

/** Step label = the element's own value (400/600/700), not its position. */
export type ValueAccessors<T extends Record<string, readonly (string | number)[]>> = {
	[K in keyof T]: (key: `${T[K][number]}`) => TokenVar
}
export const createValueAccessors = <T extends Record<string, readonly (string | number)[]>>(
	build: Builder, scales: T
): ValueAccessors<T> =>
	createAccessorGroup(build, scales, createAccessor)

/** Step label = the scale object's own key, required. */
export type NamedAccessors<T extends Record<string, Record<string, unknown>>> = {
	[K in keyof T]: (key: keyof T[K] & string) => TokenVar
}
export const createNamedAccessors = <T extends Record<string, Record<string, unknown>>>(
	build: Builder, scales: T
): NamedAccessors<T> =>
	createAccessorGroup(build, scales, createAccessor)

/** Step label = the scale object's own key, optional — omitting it means "base". */
export type StateNamedAccessors<T extends Record<string, Record<string, unknown>>> = {
	[K in keyof T]: (key?: Exclude<keyof T[K], 'base'> & string) => TokenVar
}
export const createStateNamedAccessors = <T extends Record<string, Record<string, unknown>>>(
	build: Builder, scales: T
): StateNamedAccessors<T> =>
	createAccessorGroup(build, scales, createStateAccessor)
