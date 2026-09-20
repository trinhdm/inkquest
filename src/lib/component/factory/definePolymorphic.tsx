import type {
	ComponentProps,
	ElementType,
	FunctionComponent,
	JSX,
	JSXElementConstructor,
	ReactElement,
	ReactNode,
} from 'react'

import type { DEFAULT_TAG } from './constants'
import type { SpecsContract } from './types'

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

export type BaseProps<P = object> =
	Required<Pick<FunctionComponent<P>, 'displayName'>>

export type PolymorphicProps<P, C> =
	& Omit<SpecsContract, 'props'>
	& {
		as?: 'as' extends keyof P ? P['as'] : C
		children?: ReactNode
	}
	& Omit<P, 'as'>
	& Omit<_ElementProps<_TagName<C>>, 'as' | keyof P>

export const definePolymorphic = <
	P0 extends object,
	C0 extends ElementType,
>(
	target: (props: PolymorphicProps<P0, C0>) => ReactElement | null
) => {
	interface _Component {
		<C extends ElementType | undefined = typeof DEFAULT_TAG>(props: PolymorphicProps<P0, C>): ReactElement | null
	}

	type PolymorphicBase =
		& _Component
		& BaseProps<ComponentProps<C0>>

	return target as unknown as PolymorphicBase
}
