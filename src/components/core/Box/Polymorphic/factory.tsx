import type {
	ComponentType,
	CSSProperties,
	NamedExoticComponent,
	ReactNode,
	Ref,
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
	default: { props?: _SpecProps<P> } & (
		T extends TagName ? {
			component: T
			// ref: HTMLElementTagNameMap[T]
		} : {
			component?: never
			// ref?: never
		}
	)
	id?: string
	is?: Partial<Record<_SpecOptions, boolean>>
	props: P
	ref?: Ref<T extends TagName ? HTMLElementTagNameMap[T] : unknown>
	subcomponents?: Record<string, unknown>
	variant?: string
}

type _InferredRef<S extends ComponentSpec> =
    S['default']['component'] extends TagName
        ? { ref: HTMLElementTagNameMap[S['default']['component']] }
        : { ref?: never }

type _ComponentProps<S extends ComponentSpec> = _SpecProps<S['props']>

type _CompoundComponentSpec<S extends ComponentSpec> = {
	classNames?: never
	default: Omit<S['default'], 'props'> & _InferredRef<S> & {
		props?: _ComponentProps<S>
	}
	styles?: never
}

type _RootComponentSpec<S extends ComponentSpec> = {
	classNames?: ClassValue
	default: Omit<S['default'], 'props'> & _InferredRef<S> & {
		props?: _ComponentProps<S>
	}
	styles?: CSSProperties
}

export type ExtendComponentSpec<S extends ComponentSpec> =
	NonNullable<S['is']>['compound'] extends true
		? _CompoundComponentSpec<S>
		: _RootComponentSpec<S>

type _PolymorphicSpec<
	S extends ComponentSpec,
	C = S['default']['component']
> = S['props'] & {
	as?: C extends never ? never : C
}

type _FactoryProps<S extends ComponentSpec> =
	_PolymorphicSpec<S> & Pick<S, 'ref'>

type _Component<S extends ComponentSpec> =
	NamedExoticComponent<_FactoryProps<S>>

export interface FactoryUtils<
	S extends ComponentSpec,
	C = _Component<S>,
	P = _PolymorphicSpec<S>,
> {
	extendTheme: (args: ExtendComponentSpec<S>) => _RootComponentSpec<S>
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
>(target: (props: _FactoryProps<S>) => ReactNode) => {
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

	return BaseComponent as C
}
