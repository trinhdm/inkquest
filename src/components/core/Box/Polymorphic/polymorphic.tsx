import type {
	ComponentProps,
	ComponentRef,
	ComponentType,
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

export type PolymorphicRef<C> = C extends ValidElement
	? ComponentRef<C>
	: never

export type PolymorphicProps<C, P, T = AsTag<C, P>> = C extends ValidElement
	? InheritedProps<C, P> & {
			as?: T
			ref?: PolymorphicRef<T>
		}
	: P & { as?: ElementType }

type ExtractProps<T> = T extends { (props: infer P): unknown } ? P : never

export const polymorphic = <
	Component,
	Props = ExtractProps<Component>,
>(target: Component) => {
	type _Props<C, P> = PolymorphicProps<C, P>
	type _Component<C = 'div', P = Props> = (props: _Props<C, P>) => ReactElement | null
	type PolymorphicComponent = _Component
		& ExistingProps<ComponentProps<ElementType>>

	return target as PolymorphicComponent
}


type ExtractFCProps<T> = T extends ComponentType<infer P>
	? P
	: T extends ValidElement
		? ComponentProps<T>
		: T

export const fcPolymorphic = <FC,>(target: FC) => {
	type _FComponentProps<T> = PolymorphicProps<AsTag<T>, ExtractFCProps<FC>>
	type _TagProps<T> = ExtractFCProps<AsTag<T>>
	type _Props<C> = _FComponentProps<C> & _TagProps<C>

	type _FComponent<C = FC> = (props: _Props<C>) => ReactElement | null
	type PolymorphicFC = _FComponent
		& ExistingProps<ComponentProps<ElementType>>

	return target as PolymorphicFC
}
