import type { AriaAttributes, ComponentPropsWithoutRef, CSSProperties, ElementType, HTMLAttributes, Ref } from 'react'
import type { CSSVars } from './shared/html'


export interface SpecsContract {
	attributes?: SpecAttributes
	classNames?: string
	id?: string
	props: Record<string, unknown>
	ref?: any
	styles?: CSSProperties
	unstyled?: boolean
}

// export type SpecsDefaultProps<T extends Specs> =
// 	Partial<T['props']>
// 	& SpecAttributes

interface SpecsBase<T = unknown, P extends object = object> {
	attributes?: SpecAttributes
	ctx?: unknown
	id?: string
	props: P
	ref?: Ref<TagElement<T>>
	// variant?: string
}

interface _CompoundSpecs<P extends object = object> extends SpecsBase<unknown, P> {
	classNames?: never
	default?: {
		component?: never
	}
	specIs: { compound: true }
	styles?: never
	subcomponents?: never
	tokens?: never
}

interface _RootSpecs<T = unknown, P extends object = object> extends SpecsBase<T, P> {
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

export type ExtractHtmlAttributes<T extends ElementType> =
	Omit<
		ComponentPropsWithoutRef<T>,
		keyof AriaAttributes
	>

export type InferComponentSpec<S> =
	S extends { default: { component: infer C } }
		? C
		: unknown

export type AsPolymorphic<S> =
	S extends { specIs: { compound: true } }
		? { as?: never }
		: {
			as?: unknown extends InferComponentSpec<S>
				? ElementType
				: InferComponentSpec<S>
		}

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

type RemoveAriaPrefix<T> = {
	[K in keyof T as K extends `aria-${infer Rest}` ? Rest : never]: T[K]
}

type AriaName =
	RemoveAriaPrefix<AriaAttributes>

export interface SpecAttributes {
	aria?: AriaName
	data?: Record<string, unknown>
}

// type TagAttributes<T> =
// 	Omit<HTMLAttributes<TagElement<T>>, keyof AriaAttributes>
// 	& SpecAttributes
