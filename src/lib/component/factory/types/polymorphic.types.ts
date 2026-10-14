import type {
	CSSProperties, ElementType,
	JSX, JSXElementConstructor,
	ReactNode, Ref,
} from 'react'

import type { AriaName, TagDictionary } from '@/types/shared'
import type { DEFAULT_TAG } from '../constants'

//	polymorphic

export interface PolymorphicContract {
	as?: ElementType
	attributes?: _PolymorphicAttributes
	children?: ReactNode
	classNames?: string
	ref?: any
	styles?: CSSProperties
	unstyled?: boolean
}

export type PolymorphicProps<P, C> =
	& Omit<PolymorphicContract, 'as' | 'ref'>
	& _PolymorphicElement<P, C>

interface _PolymorphicAttributes {
	aria?: AriaName
	data?: Record<string, unknown>
}

type _PolymorphicAs<P, C> =
	'as' extends keyof P
		? P['as'] : _TagName<C>

type _PolymorphicElement<P, C> =
	& Omit<P, 'as'>
	& Omit<_ElementProps<_TagName<C>>, 'as' | keyof P>
	& {
		as?: _PolymorphicAs<P, C>
		ref?: Ref<_ElementTag<_PolymorphicAs<P, C>>>
	}

type _ElementProps<C> =
	C extends keyof JSX.IntrinsicElements
		? JSX.IntrinsicElements[C]
		: C extends JSXElementConstructor<infer P>
			? P
			: object

type _ElementTag<T> =
	[ElementType] extends [T]
		? any
		: T extends keyof TagDictionary
			? TagDictionary[T]
			: unknown

type _TagName<C> =
	[C] extends [undefined]
		? typeof DEFAULT_TAG
		: NonNullable<C>
