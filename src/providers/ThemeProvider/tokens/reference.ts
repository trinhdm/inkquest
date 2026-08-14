import { formatToken } from './format/tokenName'
import { PREFIX_CSS_SELECTOR } from '@/utils/constants'
import type { ColorScheme, SiteTheme } from '@/providers/ThemeProvider'
import type { CSSVars } from '@/types/shared'

interface ThemeOptions {
	prefix?: string
	scheme?: ColorScheme
	theme?: SiteTheme
}

type TokenVar = `var(${keyof CSSVars})`
type PathArgs = [...paths: string[], options: ThemeOptions] | string[]

const splitTokenPath = (...args: PathArgs) => {
	const path = args as string[]
	let options: ThemeOptions | undefined

	if (typeof args.at(-1) === 'object')
		options = args.pop() as ThemeOptions

	return { options, path }
}

const getTokenVar = (args: Parameters<typeof formatToken>[0]): TokenVar => {
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
