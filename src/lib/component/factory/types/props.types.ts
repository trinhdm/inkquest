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

interface FactoryContract {
	attributes?: SpecsContract['attributes']
	classNames?: SpecsContract['classNames']
	id?: SpecsContract['id']
	ref?: SpecsContract['ref']
	styles?: SpecsContract['styles']
	unstyled?: SpecsContract['unstyled']
}

export type PolymorphicProps<P, C> =
	& FactoryContract
	& {
		as?: 'as' extends keyof P ? P['as'] : C
		children?: ReactNode
	}
	& Omit<P, 'as'>
	& Omit<_ElementProps<_TagName<C>>, 'as' | keyof P>

export type PropsDefaultList<S> =
	AsPolymorphic<S> extends { as?: SpecDefaultAs<S> }
		? Exclude<keyof S, 'as'>
		: keyof S
