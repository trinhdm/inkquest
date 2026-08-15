import type { TokenVar } from './shared'

type Builder = (...path: string[]) => TokenVar

const withKey = (category: string[], key?: string): string[] =>
	key ? [...category, key] : category

/** A required-key accessor, e.g. primitive.lineHeight('lg'). */
export const createAccessor = <K extends string>(build: Builder, ...category: string[]) =>
	(key: K): TokenVar => build(...withKey(category, key))

/** An optional-key accessor where omitting the key means "base" — alias.accent() / alias.accent('hover'). */
export const createStateAccessor = <K extends string>(build: Builder, ...category: string[]) =>
	(key?: K): TokenVar => build(...withKey(category, key))

export const createValueRef = (build: Builder, ...category: string[]) =>
	(): TokenVar => build(...category)
