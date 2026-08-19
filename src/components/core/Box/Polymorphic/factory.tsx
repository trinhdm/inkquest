import { setDefaultProps } from '@/lib/registries'

import {
	memo,
	type ComponentType,
	type NamedExoticComponent,
	type ReactNode,
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

// only pull `ref` from Specs when the component's own props don't already
// declare one — letting a component override, instead of intersecting with,
// the auto-derived `Ref<TagElement<T>>` (see Box/Spec audit, Button.tsx)
type _SpecsPickKeys<S extends Specs> =
	| 'attributes'
	| 'id'
	| ('ref' extends keyof S['props'] ? never : 'ref')

type _FactoryProps<S extends Specs> =
	& Pick<S, _SpecsPickKeys<S>>
	& _PolymorphicProps<S>
	// & PickStartsWith<PolymorphicProps<InferComponentSpec<S>, S['props']>, 'on'>
	// PolymorphicProps<InferComponentSpec<S>, _PolymorphicProps<S>>

type _DefaultComponent<S extends Specs, P = InferDefaultProps<S>> = {
	props?: P & (
		'as' extends keyof P
			? unknown extends InferComponentSpec<S>
				? Required<Pick<P, 'as'>>
				: Pick<P, 'as'>
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
	classes?: Record<string, string>
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
>(
	target: (props: _FactoryProps<S>) => ReactNode,
	classes?: Record<string, string>
) => {
	type FC = _FactoryComponent<S>
	const BaseComponent = memo(target) as unknown as FC

	if (classes) BaseComponent.classes = classes

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

	// cast the assignment itself, matching `memo(target) as unknown as FC`
	// above: `_FactoryProps<S>` is conditional on `S['props']` now (for the
	// ref-override support), which TypeScript can't verify generically
	// against `MethodsBase`'s simpler default `P`/`C` for an abstract `S` —
	// even though any concrete `S` satisfies it. See Box/Spec audit.
	BaseComponent.withProps = ((props: Parameters<typeof target>[0]): FC => {
		type P = Parameters<typeof target>[0]

		const TempComponent = BaseComponent as ComponentType<P>,
			ExtendWith = (extended: P) => <TempComponent { ...props } { ...extended } />

		ExtendWith.displayName = `WithProps(${BaseComponent.displayName})`
		ExtendWith.setDefaults = BaseComponent.setDefaults

		return ExtendWith as unknown as FC
	}) as unknown as MethodsBase<S>['withProps']

	return BaseComponent as unknown as C
}
