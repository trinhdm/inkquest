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

export type PolymorphicProps<C, P> =
	C extends ValidElement
		? InheritedProps<C, P> & {
				as?: AsTag<C, P>
				ref?: Ref<ComponentRef<C>>
			}
		: P & { as?: ElementType }

type ExtractProps<T> = T extends { (props: infer P): unknown } ? P : never

export const toPolymorphic = <T,>(target: T) => {
	interface _Component {
		<C = 'div', P = ExtractProps<C>>(props: PolymorphicProps<C, P>): ReactElement | null
	}

	type PolymorphicBase = _Component
 		& ExistingProps<ComponentProps<ElementType>>

	return target as PolymorphicBase
}
