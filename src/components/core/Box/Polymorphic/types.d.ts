import type { JSX, JSXElementConstructor } from 'react'
import type { InferComponentSpec } from '@/types/spec'

export type DataAttrs = Record<`data-${string}`, unknown>

export type ValidElement =
	| keyof JSX.IntrinsicElements
	| JSXElementConstructor<unknown>

export type AsTag<C, P = C> = 'as' extends keyof P
	? P['as']
	: C

export type PickStartsWith<T, Prefix extends string> = {
	[K in keyof T as K extends `${Prefix}${string}` ? K : never]: T[K]
}

export type ValueOf<
	S,
	K = InferComponentSpec<S>,
	D = 'default' extends keyof S ? NonNullable<S['default']> : object
> = K extends keyof S
	? S[K]
	: K extends keyof D
		? D[K]
		: never
