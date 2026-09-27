import type { AriaAttributes } from 'react'
import type { SOCIAL_BRANDS } from '@/utils/constants'

export type Size =
	| 'xxs'
	| 'xs'
	| 'sm'
	| 'md'
	| 'lg'
	| 'xl'
	| 'xxl'

type DimensionUnit =
	| '%'
	| 'em'
	| 'px'
	| 'rem'
	| 'vh'
	| 'vw'

type TimeUnit =
	| 'ms'
	| 's'

export type Unit =
	| DimensionUnit
	| TimeUnit

export type CSSUnit<U extends Unit = Unit> =
	`${number}${U}`

export type EvenNumber =
	number & { readonly __brand: unique symbol }

export type Digit =
	'0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9'

export type Orientation =
	AriaAttributes['aria-orientation']

export interface StyleContext {
	classes?: Record<string, string>
}

export type SocialBrand = (typeof SOCIAL_BRANDS)[number]
