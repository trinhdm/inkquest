
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

export type Digit =
	'0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9'

export interface StyleContext {
	classes?: Record<string, string>
}

