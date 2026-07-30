import { setDefaultProps } from '@/lib/registries'

import type {
	ComponentType,
	ElementType,
	NamedExoticComponent,
	ReactNode,
	Ref,
} from 'react'

import type { DataAttrs, InferSpecDefault, TagName } from './types'
import type { SpecStructure } from './structure'


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
	// default?: {
	// 	component?: unknown extends T
	// 		? unknown
	// 		: T extends TagName
	// 			? T
	// 			: never
	// 	props?: Partial<P>
	// }
	default?: {
		component?: T extends TagName
			? T
			: unknown extends T
				? unknown
				: ElementType
		props?: Partial<P>
		ref?: never
	}
	id?: string
	is?: Partial<Record<_SpecOptions, boolean>>
	props: P
	ref?: Ref<T extends TagName ? HTMLElementTagNameMap[T] : unknown>
	subcomponents?: Record<string, unknown>
	variant?: string
}

type _PolymorphicSpec<S extends ComponentSpec> = {
	as?: unknown extends InferSpecDefault<S> ? ElementType : InferSpecDefault<S>
}

type _DefaultProps<S extends ComponentSpec> =
	Partial<S['props']>
	& _PolymorphicSpec<S>
	& DataAttrs

type _InferredDefault<S extends ComponentSpec> =
	{ props?: _DefaultProps<S> } & (
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
	default?: _InferredDefault<S>
	styles?: never
}

type _RootComponentSpec<S extends ComponentSpec> = {
	classNames?: SpecStructure<S>['classNames']
	default?: _InferredDefault<S>
	styles?: SpecStructure<S>['styles']
}

export type ExtendComponentSpec<S extends ComponentSpec> =
	NonNullable<S['is']>['compound'] extends true
		? _CompoundComponentSpec<S>
		: _RootComponentSpec<S>

type _PolymorphicProps<S extends ComponentSpec> =
	S['props']
	& _PolymorphicSpec<S>

type _FactoryProps<S extends ComponentSpec> =
	_PolymorphicProps<S>
	& Pick<S, 'ref'>

type _Component<S extends ComponentSpec> =
	NamedExoticComponent<_FactoryProps<S>>

type ThemeDefaults<S extends ComponentSpec, P = _DefaultProps<S>> = {
	props?: P & (
		'as' extends keyof P
			? unknown extends InferSpecDefault<S>
				? Pick<P, 'as'>
				: Required<Pick<P, 'as'>>
			: never
		)
}

export interface FactoryUtils<
	S extends ComponentSpec,
	C = _Component<S>,
	P = _PolymorphicProps<S>,
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
		type P = Parameters<typeof target>[0]

		const TempComponent = BaseComponent as ComponentType<P>
		const ExtendWith = (extended: P) => <TempComponent { ...props } { ...extended } />

		ExtendWith.displayName = `WithProps(${BaseComponent.displayName})`
		ExtendWith.setDefaults = BaseComponent.setDefaults

		return ExtendWith as unknown as _FactoryComponent
	}

	return BaseComponent as C
}
