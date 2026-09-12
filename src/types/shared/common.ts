
export type Size =
	| 'xs'
	| 'sm'
	| 'md'
	| 'lg'
	| 'xl'

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


export interface StyleContext {
	classes?: Record<string, string>
}

