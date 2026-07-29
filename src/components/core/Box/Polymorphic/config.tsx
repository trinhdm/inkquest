import {
	factory,
	type ComponentSpec,
	type FactoryUtils,
	type Subcomponents,
} from './factory'

import type { ReactElement } from 'react'
import type { ExistingProps, PolymorphicProps } from './polymorphic'
import type { InferSpecDefault, ValueOf } from './types'

//	fix circular logic

type PolymorphicSpec<
	K = unknown,
	S extends ComponentSpec<K> = ComponentSpec<K>,
	V = S['props'] extends { variant?: infer V2 } ? V2 : never,
> = ComponentSpec<K, S['props']> & {
	variant?: V extends string ? Exclude<V, undefined> : S['variant']
}

export type PolymorphicSpecs<
	K,
	S extends ComponentSpec<K> = ComponentSpec<K>,
> = PolymorphicSpec<K, S>

export const configPolymorphic = <S extends PolymorphicSpec<InferSpecDefault<S>>>(
	target: Parameters<typeof factory<S>>[0]
) => {
	type C = ValueOf<S, 'component'>
	type P<T> = PolymorphicProps<T, ValueOf<S, 'props'>>

	type _Component = <T = C>(props: P<T>) => ReactElement
	type _Subcomponents = Subcomponents<S>
	type _Utils = FactoryUtils<S, _Component, P<C>>
	type _Properties = ExistingProps<P<unknown>>

	type PolymorphicComponent =
		& _Component
		& _Subcomponents
		& _Utils
		& _Properties

	return factory<S, PolymorphicComponent>(target)
}
