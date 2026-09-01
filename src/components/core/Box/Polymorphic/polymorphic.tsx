import {
	// memo,
	type ComponentProps,
	type ElementType,
	type FunctionComponent,
	type JSX,
	type ReactElement,
	type ReactNode,
} from 'react'

import type { SpecsContract } from '@/types/spec'
import type { ValidElement } from './types'

type _BaseProps<C extends ValidElement> =
	JSX.LibraryManagedAttributes<
		C, ComponentProps<C>
	>

export type OverrideProps<P1 = object, P2 = object> =
	P2
	& Omit<P1, keyof P2>

export type ExtendedProps<C extends ValidElement, P2 = object> =
	OverrideProps<
		_BaseProps<C>, P2
	>

//	InheritedProps

// export type PropertiesBase<C extends ElementType> =
// 	Pick<FunctionComponent<ComponentProps<C>>, 'displayName'>

// type _Tag<C> = [C] extends [undefined] ? 'div' : NonNullable<C>   // tuple-wrapped: no distribution

export type PropertiesBase<P = object> =
	Pick<FunctionComponent<P>, 'displayName'>

export type PolymorphicProps<
	P,
	C,
> =
	& P
	& Omit<SpecsContract, 'props'>
	& {
		as?: 'as' extends keyof P ? P['as'] : C
		children?: ReactNode
		unstyled?: boolean
	}

	// & ('as' extends keyof P
	// 	? { as?: P['as'] } & Omit<P, 'as'>
	// 	: { as?: C } & P
	// )
	// & ( _Tag<C> extends ValidElement
	// 		? Omit<ExtendedProps<_Tag<C>, P>, 'as'>
	// 		: Omit<P, 'as'> )

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
