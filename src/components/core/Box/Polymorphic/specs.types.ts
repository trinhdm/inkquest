import type { CSSProperties, ElementType, Ref } from 'react'
import type { CSSVars, SpecAttributes } from '@/types/shared'

// specs

export interface SpecsContract {
	attributes?: SpecAttributes
	classNames?: string
	id?: string
	props: Record<string, unknown>
	ref?: any
	styles?: CSSProperties
	unstyled?: boolean
}

interface SpecsBase<T = unknown, P extends object = object> {
	attributes?: SpecAttributes
	ctx?: unknown
	id?: string
	props: P
	ref?: Ref<TagElement<T>>
	// variant?: string
}

interface _CompoundSpecs<P extends object = object>
	extends SpecsBase<unknown, P> {
	classNames?: never
	default?: {
		component?: never
	}
	specIs: { compound: true }
	styles?: never
	subcomponents?: never
	tokens?: never
}

interface _RootSpecs<T = unknown, P extends object = object>
	extends SpecsBase<T, P> {
	classNames?: SpecsContract['classNames']
	default?: {
		component?: any
	}
	specIs?: { compound: false }
	styles?: SpecsContract['styles']
	subcomponents?: Record<string, unknown>
	tokens?: CSSVars
}

export type Specs<T = unknown, P extends object = object> =
	| _RootSpecs<T, P>
	| _CompoundSpecs<P>


// polymorphism

export type IsPolymorphic<S> =
	S extends { default: { component: ElementType } } ? true : false

export type InferComponentSpec<S, Fallback = never> =
	S extends { default: { component: infer C extends ElementType } }
		? C
		: Fallback

export type AsPolymorphic<S> =
	IsPolymorphic<S> extends true
		? { as?: InferComponentSpec<S> }
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
