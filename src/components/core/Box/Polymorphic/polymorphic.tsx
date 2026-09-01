import type {
	ComponentProps,
	ElementType,
	FunctionComponent,
	JSX,
	ReactElement,
	ReactNode,
} from 'react'

import type { SpecsContract } from '@/types/spec'

type _BaseProps<C extends ElementType> =
	JSX.LibraryManagedAttributes<
		C, ComponentProps<C>
	>

type _OverrideProps<P1 = object, P2 = object> =
	P2
	& Omit<P1, keyof P2>

type _ExtendedProps<C extends ElementType, P2 = object> =
	_OverrideProps<
		_BaseProps<C>, P2
	>

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
	& ( _Tag<C> extends ElementType
		? Omit<_ExtendedProps<_Tag<C>, P>, 'as'>
		: Omit<P, 'as'> )

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

	// const BaseComponent = memo(target) as unknown as PolymorphicBase

	return target as unknown as PolymorphicBase
}
