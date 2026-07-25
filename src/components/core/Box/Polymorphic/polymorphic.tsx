import type {
	ComponentProps,
	ComponentType,
	ElementType,
	FunctionComponent,
	JSX,
	JSXElementConstructor,
	ReactElement,
} from 'react'


type  ValidElement =
	| keyof JSX.IntrinsicElements
	| JSXElementConstructor<any>

type ElementTag<C, P> = 'as' extends keyof P ? P['as'] : C

type ElementProps<C extends ValidElement> = JSX.LibraryManagedAttributes<
	C,
	ComponentProps<C>
>

type OverriddenProps<Props = {}, Override = {}> =
	Override
	& Omit<Props, keyof Override>

type InheritedProps<C extends ValidElement, Props = {}> = OverriddenProps<
	ElementProps<C>,
	Props
>

export type ExistingProps<P extends ComponentProps<any>> = Omit<
	FunctionComponent<P>,
	never
>

export type PolymorphicRef<C> = C extends ValidElement
	? ComponentProps<C>['ref']
	: never

export type PolymorphicProps<C, P, T = ElementTag<C, P>> = C extends ValidElement
	? InheritedProps<C, P> & {
			as?: T
			ref?: PolymorphicRef<T>
		}
	: P & { as?: ElementType }

type ExtractProps<T> = T extends { (props: infer P): any } ? P : never

export const polymorphic = <
	Component,
	Props = ExtractProps<Component>,
>(target: Component) => {
	// type Tag<C> = 'as' extends keyof Props ? Props['as'] : C

	type _Props<C, P> = PolymorphicProps<C, P>
	type _Component<C = 'div', P = Props> = (props: _Props<C, P>) => ReactElement | null
	type PolymorphicComponent = _Component
		& ExistingProps<ComponentProps<any>>

	return target as PolymorphicComponent
}


type ExtractFCProps<T> = T extends ComponentType<infer P>
	? P
	: T extends ValidElement
		? ComponentProps<T>
		: T

export const fcPolymorphic = <
	FC,
	Props = ExtractFCProps<FC>,
>(target: FC) => {
	type Tag<T> = 'as' extends keyof T ? T['as'] : T

	type _FComponentProps<T> = PolymorphicProps<Tag<T>, Props>
	type _TagProps<T> = ExtractFCProps<Tag<T>>
	type _Props<C> = _FComponentProps<C> & _TagProps<C>

	type _FComponent<C = FC> = (props: _Props<C>) => ReactElement | null
	type PolymorphicFC = _FComponent
		& ExistingProps<ComponentProps<any>>

	return target as PolymorphicFC

	// type _TagProps<T> = 'as' extends keyof T ? T['as'] : never
	// type _Props = ExtractProps<T['as']<T>>
}
