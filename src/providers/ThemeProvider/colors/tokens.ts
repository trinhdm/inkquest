
import { PREFIX_CSS_SELECTOR } from '@/utils/constants'
import { getVariable } from '../css'
import type { ColorScheme, SiteTheme } from '@/providers/ThemeProvider'

interface ThemeOptions {
	prefix?: string
	scheme?: ColorScheme
	theme?: SiteTheme
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
	let options = args as Exclude<typeof args, string[]>

	if (typeof last === 'string')
		options.push({ prefix: PREFIX_CSS_SELECTOR } as ThemeOptions)

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
	base: _getPrimitive,
	global: _namePrimitive,
	alias: _getSemantic,
}
