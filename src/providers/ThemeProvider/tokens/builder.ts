import { generateTokens } from './generate'
import { tkn, Token } from './reference'
import type { ColorScheme, SiteTheme, ThemeName } from '../theme.types'
import type { CSSProperties } from 'react'
import type { CSSVars } from '@/types/shared'


export type ThemeTokens<V = unknown> =
	Record<ThemeName | 'base', CSSVars<V>>

interface TokenBuilder<K extends ThemeName> {
	name: K
	prefix?: string
	primitives: CSSVars
	scheme: ColorScheme
}

type TokenItem<T extends keyof CSSProperties> =
	CSSProperties[T]

export interface TokenStatesList<T extends keyof CSSProperties> {
	base: TokenItem<T>
	hover: TokenItem<T>
	active?: TokenItem<T>
	disabled?: TokenItem<T>
	focus?: TokenItem<T>
	pressed?: TokenItem<T>
	selected?: TokenItem<T>
}

export type TokenGroup<T extends keyof CSSProperties> =
	| TokenItem<T>
	| TokenStatesList<T>

const buildSemanticTheme = <K extends ThemeName>(
	options: TokenBuilder<K>
) => {
	const { scheme } = options
	const accent = {
		base: tkn('brand', '100'),
		hover: tkn('brand', '200'),
		press: tkn('brand', '300'),
		text: Token.alias('color', 'link'),
	}

	const border = {
		base: tkn(scheme, '600'),
		// strong: tkn(scheme, '500'),
		strong: `color-mix(in oklab, #FFF 55%, ${Token.alias('border')})`,
		// text: Token.alias('secondary', '04', options),
	}

	const backgrounds = {
		page: options.name === 'dark'
			? tkn(scheme, '100')
			: tkn(scheme, '300'),
		surface: Token.alias('primary', '02', options),
		card: {
			base: options.name === 'dark'
				? tkn(scheme, '300')
				: tkn(scheme, '100'),
			hover: tkn(scheme, '400')
		}
	}

	const mixer = options.name === 'dark'
		? '#FFF'
		: '#000'

	const colors = {
		text: {
			base: `color-mix(in oklab, ${mixer} 95%, ${tkn(scheme, '100')})`,
			// inverse: Token.alias('primary', '01', options),
		},
		link: {
			base: `color-mix(in oklab, ${mixer} 50%, ${tkn(scheme, '100')})`,
			hover: `color-mix(in oklab, ${mixer} 75%, ${tkn(scheme, '100')})`,
		},
		action: {
			base: Token.alias('accent'),
			hover: Token.alias('accent', 'hover'),
		},
		interactive: {
			base: `color-mix(in oklab, ${mixer} 85%, ${tkn(scheme, '100')})`,
			hover: `color-mix(in oklab, ${mixer} 90%, ${tkn(scheme, '100')})`,
		},
	}

	const motion = {
		interactive: `background-color ${tkn('duration', 'fast')} ${tkn('ease')},
		border-color ${tkn('duration', 'fast')},
		transform ${tkn('duration', 'instant')} ${tkn('ease')}`,
	}

	// const semantic = { accent, colors, backgrounds, border }
	// console.log({ scheme, options })

	return { accent, colors, backgrounds, border, motion }
}

const buildTokens = <K extends ThemeName>(
	options: TokenBuilder<K>
): ThemeTokens[K] => {
	const { name, prefix } = options
	let tokens = { theme: name }

	if (name) {
		// const aliasTokens = buildAlias(options)
		const semanticTokens = buildSemanticTheme(options)
		tokens = { ...tokens, ...semanticTokens }
	}

	return generateTokens(tokens, prefix)
}

const buildSemantic = <K extends ThemeName>(
	{ prefix }: TokenBuilder<K>
) => {
	const fontProperties = {
		family: {
			display: tkn('font', 'black'),
			title: tkn('font', 'sans'),
			body: tkn('font', 'sans'),
		},
		size: {
			title: {
				h1: tkn('font', 'size', '32'),
				h2: tkn('font', 'size', '24'),
				h3: tkn('font', 'size', '20'),
			},
			body: tkn('font', 'size', '16'),
			label: {
				base: tkn('font', 'size', '14'),
				sm: tkn('font', 'size', '12'),
			},
		},
		weight: {
			normal: tkn('weight', '400'),
			bold: tkn('weight', '600'),
			bolder: tkn('weight', '700'),
		},
	}

	const fonts = {
		...fontProperties,
		display: {
			fontFamily: Token.alias('font', 'family', 'display'),
			fontSize: tkn('font', 'size', '96'),
			fontWeight: Token.alias('font', 'weight', 'bolder'),
			lineHeight: tkn('line', 'height', 'lg'),
		},
		title: {
			fontFamily: tkn('font', 'sans'),
			fontSize: tkn('size', '24'),
			fontWeight: tkn('weight', '600'),
			lineHeight: tkn('line', 'height', 'lg'),
		},
		body: {
			fontFamily: tkn('font', 'sans'),
			fontSize: tkn('size', '16'),
			fontWeight: tkn('weight', '400'),
			lineHeight: tkn('line', 'height', 'sm'),
		},
		// 	caption: {},
		// 	label: {},
	}

	const radius = {
		none: tkn('radius', '01'),
		sm: tkn('radius', '02'),
		md: tkn('radius', '03'),
		lg: tkn('radius', '04'),
		pill: tkn('radius', '05'),
	}

	const space = {
		inset: {
			xs: tkn('size', '4'),
			sm: tkn('size', '8'),
			md: tkn('size', '12'),
			lg: tkn('size', '16'),
			xl: tkn('size', '24'),
			xxl: tkn('size', '32'),
		},
		// stack: {},
		// inline: {},
	}

	const tokens = {
		fonts,
		space,
		border: { radius }
	}

	return generateTokens(tokens, prefix)
}

const buildPrimitives = <K extends keyof ThemeTokens>(
	theme: SiteTheme
): ThemeTokens[K] => {
	// let primitives = {}
	const { colors, name, setName, ...baseTheme } = theme
	const colorTokens = generateTokens(colors),
		baseTokens = generateTokens(baseTheme)

	return { ...colorTokens, ...baseTokens }
}

export const buildSchemes = (
	theme: SiteTheme,
	prefix?: string
): ThemeTokens => {
	const primitives = buildPrimitives(theme),
		semantic = buildSemantic({ prefix })
	const options = { prefix, primitives }

	return {
		base: { ...primitives, ...semantic },
		dark: buildTokens({ name: 'dark', scheme: 'ink', ...options }),
		light: buildTokens({ name: 'light', scheme: 'paper', ...options }),
		// ...buildTokens({ name: 'dark', scheme: 'ink' }),
	}
}
