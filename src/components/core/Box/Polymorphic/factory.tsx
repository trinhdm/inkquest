import { setDefaultProps } from '@/lib/registries'

import type {
	ComponentType,
	NamedExoticComponent,
	ReactNode,
} from 'react'

import type {
	InferComponentSpec,
	InferDefaultProps,
	PolymorphicSpec,
	Specs,
} from '@/types/spec'

type _PolymorphicProps<S extends Specs> =
	S['props']
	& PolymorphicSpec<S>
	// & PickStartsWith<PolymorphicProps<InferComponentSpec<S>, S['props']>, 'on'>

// type Test<S extends Specs, P1> =
// 	OverrideProps<_PolymorphicProps<S>, Pick<S, 'attributes' | 'id' | 'ref'>>

type _FactoryProps<S extends Specs> =
	// Pick<S, 'ref'>
	& Pick<S, 'attributes' | 'id' | 'ref'>
	& _PolymorphicProps<S>
	// & PickStartsWith<PolymorphicProps<InferComponentSpec<S>, S['props']>, 'on'>
	// PolymorphicProps<InferComponentSpec<S>, _PolymorphicProps<S>>

type _DefaultComponent<S extends Specs, P = InferDefaultProps<S>> = {
	props?: P & (
		'as' extends keyof P
			? unknown extends InferComponentSpec<S>
				? Pick<P, 'as'>
				: Required<Pick<P, 'as'>>
			: never
		)
}

type _Component<S extends Specs> =
	NamedExoticComponent<_FactoryProps<S>>

export interface MethodsBase<
	S extends Specs,
	C = _Component<S>,
	P = _PolymorphicProps<S>,
	D = _DefaultComponent<S>
> {
	setDefaults: (args: D) => D
	withProps: (props: P) => C
}

export type SubcomponentsBase<
	S extends Specs,
	List = S['subcomponents']
> = List extends Record<string, unknown>
	? List
	: Record<string, never>

type _FactoryComponent<S extends Specs> =
	& _Component<S>
	& SubcomponentsBase<S>
	& MethodsBase<S>

export const factory = <
	S extends Specs,
	C extends object = _FactoryComponent<S>
>(target: (props: _FactoryProps<S>) => ReactNode) => {
	type FC = _FactoryComponent<S>

	const BaseComponent = target as unknown as FC

	BaseComponent.setDefaults = (args: _DefaultComponent<S>) => {
		const { displayName } = BaseComponent

		if (!displayName)
			throw new Error('cannot set defaultProps: missing `displayName`')

		if (args?.props && Object.keys(args.props).length) {
			const props = { unstyled: false, ...args.props }
			setDefaultProps(displayName, props)
		}

		return args
	}

	BaseComponent.withProps = (props: Parameters<typeof target>[0]): FC => {
		type P = Parameters<typeof target>[0]

		const TempComponent = BaseComponent as ComponentType<P>,
			ExtendWith = (extended: P) => <TempComponent { ...props } { ...extended } />

		ExtendWith.displayName = `WithProps(${BaseComponent.displayName})`
		ExtendWith.setDefaults = BaseComponent.setDefaults

		return ExtendWith as unknown as FC
	}

	return BaseComponent as unknown as C
}
