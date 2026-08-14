import { formatToken } from './format/tokenName'
import { PREFIX_CSS_SELECTOR } from '@/utils/constants'
import type { ColorScheme, SiteTheme } from '@/providers/ThemeProvider'

interface ThemeOptions {
	prefix?: string
	scheme?: ColorScheme
	theme?: SiteTheme
}

type PathArgs = [...paths: string[], options: ThemeOptions] | string[]

const splitTokenPath = (...args: PathArgs) => {
	const path = args as string[]
	let options: ThemeOptions | undefined

	// (args as Exclude<typeof args, string[]>).pop()
	if (typeof args.at(-1) === 'object')
		options = args.pop() as ThemeOptions

	return { options, path }
}

const getTokenVar = (args: Parameters<typeof formatToken>[0]) => {
	return `var(${formatToken(args)})`
}

const baseVar = (...args: PathArgs) => {
	const { options, path } = splitTokenPath(...args)
	return getTokenVar({ ...options, path })
}

const aliasVar = (...args: PathArgs) => {
	const { options, path } = splitTokenPath(...args)
	let opts = options ?? {}

	if (!Object.hasOwn(opts, 'prefix'))
		opts.prefix = PREFIX_CSS_SELECTOR

	return getTokenVar({ ...opts, path })
}

export const Token = {
	base: baseVar,
	alias: aliasVar,
}


// const _namePrimitive = (
// 	...args: [...paths: string[], options: ThemeOptions] | string[]
// ) => {
// 	const last = args.at(-1)
// 	let options = {} as ThemeOptions,
// 		prefix: string | undefined = undefined

// 	if (typeof last === 'object') {
// 		options = args.pop() as ThemeOptions

// 		if (Object.hasOwn(options, 'prefix'))
// 			({ prefix } = options)
// 	}

// 	const path = args as string[]
// 	const variable = formatToken({ path, prefix })
// 	// console.log(variable, options, { path, prefix })

// 	return variable
// }

// const _getSemantic = (
// 	...args: [...paths: string[], options: ThemeOptions] | string[]
// ) => {
// 	const last = args.at(-1)
// 	let options = args as Exclude<typeof args, string[]>

// 	if (typeof last === 'string')
// 		options.push({ prefix: PREFIX_CSS_SELECTOR } as ThemeOptions)

// 	const variable = _namePrimitive(...options)
// 	return `var(${variable})`
// }

// const _getPrimitive = (
// 	...args: [...paths: string[], options: ThemeOptions] | string[]
// ) => {
// 	const variable = _namePrimitive(...args)
// 	return `var(${variable})`
// }
