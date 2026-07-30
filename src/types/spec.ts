// import type {
// 	ChangeEventHandler,
// 	FocusEventHandler,
// 	KeyboardEventHandler,
// 	MouseEventHandler,
// } from 'react'

import type { CSSProperties, Ref } from 'react'
import type { ClassValue } from 'clsx'


export type TagName = keyof HTMLElementTagNameMap

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
	default?: (
			T extends TagName
				? { component?: T }
				: { component?: unknown extends T ? unknown : never }
		)
		& { props?: Partial<P> }
	id?: string
	is?: Partial<Record<_SpecOptions, boolean>>
	props: P
	ref?: Ref<T extends TagName ? HTMLElementTagNameMap[T] : unknown>
	subcomponents?: Record<string, unknown>
	variant?: string
}

export type InferComponentSpec<S> =
	S extends { default?: { component: infer K } }
		? K
		: unknown

export type ValidSpecs<S> =
	Specs<InferComponentSpec<S>>


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
type _Styles<P,> = _RootSpec<CSSProperties, P>
type _Variant<P,> = _RootSpec<string, P>

export interface SpecStructure<P = { is: { compound: false } }> {
	attributes?: _Attributes<P>
	classNames?: _ClassNames<P>
	styles?: _Styles<P>
	variant?: _Variant<P>
}


// type _Handler<T = unknown> = (...args: T[]) => unknown

// export interface EventHandlers<
// 	N extends ValidElement,
// 	T = N extends TagName ? HTMLElementTagNameMap[N] : Element
// > {
// 	onBlur?: FocusEventHandler<T>
// 	// onChange?: ChangeEventHandler<T>
// 	onClick?: MouseEventHandler<T>
// 	onFocus?: FocusEventHandler<T>
// 	onKeyDown?: KeyboardEventHandler<T>
// 	// onMouseDown?: MouseEventHandler<T>
// 	// onMouseEnter?: MouseEventHandler<T>
// 	// onMouseOut?: MouseEventHandler<T>
// 	// onMouseOver?: MouseEventHandler<T>
// 	// onMouseUp?: MouseEventHandler<T>
// }

