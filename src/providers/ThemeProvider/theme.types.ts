import type { CSSProperties } from 'react'
import type { GetPaletteFn, SetPaletteFn } from './getPalette'


export type Theme =
	| 'dark'
	| 'light'
	| 'system'

export interface SiteTheme {
	getPalette: GetPaletteFn
	setPalette: SetPaletteFn

	font: {
		family: FontStyle<'fontFamily'>
		lineHeight: FontStyle<'lineHeight'>
		size: FontStyle<'fontSize', 'md'>
		weight: FontStyle<'fontWeight', 'regular'>
	}

	headings?: Pick<FontStyles, 'fontFamily' | 'fontWeight'> & {
		tagName: Record<HeadingTagName, HeadingStyles>
	}

	breakpoints: ConsistentUnitFor<Size>
}

type Unit = 'em' | 'px' | 'rem' | 'vh' | 'vw' | '%'
type CSSUnit = `${number}${Unit}`

type ConsistentUnitFor<K extends PropertyKey, U extends string = Unit> =
	{ [V in U]: Record<K, `${number}${V}`> }[U]

type FontList = {
	fontFamily: FontFamily
	fontWeight: FontWeight
	fontSize: Size
	lineHeight: Size
}

type FontRequireAs<K extends FontProperty> =
	FontList[K] & keyof FontStyleList<K>

type FontStyleList<K extends FontProperty> =
	K extends 'fontSize'
		? ConsistentUnitFor<FontList[K]>
		: K extends 'lineHeight'
			? ConsistentUnitFor<FontList[K]> | Record<FontList[K], number>
			: Record<FontList[K], CSSProperties[K]>

type FontStyle<
	K extends FontProperty,
	RK extends FontRequireAs<K> | undefined = undefined
> = CSSProperties[K] | (
	RK extends FontRequireAs<K>
		? Partial<FontStyleList<K>> & Pick<FontStyleList<K>, RK>
		: FontStyleList<K>
)


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

type FontProperty =
	| 'fontFamily'
	| 'fontSize'
	| 'fontWeight'
	| 'lineHeight'

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
