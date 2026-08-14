import { generateTokens } from './generate'
import { Token } from './reference'
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
		base: Token.base('brand', '100'),
		hover: Token.base('brand', '200'),
		press: Token.base('brand', '300'),
		text: Token.alias('secondary', '02', options),
	}

	const border = {
		base: Token.alias('secondary', '05', options),
		strong: Token.alias('secondary', '06', options),
		text: Token.alias('secondary', '04', options),
	}

	const backgrounds = {
		page: options.name === 'dark'
			? Token.base(scheme, '100')
			: Token.base(scheme, '300'),
		surface: Token.alias('primary', '02', options),
		card: options.name === 'dark'
			? Token.alias('primary', '03', options)
			: Token.alias('primary', '01', options),
	}

	const colors = {
		text: {
			base: Token.alias('secondary', '01', options),
			inverse: Token.alias('primary', '01', options),
		},
		link: {
			base: Token.alias('accent', options),
			hover: Token.alias('accent', 'hover', options),
		},
	}

	const motion = {
		background: `background-color var(--inkq-duration-fast) var(--inkq-ease),
		border-color var(--inkq-duration-fast),
		transform var(--inkq-duration-instant) var(--inkq-ease)`,
	}

	// const semantic = { accent, colors, backgrounds, border }
	// console.log({ scheme, options })

	return { accent, colors, backgrounds, border, motion }
}

const buildAlias = <K extends ThemeName>(
	options: TokenBuilder<K>
): ThemeTokens[K] => {
	const { prefix, primitives, scheme } = options
	const PRIMITIVE_SCALE = /(0|[1-9]\d*)00$/,
		variables = Object.keys(primitives).filter(k => PRIMITIVE_SCALE.test(k))

	const groupedByScheme = variables.reduce<Record<string, string[]>>((acc, value) => {
		if (value.includes('brand')) return acc
		const group = value.includes(scheme) ? 'primary' : 'secondary'

		if (!Object.hasOwn(acc, group))
			acc[group] = [] as string[]
		if (!acc[group].includes(value))
			acc[group].push(`var(${value})`)

		return acc
	}, {})
	// console.log({ scheme, groupedByScheme, options })

	return generateTokens(groupedByScheme, prefix)
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
	const font = {
		display: {
			fontFamily: Token.base('font', 'black'),
			fontSize: Token.base('size', '32'),
			fontWeight: Token.base('weight', '700'),
			lineHeight: Token.base('line', 'height', 'lg'),
		},
		title: {
			fontFamily: Token.base('font', 'sans'),
			fontSize: Token.base('size', '24'),
			fontWeight: Token.base('weight', '600'),
			lineHeight: Token.base('line', 'height', 'lg'),
		},
		body: {
			fontFamily: Token.base('font', 'sans'),
			fontSize: Token.base('size', '16'),
			fontWeight: Token.base('weight', '400'),
			lineHeight: Token.base('line', 'height', 'sm'),
		},
	}

	// const fonts = {
	// 	display: {},
	// 	heading: {},
	// 	body: {},
	// 	caption: {},
	// 	label: {},
	// }

	const radius = {
		none: Token.base('radius', '01'),
		sm: Token.base('radius', '02'),
		md: Token.base('radius', '03'),
		lg: Token.base('radius', '04'),
		pill: Token.base('radius', '05'),
	}

	const tokens = {
		font,
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

// const buildScheme = <K extends keyof ThemeTokens>(
// 	options: TokenBuilder<K>
// ): ThemeTokens[K] => {
// 	const { name } = options
// 	return { [name]: buildTokens({ ...options, primitives }) }
// }

export const buildSchemes = (
	theme: SiteTheme,
	prefix?: string
): ThemeTokens => {
	const primitives = buildPrimitives(theme),
		semantic = buildSemantic({ prefix })
	// const variables = Object.keys(primitives).filter(k => /(0|[1-9]\d*)00$/.test(k))
	const options = { prefix, primitives }

	// const themeName = theme.name
	// console.log({ themeName })

	return {
		base: { ...primitives, ...semantic },
		dark: buildTokens({ name: 'dark', scheme: 'ink', ...options }),
		light: buildTokens({ name: 'light', scheme: 'paper', ...options }),
		// ...buildTokens({ name: 'dark', scheme: 'ink' }),
		// light: buildTokens({ name: 'light', scheme: 'paper', theme, prefix }),
	}
}
