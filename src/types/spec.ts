import type { AriaAttributes, ComponentProps, CSSProperties, ElementType, HTMLAttributes, JSX, Ref } from 'react'
import type { ClassValue } from 'clsx'
import type { CSSVars, DataAttrs } from './shared/html'

export type TagName =
	| keyof HTMLElementTagNameMap
	| keyof SVGElementTagNameMap

export type TagElement<T> =
	T extends keyof HTMLElementTagNameMap
		? HTMLElementTagNameMap[T]
		: T extends keyof SVGElementTagNameMap
			? SVGElementTagNameMap[T]
			: unknown

type Aria = `aria-${string}`

type TagAria<T extends TagName> = Pick<
	ComponentProps<T>,
	Extract<keyof ComponentProps<T>, Aria>
>

type RemoveAriaPrefix<T> = {
	[K in keyof T as K extends `aria-${infer Rest}` ? Rest : never]: T[K]
}

type AriaBag<T> = T extends TagName
	? RemoveAriaPrefix<TagAria<T>>
	: RemoveAriaPrefix<AriaAttributes>

type TagAttributes<T> = Omit<HTMLAttributes<TagElement<T>>, keyof AriaAttributes> & {
	aria?: AriaBag<T>
	data?: Record<string, unknown>
}

interface BoxAttributes<T> {
	aria?: AriaBag<T>
	data?: Record<string, unknown>
}

type _SpecOptions =
	| 'compound'					// compound components cannot have styles
	| 'disabled'
	| 'focusable'
	| 'loading'
	| 'selectable'
	| 'unstyled'

export type SpecIs = Partial<Record<_SpecOptions, boolean>>

type _IsCompound<Is> =
	[Is] extends [{ compound: true }] ? true : false

export interface Specs<
	T = unknown,
	P extends object = object,
> {
	attributes?: TagAttributes<T>
	ctx?: unknown
	// data?: Record<string, unknown>
	default?: (
			T extends TagName
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
	S extends { default?: { component: infer K } }
		? K
		: unknown

type InferPropsSpec<S> =
	S extends { props: infer P extends object }
		? P
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

type _InferredDefault<S extends Specs> = (
		InferComponentSpec<S> extends TagName ? {
			component: InferComponentSpec<S>
			ref: TagElement<InferComponentSpec<S>>
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

type _RootComponentSpec<
	S extends Specs,
	T extends SpecStructure<S> = SpecStructure<S>
> = {
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

type _CompoundSpec<P,> =
	'specIs' extends keyof P
		? 'compound' extends keyof P['specIs']
			? P['specIs']['compound']
			: false
		: false

type _RootSpec<V, P> =
	_CompoundSpec<P> extends true
		? never
		: V

// type _Attributes<P,> = _RootSpec<Record<string, unknown>, P>
// type _ClassNames<P,> = _RootSpec<ClassValue, P>
// type _CssTokens<P,> = _RootSpec<CSSVars, P>
// type _DataAttributes<P,> = _RootSpec<Record<string, unknown>, P>
// type _Styles<P,> = _RootSpec<CSSProperties, P>
// type _Unstyled<P,> = _RootSpec<boolean, P>
// type _Variant<P,> = _RootSpec<string, P>

export interface SpecStructure<T = unknown> {
	attributes?: BoxAttributes<T>
	classNames?: ClassValue
	styles?: CSSProperties
	tokens?: CSSVars
	unstyled?: boolean
	variant?: string
}
