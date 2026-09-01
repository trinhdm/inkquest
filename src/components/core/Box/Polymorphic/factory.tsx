import { setDefaultProps } from '@/lib/registries'
import type { Simplify } from '@/types/utils'

import {
	memo,
	type ComponentType,
	type NamedExoticComponent,
	type ReactNode,
} from 'react'

import type {
	AsPolymorphic,
	ComponentSpecs,
	InferComponentSpec,
	// SpecsContract,
	SpecsDefaultProps,
	// Specs,
} from '@/types/spec'

export type FactoryProps<S extends ComponentSpecs> =
	S['props']
	// & ComponentSpecs<S>
	& AsPolymorphic<S>
	& {
		children?: ReactNode
		unstyled?: boolean
	}

// only pull `ref` from Specs when the component's own props don't already
// declare one — letting a component override, instead of intersecting with,
// the auto-derived `Ref<TagElement<T>>` (see Box/Spec audit, Button.tsx)
type _SpecsPickKeys<S extends ComponentSpecs> =
	| 'attributes'
	| 'id'
	| ('ref' extends keyof S['props'] ? never : 'ref')

type _OldFactoryProps<S extends ComponentSpecs> =
	& Pick<S, _SpecsPickKeys<S>>
	& FactoryProps<S>

type _DefaultComponent<S extends ComponentSpecs> = {
	props?: SpecsDefaultProps<S>
		& (S extends { specIs: { compound: true } }
			? { as?: never }
			: unknown extends InferComponentSpec<S>
					? Required<AsPolymorphic<S>>
					: AsPolymorphic<S>)
}

type _Component<S extends ComponentSpecs> =
	NamedExoticComponent<Simplify<_OldFactoryProps<S>>>

export interface MethodsBase<
	S extends ComponentSpecs,
	C = _Component<S>,
	P = FactoryProps<S>,
	D = _DefaultComponent<S>
> {
	classes?: Record<string, string>
	setDefaults: (args: D) => D
	withProps: (props: P) => C
}

export type SubcomponentsBase<
	S extends ComponentSpecs,
	List = S['subcomponents']
> = List extends Record<string, unknown>
	? List
	: Record<string, never>

type _FactoryComponent<S extends ComponentSpecs> =
	& _Component<S>
	& SubcomponentsBase<S>
	& MethodsBase<S>

export const factory = <
	T extends ComponentSpecs,
	C extends object = _FactoryComponent<T>
>(
	target: (props: FactoryProps<T>) => ReactNode,
	classes?: Record<string, string>
) => {
	type FC = _FactoryComponent<T>
	const BaseComponent = memo(target) as unknown as FC

	if (classes) BaseComponent.classes = classes

	BaseComponent.setDefaults = args => {
		const { displayName } = BaseComponent

		if (!displayName)
			throw new Error('cannot set defaultProps: missing `displayName`')

		if (args?.props && Object.keys(args.props).length)
			setDefaultProps(displayName, args.props)

		return args
	}

	BaseComponent.withProps = props => {
		type P = Parameters<typeof target>[0]

		const TempComponent = BaseComponent as ComponentType<P>,
			ExtendWith = (extended: P) => <TempComponent { ...props } { ...extended } />

		ExtendWith.displayName = `WithProps(${BaseComponent.displayName})`
		ExtendWith.setDefaults = BaseComponent.setDefaults

		return ExtendWith as unknown as FC
	}

	return BaseComponent as unknown as C
}
