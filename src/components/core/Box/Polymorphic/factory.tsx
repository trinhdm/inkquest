import type {
	ComponentType,
	CSSProperties,
	NamedExoticComponent,
	ReactNode,
	Ref,
	RefAttributes,
} from 'react'

import type { DataAttrs, TagName } from './types'


type SpecProps<P extends Record<string, any>> =
	Partial<P>
	& DataAttrs

type SpecOptions =
	| 'compound'					// compound components cannot have styles
	| 'disabled'
	| 'focusable'
	| 'unstyled'

export interface ComponentSpec<
	K = undefined,
	P extends Record<string, any> = Record<string, any>,
> {
	ctx?: any
	default?: { props?: SpecProps<P> } & (
		K extends TagName ? {
			component: K
			ref: HTMLElementTagNameMap[K]
		} : {
			component?: never
			ref?: never
		}
	)
	id?: string
	is?: Partial<Record<SpecOptions, boolean>>
	props: P
	ref?: Ref<any>
	subcomponents?: Record<string, any>
	variant?: string
}

interface _PolymorphicSpec {
	as?: any
}

type _ComponentProps<S extends ComponentSpec> = SpecProps<S['props']>

interface _CompoundComponent<S extends ComponentSpec> {
	default?: Omit<S['default'], 'props'> & {
		props?: _ComponentProps<S>
	}
}

interface _RootComponent<S extends ComponentSpec> {
	className?: string[]
	default?: Omit<S['default'], 'props'> & {
		props?: _ComponentProps<S> & _PolymorphicSpec
	}
	style?: CSSProperties
}

type _ComponentKind<S extends ComponentSpec> =
	NonNullable<S['is']>['compound'] extends true
		? _CompoundComponent<S>
		: _RootComponent<S>

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
	extendTheme: (args: _ComponentKind<S>) => Record<keyof _RootComponent<S>, any>
	withProps: (props: P) => C
}

export type Subcomponents<
	S extends ComponentSpec,
	List = S['subcomponents']
> = List extends Record<string, any>
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

	BaseComponent.extendTheme = extendWith as any
	BaseComponent.withProps = (props: Parameters<typeof target>[0]): _FactoryComponent => {
		const TempComponent = BaseComponent as unknown as ComponentType<any>
		const ExtendWith = (
			override: Record<string, any>
		) => <TempComponent { ...props } { ...override } />

		ExtendWith.displayName = `WithProps(${BaseComponent.displayName})`
		ExtendWith.extendTheme = BaseComponent.extendTheme

		return ExtendWith as unknown as _FactoryComponent
	}

	return BaseComponent as C extends unknown ? _FactoryComponent : C
}
