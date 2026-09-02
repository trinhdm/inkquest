import type {
	ComponentProps,
	ElementType,
	FunctionComponent,
	JSX,
	JSXElementConstructor,
	ReactElement,
	ReactNode,
} from 'react'

import type { SpecsContract } from './specs.types'

type _BaseProps<C> =
	C extends keyof JSX.IntrinsicElements
		? JSX.IntrinsicElements[C]
		: C extends JSXElementConstructor<infer P>
			? P
			: object

type _Tag<C> = [C] extends [undefined] ? 'div' : NonNullable<C>

export type PropertiesBase<P = object> =
	Pick<FunctionComponent<P>, 'displayName'>

export type PolymorphicProps<
	P,
	C,
> =
	& Omit<SpecsContract, 'props'>
	& {
		as?: 'as' extends keyof P ? P['as'] : C
		children?: ReactNode
		unstyled?: boolean
	}
	& Omit<P, 'as'>
	& Omit<_BaseProps<_Tag<C>>, 'as' | keyof P>

export const toPolymorphic = <
	P0 extends object,
	C0 extends ElementType,
>(
	target: (props: PolymorphicProps<P0, C0>) => ReactElement | null
) => {
	interface _Component {
		<C extends ElementType | undefined = 'div'>(props: PolymorphicProps<P0, C>): ReactElement | null
	}

	type PolymorphicBase =
		& _Component
		& PropertiesBase<ComponentProps<C0>>

	return target as unknown as PolymorphicBase
}
