import {
	memo,
	type ComponentType,
	type CSSProperties,
	type NamedExoticComponent,
	type ReactNode,
} from 'react'

import { useStyles as useStylesHook, type StyleFn, type StyleOptions } from '@/hooks/useStyles'
import { keyHasValue } from '@/utils/helpers'
import { setDefaultProps } from '@/hooks/useProps'
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

type _MethodSetDefault<S extends Specs> =
	[SpecsDefaultProps<S>] extends [never]
		? { props?: _DefaultProps<S> }
		: { props: _DefaultProps<S> }

type _Component<S extends Specs> =
	NamedExoticComponent<_ComponentProps<S>>

export interface MethodsBase<
	S extends Specs,
	C = _Component<S>,
	P = _ComponentProps<S>,
	D = _MethodSetDefault<S>
> {
	classes?: Record<string, string>
	setDefaults: (defaults: D) => D
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

type _FactoryProps<S extends Specs> =
	WithDefaults<_ComponentProps<S>, SpecsDefaultProps<S>>

type _FactoryStyles<S extends Specs> =
	Omit<StyleOptions<S>, 'classes'>

interface _FactoryTools<S extends Specs> {
	useStyles: (name: string, opts: _FactoryStyles<S>) => StyleFn<S>
}

type _FactoryTarget<S extends Specs> =
	(_props: _FactoryProps<S>, tools: _FactoryTools<S>) => ReactNode

export const createFactory = <
	T extends Specs,
	C extends object = _FactoryComponent<T>
>(
	target: _FactoryTarget<T>,
	classes?: Record<string, string>,
) => {
	type FC = _FactoryComponent<T>

	const tools: _FactoryTools<T> = {
		useStyles: function useStyles(name, opts) {
			const args = { ...opts, classes: classes as StyleOptions<T>['classes'] }
			return useStylesHook<T>(name, args)
		},
	}

	const Render = (_props: _FactoryProps<T>) => target(_props, tools)
	const BaseComponent = memo(Render) as unknown as FC

	Object.defineProperty(BaseComponent, POLYMORPHIC_MARKER, { value: true })

	if (classes) BaseComponent.classes = classes

	BaseComponent.setDefaults = defaults => {
		const { displayName } = BaseComponent

		if (!displayName)
			throw new Error('cannot set defaultProps: missing `displayName`')

		if (keyHasValue(defaults, 'props') && defaults.props && Object.keys(defaults.props).length)
			setDefaultProps(displayName, defaults.props)

		return defaults
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
