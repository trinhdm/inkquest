import {
	memo,
	type ComponentProps,
	type ComponentRef,
	type CSSProperties,
	type ElementType,
	type FunctionComponent,
	type JSX,
	type ReactElement,
	type Ref,
} from 'react'

import type { AsTag, ValidElement } from './types'
// import type { ClassValue } from 'clsx'
import type { CSSVars } from '@/types/shared'
import type { SpecsContract } from '@/types/spec'

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

export type PropertiesBase<C extends ElementType> =
	Pick<FunctionComponent<ComponentProps<C>>, 'displayName'>

// interface SpecStructure {
// 	attributes?: SpecAttributes
// 	classNames?: ClassValue
// 	styles?: CSSProperties
// 	tokens?: CSSVars
// 	unstyled?: boolean
// 	variant?: string
// }

// export type PolymorphicProps<C, P> =
// 	{ as?: AsTag<C, P> }
// 	& (
// 		C extends ValidElement
// 			? Omit<ExtendedProps<C, P>, 'as'> & {
// 					ref?: Ref<ComponentRef<C>>
// 				}
// 			: Omit<P, 'as'>
// 	)
// 	& SpecStructure

type _Tag<C> = [C] extends [undefined] ? 'div' : NonNullable<C>   // tuple-wrapped: no distribution

// export type PolymorphicProps<C, P> =
// 	// bare `C` => a real inference site
// 	& { as?: C }
// 	// preserves ButtonSection's `as?: never` ban: {as?: C} & {as?: never} => as?: never
// 	& ('as' extends keyof P ? { as?: P['as'] } : unknown)
// 	& ( _Tag<C> extends ValidElement
// 			? Omit<ExtendedProps<_Tag<C>, P>, 'as'>
// 			: Omit<P, 'as'> )
// 	& SpecsContract

export type PolymorphicProps<
	P,
	C,
> =
	& P
	& Omit<SpecsContract, 'props'>
	& { as?: 'as' extends keyof P ? P['as'] : C }
	// & ('as' extends keyof P
	// 	? { as?: P['as'] } & Omit<P, 'as'>
	// 	: { as?: C } & P
	// )
	// & { as?: C }
	// & ('as' extends keyof P ? { as?: P['as'] } : unknown)
	// & ( _Tag<C> extends ValidElement
	// 		? Omit<ExtendedProps<_Tag<C>, P>, 'as'>
	// 		: Omit<P, 'as'> )


// interface _Component {
// 	<C extends ValidElement | undefined = 'div'>(props: PolymorphicProps<C, P0>): ReactElement | null
// }

export const toPolymorphic = <
	P0 extends object,
	C0 extends ValidElement,
>(
	target: (props: PolymorphicProps<P0, C0>) => ReactElement | null
) => {
	type PolymorphicBase =
		& typeof target
		& PropertiesBase<ComponentProps<C0>>

	const BaseComponent = memo(target) as unknown as PolymorphicBase
	// `| undefined` so `as: 'div' | undefined` is a legal candidate;
	// `= 'div'` so a *missing* `as` resolves to one tag, not 180

	// interface _Component {
	// 	<C extends ValidElement | undefined = 'div'>(props: PolymorphicProps<P0, C>): ReactElement | null
	// }

	return target as unknown as PolymorphicBase
}
