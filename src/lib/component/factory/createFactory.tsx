import {
	memo,
	type ComponentType,
	type CSSProperties,
	type NamedExoticComponent,
	type ReactNode,
} from 'react'

import { useProps as usePropsHook, setDefaultProps } from '@/hooks/useProps'
import { useStyles as useStylesHook, type StyleOptions } from '@/hooks/useStyles'
import { useVariants as useVariantsHook } from '@/hooks/useVariants'
import { keyHasValue } from '@/utils/helpers'
import { POLYMORPHIC_MARKER } from './constants'
import type { AsPolymorphic, Specs, SpecsDefaultProps } from './types'
import type { DistributiveOmit, WithDefaults } from '@/types/utils'
import type { SpecAttributes } from '@/types/shared'

type _CommonProps = {
	attributes?: SpecAttributes
	children?: ReactNode
	className?: string
	id?: string
	style?: CSSProperties
	unstyled?: boolean
}

type _ComponentProps<S extends Specs> =
	S['props']
	& AsPolymorphic<S>
	& _CommonProps

type _AsDefaultProps<S extends Specs> =
	AsPolymorphic<S> extends { as?: never }
		? { as?: never }
		: Required<AsPolymorphic<S>>

type _DefaultProps<S extends Specs> =
	Partial<DistributiveOmit<S['props'], 'as'>>
	& Required<Pick<S['props'], SpecsDefaultProps<S> & keyof S['props']>>
	& _AsDefaultProps<S>

type _SetDefaultProps<S extends Specs> =
	[SpecsDefaultProps<S>] extends [never]
		? { defaultProps?: _DefaultProps<S> }
		: { defaultProps: _DefaultProps<S> }

type _MethodSet<S extends Specs> =
	& _SetDefaultProps<S>
	& { displayName?: string }

type _Component<S extends Specs> =
	NamedExoticComponent<_ComponentProps<S>>

export interface MethodsBase<
	S extends Specs,
	C = _Component<S>,
	P = _ComponentProps<S>,
	D = _MethodSet<S>
> {
	set: (args: D) => D
	withProps: (props: P) => C
}

export type SubcomponentsBase<
	S extends Specs,
	C = S['subcomponents']
> = C extends Record<string, unknown>
	? C
	: Record<string, never>

type _FactoryComponent<S extends Specs> =
	& _Component<S>
	& SubcomponentsBase<S>
	& MethodsBase<S>

type _FactoryProps<S extends Specs> =
	WithDefaults<_ComponentProps<S>, SpecsDefaultProps<S>>

type _FactoryStyles<S extends Specs> =
	& Omit<StyleOptions<S>, 'classes'>
	& Partial<Pick<FactoryConfig<S>, 'name'>>

interface _FactoryTools<S extends Specs> {
	useProps: <P extends object = _FactoryProps<S>>(_props?: P) => P
	useStyles: (options: _FactoryStyles<S>) => ReturnType<typeof useStylesHook<S>>
	useVariants: () => void
}

export interface FactoryConfig<S extends Specs> {
	readonly classes?: StyleOptions<S>['classes']
	name: string
}

type _FactoryTarget<S extends Specs> =
	(_props: _FactoryProps<S>, tools: _FactoryTools<S>) => ReactNode

export const createFactory = <
	S extends Specs,
	C extends object = _FactoryComponent<S>
>(
	target: _FactoryTarget<S>,
	{ classes, name }: FactoryConfig<S>,
) => {
	type FC = _FactoryComponent<S>

	const tooling = (_props: _FactoryProps<S>): _FactoryTools<S> => ({
		useProps: function useProps(props) {
			return usePropsHook(name, (props ?? _props) as NonNullable<typeof props>)
		},
		useStyles: function useStyles({ name: scope = name, ...options }) {
			const args = { ...options, classes: classes as StyleOptions<S>['classes'] }
			return useStylesHook<S>(scope, args)
		},
		useVariants: function useVariants() {
			return useVariantsHook(name)
		},
	})

	const Render = (_props: _FactoryProps<S>) => target(_props, tooling(_props))
	const BaseComponent = memo(Render) as unknown as FC

	BaseComponent.displayName = name
	Object.defineProperty(BaseComponent, POLYMORPHIC_MARKER, { value: true })

	BaseComponent.set = args => {
		let { displayName } = BaseComponent

		if (keyHasValue(args, 'displayName') && displayName !== name) {
			BaseComponent.displayName = args.displayName
			;({ displayName } = BaseComponent)
		}

		if (keyHasValue(args, 'defaultProps') && !!displayName)
			setDefaultProps(displayName, args.defaultProps)

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
