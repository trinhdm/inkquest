import type { Size } from './common'

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
