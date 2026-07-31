
export type Size =
	| 'xs'
	| 'sm'
	| 'md'
	| 'lg'
	| 'xl'

export type Unit =
	| '%'
	| 'em'
	| 'px'
	| 'rem'
	| 'vh'
	| 'vw'

export type CSSUnit =
	`${number}${Unit}`

// type ContainUnit<S extends string, U extends string = Unit> =
// 	S extends `${number}${U}`
// 		? true
// 		: false
