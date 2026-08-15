import type { TokenVar } from './shared'

export type LeafPath<T> =
	T extends readonly unknown[] ? [] :
	T extends object
		?
			| ('base' extends keyof T ? [] : never)
			| { [K in Exclude<keyof T & string, 'base'>]: [K, ...LeafPath<T[K]>] }[Exclude<keyof T & string, 'base'>]
		: []

type PathOf<K> = K extends object ? LeafPath<K> : [K]
type StatePathOf<K> = K extends object ? LeafPath<K> : [K] | []
type Builder = (...path: string[]) => TokenVar

/** A required-path accessor, e.g. primitive.lineHeight('lg') or, given a nested shape, alias.font.size('heading', 'h1'). */
export const createAccessor = <K>(build: Builder, ...category: string[]) =>
	(...path: PathOf<K>): TokenVar => build(...category, ...(path as string[]))

/** An optional-path accessor where omitting it entirely means "base" — alias.primary() / alias.primary('hover'). */
export const createStateAccessor = <K>(build: Builder, ...category: string[]) =>
	(...path: StatePathOf<K> | []): TokenVar => build(...category, ...(path as string[]))

export const createValueRef = (build: Builder, ...category: string[]) =>
	(): TokenVar => build(...category)


// export type LeafPath<T> =
// 	T extends readonly unknown[] ? [] :
// 	T extends object
// 		?
// 			| ('base' extends keyof T ? [] : never)
// 			| { [K in keyof T & string]: [K, ...LeafPath<T[K]>] }[keyof T & string]
// 		: []

// export type StateLeafPath<T> =
// 	T extends readonly unknown[] ? [] :
// 	T extends object
// 		?
// 			| ('base' extends keyof T ? [] : never)
// 			| { [K in Exclude<keyof T & string, 'base'>]: [K, ...StateLeafPath<T[K]>] }[Exclude<keyof T & string, 'base'>]
// 		: []

// type PathOf<K> = K extends object ? LeafPath<K> : [K]
// type StatePathOf<K> = K extends object ? StateLeafPath<K> : [K]
