//	general

export type Primitive =
	boolean | number | string | bigint | symbol | null | undefined

export type PrimitiveName =
	boolean | number | string


//	numbers

export type EvenNumber =
	number & { readonly __brand: unique symbol }

export type Digit =
	'0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9'

type InDigit<N extends Digit | null> =
	N extends null
		? Digit
		: `${Extract<Digit, N>}`

export type TwoDigit<N1 extends Digit | null = null, N2 extends Digit | null = null> =
	`${InDigit<N1>}${InDigit<N2>}`
