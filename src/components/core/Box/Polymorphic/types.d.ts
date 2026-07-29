import type { JSX, JSXElementConstructor } from 'react'

export type ValidElement =
	| keyof JSX.IntrinsicElements
	| JSXElementConstructor<unknown>

export type AsTag<C, P = C> = 'as' extends keyof P
	? P['as']
	: C

export type DataAttrs = Record<`data-${string}`, unknown>
export type TagName = keyof HTMLElementTagNameMap

export type InferSpecDefault<S> = S extends {
	default?: { component: infer K }
} ? K : unknown

export type ValueOf<
	S,
	K = InferSpecDefault<S>,
	D = 'default' extends keyof S ? S['default'] : object
> = K extends keyof D
	? D[K]
	: K extends keyof S
		? S[K]
		: never
