import type { Size } from './common'

export type HeadingTag =
	| 'h1'
	| 'h2'
	| 'h3'
	| 'h4'
	| 'h5'
	| 'h6'

// type FontFamily =
// 	| 'monospace'
// 	| 'sans-serif'
// 	| 'serif'

// type FontFamily =
// 	| 'title'
// 	| 'body'
// 	| 'label'

type FontFamily =
	| 'black'
	| 'mono'
	| 'sans'

type FontWeight =
	| 'thin'
	| 'light'
	| 'regular'
	| 'medium'
	| 'bold'
	| 'black'

export type FontList = {
	fontFamily: FontFamily
	fontSize: Size
	fontWeight: FontWeight
	lineHeight: Size
}

// type FontFamilies =
// 	{ [K in FontFamily]?: FontProperties['fontFamily'] }

// type FontSizes =
// 	FontProperties extends { size: Record<infer CustomSizes, string> }
// 		? CustomSizes
// 		: Size


// type ConsistentFor<K extends PropertyKey, T extends string> =
// 	{ [V in T]: Record<K, `${number}${V}`> }[T]
