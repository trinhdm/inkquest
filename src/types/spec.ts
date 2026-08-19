import type { CSSProperties, ElementType, Ref } from 'react'
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

type _SpecOptions =
	| 'compound'					// compound components cannot have styles
	| 'disabled'
	| 'focusable'
	| 'unstyled'

export interface Specs<
	T = unknown,
	P extends object = object,
> {
	attributes?: Record<string, unknown>
	ctx?: unknown
	data?: Record<string, unknown>
	default?: (
			T extends TagName
				? { component?: T }
				: { component?: unknown extends T ? unknown : never }
		)
		& { props?: Partial<P> }
	id?: string
	is?: Partial<Record<_SpecOptions, boolean>>
	props: P
	ref?: Ref<TagElement<T>>
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
	tokens?: never
	unstyled?: never
}

type _RootComponentSpec<
	S extends Specs,
	T extends SpecStructure<S> = SpecStructure<S>
> = {
	classNames?: T['classNames']
	default?: _InferredDefault<S>
	styles?: T['styles']
	tokens?: T['tokens']
	unstyled?: T['unstyled']
}

export type ExtendedSpecs<S extends Specs> =
	NonNullable<S['is']>['compound'] extends true
		? _CompoundComponentSpec<S>
		: _RootComponentSpec<S>

type _CompoundSpec<P,> =
	'is' extends keyof P
		? 'compound' extends keyof P['is']
			? P['is']['compound']
			: false
		: false

type _RootSpec<V, P> =
	_CompoundSpec<P> extends true
		? never
		: V

type _Attributes<P,> = _RootSpec<Record<string, unknown>, P>
type _ClassNames<P,> = _RootSpec<ClassValue, P>
type _CssTokens<P,> = _RootSpec<CSSVars, P>
type _DataAttributes<P,> = _RootSpec<Record<string, unknown>, P>
type _Styles<P,> = _RootSpec<CSSProperties, P>
type _Unstyled<P,> = _RootSpec<boolean, P>
type _Variant<P,> = _RootSpec<string, P>

export interface SpecStructure<P = { is: { compound: false } }> {
	attributes?: _Attributes<P>
	classNames?: _ClassNames<P>
	data?: _DataAttributes<P>
	styles?: _Styles<P>
	tokens?: _CssTokens<P>
	unstyled?: _Unstyled<P>
	variant?: _Variant<P>
}
