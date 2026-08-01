import type { CSSProperties } from 'react'
import type { AtLeastOneKey } from '@/types/utils'
import type { CSSUnit, FontList, HeadingTagName, Size, Unit } from '@/types/shared'
import type { GetPaletteFn, SetPaletteFn } from './theme/palette'


export type Theme =
	| 'dark'
	| 'light'
	| 'system'

export interface SiteTheme
	extends Required<FontStyles> {
	getPalette: GetPaletteFn
	setPalette: SetPaletteFn

	// font: Required<RewriteKeysWithout<'font', FontStyles>>
	headings: {
		fontFamily?: FontStyle<'fontFamily'>
		fontWeight?: FontStyle<'fontWeight'>
		tagName: Style<TagFontStyles, HeadingTagName, 'h1'>
	}

	breakpoints: Style<CSSUnit, Size>
}

type StyleList<
    Keys extends PropertyKey,
    V,
    Name extends PropertyKey = PropertyKey,
> =
    V extends CSSUnit
		? ConsistentValues<Keys, true>
		: Name extends ConsistentProperty
			? ConsistentValues<Keys, true, number extends V ? V : undefined>
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

interface TagFontStyles {
	fontSize: FontStyle<'fontSize'>
	fontWeight?: FontStyle<'fontWeight'>
	lineHeight?: FontStyle<'lineHeight'>
}

// consistent value helpers

type ConsistentProperty =
	| 'fontSize'
	| 'lineHeight'

type ConsistentType<
	K extends PropertyKey,
	Optional extends boolean = false,
	T extends unknown = undefined,
> =
	T extends undefined
		? never
		: Optional extends true
			? AtLeastOneKey<Record<K, T>>
			: Record<K, T>

type ConsistentUnit<
	K extends PropertyKey,
	Optional extends boolean = false,
	U extends string = Unit,
> = {
		[V in U]: Optional extends true
			? AtLeastOneKey<Record<K, `${number}${V}`>>
			: Record<K, `${number}${V}`>
	}[U]

type ConsistentValues<
	K extends PropertyKey,
	Optional extends boolean = false,
	T extends unknown = undefined,
	U extends string = Unit,
> =
	| ConsistentType<K, Optional, T>
	| ConsistentUnit<K, Optional, U>
