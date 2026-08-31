import { COLOR_TOKENS, THEME_SCHEMES } from '../scales'
import type { CSSProperties } from 'react'
import type { AtLeastOneKeyOf } from '@/types/utils'
import type { CSSVars, HexCode, Unit } from '@/types/shared'
import type { GetVariantColorsFn, PaintVariantsFn } from '../tokens'
import type { SemanticTokens } from '../reference'

export type ThemeName =
	typeof THEME_SCHEMES[number]

export type ColorScheme =
	| 'dark'
	| 'light'

export type ColorScales =
	keyof typeof COLOR_TOKENS

export type ColorScaleKey = {
	[K in ColorScales]: (typeof COLOR_TOKENS)[K] extends readonly string[] ? K : never
}[ColorScales]
// 'ink' | 'oxblood' | 'ghost' | 'paper' | 'crimson' | 'ghost'

export type FlatColorKey =
	Exclude<ColorScales, ColorScaleKey>

export type ThemeTokens<V = unknown> =
	Record<ColorScheme | 'base', CSSVars<V>>

export type BaseVarKey = 'base'

export interface SiteTheme {
	// getVariantColors: GetVariantColorsFn
	// paintVariants: PaintVariantsFn

	// tokens: SemanticTokens

	scale: { size: number }
	colors:
		& { [K in FlatColorKey]: HexCode }
		& { [K in ColorScaleKey]: readonly HexCode[] }

	fontFamily: Record<'black' | 'sans' | 'mono', string>
	fontSize: number[]
	fontWeight: number[]
	lineHeight: Style<'lineHeight', ThemeLineHeight, 'normal'>
	tracking: Style<'letterSpacing', ThemeSizeScale, 'md'>

	duration: Style<'transitionDuration', ThemeDuration, 'default'>
	easing: Style<'transitionTimingFunction', ThemeEasing, BaseVarKey>

	opacity: number[]
	radius: number[]
	screenSize: number[]

	// subcomponents?: Record<string, {
	// 	cssVars?: (theme: SiteTheme, props: unknown, ctx: unknown) => Partial<Record<string, CSSVars>>
	// }>
}

export interface SiteThemeConfig
	extends SemanticTokens {
	// getVariantColors: GetVariantColorsFn
	// paintVariants: PaintVariantsFn

	prefixSelector: (name: string) => string

	// config: SiteTheme
	prefix?: string
	subcomponents?: Record<string, {
		cssVars?: (theme: SiteTheme, props: unknown, ctx: unknown) => Partial<Record<string, CSSVars>>
	}>
}

type ThemeSizeScale =
	| 'xxs'
	| 'xs'
	| 'sm'
	| 'md'
	| 'lg'
	| 'xl'
	| 'xxl'

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

type StyleList<
    Keys extends PropertyKey,
    V,
    Name extends PropertyKey = PropertyKey,
> =
    V extends `${number}${Unit}`
		? ConsistentValues<Keys, true>
		: Name extends ConsistentProperty
			? ConsistentValues<Keys, true, number extends V ? V : undefined>
			: AtLeastOneKeyOf<Keys, V>

type BaseStyle<
    V,
    Keys extends PropertyKey,
    RK extends Keys | undefined = undefined,
    Name extends PropertyKey = PropertyKey,
> =
	| V
	| (RK extends Keys
		? Extract<StyleList<Keys, V, Name>, Record<RK, unknown>>
		: StyleList<Keys, V, Name>)

type Style<
    P extends keyof CSSProperties,
	Keys extends PropertyKey,
    RK extends Keys | undefined = undefined,
	Name extends PropertyKey = PropertyKey,
> =
	BaseStyle<CSSProperties[P], Keys, RK, Name>

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
			? AtLeastOneKeyOf<K, T>
			: Record<K, T>

type ConsistentUnit<
    K extends PropertyKey,
    Optional extends boolean = false,
    U extends string = Unit,
> =
	// `${number}${U}` already distributes over U on its own — the mapped
	// type + [U] indexed-access unwrap above was a redundant second pass.
	Optional extends true
		? AtLeastOneKeyOf<K, `${number}${U}`>
		: Record<K, `${number}${U}`>

type ConsistentValues<
	K extends PropertyKey,
	Optional extends boolean = false,
	T extends unknown = undefined,
	U extends string = Unit,
> =
	| ConsistentType<K, Optional, T>
	| ConsistentUnit<K, Optional, U>
