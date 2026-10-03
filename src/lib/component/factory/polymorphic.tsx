import { createFactory } from './createFactory'
import type { ElementType, ReactElement } from 'react'
import type {
	FactoryDisplayName,
	FactoryMethods, FactorySubcomponents,
	IsPolymorphic, PolymorphicProps,
	Specs, SpecsDefaultAs,
} from './types'

type SpecsConstraint<T extends { props: object }> =
	Specs & { defaults?: { props?: keyof T['props'] } }

const polymorphicFactory = <
	S extends SpecsConstraint<S>,
	F extends typeof createFactory<S> = typeof createFactory<S>,
	T extends Parameters<F> = Parameters<F>
>(target: T[0], config: T[1]) => {
	type C = SpecsDefaultAs<S, ElementType>
	type P<U> = PolymorphicProps<S['props'], U>

	type _Component = IsPolymorphic<S> extends true
		? <U extends ElementType = C>(props: P<U>) => ReactElement
		: (props: P<never>) => ReactElement

	type _Subcomponents = FactorySubcomponents<S>
	type _Methods = FactoryMethods<S, _Component, P<C>>
	type _Properties = Required<FactoryDisplayName>

	type PolymorphicComponent =
		& _Component
		& _Subcomponents
		& _Methods
		& _Properties

	return createFactory<S, PolymorphicComponent>(target, config)
}

export const polymorphic = <
	S extends SpecsConstraint<S>,
	F extends typeof polymorphicFactory<S> = typeof polymorphicFactory<S>,
	T extends Parameters<F> = Parameters<F>
>(target: T[0], config: T[1]) =>
	polymorphicFactory<S>(target, config)
