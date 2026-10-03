import type { JSX, JSXElementConstructor } from 'react'
import type { AsPolymorphic, SpecsContract, SpecsDefaultAs } from './specs.types'
import type { FactoryContract } from './factory.types'
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

interface _PolymorphicContract
	extends Omit<FactoryContract, 'children'> {
	ref?: SpecsContract['ref']
}

export type PolymorphicProps<P, C> =
	& _PolymorphicContract
	& { as?: 'as' extends keyof P ? P['as'] : C }
	& Omit<P, 'as'>
	& Omit<_ElementProps<_TagName<C>>, 'as' | keyof P>

export type PropsDefaultList<S> =
	AsPolymorphic<S> extends { as?: SpecsDefaultAs<S> }
		? Exclude<keyof S, 'as'>
		: keyof S
