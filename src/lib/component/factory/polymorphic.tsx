import {
	createFactory,
	type MethodsBase,
	type SubcomponentsBase,
} from './createFactory'

import type { ElementType, ReactElement } from 'react'
import type { BaseProps, PolymorphicProps } from './definePolymorphic'
import type { IsPolymorphic, SpecDefaultAs, SpecsConstraint } from './types'

const polymorphicFactory = <T extends SpecsConstraint<T>>(
	target: Parameters<typeof createFactory<T>>[0],
	classes?: Record<string, string>
) => {
	type C = SpecDefaultAs<T, ElementType>
	type P<U> = PolymorphicProps<T['props'], U>

	type _Component = IsPolymorphic<T> extends true
		? <U extends ElementType = C>(props: P<U>) => ReactElement
		: (props: P<never>) => ReactElement

	type _Subcomponents = SubcomponentsBase<T>
	type _Methods = MethodsBase<T, _Component, P<C>>
	type _Properties = BaseProps<P<unknown>>

	type PolymorphicComponent =
		& _Component
		& _Subcomponents
		& _Methods
		& _Properties

	return createFactory<T, PolymorphicComponent>(target, classes)
}

export const polymorphic = <
	T extends SpecsConstraint<T>,
	U extends typeof polymorphicFactory<T> = typeof polymorphicFactory<T>,
	P extends Parameters<U>[0] = Parameters<U>[0],
>(target: P, classes?: Record<string, string>) =>
	polymorphicFactory<T>(target as P, classes)
