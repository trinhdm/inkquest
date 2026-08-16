import { COLOR_TOKENS, THEME_SCHEMES } from './scales'
import type { CSSProperties } from 'react'
import type { AtLeastOneKey } from '@/types/utils'
import type { CSSUnit, CSSVars, FontList, HexCode, Size, Unit } from '@/types/shared'
import type { SemanticTokens } from './tokens'
import type { PaintVariantsFn } from './variants'

export type ColorScheme =
	keyof typeof COLOR_TOKENS

export type ColorScaleKey = {
	[K in ColorScheme]: (typeof COLOR_TOKENS)[K] extends readonly string[] ? K : never
}[ColorScheme]
// 'ink' | 'oxblood' | 'ghost' | 'paper' | 'crimson' | 'ghost'

export type FlatColorKey =
	Exclude<ColorScheme, ColorScaleKey>
// 'danger' | 'success' | 'warning' | 'info'

export type PaletteName =
	typeof THEME_SCHEMES[number]
// 'ink' | 'paper' — only the tagged ones

export type ThemeName =
	| 'dark'
	| 'light'

// export type ColorScheme =
// 	| 'brand'
// 	| 'ink'
// 	| 'paper'

export interface SiteTheme {
	paintVariants: PaintVariantsFn

	// name: ThemeName
	// setName: (theme: ThemeName) => void

	tokens: SemanticTokens

	scale: { size: number }

	fontFamily: FontStyle<'fontFamily', 'sans'>
	fontSize: number[] | FontStyle<'fontSize', 'md'>
	fontWeight: number[] | FontStyle<'fontWeight', 'regular'>
	lineHeight: Style<CSSProperties['lineHeight'], ThemeLineHeight, 'normal'>

	// headings: FontStyles<TagFontStyles, HeadingTag, 'h1'>

	// colors: Record<ColorScheme, readonly HexCode[]>
	colors:
		& { [K in FlatColorKey]: HexCode }
		& { [K in ColorScaleKey]: readonly HexCode[] }
	breakpoints: Style<CSSUnit, Size>
	radius: number[]

	duration: Style<CSSProperties['transitionDuration'], ThemeDuration, 'default'>
	easing: Style<ThemeEasingValues, ThemeEasing, BaseVarKey>

	screenSize: number[]

	subcomponents?: Record<string, {
		cssVars?: (theme: SiteTheme, props: unknown, ctx: unknown) => Partial<Record<string, CSSVars>>
	}>
}

export type BaseVarKey = 'base'

type ThemeLineHeight =
	| 'exact'
	| 'tight'
	| 'snug'
	| 'normal'
	| 'loose'

type ThemeDuration =
	| 'default'
	| 'instant'
	| 'fast'
	| 'slow'
	| 'gradual'

type ThemeEasing =
	| BaseVarKey
	| 'in'
	| 'out'
	| 'inOut'

type ThemeEasingValues =
	CSSProperties['transitionTimingFunction'] | `cubic-bezier(${string})`

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

export type Style<
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

interface FontStyles<
	V,
	Keys extends PropertyKey,
	RK extends Keys | undefined = undefined,
> {
	fontFamily?: FontStyle<'fontFamily'>
	fontWeight?: FontStyle<'fontWeight'>
	tagName: Style<V, Keys, RK>
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
