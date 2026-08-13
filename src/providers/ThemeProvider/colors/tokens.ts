
import { PREFIX_CSS_SELECTOR } from '@/utils/constants'
import { getVariable, nameVariables } from '../css'

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

export interface TokenStatesList<T extends keyof CSSProperties> {
	base: TokenItem<T>
	hover: TokenItem<T>
	// active?: TokenItem<T>
	// disabled?: TokenItem<T>
	// focus?: TokenItem<T>
	// selected?: TokenItem<T>
}

type TokenGroup<T extends keyof CSSProperties> =
	| TokenItem<T>
	| TokenStatesList<T>

export interface ColorPalette {
	background?: TokenGroup<'backgroundColor'>
	border?: TokenGroup<'borderColor'>
	color?: TokenGroup<'color'>
}

interface ThemeOptions {
	prefix?: string
	scheme: ColorScheme
	theme: SiteTheme
}

const _namePrimitive = (
	...args: [...paths: string[], options: ThemeOptions] | string[]
) => {
	const last = args.at(-1)
	let options = {} as ThemeOptions,
		prefix: string | undefined = undefined

	if (typeof last === 'object') {
		options = args.pop() as ThemeOptions

		if (Object.hasOwn(options, 'prefix'))
			({ prefix } = options)
	}

	const path = args as string[]
	const variable = getVariable({ path, prefix })
	// console.log(variable, options, { path, prefix })

	return variable
}

const _getSemantic = (
	...args: [...paths: string[], options: ThemeOptions] | string[]
) => {
	const last = args.at(-1)
	let options = args

	if (typeof last === 'string')
		options.push({ prefix: PREFIX_CSS_SELECTOR })
	const variable = _namePrimitive(...options)
	return `var(${variable})`
}

const _getPrimitive = (
	...args: [...paths: string[], options: ThemeOptions] | string[]
) => {
	const variable = _namePrimitive(...args)
	return `var(${variable})`
}


export const Token = {
	// main: _primaryColor,
	// alt: _secondaryColor,
	// primitive: _tertiaryColor,
	base: _getPrimitive,
	global: _namePrimitive,
	alias: _getSemantic,
}

const buildSemantic = <K extends ThemeName>(
	options: TokenBuilder<K>
) => {
	const accent = {
		base: Token.base('brand', '100'),
		hover: Token.base('brand', '200'),
		text: Token.alias('secondary', '02', options),
	}

	const border = {
		base: Token.alias('secondary', '05', options),
		strong: Token.alias('secondary', '06', options),
		text: Token.alias('secondary', '04', options),
	}

	const backgrounds = {
		page: Token.alias('primary', '01', options),
		surface: Token.alias('primary', '02', options),
		card: Token.alias('primary', '03', options),
	}

	const colors = {
		text: Token.alias('primary', '01', options),
	}

	const semantic = { accent, colors, backgrounds, border }

	console.log({ semantic, options })

	return { accent, colors, backgrounds, border }
}

const buildAlias = <K extends keyof ThemeTokens>(
	options: TokenBuilder<K>
): ThemeTokens[K] => {
	const { prefix, primitives, scheme } = options

	const variables = Object.keys(primitives).filter(k => /(0|[1-9]\d*)00$/.test(k))
	let tokens = {}

	const aliasTokens = variables.reduce((acc, value) => {
		let key = ''
		if (scheme && !value.includes('brand'))
			key = value.includes(scheme) ? 'primary' : 'secondary'

		if (key && Object.hasOwn(acc, key) && !acc[key].includes(value))
			acc[key].push(`var(${value})`)

		return acc
	}, {
		primary: [],
		secondary: []
	})
	// console.log({ scheme, aliasTokens, options })

	return nameVariables(aliasTokens, prefix)
}

const buildTokens = <K extends keyof ThemeTokens>(
	options: TokenBuilder<K>
): ThemeTokens[K] => {
	const { name, prefix } = options
	let tokens = { theme: name }

	if (name) {
		const aliasTokens = buildAlias(options)
		const semanticTokens = buildSemantic(options)
		tokens = { ...tokens, ...aliasTokens, ...semanticTokens }
	}

	return nameVariables(tokens, prefix)
}

const buildPrimitives = <K extends keyof ThemeTokens>(
	theme: SiteTheme
): ThemeTokens[K] => {
	// let primitives = {}
	const { colors, ...baseTheme } = theme
	const colorTokens = nameVariables(colors),
		baseTokens = nameVariables(baseTheme)

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
	const primitives = buildPrimitives(theme)
	// const variables = Object.keys(primitives).filter(k => /(0|[1-9]\d*)00$/.test(k))

	return {
		base: primitives,
		dark: buildTokens({ name: 'dark', scheme: 'ink', prefix, primitives }),
		light: buildTokens({ name: 'light', scheme: 'paper', prefix, primitives }),
		// ...buildTokens({ name: 'dark', scheme: 'ink' }),
		// light: buildTokens({ name: 'light', scheme: 'paper', theme, prefix }),
	}
}






