import {
	factory,
	type MethodsBase,
	type SubcomponentsBase,
} from './factory'

import type {
	AsPolymorphic,
	ComponentSpecs,
} from '@/types/spec'

import type { ReactElement } from 'react'
import type { PolymorphicProps, PropertiesBase } from './polymorphic'

// type _PropsVariant<T extends Specs> =
// 	T['props'] extends { variant?: unknown }
// 		? NonNullable<T['props']>['variant']
// 		: never

// type _SpecVariant<S> =
// 	S extends { variant?: unknown } ? S['variant'] : never

// type PolymorphicSpec<T extends Specs> =
// 	T['props']
// 	& ComponentSpecs<T> & {
// 		variant?: _PropsVariant<T> extends infer VP
// 			? VP extends string
// 				? Exclude<VP, undefined>
// 				: _SpecVariant<T>
// 			: never
// 	}

// export type PolymorphicSpecs<T extends Specs> =
// 	PolymorphicSpec<T>

const polymorphicFactory = <T extends ComponentSpecs>(
	target: Parameters<typeof factory<T>>[0],
	classes?: Record<string, string>
) => {
	type C = NonNullable<AsPolymorphic<T>['as']>
	type P<U> = PolymorphicProps<T['props'], U>

	type _Component = T extends { specIs: { compound: true } }
		? (props: P<never>) => ReactElement
		: <U = C>(props: P<U>) => ReactElement

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

export const polymorphic = <
	T extends ComponentSpecs,
	U extends typeof polymorphicFactory<T> = typeof polymorphicFactory<T>,
	P extends Parameters<U>[0] = Parameters<U>[0],
>(
	target: P,
	classes?: Record<string, string>
) =>
	polymorphicFactory<T>(target as P, classes)
