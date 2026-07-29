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
import type { EventHandlers, SpecStructure } from './structure'

type _BaseProps<C extends ValidElement> = JSX.LibraryManagedAttributes<
	C,
	ComponentProps<C>
>

type _OverrideProps<P1 = object, P2 = object> =
	P2
	& Omit<P1, keyof P2>

type _InheritProps<C extends ValidElement, P2 = object> = _OverrideProps<
	_BaseProps<C>,
	P2
>

type _ExtractProps<T> =
	T extends { (props: infer P): unknown } ? P : never

export type ExistingProps<P extends ComponentProps<ElementType>> = Omit<
	FunctionComponent<P>,
	never
>

export type PolymorphicProps<C, P> =
	C extends ValidElement
		? SpecStructure<P> & EventHandlers<C> & _InheritProps<C, P> & {
				as?: AsTag<C, P>
				ref?: Ref<ComponentRef<C>>
			}
		: P & SpecStructure<P> & { as?: ElementType }

export const toPolymorphic = <T,>(target: T) => {
	interface _Component {
		<C = 'div', P = _ExtractProps<C>>(props: PolymorphicProps<C, P>): ReactElement | null
	}

	type PolymorphicBase = _Component
 		& ExistingProps<ComponentProps<ElementType>>

	return target as PolymorphicBase
}
