import type { CSSVarArgs } from '../format'
import type { CSSVars } from '@/types/shared'

export interface TokenEntry {
	name: keyof CSSVars
	value: string
}

export type GeneratorContext<T = unknown> = CSSVarArgs<T>
export type GenerateFn = (context: GeneratorContext) => TokenEntry[]

export interface GeneratorStrategy<V = unknown> {
	matches(context: GeneratorContext): boolean
	run(context: GeneratorContext<V> & { value: V }, generate: GenerateFn): TokenEntry[]
}
