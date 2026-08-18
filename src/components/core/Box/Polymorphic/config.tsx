import {
	factory,
	type MethodsBase,
	type SubcomponentsBase,
} from './factory'

import type {
	ExtendedSpecs,
	InferComponentSpec,
	Specs,
	ValidSpecs,
} from '@/types/spec'

import type { ReactElement } from 'react'
import type { PolymorphicProps, PropertiesBase } from './polymorphic'
import type { ValueOf } from './types'

type PolymorphicSpec<
	S extends ValidSpecs<S>,
	K = InferComponentSpec<S>,
	// V = S['props'] extends { variant?: infer PV } ? PV : never,
> = Specs<K, S['props']>
	& ExtendedSpecs<S> & {
			subcomponents?: S['subcomponents']
			variant?: S['props'] extends { variant?: infer VP }
				? VP extends string
					? Exclude<VP, undefined>
					: S extends { variant?: infer VS } ? VS : never
				: never
		}
	// & ExtendedSpec<S> & {
	// 		variant?: V extends string
	// 			? Exclude<V, undefined>
	// 			: S extends { variant?: infer SV } ? SV : never
	// 	}

export type PolymorphicSpecs<S extends ValidSpecs<S>> =
	PolymorphicSpec<S>

const polymorphicFactory = <
	SC extends ValidSpecs<SC>,
	S extends PolymorphicSpec<SC> = PolymorphicSpec<SC>
>(
	target: Parameters<typeof factory<S>>[0],
	classes?: Record<string, string>
) => {
	type C = ValueOf<S, 'component'>
	type P<T> = PolymorphicProps<T, ValueOf<S, 'props'>>

	type _Component = <T = C>(props: P<T>) => ReactElement
	type _Subcomponents = SubcomponentsBase<S>
	type _Methods = MethodsBase<S, _Component, P<C>>
	type _Properties = PropertiesBase<P<unknown>>

	type PolymorphicComponent =
		& _Component
		& _Subcomponents
		& _Methods
		& _Properties

	return factory<S, PolymorphicComponent>(target, classes)
}

type _TopExcessKeys<S> =
	Exclude<keyof S, keyof Specs>

type _DefaultExcessKeys<S> = S extends { default: infer D }
	? Exclude<keyof D, 'component'>
	: never

type _ExcessMarker<SC> =
	[_TopExcessKeys<SC>] extends [never]
		? [_DefaultExcessKeys<SC>] extends [never]
			? unknown
			: { keyNotDefinedInSpecsDefault: _DefaultExcessKeys<SC> }
		: { keyNotDefinedInSpecs: _TopExcessKeys<SC> }

export const polymorphic = <
	SC extends ValidSpecs<SC>,
	T extends typeof polymorphicFactory<SC> = typeof polymorphicFactory<SC>,
	P extends Parameters<T>[0] = Parameters<T>[0],
>(
	target: P & _ExcessMarker<SC>,
	classes?: Record<string, string>
) =>
	polymorphicFactory<SC>(target as P, classes)
