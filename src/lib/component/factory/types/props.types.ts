import type { JSX, JSXElementConstructor, ReactNode } from 'react'
import type { AsPolymorphic, SpecDefaultAs, SpecsContract } from './specs.types'
import type { DEFAULT_TAG } from '../constants'

type _ElementProps<C> =
	C extends keyof JSX.IntrinsicElements
		? JSX.IntrinsicElements[C]
		: C extends JSXElementConstructor<infer P>
			? P
			: object

type _TagName<C> =
	[C] extends [undefined]
		? typeof DEFAULT_TAG
		: NonNullable<C>


export type PolymorphicProps<P, C> =
	& Omit<SpecsContract, 'props'>
	& {
		as?: 'as' extends keyof P ? P['as'] : C
		children?: ReactNode
	}
	& Omit<P, 'as'>
	& Omit<_ElementProps<_TagName<C>>, 'as' | keyof P>

export type ListProps<S> =
	AsPolymorphic<S> extends { as?: SpecDefaultAs<S> }
		? Exclude<keyof S, 'as'>
		: keyof S
