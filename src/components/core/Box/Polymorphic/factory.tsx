import type {
	ComponentType,
	CSSProperties,
	NamedExoticComponent,
	ReactNode,
	Ref,
	RefAttributes,
} from 'react'

import type { ClassValue } from 'clsx'
import type { DataAttrs, TagName } from './types'


type _SpecProps<P extends object> =
	Partial<P>
	& DataAttrs

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
	default?: { props?: _SpecProps<P> } & (
		T extends TagName ? {
			component: T
			ref: HTMLElementTagNameMap[T]
		} : {
			component?: never
			ref?: never
		}
	)
	id?: string
	is?: Partial<Record<_SpecOptions, boolean>>
	props: P
	ref?: Ref<T extends TagName ? HTMLElementTagNameMap[T] : unknown>
	subcomponents?: Record<string, unknown>
	variant?: string
}

interface _PolymorphicSpec<T = unknown> {
	as?: T
}

type _ComponentProps<S extends ComponentSpec> = _SpecProps<S['props']>

type _CompoundComponentSpec<S extends ComponentSpec> = _PolymorphicSpec<never> & {
	classNames?: never
	default?: Omit<S['default'], 'props'> & {
		props?: _ComponentProps<S>
	}
	styles?: never
}

type _RootComponentSpec<S extends ComponentSpec> = _PolymorphicSpec<NonNullable<S['default']>['component']> & {
	classNames?: ClassValue
	default?: Omit<S['default'], 'props'> & {
		props?: _ComponentProps<S>
	}
	styles?: CSSProperties
}

type _ExtendSpec<S extends ComponentSpec> =
	NonNullable<S['is']>['compound'] extends true
		? _CompoundComponentSpec<S>
		: _RootComponentSpec<S>

export type FactorySpec<S extends ComponentSpec> =
	S & _ExtendSpec<S>

type _Component<S extends ComponentSpec> = NamedExoticComponent<
	S['props']
	& { as: NonNullable<S['default']>['component'] }
	& RefAttributes<S['ref']>
	& _PolymorphicSpec
>

export interface FactoryUtils<
	S extends ComponentSpec,
	C = _Component<S>,
	P = Partial<S['props'] & { as: NonNullable<S['default']>['component'] }>,
> {
	extendTheme: (args: _ExtendSpec<S>) => _RootComponentSpec<S>
	withProps: (props: P) => C
}

export type Subcomponents<
	S extends ComponentSpec,
	List = S['subcomponents']
> = List extends Record<string, unknown>
	? List
	: Record<string, never>

const extendWith = <T,>(value: T): T => value

export const factory = <
	S extends ComponentSpec,
	C = unknown,
>(
	// target: (props: S['props'] & Pick<S, 'ref'>) => ReactNode
	target: (props: S['props'] & Pick<S, 'ref'> & { as?: NonNullable<S['default']>['component'] }) => ReactNode
) => {
	type _FactoryComponent =
		& _Component<S>
		& Subcomponents<S>
		& FactoryUtils<S>

	const BaseComponent = target as unknown as _FactoryComponent

	BaseComponent.extendTheme = extendWith
	BaseComponent.withProps = (props: Parameters<typeof target>[0]): _FactoryComponent => {
		const TempComponent = BaseComponent as unknown as ComponentType<Record<string, unknown>>
		const ExtendWith = (
			extended: Record<string, unknown>
		) => <TempComponent { ...props } { ...extended } />

		ExtendWith.displayName = `WithProps(${BaseComponent.displayName})`
		ExtendWith.extendTheme = BaseComponent.extendTheme

		return ExtendWith as unknown as _FactoryComponent
	}

	return BaseComponent as C extends unknown ? _FactoryComponent : C
}
