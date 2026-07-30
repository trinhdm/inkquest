import type { CSSProperties } from 'react'
import type { PaletteConfig } from './getPalette'


export type Theme =
	| 'dark'
	| 'light'
	| 'system'

export interface SiteTheme {
	colors: string[]
	font: FontProperties

	headings: FontStyles & {
		size: Record<HeadingTagName, HeadingStyles>
	}

	breakpoints: ThemeItem<'breakpoints', CSSUnit>

	getPalette: PaletteConfig
}

type CSSUnit = `${number}${Unit}`

type Unit = 'em' | 'px' | 'rem' | 'vh' | 'vw' | '%'

export type ThemeItem<K extends string, V> = {
	[Key in K]: Record<K, V> extends Record<Key, infer CustomList>
		? CustomList
		: Size
}


type HeadingTagName = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'

export interface FontStyles {
	fontFamily?: FontStyle<'fontFamily'>
	fontWeight?: FontStyle<'fontWeight'>
	lineHeight: FontStyle<'lineHeight'>
	size: FontStyle<'fontSize'>
}

interface HeadingStyles {
	fontSize: FontStyle<'fontSize'>
	fontWeight?: FontStyle<'fontWeight'>
	lineHeight: FontStyle<'lineHeight'>
}

export type FontProp =
	| 'fontFamily'
	| 'fontSize'
	| 'fontWeight'
	| 'lineHeight'

type FontProperties = {
	[K in FontProp]: FontList[K] extends string
		? Record<FontList[K], CSSProperties[K]>
		: FontList[K]
}

type FontProperties2 =
	{ [K in FontProp]: CSSProperties[K] }

export type FontStyle<K extends FontProp> =
	FontProperties2 extends {
		[P in K]: Record<infer Custom, CSSProperties[P]>
	}
		? Custom
		: Record<K, K extends keyof FontList ? FontList[K] : Size>

export type Size =
	| 'xs'
	| 'sm'
	| 'md'
	| 'lg'
	| 'xl'

// type FontSizes =
// 	FontProperties extends { size: Record<infer CustomSizes, string> }
// 		? CustomSizes
// 		: Size

export type FontFamily =
	| 'monospace'
	| 'sans-serif'
	| 'serif'

// type FontFamilies =
// 	{ [K in FontFamily]?: FontProperties['fontFamily'] }

export type FontWeight =
	| 'thin'
	| 'light'
	| 'regular'
	| 'medium'
	| 'bold'
	| 'black'

type FontList = {
	fontFamily: FontFamily
	fontWeight: FontWeight
	fontSize: Size
	lineHeight: Size
}

// export interface FontProperties {
// 	fontFamily: CSSProperties['fontFamily']
// 	fontWeight?: CSSProperties['fontWeight']
// 	fontSize: CSSProperties['fontSize']
// 	lineHeight?: CSSProperties['lineHeight']
// }
