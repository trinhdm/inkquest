import { generateCssVars } from './generator'
import { getThemeColors, ThemeColor, type ThemeOptions } from './themeColors'
import { deepMerge, keyWithValue } from '@/utils/helpers'
import type { ColorScheme, SiteTheme, ThemeName } from '@/providers/ThemeProvider'
import type { CSSVars } from '@/types/shared'
import type { CSSProperties } from 'react'

export type ThemeTokens<V = unknown> =
	Record<ThemeName | 'base', CSSVars<V>>
interface TokenBuilderRoot extends Omit<ThemeOptions, 'scheme'> {}

type BaseTokenBuilder = TokenBuilderRoot & {
	name?: never
	scheme?: never
}

type ThemeTokenBuilder<K extends ThemeName> = TokenBuilderRoot & {
	name: K
	scheme: ColorScheme
}

type TokenBuilder<K extends keyof ThemeTokens> =
	K extends ThemeName ? ThemeTokenBuilder<K> : BaseTokenBuilder

type TokenItem<T extends keyof CSSProperties> =
	CSSProperties[T]

interface TokenStatesList<T extends keyof CSSProperties> {
	base: TokenItem<T>
	hover: TokenItem<T>
}

type TokenGroup<T extends keyof CSSProperties> =
	| TokenItem<T>
	| TokenStatesList<T>

export interface ColorPalette {
	background?: TokenGroup<'backgroundColor'>
	border?: TokenGroup<'borderColor'>
	color?: TokenGroup<'color'>
}

const buildTokens = <K extends keyof ThemeTokens>(
	options: TokenBuilder<K>
): ThemeTokens[K] => {
	const { prefix, theme } = options

	const isConfigTheme = keyWithValue('name', options)
		&& keyWithValue('scheme', options)

	if (!isConfigTheme) {
		const { colors, ...baseTheme } = theme,
			schemes = Object.keys(colors) as (keyof typeof colors)[],
			vars = {}

		for (const scheme of schemes)
			Object.assign(vars, { [scheme]: getThemeColors({ ...options, scheme }) })

		// console.log({ baseVars: vars })
		return generateCssVars({ ...baseTheme, colors: vars }, prefix)
	}

	return buildThemeTokens(options as TokenBuilder<Exclude<K, 'base'>>)
}

const basePalette: ColorPalette = {
	background: {
		base: 'transparent',
		hover: 'transparent',
	},
	border: {
		base: 'none',
		hover: 'none',
	},
	color: {
		base: 'inherit',
		hover: 'inherit',
	},
}

const getVariantColors = <K extends ThemeName>(
	variant: string,
	options: TokenBuilder<K>
): Partial<ColorPalette> => {
	switch (variant) {
		case 'solid':
			return {
				background: {
					base: ThemeColor.get('accent', options),
					hover: ThemeColor.get('accent', 'hover', options),
				},
				color: ThemeColor.get('accent', 'text', options),
			}
		case 'outline':
			return {
				border: {
					base: ThemeColor.get('border', options),
					hover: ThemeColor.get('border', 'strong', options),
				},
				color: ThemeColor.get('border', 'text', options),
			}
		case 'ghost':
			return {
				background: {
					base: 'transparent',
					hover: ThemeColor.get('primary', '03', options),
				},
				border: {
					base: 'transparent',
					hover: ThemeColor.get('primary', '03', options),
				},
				color: ThemeColor.get('border', 'text', options),
			}
		default:
			return {}
	}
}

// currently takes in wrong params - use interface type
export const buildVariantTokens = <K extends ThemeName>(
	target: string,
	variant: string,
	options: TokenBuilder<K>
): ThemeTokens[K] => {
	const variantPalette = getVariantColors(variant, options),
		palette = deepMerge(basePalette, variantPalette)
		// console.log({ options })

	return generateCssVars(palette, target)
}

const listThemeTokens = <K extends ThemeName>(
	options: TokenBuilder<K>
) => {
	const accent = {
		base: ThemeColor.accent('01', options),
		hover: ThemeColor.accent('02', options),
		text: ThemeColor.alt('01', options),
	}

	const border = {
		base: ThemeColor.alt('05', options),
		strong: ThemeColor.alt('06', options),
		text: ThemeColor.alt('04', options),
	}

	const backgrounds = {
		body: ThemeColor.main('01', options),
	}

	const colors = {
		text: ThemeColor.alt('01', options),
	}

	const themeColors = getThemeColors({ ...options, as: 'var' })
	return { ...themeColors, accent, colors, backgrounds, border }
}

export const buildThemeTokens = <K extends ThemeName>(
	options: TokenBuilder<K>
): ThemeTokens[K] => {
	const { name, theme, scheme, prefix } = options
	if (!Object.hasOwn(theme.colors, scheme)) return {}

	// const test2 = buildVariantTokens('button', 'solid', options)
	// console.log(test2)

	const tokens = listThemeTokens(options),
		config = { theme: name, ...tokens }

	return generateCssVars(config, prefix) as ThemeTokens[K]
}

export const themeToCssVars = (
	theme: SiteTheme,
	prefix?: string
): ThemeTokens => ({
	base: buildTokens({ theme, prefix }),
	dark: buildTokens({ name: 'dark', scheme: 'ink', theme, prefix }),
	light: buildTokens({ name: 'light', scheme: 'paper', theme, prefix }),
})