// const buildTokens = <K extends keyof ThemeTokens>(
// 	options: TokenBuilder<K>
// ): ThemeTokens[K] => {
// 	const { name, prefix } = options
// 	let tokens = { theme: name }

// 	const aliasTokens = buildAlias(options)
// 	const semanticTokens = buildSemantic({ prefix })
// 		tokens = { ...tokens, ...aliasTokens, ...semanticTokens }

// 		// const variables = Object.keys(primitives).filter(k => /(0|[1-9]\d*)00$/.test(k) && !k.includes('brand'))

// 	// if (scheme) {
// 	// 	const themeTokens = variables.reduce((acc, value) => {
// 	// 		let key = value.includes(scheme) ? 'primary' : 'secondary'

// 	// 		if (!acc[key].includes(value))
// 	// 			acc[key].push(`var(${value})`)

// 	// 		return acc
// 	// 	}, {
// 	// 		primary: [],
// 	// 		secondary: []
// 	// 	})

// 	// 	const semanticTokens = buildSemantic({ prefix })
// 	// 	tokens = { ...tokens, ...aliasTokens, ...semanticTokens }
// 	// }

// 	// const tokens = nameVariables({ theme: name, ...tokens }, prefix)

// 	return nameVariables(tokens, prefix)
// }




// const buildTokens = <K extends keyof ThemeTokens>(
// 	options: TokenBuilder<K>
// ): ThemeTokens[K] => {
// 	const { name, prefix, primitives, scheme } = options

// 	const variables = Object.keys(primitives).filter(k => k.includes('color') && !k.includes('brand'))

// 	const test = variables.reduce((acc, value) => {
// 		let key = value.includes(scheme) ? 'primary' : 'secondary'

// 		if (!acc[key].includes(value))
// 			acc[key].push(`var(${value})`)

// 		return acc
// 	}, {
// 		primary: [],
// 		secondary: []
// 	})

// 	// console.log(test, nameVariables(test, prefix))
// 	const tokens = listThemeTokens({ prefix })
// 	console.log({ tokens })

// 	return nameVariables({ theme: name, ...test, ...tokens }, prefix)

// 	// for (const [index, value] of colors.entries()) {
// 	// 	const step = getStep(index)
// 	// 	console.log({ index, value })
// 	// 	// deepSetMap(vars, step, value)
// 	// }

// 	// for (const scheme of schemes) {
// 	// 	// const variables = nameVariables({ path: ['primary'] }, prefix)
// 	// 	const variables = Token.global({ path: ['primary'] }, prefix)
// 	// 	console.log({ variables, scheme })
// 	// 	// hexCodes[scheme] = getThemeColors({ ...options, scheme })
// 	// }

// 	// return nameVariables(theme)

// 	// const primitives = nameVariables({ color: hexCodes })
// 	// const variables = nameVariables(baseTheme, prefix)

// 	// return { ...variables, ...primitives }
// }

// export const buildSchemes = (
// 	theme: SiteTheme,
// 	prefix?: string
// ): ThemeTokens => {
// 	const primitives = nameVariables(theme)

// 	const { colors, ...baseTheme } = theme,
// 		schemes = Object.keys(colors) as (keyof typeof colors)[]

// 	// const variables = Object.keys(primitives).filter(k => k.includes('color') && !k.includes('brand'))

// 	// for (const scheme of schemes) {
// 	// 	const test = variables.reduce((acc, value) => {
// 	// 		let key = value.includes(scheme) ? 'primary' : 'secondary'

// 	// 		if (!acc[key].includes(value))
// 	// 			acc[key].push(`var(${value})`)

// 	// 		// if (Object.hasOwn(primitives, value))
// 	// 		// 	const hexCode = primitives[value]

// 	// 		return acc
// 	// 	}, {
// 	// 		primary: [],
// 	// 		secondary: []
// 	// 	})

// 	// 	console.log(test, nameVariables(test, prefix))
// 	// }

// 	return {
// 		base: primitives,
// 		dark: buildTokens({ name: 'dark', scheme: 'ink', prefix, primitives }),
// 		// ...buildTokens({ name: 'dark', scheme: 'ink' }),
// 		// light: buildTokens({ name: 'light', scheme: 'paper', theme, prefix }),
// 	}
// }
