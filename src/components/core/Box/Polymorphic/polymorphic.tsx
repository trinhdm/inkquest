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
import type { SpecStructure, TagName } from '@/types/spec'

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

export type PropertiesBase<P extends ComponentProps<ElementType>> =
	Pick<FunctionComponent<P>, 'displayName'>

export type PolymorphicProps<C, P> =
    SpecStructure<C> & (
        C extends ValidElement
            ? ExtendedProps<C, P> & {
                    as?: AsTag<C, P>
                    ref?: Ref<ComponentRef<C>>
                }
            : P & { as?: ElementType }
    )

export const toPolymorphic = <
	C0 extends ValidElement,
	P0 extends object,
>(
	target: (props: PolymorphicProps<C0, P0>) => ReactElement | null
) => {
	interface _Component {
		<C extends ValidElement>(props: PolymorphicProps<C, P0>): ReactElement | null
	}

	type PolymorphicBase = _Component
		 & PropertiesBase<ComponentProps<ElementType>>

	return target as PolymorphicBase
}
