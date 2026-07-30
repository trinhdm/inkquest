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
	// V = S['props'] extends { variant?: infer PV } ? PV : never,
> = ComponentSpec<K, S['props']>
	// & ExtendComponentSpec<S>
	& ExtendComponentSpec<S> & {
			variant?: S['props'] extends { variant?: infer VP }
				? VP extends string
					? Exclude<VP, undefined>
					: S extends { variant?: infer VS } ? VS : never
				: never
		}
	// & ExtendComponentSpec<S> & {
	// 		variant?: V extends string
	// 			? Exclude<V, undefined>
	// 			: S extends { variant?: infer SV } ? SV : never
	// 	}

export type PolymorphicSpecs<
	S extends ComponentSpec<InferSpecDefault<S>>,
> = PolymorphicSpec<S>

const polymorphicFactory = <
	Specs extends ComponentSpec<InferSpecDefault<Specs>>,
	S extends PolymorphicSpec<Specs> = PolymorphicSpec<Specs>
>(target: Parameters<typeof factory<S>>[0]) => {
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
type _TopExcessKeys<S> = Exclude<keyof S, keyof ComponentSpec>

type _DefaultExcessKeys<S> = S extends { default: infer D }
	? Exclude<keyof D, 'component'>
	: never

type _ExcessMarker<Specs> =
	[_TopExcessKeys<Specs>] extends [never]
		? [_DefaultExcessKeys<Specs>] extends [never]
			? unknown
			: { keyNotDefinedInSpecsDefault: _DefaultExcessKeys<Specs> }
		: { keyNotDefinedInSpecs: _TopExcessKeys<Specs> }

export const polymorphic = <
	Specs extends ComponentSpec<InferSpecDefault<Specs>>,
	S extends Parameters<typeof polymorphicFactory<Specs>>[0] = Parameters<typeof polymorphicFactory<Specs>>[0],
>(target: S & _ExcessMarker<Specs>) =>
	polymorphicFactory<Specs>(target as S)



// type _PolymorphicArgs<Specs extends ComponentSpec<InferSpecDefault<Specs>>> =
// 	_IsClean<Specs> extends true
// 		? [target: Parameters<typeof polymorphicFactory<Specs>>[0]]
// 		: [
// 			target: Parameters<typeof polymorphicFactory<Specs>>[0],
// 			error: `Specs contains unexpected key(s), either at the top level or inside 'default'`,
// 		]

// export const polymorphic = <
// 	Specs extends ComponentSpec<InferSpecDefault<Specs>>,
// >(...args: _PolymorphicArgs<Specs>) =>
// 	polymorphicFactory<Specs>(args[0])




// type _HasValidDefault<Specs> =
// 	InferSpecDefault<Specs> extends TagName
// 		? true
// 		: unknown extends InferSpecDefault<Specs>
// 			? true
// 			: false

// type _PolymorphicArgs<Specs extends ComponentSpec<InferSpecDefault<Specs>>> =
// 	_HasValidDefault<Specs> extends true
// 		? [target: Parameters<typeof polymorphicFactory<Specs>>[0]]
// 		: [
// 			target: Parameters<typeof polymorphicFactory<Specs>>[0],
// 			error: `Specs['default']['component'] must be a valid HTML tag name`,
// 		]

// export const polymorphic = <
// 	Specs extends ComponentSpec<InferSpecDefault<Specs>>,
// >(...args: _PolymorphicArgs<Specs>) =>
// 	polymorphicFactory<Specs>(args[0])

// export const polymorphic = polymorphicFactory




// type _NoExcessTop<S> =
// 	Exclude<keyof S, keyof ComponentSpec> extends never
// 		? true
// 		: false

// type _DefaultIsClean<S> =
// 	S extends { default: infer D }
// 		? Exclude<keyof D, 'component'> extends never
// 			? true
// 			: false
// 		: true

// type _IsClean<Specs> =
// 	_NoExcessTop<Specs> extends true
// 		? _DefaultIsClean<Specs> extends true
// 			? true
// 			: false
// 		: false

// type _ExcessMarker<Specs> =
// 	_IsClean<Specs> extends true
// 		? unknown
// 		: { unexpectedKeyInSpecs: 'Specs contains a key not defined in ComponentSpec, either at the top level or inside default' }

// export const polymorphic = <
// 	Specs extends ComponentSpec<InferSpecDefault<Specs>>,
// >(target: Parameters<typeof polymorphicFactory<Specs>>[0] & _ExcessMarker<Specs>) =>
// 	polymorphicFactory<Specs>(target as Parameters<typeof polymorphicFactory<Specs>>[0])


