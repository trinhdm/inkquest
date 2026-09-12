import {
	memo,
	type ComponentType,
	type CSSProperties,
	type NamedExoticComponent,
	type ReactNode,
} from 'react'

import { setDefaultProps } from '@/lib/registries'
import type { AsPolymorphic, IsPolymorphic, SpecDefaultProps, Specs } from './specs.types'
import type { DistributiveOmit, WithDefaults } from '@/types/utils'

type _FactoryProps<S extends Specs> =
	S['props']
	& AsPolymorphic<S>
	& {
		children?: ReactNode
		className?: string
		style?: CSSProperties
		unstyled?: boolean
	}

type _Component<S extends Specs> =
	NamedExoticComponent<_FactoryProps<S>>

type _BodyProps<S extends Specs> =
	WithDefaults<_FactoryProps<S>, SpecDefaultProps<S>>

type _DefaultProps<S extends Specs> =
	Partial<DistributiveOmit<S['props'], 'as'>>
	& Required<Pick<S['props'], SpecDefaultProps<S> & keyof S['props']>>
	& (IsPolymorphic<S> extends true
		? Required<AsPolymorphic<S>>
		: { as?: never })

type _MethodSetDefault<S extends Specs> =
	[SpecDefaultProps<S>] extends [never]
		? { props?: _DefaultProps<S> }
		: { props: _DefaultProps<S> }

// type _MethodSetDefault<S extends Specs> = {
// 	props?: Partial<DistributiveOmit<S['props'], 'as'>>
// 		& (IsPolymorphic<S> extends true
// 			? Required<AsPolymorphic<S>>
// 			: { as?: never })
// }

export interface MethodsBase<
	S extends Specs,
	C = _Component<S>,
	P = _FactoryProps<S>,
	D = _MethodSetDefault<S>
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

export const POLYMORPHIC = Symbol.for('inkq.polymorphic')

export const factory = <
	T extends Specs,
	C extends object = _FactoryComponent<T>
>(
	// target: (props: _FactoryProps<T>) => ReactNode,
	target: (props: _BodyProps<T>) => ReactNode,
	classes?: Record<string, string>
) => {
	type FC = _FactoryComponent<T>

	const BaseComponent = memo(target) as unknown as FC
	Object.defineProperty(BaseComponent, POLYMORPHIC, { value: true })

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

		return Object.assign(ExtendWith, BaseComponent, {
			displayName: `WithProps(${BaseComponent.displayName})`,
		}) as unknown as FC
	}

	return BaseComponent as unknown as C
}
