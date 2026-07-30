import type {
	ComponentProps,
	ComponentRef,
	ElementType,
	FunctionComponent,
	JSX,
	ReactElement,
	Ref,
} from 'react'

import type { AsTag, ValidElement } from './types'
import type { SpecStructure } from '@/types/spec'

type _BaseProps<C extends ValidElement> = JSX.LibraryManagedAttributes<
	C,
	ComponentProps<C>
>

export type OverrideProps<P1 = object, P2 = object> =
	P2
	& Omit<P1, keyof P2>

export type ExtendedProps<C extends ValidElement, P2 = object> = OverrideProps<
	_BaseProps<C>,
	P2
>

//	InheritedProps

type _ExtractProps<T> =
	T extends { (props: infer P): unknown } ? P : never

export type PropertiesBase<P extends ComponentProps<ElementType>> = Omit<
	FunctionComponent<P>,
	never
>

export type PolymorphicProps<C, P> =
	SpecStructure<P> & (
		C extends ValidElement
			? ExtendedProps<C, P> & {
					as?: AsTag<C, P>
					ref?: Ref<ComponentRef<C>>
				}
			: P & { as?: ElementType }
	)

export const toPolymorphic = <T,>(target: T) => {
	interface _Component {
		<C = 'div', P = _ExtractProps<C>>(props: PolymorphicProps<C, P>): ReactElement | null
	}

	type PolymorphicBase = _Component
 		& PropertiesBase<ComponentProps<ElementType>>

	return target as PolymorphicBase
}
