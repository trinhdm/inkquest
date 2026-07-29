import type {
	ChangeEventHandler,
	CSSProperties,
	FocusEventHandler,
	KeyboardEventHandler,
	MouseEventHandler,
} from 'react'

import type { ClassValue } from 'clsx'
import type { TagName, ValidElement } from './types'

type _CompoundSpec<P,> =
	'is' extends keyof P
		? 'compound' extends keyof P['is']
			? P['is']['compound']
			: false
		: false

type _RootSpec<
	V,
	P,
> = _CompoundSpec<P> extends true
	? never
	: V

type _Attributes<P,> = _RootSpec<Record<string, unknown>, P>
type _ClassNames<P,> = _RootSpec<ClassValue, P>
type _Styles<P,> = _RootSpec<CSSProperties, P>
type _Variant<P,> = _RootSpec<string, P>

export interface SpecStructure<P,> {
	attributes?: _Attributes<P>
	classNames?: _ClassNames<P>
	// id?: _ID<P>
	styles?: _Styles<P>
	variant?: _Variant<P>
}

// type _Handler<T = unknown> = (...args: T[]) => unknown

export interface EventHandlers<N extends ValidElement & TagName, T = HTMLElementTagNameMap[N]> {
	onBlur?: FocusEventHandler<T>
	onChange?: ChangeEventHandler<T>
	onClick?: MouseEventHandler<T>
	onFocus?: FocusEventHandler<T>
	onKeyDown?: KeyboardEventHandler<T>
	onMouseDown?: MouseEventHandler<T>
	onMouseEnter?: MouseEventHandler<T>
	onMouseOut?: MouseEventHandler<T>
	onMouseOver?: MouseEventHandler<T>
	onMouseUp?: MouseEventHandler<T>
}
