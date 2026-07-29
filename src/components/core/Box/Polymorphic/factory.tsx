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


type SpecProps<P extends object> =
	Partial<P>
	& DataAttrs

type SpecOptions =
	| 'compound'					// compound components cannot have styles
	| 'disabled'
	| 'focusable'
	| 'unstyled'

export interface ComponentSpec<
	T = undefined,
	P extends object = object,
> {
	attributes?: Record<string, unknown>
	ctx?: unknown
	default?: { props?: SpecProps<P> } & (
		T extends TagName ? {
			component: T
			ref: HTMLElementTagNameMap[T]
		} : {
			component?: never
			ref?: never
		}
	)
	id?: string
	is?: Partial<Record<SpecOptions, boolean>>
	props: P
	ref?: Ref<unknown>
	subcomponents?: Record<string, unknown>
	variant?: string
}

interface _PolymorphicSpec {
	as?: unknown
}

type _ComponentProps<S extends ComponentSpec> = SpecProps<S['props']>

type _CompoundComponentSpec<S extends ComponentSpec> = S & {
	classNames?: never
	default?: Omit<S['default'], 'props'> & {
		props?: _ComponentProps<S>
	}
	styles?: never
}

type _RootComponentSpec<S extends ComponentSpec> = S & {
	classNames?: ClassValue
	default?: Omit<S['default'], 'props'> & {
		props?: _ComponentProps<S> & _PolymorphicSpec
	}
	styles?: CSSProperties
}

export type FactorySpec<S extends ComponentSpec> =
	NonNullable<S['is']>['compound'] extends true
		? _CompoundComponentSpec<S>
		: _RootComponentSpec<S>

type _Component<S extends ComponentSpec> = NamedExoticComponent<
	S['props']
	& RefAttributes<S['ref']>
	& _PolymorphicSpec
>

export interface FactoryUtils<
	S extends ComponentSpec,
	C = _Component<S>,
	P = Partial<S['props']>,
> {
	extendTheme: (args: FactorySpec<S>) => _RootComponentSpec<S>
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
	target: (props: S['props'] & Pick<S, 'ref'>) => ReactNode
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
			override: Record<string, unknown>
		) => <TempComponent { ...props } { ...override } />

		ExtendWith.displayName = `WithProps(${BaseComponent.displayName})`
		ExtendWith.extendTheme = BaseComponent.extendTheme

		return ExtendWith as unknown as _FactoryComponent
	}

	return BaseComponent as C extends unknown ? _FactoryComponent : C
}
