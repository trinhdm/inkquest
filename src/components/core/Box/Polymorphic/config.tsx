import {
	factory,
	type MethodsBase,
	type SubcomponentsBase,
} from './factory'

import type { IsPolymorphic, SpecDefaultAs, Specs, ValidSpecs } from './specs.types'
import type { PolymorphicProps, PropertiesBase } from './polymorphic'
import type { ElementType, ReactElement } from 'react'

const polymorphicFactory = <T extends Specs & ValidSpecs<T>>(
	target: Parameters<typeof factory<T>>[0],
	classes?: Record<string, string>
) => {
	type C = SpecDefaultAs<T, ElementType>
	type P<U> = PolymorphicProps<T['props'], U>

	type _Component = IsPolymorphic<T> extends true
		? <U extends ElementType = C>(props: P<U>) => ReactElement
		: (props: P<never>) => ReactElement

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
	T extends Specs & ValidSpecs<T>,
	U extends typeof polymorphicFactory<T> = typeof polymorphicFactory<T>,
	P extends Parameters<U>[0] = Parameters<U>[0],
>(target: P, classes?: Record<string, string>) =>
	polymorphicFactory<T>(target as P, classes)
