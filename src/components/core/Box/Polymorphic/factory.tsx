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
// import type { PolymorphicProps } from './polymorphic'


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
	default?: (
			T extends TagName
				? { component?: T }
				: { component?: unknown extends T ? unknown : never }
		)
		& { props?: Partial<P> }
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

type _PolymorphicProps<S extends ComponentSpec> =
	S['props']
	& _PolymorphicSpec<S>
	// & PickStartsWith<PolymorphicProps<InferSpecDefault<S>, S['props']>, 'on'>

// type Test<S extends ComponentSpec, P1> =
// 	OverrideProps<_PolymorphicProps<S>, Pick<S, 'attributes' | 'id' | 'ref'>>

type _FactoryProps<S extends ComponentSpec> =
	// Pick<S, 'ref'>
	& Pick<S, 'attributes' | 'id' | 'ref'>
	& _PolymorphicProps<S>
	// & PickStartsWith<PolymorphicProps<InferSpecDefault<S>, S['props']>, 'on'>
	// PolymorphicProps<InferSpecDefault<S>, _PolymorphicProps<S>>

type _DefaultProps<S extends ComponentSpec> =
	Partial<S['props']>
	& _PolymorphicSpec<S>
	& DataAttrs

type _InferredDefault<S extends ComponentSpec> = (
		InferSpecDefault<S> extends TagName ? {
			component: InferSpecDefault<S>
			ref: HTMLElementTagNameMap[InferSpecDefault<S>]
		} : {
			component?: never
			ref?: never
		}
	)
	& { props?: _DefaultProps<S> }

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

export type ExtendedSpec<S extends ComponentSpec> =
	NonNullable<S['is']>['compound'] extends true
		? _CompoundComponentSpec<S>
		: _RootComponentSpec<S>

type _DefaultComponent<S extends ComponentSpec, P = _DefaultProps<S>> = {
	props?: P & (
		'as' extends keyof P
			? unknown extends InferSpecDefault<S>
				? Pick<P, 'as'>
				: Required<Pick<P, 'as'>>
			: never
		)
}

type _Component<S extends ComponentSpec> =
	NamedExoticComponent<_FactoryProps<S>>

export interface MethodsBase<
	S extends ComponentSpec,
	C = _Component<S>,
	P = _PolymorphicProps<S>,
	D = _DefaultComponent<S>
> {
	setDefaults: (args: D) => D
	withProps: (props: P) => C
}

export type SubcomponentsBase<
	S extends ComponentSpec,
	List = S['subcomponents']
> = List extends Record<string, unknown>
	? List
	: Record<string, never>

type _FactoryComponent<S extends ComponentSpec> =
	& _Component<S>
	& SubcomponentsBase<S>
	& MethodsBase<S>

export const factory = <
	S extends ComponentSpec,
	C extends object = _FactoryComponent<S>
>(target: (props: _FactoryProps<S>) => ReactNode) => {
	type FC = _FactoryComponent<S>

	const BaseComponent = target as unknown as FC

	BaseComponent.setDefaults = (args: _DefaultComponent<S>) => {
		const { displayName } = BaseComponent

		if (!displayName)
			throw new Error('cannot set defaultProps: missing `displayName`')
		if (args?.props && Object.keys(args.props).length)
			setDefaultProps(displayName, args.props)

		return args
	}

	BaseComponent.withProps = (props: Parameters<typeof target>[0]): FC => {
		type P = Parameters<typeof target>[0]

		const TempComponent = BaseComponent as ComponentType<P>,
			ExtendWith = (extended: P) => <TempComponent { ...props } { ...extended } />

		ExtendWith.displayName = `WithProps(${BaseComponent.displayName})`
		ExtendWith.setDefaults = BaseComponent.setDefaults

		return ExtendWith as unknown as FC
	}

	return BaseComponent as unknown as C
}
