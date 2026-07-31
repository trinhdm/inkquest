import type { CSSProperties } from 'react'
import type { AtLeastOneKey, RewriteKeysWithout } from '@/types/utils'
import type { CSSUnit, FontList, HeadingTagName, Size, Unit } from '@/types/shared'
import type { GetPaletteFn, SetPaletteFn } from './palette'


export type Theme =
	| 'dark'
	| 'light'
	| 'system'

export interface SiteTheme {
	getPalette: GetPaletteFn
	setPalette: SetPaletteFn

	font: Required<RewriteKeysWithout<'font', FontStyles>>
	headings: Omit<FontStyles, 'fontSize' | 'lineHeight'> & {
		tagName: Style<[HeadingTagName, Omit<FontStyles, 'fontFamily'>], 'h1'>
	}

	breakpoints: Style<[Size, number], 'xs'>
}

type FontProperty =
	| 'fontFamily'
	| 'fontSize'
	| 'fontWeight'
	| 'lineHeight'

type ConsistentUnitFor<K extends PropertyKey, U extends string = Unit> =
	{ [V in U]: Record<K, `${number}${V}`> }[U]

type PartialConsistentUnitFor<K extends PropertyKey, U extends string = Unit> =
	{ [V in U]: AtLeastOneKey<Record<K, `${number}${V}`>> }[U]

type FontRequireAs<K extends FontProperty> =
	FontList[K] & keyof FontStyleList<K>

type FontStyleList<K extends FontProperty> =
	K extends 'fontSize'
		? PartialConsistentUnitFor<FontList[K]>
		: AtLeastOneKey<Record<FontList[K], CSSProperties[K]>>

type FontStyle<
	K extends FontProperty,
	RK extends FontRequireAs<K> | undefined = undefined
> = CSSProperties[K] | (
	RK extends FontRequireAs<K>
		? Extract<FontStyleList<K>, Record<RK, unknown>>
		: FontStyleList<K>
)

interface FontStyles {
	fontFamily?: FontStyle<'fontFamily', 'body'>
	fontSize: FontStyle<'fontSize', 'md'>
	fontWeight?: FontStyle<'fontWeight', 'regular'>
	lineHeight: FontStyle<'lineHeight'>
}

type StyleEntry = [key: PropertyKey, value: unknown]

type StyleList<
	E extends StyleEntry,
	K extends E[0] = E[0],
	V extends E[1] = E[1]
> =
	V extends number
		? ConsistentUnitFor<K>
		: AtLeastOneKey<Record<K, V>>

type Style<
	E extends StyleEntry,
	RK extends PropertyKey | undefined = undefined,
	K extends E[0] = E[0],
	V extends E[1] = E[1]
> = | (V extends number ? CSSUnit : V)
	| (RK extends K
		? Extract<StyleList<[K, V]>, Record<RK, unknown>>
		: StyleList<[K, V]>)
