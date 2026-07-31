import type { CSSProperties } from 'react'
import type { GetPaletteFn, SetPaletteFn } from './getPalette'
import type { FontList, HeadingTagName, Size, Unit } from '@/types/shared'
import type { RewriteKeysWithout } from '@/types/utils'


export type Theme =
	| 'dark'
	| 'light'
	| 'system'

export interface SiteTheme {
	getPalette: GetPaletteFn
	setPalette: SetPaletteFn

	font: Required<RewriteKeysWithout<'font', FontStyles>>
	headings: Omit<FontStyles, 'fontSize' | 'lineHeight'> & {
		tagName: Record<HeadingTagName, Omit<FontStyles, 'fontFamily'>>
	}

	breakpoints: ConsistentUnitFor<Size>
}

type FontProperty =
	| 'fontFamily'
	| 'fontSize'
	| 'fontWeight'
	| 'lineHeight'

type ConsistentUnitFor<K extends PropertyKey, U extends string = Unit> =
	{ [V in U]: Record<K, `${number}${V}`> }[U]

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

interface FontStyles {
	fontFamily?: FontStyle<'fontFamily'>
	fontSize: FontStyle<'fontSize', 'md'>
	fontWeight?: FontStyle<'fontWeight', 'regular'>
	lineHeight: FontStyle<'lineHeight'>
}
