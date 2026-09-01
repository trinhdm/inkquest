import {
	factory,
	type MethodsBase,
	type SubcomponentsBase,
} from './factory'

import type {
	ComponentSpecs,
	// ExtendedSpecs,
	// InferComponentSpec,
	BaseSpecs,
	Specs,
	SpecsContract,
	SpecsList,
	// ValidSpecs,
} from '@/types/spec'

import type { ReactElement } from 'react'
import type { PolymorphicProps, PropertiesBase } from './polymorphic'
import type { ValueOf } from './types'

type _PropsVariant<T extends Specs> =
	T['props'] extends { variant?: unknown }
		? NonNullable<T['props']>['variant']
		: never

// Specs already declares `variant?: string` at the top level — this stays
// a guarded lookup (not bare S['variant']) so it keeps working if that
// top-level field is ever narrowed or removed.
type _SpecVariant<S> =
	S extends { variant?: unknown } ? S['variant'] : never

type PolymorphicSpec<
	T extends Specs,
	// K = InferComponentSpec<T>,
	// V = S['props'] extends { variant?: infer PV } ? PV : never,
> = T['props']
	& ComponentSpecs<T> & {
		// subcomponents?: T['subcomponents']
		variant?: _PropsVariant<T> extends infer VP
			? VP extends string
				? Exclude<VP, undefined>
				: _SpecVariant<T>
			: never
	}

export type PolymorphicSpecs<T extends Specs> =
	PolymorphicSpec<T>

const polymorphicFactory = <
	T extends Specs,
	S extends PolymorphicSpec<T> = PolymorphicSpec<T>
>(
	target: Parameters<typeof factory<T>>[0],
	classes?: Record<string, string>
) => {
	type C = ValueOf<S, 'component'>
	type P<U> = PolymorphicProps<ValueOf<S, 'props'>, U>

	type _Component = <U = C>(props: P<U>) => ReactElement
	type _Subcomponents = SubcomponentsBase<T>
	type _Methods = MethodsBase<T, _Component, P<C>>
	type _Properties = PropertiesBase<P<unknown>>

	type PolymorphicComponent =
		& _Component
		& _Subcomponents
		& _Methods
		& _Properties

	return factory<T, PolymorphicComponent>(target, classes)
}

// type _TopExcessKeys<S> =
// 	Exclude<keyof S, keyof Specs>

// type _DefaultExcessKeys<S> =
// 	S extends { default: infer D }
// 		? Exclude<keyof D, 'component'>
// 		: never

// type _ExcessMarker<SC> =
// 	[_TopExcessKeys<SC>] extends [never]
// 		? [_DefaultExcessKeys<SC>] extends [never]
// 			? unknown
// 			: { keyNotDefinedInSpecsDefault: _DefaultExcessKeys<SC> }
// 		: { keyNotDefinedInSpecs: _TopExcessKeys<SC> }

export const polymorphic = <
	T extends Specs,
	U extends typeof polymorphicFactory<T> = typeof polymorphicFactory<T>,
	P extends Parameters<U>[0] = Parameters<U>[0],
>(
	target: P,
	classes?: Record<string, string>
) =>
	polymorphicFactory<T>(target as P, classes)
