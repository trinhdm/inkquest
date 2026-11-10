import type { ElementType } from 'react'
import type { SpecsDefaultAs } from './specs.types'

//	default props

export type IsPolymorphic<S> =
	S extends { defaults: { as: ElementType } }
		? true
		: false

export type AsPolymorphic<S> =
	IsPolymorphic<S> extends true
		? { as?: SpecsDefaultAs<S> }
		: { as?: never }

export type PropsDefaultList<S> =
	AsPolymorphic<S> extends { as?: SpecsDefaultAs<S> }
		? Exclude<keyof S, 'as'>
		: keyof S
