
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

// type ContainUnit<S extends string, U extends string = Unit> =
// 	S extends `${number}${U}`
// 		? true
// 		: false

export type EvenNumber =
	number & { readonly __brand: unique symbol }


export interface StyleContext {
	classes?: Record<string, string>
}

