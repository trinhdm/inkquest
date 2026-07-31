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
		tagName: Style<Omit<FontStyles, 'fontFamily'>, HeadingTagName, 'h1'>
	}

	breakpoints: Style<CSSUnit, Size>
}

type ConsistentUnitFor<
	K extends PropertyKey,
	Optional extends boolean = false,
	U extends string = Unit,
> = {
		[V in U]: Optional extends true
			? AtLeastOneKey<Record<K, `${number}${V}`>>
			: Record<K, `${number}${V}`>
	}[U]

type ConsistentProperty =
	| 'fontSize'
	| 'lineHeight'

type StyleList<
    Keys extends PropertyKey,
    V,
    Name extends PropertyKey = PropertyKey,
> =
    V extends CSSUnit
		? ConsistentUnitFor<Keys, true>
		: Name extends ConsistentProperty
			? ConsistentUnitFor<Keys, true>
			: AtLeastOneKey<Record<Keys, V>>

type Style<
    V,
    Keys extends PropertyKey,
    RK extends Keys | undefined = undefined,
    Name extends PropertyKey = PropertyKey,
> =
	| V
	| (RK extends Keys
		? Extract<StyleList<Keys, V, Name>, Record<RK, unknown>>
		: StyleList<Keys, V, Name>)

type FontStyle<
    K extends keyof FontList,
    RK extends FontList[K] | undefined = undefined,
> =
	Style<CSSProperties[K], FontList[K], RK, K>

interface FontStyles {
	fontFamily?: FontStyle<'fontFamily', 'body'>
	fontSize: FontStyle<'fontSize', 'md'>
	fontWeight?: FontStyle<'fontWeight', 'regular'>
	lineHeight: FontStyle<'lineHeight'>
}
