import type {
	ComponentProps,
	ComponentRef,
	ElementType,
	FunctionComponent,
	JSX,
	ReactElement,
} from 'react'

import type { AsTag, ValidElement } from './types'

type ElementProps<C extends ValidElement> = JSX.LibraryManagedAttributes<
	C,
	ComponentProps<C>
>

type OverriddenProps<Props = object, Override = object> =
	Override
	& Omit<Props, keyof Override>

type InheritedProps<C extends ValidElement, Props = object> = OverriddenProps<
	ElementProps<C>,
	Props
>

export type ExistingProps<P extends ComponentProps<ElementType>> = Omit<
	FunctionComponent<P>,
	never
>

type PolymorphicRef<C> = C extends ValidElement
	? ComponentRef<C>
	: never

export type PolymorphicProps<C, P, T = AsTag<C, P>> =
	C extends ValidElement
		? InheritedProps<C, P> & {
				as?: T
				ref?: PolymorphicRef<T>
			}
		: P & { as?: ElementType }

type ExtractProps<T> = T extends { (props: infer P): unknown } ? P : never

export const toPolymorphic = <C,>(target: C) => {
	interface _Component {
		<T = 'div', P = ExtractProps<T>>(props: PolymorphicProps<T, P>): ReactElement | null
	}

	type PolymorphicComponent = _Component
 		& ExistingProps<ComponentProps<ElementType>>

	return target as PolymorphicComponent
}
