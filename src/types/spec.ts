import type { AriaAttributes, CSSProperties, ElementType, HTMLAttributes, Ref } from 'react'
import type { ClassValue } from 'clsx'
import type { CSSVars, DataAttrs } from './shared/html'

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

type _SpecOptions =
	| 'compound'					// compound components cannot have styles
	| 'disabled'
	| 'focusable'
	| 'loading'
	| 'selectable'
	// | 'unstyled'

export type SpecIs =
	Partial<Record<_SpecOptions, boolean>>

type _IsCompound<Is> =
	[Is] extends [{ compound: true }] ? true : false

export interface Specs<
	T = unknown,
	P extends object = object,
> {
	attributes?: TagAttributes<T>
	ctx?: unknown
	default?: (
			T extends keyof _ElementTagMap
				? { component?: T }
				: { component?: unknown extends T ? unknown : never }
		)
		& { props?: Partial<P> }
	id?: string
	props: P
	ref?: Ref<TagElement<T>>
	specIs?: SpecIs
	subcomponents?: Record<string, unknown>		// move this to compound/root
	tokens?: CSSVars
	variant?: string
}

export type InferComponentSpec<S> =
	S extends { default?: { component: unknown } }
		? NonNullable<S['default']>['component']
		: unknown

type InferPropsSpec<S> =
	S extends { props: object }
		? S['props']
		: object

export type ValidSpecs<S> =
	Specs<InferComponentSpec<S>, InferPropsSpec<S>>
	// Specs<InferComponentSpec<S>>

export type PolymorphicSpec<S extends Specs> = {
    as?: unknown extends InferComponentSpec<S>
        ? ElementType
        : InferComponentSpec<S>
}

export type InferDefaultProps<S extends Specs> =
	Partial<S['props']>
	& PolymorphicSpec<S>
	& DataAttrs

type _InferredDefault<
	S extends Specs,
	K = InferComponentSpec<S>,
> = (
		K extends keyof _ElementTagMap ? {
			component: K
			ref: TagElement<K>
		} : {
			component?: never
			ref?: never
		}
	)
	& { props?: InferDefaultProps<S> }

type _CompoundComponentSpec<S extends Specs> = {
	classNames?: never
	default?: _InferredDefault<S>
	styles?: never
	// subcomponents?: never
	tokens?: never
	unstyled?: never
}

type _RootComponentSpec<S extends Specs> = {
	classNames?: ClassValue
	default?: _InferredDefault<S>
	styles?: CSSProperties
	// subcomponents?: Record<string, unknown>		// move this to compound/root
	tokens?: CSSVars
	unstyled?: boolean
}

export type ExtendedSpecs<S extends Specs> =
	_IsCompound<S['specIs']> extends true
		? _CompoundComponentSpec<S>
		: _RootComponentSpec<S>

// type _CompoundSpec<P,> =
// 	'specIs' extends keyof P
// 		? 'compound' extends keyof P['specIs']
// 			? P['specIs']['compound']
// 			: false
// 		: false
