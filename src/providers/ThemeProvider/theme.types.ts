import type { CSSProperties } from 'react'
import type { GetPaletteFn, SetPaletteFn } from './getPalette'


export type Theme =
	| 'dark'
	| 'light'
	| 'system'

export interface SiteTheme {
	// colors: string[]

	font: {
		family: FontStyle<'fontFamily'>
		lineHeight: FontStyle<'lineHeight'>
		size: FontStyle<'fontSize'>
		weight: FontStyle<'fontWeight', 'regular'>
	}

	headings?: Pick<FontStyles, 'fontFamily' | 'fontWeight'> & {
		tagName: Record<HeadingTagName, HeadingStyles>
	}

	breakpoints: ConsistentUnitFor<Size>
	// breakpoints: { [U in Unit]: Record<Size, `${number}${U}`> }[Unit]

	getPalette: GetPaletteFn
	setPalette: SetPaletteFn
}

type Unit = 'em' | 'px' | 'rem' | 'vh' | 'vw' | '%'
type CSSUnit = `${number}${Unit}`

type ConsistentUnitFor<K extends PropertyKey, U extends string = Unit> =
	{ [V in U]: Record<K, `${number}${V}`> }[U]

type ThemeItem<K extends string, V> = {
	[Key in K]: Record<K, V> extends Record<Key, infer CustomList>
		? CustomList
		: Size
}

type FontList = {
	fontFamily: FontFamily
	fontWeight: FontWeight
	fontSize: Size
	lineHeight: Size
}

type FontStyleList<K extends FontProp> =
	K extends 'fontSize'
		? ConsistentUnitFor<FontList[K]>
		: K extends 'lineHeight'
			? ConsistentUnitFor<FontList[K]> | Record<FontList[K], number>
			: Record<FontList[K], CSSProperties[K]>

type FontStyle<
	K extends FontProp,
	RequiredKey extends (FontList[K] & keyof FontStyleList<K>) | undefined = undefined
> = CSSProperties[K] | (
	RequiredKey extends (FontList[K] & keyof FontStyleList<K>)
		? Partial<FontStyleList<K>> & Pick<FontStyleList<K>, RequiredKey>
		: FontStyleList<K>
)

// type FontStyle2<K extends FontProp> = CSSProperties[K] | FontStyleList<K>


type HeadingTagName = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'

interface FontStyles {
	fontFamily?: FontStyle<'fontFamily'>
	lineHeight: FontStyle<'lineHeight'>
	fontSize: FontStyle<'fontSize'>
	fontWeight?: FontStyle<'fontWeight'>
}

interface HeadingStyles {
	fontSize: FontStyle<'fontSize'>
	fontWeight?: FontStyle<'fontWeight'>
	lineHeight: FontStyle<'lineHeight'>
}

type FontProp =
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

type FontStyleOld<K extends FontProp> =
	FontProperties2 extends {
		[P in K]: Record<infer Custom, CSSProperties[P]>
	}
		? Custom
		: K extends keyof FontList ? Record<FontList[K], CSSProperties[K]> : never

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

// type FontList = {
// 	fontFamily: FontFamily
// 	fontWeight: FontWeight
// 	fontSize: Size
// 	lineHeight: Size
// }

// export interface FontProperties {
// 	fontFamily: CSSProperties['fontFamily']
// 	fontWeight?: CSSProperties['fontWeight']
// 	fontSize: CSSProperties['fontSize']
// 	lineHeight?: CSSProperties['lineHeight']
// }
