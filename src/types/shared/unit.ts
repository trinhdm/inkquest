import type { ExcludeIn } from '../utils'

//	css

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


//	sizes

export type SizeRange =
	| 'xxs'
	| 'xs'
	| 'sm'
	| 'md'
	| 'lg'
	| 'xl'
	| 'xxl'

export type Size =
	ExcludeIn<SizeRange, 'x'>
