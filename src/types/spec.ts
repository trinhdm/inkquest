import type { AriaAttributes, ComponentProps, ComponentPropsWithoutRef, CSSProperties, ElementType, HTMLAttributes, JSX, Ref } from 'react'
import type { ClassValue } from 'clsx'
import type { CSSVars, DataAttrs } from './shared/html'
// import type { ValidElement } from '@/components/core/Box/Polymorphic/types'


export interface SpecsContract {
	// as?: string
	attributes?: SpecAttributes
	classNames?: string
	id?: string
	props: Record<string, unknown>
	ref?: any
	styles?: CSSProperties
	unstyled?: boolean
	// tokens?: CSSVars
	// variant?: string
}

export type SpecsDefaultProps<T extends SpecsContract> =
	Partial<T['props']>
	// & PolymorphicSpec<S>
	& SpecAttributes



type _CompoundSpecs<T extends SpecsContract> = {
	classNames?: never
	default?: {
		component?: never
		props?: SpecsDefaultProps<T>
	}
	styles?: never
	subcomponents?: never
	tokens?: never
	// unstyled?: never
}

type _RootSpecs<T extends SpecsContract> = {
	classNames?: T['classNames']
	default?: {
		component?: any
		props?: SpecsDefaultProps<T>
	}
	styles?: T['styles']
	subcomponents?: Record<string, unknown>		// move this to compound/root
	tokens?: CSSVars
	// unstyled?: boolean
}

export type ComponentSpecs<T extends SpecsContract> =
	T extends { specIs?: { compound: true } }
		? _CompoundSpecs<T>
		: _RootSpecs<T>

// type AriaByTag<T extends ValidElement> = Pick<
// 	HTMLAttributes<T>,
// 	keyof AriaAttributes
// >

export type ExtractHtmlAttributes<T extends ElementType> =
	Omit<
		ComponentPropsWithoutRef<T>,
		keyof AriaAttributes
	>

// // Extract ARIA attributes for a specific HTML tag (e.g., 'button')
// type ButtonAria = JSX.IntrinsicElements['button'] & AriaAttributes

// // Generic utility to get ARIA attributes for ANY valid HTML tag
// type ExtractAria<T extends keyof JSX.IntrinsicElements> = Extract<
// 	keyof JSX.IntrinsicElements[T],
// 	keyof AriaAttributes
// >

// type Test = ExtractHtmlAttributes<'button'>
// type Test2 = Omit<ComponentPropsWithoutRef<'button'>, keyof AriaAttributes>

// type ButtonAriaProps = Pick<
//   ComponentPropsWithoutRef<'button'>,
//   Extract<keyof ComponentPropsWithoutRef<'button'>, keyof AriaAttributes>
// >



export type AsPolymorphic<S> = {
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
	S,
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
	& { props?: object }
	// & { props?: InferDefaultProps<S> }

type _CompoundComponentSpec<S> = {
	classNames?: never
	default?: _InferredDefault<S>
	styles?: never
	subcomponents?: never
	tokens?: never
	unstyled?: never
}

type _RootComponentSpec<S> = {
	classNames?: ClassValue
	default?: _InferredDefault<S>
	styles?: CSSProperties
	subcomponents?: Record<string, unknown>		// move this to compound/root
	tokens?: CSSVars
	unstyled?: boolean
}

export type ExtendedSpecs<S> =
	S extends { specIs?: { compound: true } }
		? _CompoundComponentSpec<S>
		: _RootComponentSpec<S>

type _InferredTag<
	S extends Specs,
	K = InferComponentSpec<S>,
> =
	K extends keyof _ElementTagMap
		? K
		: never

// A wrapped record type
type Wrapped<T> = {
	[K in keyof T]: { value: T[K] }
}

// Extract the original inner type from the wrapped record
type UnwrapWrapped<T, K extends string> =
	T extends { [U in keyof T]: { [P in K]: infer V } } ? V : never
	// T extends { [K in keyof T]: { value: infer V } } ? V : never

type _UnpackTag<T> = T extends { component?: infer K }
	? K extends keyof _ElementTagMap
		? K : never
	: never

export interface BaseSpecs<P, T> {
	attributes?: TagAttributes<T>
	ctx?: unknown
	default?:
		{ component?: keyof _ElementTagMap | never }
		& { props?: Partial<P> }
	id?: string
	props: P
	ref?: Ref<TagElement<T>>
	specIs?: SpecIs
	subcomponents?: Record<string, unknown>		// move this to compound/root
	tokens?: CSSVars
	variant?: string
}

export type SpecsList<TObj> = {
	[K in keyof TObj]: TObj[K] extends BaseSpecs<infer P, infer T>
		? BaseSpecs<P, T> & ExtendedSpecs<T>
		: never
}

// export type SpecsList<TObj> =
// 	TObj extends BaseSpecs<infer P, infer T>
// 		? BaseSpecs<P, T> & ExtendedSpecs<T>
// 		: never

export type SpecsMap<
	T extends SpecsList<T>,
> = {
	[U in keyof T]: T[U]
}

export type SpecItem<
	T extends SpecsList<T>,
	K extends keyof T,
> =
	SpecsMap<T>[K]
	// SpecsMap<T> extends { [P in K]: infer V } ? V : never

// export type SpecsList<TObj extends SiblingMappedShape<TObj>> =
// TObj & {
// 	}
