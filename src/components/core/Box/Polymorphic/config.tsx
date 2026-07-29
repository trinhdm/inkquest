import {
	factory,
	type ComponentSpec,
	type ExtendComponentSpec,
	type FactoryUtils,
	type Subcomponents,
} from './factory'

import type { ReactElement } from 'react'
import type { ExistingProps, PolymorphicProps } from './polymorphic'
import type { InferSpecDefault, ValueOf } from './types'

type PolymorphicSpec<
	S extends ComponentSpec<InferSpecDefault<S>>,
	K = InferSpecDefault<S>,
	V = S['props'] extends { variant?: infer PV } ? PV : never,
> = ComponentSpec<K, S['props']>
	& ExtendComponentSpec<S> & {
		variant?: V extends string
			? Exclude<V, undefined>
			: S extends { variant?: infer SV } ? SV : never
	}

export type PolymorphicSpecs<
	S extends ComponentSpec<InferSpecDefault<S>>,
> = PolymorphicSpec<S>

const polymorphicFactory = <
	Specs extends ComponentSpec<InferSpecDefault<Specs>>,
	S extends PolymorphicSpec<Specs> = PolymorphicSpec<Specs>
>(
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

export const polymorphic = polymorphicFactory
