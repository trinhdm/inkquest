import type { CSSProperties, ElementType, Ref } from 'react'
import type { CSSVariable, SpecAttributes } from '@/types/shared'
import type { RootCtxValue } from '../../context'

// specs
export interface SpecsContract {
	attributes?: SpecAttributes
	classNames?: string
	context?: any
	id?: string
	props: Record<string, any>
	ref?: any
	selectors?: string
	styles?: CSSProperties
	unstyled?: boolean
}

interface _BaseSpecs<T = unknown, P extends object = object> {
	attributes?: SpecAttributes
	context?: any
	id?: string
	props: P
	ref?: Ref<TagElement<T>>
	selectors?: string
	tokens?: Record<string, CSSVariable>
}

interface _CompoundSpecs<P extends object = object>
	extends _BaseSpecs<unknown, P> {
	classNames?: never
	defaults?: {
		as?: never
		props?: PropertyKey
		// unstyled?: boolean
	}
	isCompound: true
	styles?: never
	subcomponents?: never
}

interface _RootSpecs<T = unknown, P extends object = object>
	extends _BaseSpecs<T, P> {
	classNames?: SpecsContract['classNames']
	defaults?: {
		as?: any
		props?: PropertyKey
		// unstyled?: boolean
	}
	isCompound?: false
	styles?: SpecsContract['styles']
	subcomponents?: Record<string, any>
}

export type Specs<T = unknown, P extends object = object> =
	| _RootSpecs<T, P>
	| _CompoundSpecs<P>


//	individual specs

export type SpecsContext<S> =
	'context' extends keyof S
		? RootCtxValue<S['context']>
		: undefined

export type SpecDefaultAs<S, Fallback = never> =
	S extends { defaults: { as: infer C extends ElementType } }
		? C
		: Fallback

export type SpecDefaultProps<S> =
	S extends {
		defaults: { props: infer K },
		props: infer P
	}
		? Extract<K, keyof P>
		: never

type _TokensGroup<V> = {
	[K in keyof V]: V[K] extends CSSVariable
		? Record<V[K], number | string | undefined>
		: never
}

export type TokensList<V> =
	| _TokensGroup<V>
	| Record<PropertyKey, never>

export type SpecsTokens<S> =
	'tokens' extends keyof S
		? TokensList<S['tokens']>
		: Record<PropertyKey, never>


// polymorphism

export type IsPolymorphic<S> =
	S extends { defaults: { as: ElementType } }
		? true
		: false

export type AsPolymorphic<S> =
	IsPolymorphic<S> extends true
		? { as?: SpecDefaultAs<S> }
		: { as?: never }


type _CommonTag =
	| 'a' | 'button' | 'div' | 'nav' | 'span' | 'svg'

// type _CommonTag =
// 	| 'a' | 'button'
// 	| 'article' | 'aside' | 'nav'
// 	| 'details' | 'progress' | 'summary'
// 	| 'dialog' | 'div' | 'section'
// 	| 'blockquote' | 'p' | 'span'
// 	| 'form' | 'input' | 'option' | 'select' | 'textarea'
// 	| 'img' | 'svg'
// 	| 'ol' | 'ul' | 'li'
// // 	// | 'h1' | 'h2' | 'h3'

type _ElementTagMap =
	SVGElementTagNameMap & HTMLElementTagNameMap

type TagElement<T> =
	T extends _CommonTag
		? _ElementTagMap[T]
		: T extends keyof _ElementTagMap
			? _ElementTagMap[T]
			: unknown


// type NonSemanticAttrs =
// 	| 'about' | 'content' | 'datatype' | 'inlist' | 'prefix' | 'property'
// 	| 'resource' | 'rev' | 'typeof' | 'vocab'
// 	| 'color' | 'results' | 'security' | 'unselectable'
