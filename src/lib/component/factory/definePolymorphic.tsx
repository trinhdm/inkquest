import type {
	ComponentProps,
	ElementType,
	FunctionComponent,
	ReactElement,
} from 'react'

import type { PolymorphicProps } from './types'
import type { DEFAULT_TAG } from './constants'

export type BaseProps<P = object> =
	Required<Pick<FunctionComponent<P>, 'displayName'>>

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
		& BaseProps<ComponentProps<C0>>

	return target as unknown as PolymorphicBase
}
