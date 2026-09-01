import {
	factory,
	type MethodsBase,
	type SubcomponentsBase,
} from './factory'

import type { AsPolymorphic, Specs } from '@/types/spec'
import type { ReactElement } from 'react'
import type { PolymorphicProps, PropertiesBase } from './polymorphic'

const polymorphicFactory = <T extends Specs>(
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
	T extends Specs,
	U extends typeof polymorphicFactory<T> = typeof polymorphicFactory<T>,
	P extends Parameters<U>[0] = Parameters<U>[0],
>(
	target: P,
	classes?: Record<string, string>
) =>
	polymorphicFactory<T>(target as P, classes)
