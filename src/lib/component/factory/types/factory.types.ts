import type {
	CSSProperties, ElementType,
	FunctionComponent, NamedExoticComponent,
	ReactNode,
} from 'react'

import type {
	AsPolymorphic, IsPolymorphic,
	Specs, SpecsDefaultProps,
} from './specs.types'

import type { DistributiveOmit } from '@/types/utils'
import type { SpecAttributes } from '@/types/shared'

//	component + props

export type FactoryContract = {
	attributes?: SpecAttributes
	children?: ReactNode
	className?: string
	id?: string
	style?: CSSProperties
	unstyled?: boolean
}

export type FactoryPropsList<S extends Specs> =
	& S['props']
	& AsPolymorphic<S>
	& FactoryContract

export type FactoryComponent<S extends Specs> =
	NamedExoticComponent<FactoryPropsList<S>>

export type FactoryAsComponent<S extends Specs> =
	IsPolymorphic<S> extends true
		? { as?: ElementType }
		: { as?: never }

//	factory: .set() method

export type FactoryDisplayName =
	Pick<FunctionComponent, 'displayName'>

type _AsDefaultProps<S extends Specs> =
	AsPolymorphic<S> extends { as?: never }
		? { as?: never }
		: Required<AsPolymorphic<S>>

type _DefaultPropsList<S extends Specs> =
	& Partial<DistributiveOmit<S['props'], 'as'>>
	& Required<Pick<S['props'], SpecsDefaultProps<S> & keyof S['props']>>
	& _AsDefaultProps<S>

type _SetDefaultProps<S extends Specs> =
	[SpecsDefaultProps<S>] extends [never]
		? { defaultProps?: _DefaultPropsList<S> }
		: { defaultProps: _DefaultPropsList<S> }

type _SetSubcomponents<S extends Specs> =
	S extends { subcomponents: Record<string, unknown> }
		? { subcomponents: S['subcomponents'] }
		: { subcomponents?: never }

type _MethodSetArgs<S extends Specs> =
	& FactoryDisplayName
	& _SetDefaultProps<S>
	& _SetSubcomponents<S>

export interface FactoryMethods<
	S extends Specs,
	C = FactoryComponent<S>,
	P = FactoryPropsList<S>
> {
	set: (args: _MethodSetArgs<S>) => _MethodSetArgs<S>
	withProps: (props: P) => C
}

export type FactorySubcomponents<
	S extends Specs,
	C = S['subcomponents']
> =
	C extends Record<string, unknown>
		? C
		: unknown
