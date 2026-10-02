import type { ComponentProps, ElementType, ReactElement } from 'react'
import type { FactoryDisplayName, PolymorphicProps } from './types'
import type { DEFAULT_TAG } from './constants'

export const definePolymorphic = <
	P0 extends object,
	C0 extends ElementType,
>(
	target: (props: PolymorphicProps<P0, C0>) => ReactElement | null
) => {
	interface _Component {
		<C extends ElementType | undefined = typeof DEFAULT_TAG>(props: PolymorphicProps<P0, C>): ReactElement | null
	}

	type PolymorphicBase =
		& _Component
		& Required<FactoryDisplayName<ComponentProps<C0>>>

	return target as unknown as PolymorphicBase
}
