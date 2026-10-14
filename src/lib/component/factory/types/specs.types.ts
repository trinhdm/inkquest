import type { ElementType } from 'react'
import type { CSSVariable } from '@/types/shared'
import type { RootCtxValue, SafeRootCtxValue } from '../../context'

// specs

export interface SpecsContract {
	context?: any
	defaults?: {
		as?: any
		props?: PropertyKey
	}
	isCompound?: boolean
	props: Record<string, any>
	selectors?: string
	subcomponents?: Record<string, any>
	tokens?: Record<string, CSSVariable>
}

interface _BaseSpecs<P extends object = object> {
	context?: SpecsContract['context']
	props: P
	selectors?: SpecsContract['selectors']
	tokens?: SpecsContract['tokens']
}

interface _CompoundSpecs {
	defaults?: {
		as?: never
		props?: PropertyKey
	}
	isCompound: true
	subcomponents?: never
}

interface _RootSpecs {
	defaults?: {
		as?: any
		props?: PropertyKey
	}
	isCompound?: false
	subcomponents?: SpecsContract['subcomponents']
}

type _ComponentSpecs =
	| _RootSpecs
	| _CompoundSpecs

export type Specs<P extends object = object> =
	& _BaseSpecs<P>
	& _ComponentSpecs


//	individual specs

export type SpecsContext<S, N extends string = string> =
	'context' extends keyof S
		? RootCtxValue<S['context']> | SafeRootCtxValue<S['context'], N>
		: undefined

export type SpecsDefaultAs<S, Fallback = never> =
	S extends { defaults: { as: infer C extends ElementType } }
		? C
		: Fallback

export type SpecsDefaultProps<S> =
	S extends {
		defaults: { props: infer K },
		props: infer P
	}
		? Extract<K, keyof P>
		: never

export type SpecsSelectors<S> =
	'selectors' extends keyof S
		? NonNullable<S['selectors']>
		: never

type _TokenSelector<T> =
	[T] extends [never] ? PropertyKey : T

export type TokenValue =
	number | string | undefined

type _TokensGroup<V, T> = {
	[K in keyof V]: K extends _TokenSelector<T>
		? V[K] extends CSSVariable
			? Record<V[K], TokenValue>
			: never
		: { [E in K & string as `selector '${E}' is not declared in Specs['selectors']`]: never }
}

export type TokensNever =
	Record<PropertyKey, never>

type TokensList<V, T = never> =
	| _TokensGroup<V, T>
	| TokensNever

export type SpecsTokens<S> =
	'tokens' extends keyof S
		? TokensList<NonNullable<S['tokens']>, SpecsSelectors<S>>
		: TokensNever

export type SpecsTokenGroups<S> =
	'tokens' extends keyof S
		? _TokensGroup<NonNullable<S['tokens']>, SpecsSelectors<S>>
		: TokensNever
