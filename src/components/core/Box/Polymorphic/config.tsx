import {
	factory,
	// type Specs,
	type ExtendedSpec,
	type MethodsBase,
	type SubcomponentsBase,
} from './factory'

import type { ReactElement } from 'react'
import type { PolymorphicProps, PropertiesBase } from './polymorphic'
import type { InferComponentSpec, Specs, ValidSpecs } from '@/types/spec'
import type { ValueOf } from './types'

type PolymorphicSpec<
	S extends ValidSpecs<S>,
	K = InferComponentSpec<S>,
	// V = S['props'] extends { variant?: infer PV } ? PV : never,
> = Specs<K, S['props']>
	& ExtendedSpec<S> & {
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
>(target: Parameters<typeof factory<S>>[0]) => {
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

	return factory<S, PolymorphicComponent>(target)
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
>(target: P & _ExcessMarker<SC>) =>
	polymorphicFactory<SC>(target as P)



// type _PolymorphicArgs<SC extends ValidSpecs<SC>> =
// 	_IsClean<SC> extends true
// 		? [target: Parameters<typeof polymorphicFactory<SC>>[0]]
// 		: [
// 			target: Parameters<typeof polymorphicFactory<SC>>[0],
// 			error: `SC contains unexpected key(s), either at the top level or inside 'default'`,
// 		]

// export const polymorphic = <
// 	SC extends ValidSpecs<SC>,
// >(...args: _PolymorphicArgs<SC>) =>
// 	polymorphicFactory<SC>(args[0])




// type _HasValidDefault<SC> =
// 	InferComponentSpec<SC> extends TagName
// 		? true
// 		: unknown extends InferComponentSpec<SC>
// 			? true
// 			: false

// type _PolymorphicArgs<SC extends ValidSpecs<SC> =
// 	_HasValidDefault<SC> extends true
// 		? [target: Parameters<typeof polymorphicFactory<SC>>[0]]
// 		: [
// 			target: Parameters<typeof polymorphicFactory<SC>>[0],
// 			error: `SC['default']['component'] must be a valid HTML tag name`,
// 		]

// export const polymorphic = <
// 	SC extends ValidSpecs<SC>,
// >(...args: _PolymorphicArgs<SC>) =>
// 	polymorphicFactory<SC>(args[0])

// export const polymorphic = polymorphicFactory




// type _NoExcessTop<S> =
// 	Exclude<keyof S, keyof Specs> extends never
// 		? true
// 		: false

// type _DefaultIsClean<S> =
// 	S extends { default: infer D }
// 		? Exclude<keyof D, 'component'> extends never
// 			? true
// 			: false
// 		: true

// type _IsClean<SC> =
// 	_NoExcessTop<SC> extends true
// 		? _DefaultIsClean<SC> extends true
// 			? true
// 			: false
// 		: false

// type _ExcessMarker<SC> =
// 	_IsClean<SC> extends true
// 		? unknown
// 		: { unexpectedKeyInSpecs: 'SC contains a key not defined in Specs, either at the top level or inside default' }

// export const polymorphic = <
// 	SC extends ValidSpecs<SC>,
// >(target: Parameters<typeof polymorphicFactory<SC>>[0] & _ExcessMarker<SC>) =>
// 	polymorphicFactory<SC>(target as Parameters<typeof polymorphicFactory<SC>>[0])


