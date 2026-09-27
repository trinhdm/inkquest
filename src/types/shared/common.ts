//	general

export type Primitive =
	boolean | number | string


//	numbers

export type EvenNumber =
	number & { readonly __brand: unique symbol }

export type Digit =
	'0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9'
