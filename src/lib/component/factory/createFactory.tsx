import { memo, type ComponentType, type ReactNode } from 'react'
import { useProps as usePropsHook, setDefaultProps } from '@/hooks/useProps'
import { useStyles as useStylesHook, type StyleOptions } from '@/hooks/useStyles'
import { useVariants as useVariantsHook } from '@/hooks/useVariants'
import { keyHasValue } from '@/utils/helpers'
import { POLYMORPHIC_MARKER } from './constants'
import type {
	FactoryComponent, FactorySubcomponents,
	FactoryMethods, FactoryPropsList,
	Specs, SpecsDefaultProps,
	WithDefaults,
} from './types'

type _FactoryComponent<S extends Specs> =
	& FactoryComponent<S>
	& FactorySubcomponents<S>
	& FactoryMethods<S>

type _FactoryProps<S extends Specs> =
	WithDefaults<FactoryPropsList<S>, SpecsDefaultProps<S>>

type _FactoryStyles<S extends Specs> =
	& Omit<StyleOptions<S>, 'classes'>
	& Partial<Pick<FactoryConfig<S>, 'name'>>

type _FactoryTarget<S extends Specs> =
	(_props: _FactoryProps<S>, tools: _FactoryTools<S>) => ReactNode

interface _FactoryTools<S extends Specs> {
	useProps: <P extends object = _FactoryProps<S>>(_props?: P) => P
	useStyles: (options: _FactoryStyles<S>) => ReturnType<typeof useStylesHook<S>>
	useVariants: () => void
}

export interface FactoryConfig<S extends Specs> {
	readonly classes?: StyleOptions<S>['classes']
	name: string
}

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

		if (keyHasValue(args, 'subcomponents'))
			Object.assign(BaseComponent, args.subcomponents)

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
