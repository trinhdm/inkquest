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

export type SpecsDefaultProps<T extends ComponentSpecs> =
	Partial<T['props']>
	& SpecAttributes

interface SpecsBase<T = unknown, P extends object = object> {
	attributes?: TagAttributes<T>
	// className?: string
	ctx?: unknown
	id?: string
	props: P
	ref?: Ref<TagElement<T>>
	// style?: CSSProperties
	// variant?: string
}

interface _CompoundSpecs<P extends object = object> extends SpecsBase<unknown, P> {
	classNames?: never
	default?: {
		component?: never
		// props?: _ComponentSpecsProps<T>
	}
	specIs: { compound: true }
	styles?: never
	subcomponents?: never
	tokens?: never
	// unstyled?: never
}

interface _RootSpecs<T = unknown, P extends object = object> extends SpecsBase<T, P> {
	classNames?: SpecsContract['classNames']
	default?: {
		component?: any
		// props?: _ComponentSpecsProps<T>
	}
	specIs?: { compound: false }
	styles?: SpecsContract['styles']
	subcomponents?: Record<string, unknown>
	tokens?: CSSVars
	// unstyled?: boolean
}

export type ComponentSpecs<T = unknown, P extends object = object> = (
	| _RootSpecs<T, P>
	| _CompoundSpecs<P>
)

// export type ComponentSpecs<T extends SpecsContract> =
// 	T extends { specIs: { compound: true } }
// 		? _CompoundSpecs<T>
// 		: _RootSpecs<T>

export type ExtractHtmlAttributes<T extends ElementType> =
	Omit<
		ComponentPropsWithoutRef<T>,
		keyof AriaAttributes
	>

export type InferComponentSpec<S> =
	S extends { default: { component: infer C } }
		? C
		: unknown

// export type AsPolymorphic<S> = {
//     as?: unknown extends InferComponentSpec<S>
//         ? ElementType
//         : InferComponentSpec<S>
// }

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

export type TagElement<T> =
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

type TagAttributes<T> =
	Omit<HTMLAttributes<TagElement<T>>, keyof AriaAttributes>
	& SpecAttributes

// type _SpecOptions =
// 	| 'compound'					// compound components cannot have styles
// 	| 'disabled'
// 	| 'focusable'
// 	| 'loading'
// 	| 'selectable'
// 	// | 'unstyled'

// export type SpecIs =
// 	Partial<Record<_SpecOptions, boolean>>

// export interface Specs<
// 	T = unknown,
// 	P extends object = object,
// > {
// 	attributes?: TagAttributes<T>
// 	ctx?: unknown
// 	default?: (
// 			T extends keyof _ElementTagMap
// 				? { component?: T }
// 				: { component?: unknown extends T ? unknown : never }
// 		)
// 		& { props?: Partial<P> }
// 	id?: string
// 	props: P
// 	ref?: Ref<TagElement<T>>
// 	specIs?: SpecIs
// 	subcomponents?: Record<string, unknown>		// move this to compound/root
// 	tokens?: CSSVars
// 	variant?: string
// }

// type InferPropsSpec<S> =
// 	S extends { props: object }
// 		? S['props']
// 		: object

// export type ValidSpecs<S> =
// 	Specs<InferComponentSpec<S>, InferPropsSpec<S>>
// 	// Specs<InferComponentSpec<S>>
