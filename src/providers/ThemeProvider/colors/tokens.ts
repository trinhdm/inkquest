
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
		prefix: string | undefined = PREFIX_CSS_SELECTOR

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
	const variable = _namePrimitive(...args)
	return `var(${variable})`
}


export const Token = {
	// main: _primaryColor,
	// alt: _secondaryColor,
	// primitive: _tertiaryColor,
	global: _namePrimitive,
	alias: _getSemantic,
}



type Position = `0${number}`

const ALT_SCHEME: Record<ColorScheme, ColorScheme> = {
	brand: 'brand',
	ink: 'paper',
	paper: 'ink',
}

function getStep(value: number): string
function getStep(value: Position): number
function getStep(value: number | Position): number | string {
	if (typeof value === 'number') {
		const i = value + 1
		return i < 10 ? `0${i}` as const : String(i)
	}

	return parseFloat(value) - 1
}


const semanticTokens = <K extends ThemeName>(
	options: TokenBuilder<K>
) => {
	const accent = {
		base: Token.alias('brand', '01', { prefix: 'color' }),
		hover: Token.alias('brand', '02', { prefix: 'color' }),
		text: Token.alias('secondary', '02', options),
	}

	const border = {
		base: Token.alias('secondary', '05', options),
		strong: Token.alias('secondary', '06', options),
		text: Token.alias('secondary', '04', options),
	}

	const backgrounds = {
		body: Token.alias('primary', '01', options),
	}

	const colors = {
		text: Token.alias('primary', '01', options),
	}

	return { accent, colors, backgrounds, border }
}

const buildTokens = <K extends keyof ThemeTokens>(
	options: TokenBuilder<K>
): ThemeTokens[K] => {
	const { name, prefix, primitives, scheme } = options

	const variables = Object.keys(primitives).filter(k => k.includes('color') && !k.includes('brand'))
	let tokens = {}

	if (scheme) {

		const test = variables.reduce((acc, value) => {
			let key = value.includes(scheme) ? 'primary' : 'secondary'

			if (!acc[key].includes(value))
				acc[key].push(`var(${value})`)

			return acc
		}, {
			primary: [],
			secondary: []
		})

		const themeTokens = semanticTokens({ prefix })
		tokens = { ...tokens, ...test, ...themeTokens }

	}

	return nameVariables({ theme: name, ...tokens }, prefix)
}

export const buildSchemes = (
	theme: SiteTheme,
	prefix?: string
): ThemeTokens => {
	const primitives = nameVariables(theme)

	return {
		base: primitives,
		dark: buildTokens({ name: 'dark', scheme: 'ink', prefix, primitives }),
		// ...buildTokens({ name: 'dark', scheme: 'ink' }),
		// light: buildTokens({ name: 'light', scheme: 'paper', theme, prefix }),
	}
}



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
