import { setDefaultProps } from '@/lib/registries'

import type {
	ComponentType,
	CSSProperties,
	NamedExoticComponent,
	ReactNode,
	Ref,
} from 'react'

import type { ClassValue } from 'clsx'
import type { DataAttrs, InferSpecDefault, TagName } from './types'


type _SpecOptions =
	| 'compound'					// compound components cannot have styles
	| 'disabled'
	| 'focusable'
	| 'unstyled'

export interface ComponentSpec<
	T = unknown,
	P extends object = object,
> {
	attributes?: Record<string, unknown>
	ctx?: unknown
	id?: string
	is?: Partial<Record<_SpecOptions, boolean>>
	props: P
	ref?: Ref<T extends TagName ? HTMLElementTagNameMap[T] : unknown>
	subcomponents?: Record<string, unknown>
	variant?: string
}

type _SpecProps<S extends ComponentSpec> =
	Partial<S['props']>
	& DataAttrs

type _InferredDefault<S extends ComponentSpec> =
	{ props?: _SpecProps<S> } & (
	InferSpecDefault<S> extends TagName ? {
		component: InferSpecDefault<S>
		ref: HTMLElementTagNameMap[InferSpecDefault<S>]
	} : {
		component?: never
		ref?: never
	}
)

type _CompoundComponentSpec<S extends ComponentSpec> = {
	classNames?: never
	default: _InferredDefault<S>
	styles?: never
}

type _RootComponentSpec<S extends ComponentSpec> = {
	classNames?: ClassValue
	default: _InferredDefault<S>
	styles?: CSSProperties
}

export type ExtendComponentSpec<S extends ComponentSpec> =
	NonNullable<S['is']>['compound'] extends true
		? _CompoundComponentSpec<S>
		: _RootComponentSpec<S>

type _PolymorphicSpec<
	S extends ComponentSpec,
	C = InferSpecDefault<S>
> = S['props'] & {
	as?: C extends never ? never : C
}

type _FactoryProps<S extends ComponentSpec> =
	_PolymorphicSpec<S> & Pick<S, 'ref'>

type _Component<S extends ComponentSpec> =
	NamedExoticComponent<_FactoryProps<S>>

type ThemeDefaults<S extends ComponentSpec> = Pick<ExtendComponentSpec<S>['default'], 'props'>

export interface FactoryUtils<
	S extends ComponentSpec,
	C = _Component<S>,
	P = _PolymorphicSpec<S>,
> {
	setDefaults: (args: ThemeDefaults<S>) => ThemeDefaults<S>
	withProps: (props: P) => C
}

export type Subcomponents<
	S extends ComponentSpec,
	List = S['subcomponents']
> = List extends Record<string, unknown>
	? List
	: Record<string, never>

export const factory = <
	S extends ComponentSpec,
	C = unknown,
>(target: (props: _FactoryProps<S>) => ReactNode) => {
	type _FactoryComponent =
		& _Component<S>
		& Subcomponents<S>
		& FactoryUtils<S>

	const BaseComponent = target as unknown as _FactoryComponent

	BaseComponent.setDefaults = (args: ThemeDefaults<S>) => {
		const { displayName } = BaseComponent

		if (!displayName)
			throw new Error('cannot set defaultProps: missing `displayName`')
		if (args?.props && Object.keys(args.props).length)
			setDefaultProps(displayName, args.props)

		return args
	}

	BaseComponent.withProps = (props: Parameters<typeof target>[0]): _FactoryComponent => {
		const TempComponent = BaseComponent as unknown as ComponentType<Record<string, unknown>>
		const ExtendWith = (
			extended: Record<string, unknown>
		) => <TempComponent { ...props } { ...extended } />

		ExtendWith.displayName = `WithProps(${BaseComponent.displayName})`
		ExtendWith.setDefaults = BaseComponent.setDefaults

		return ExtendWith as unknown as _FactoryComponent
	}

	return BaseComponent as C
}
