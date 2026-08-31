import { deepMerge } from '@/utils/helpers/objects'
import { tokens, type SiteTheme, type SiteThemeConfig } from '@/lib/theme'
import { toKebabCase } from '@/utils/helpers'

interface ThemeValidator<T,> {
	(theme: Partial<T>): asserts theme is T
}

const validateTheme = <T,>(theme: T): theme is T => {
	// if (!(Object.hasOwn(theme, 'font')))
	// 	throw new Error('theme missing font')
	return true
}

export const mergeTheme = <T extends object>(current: T, override?: Partial<T>) => {
	let theme = current

	if (override) theme = deepMerge(current, override) as T
	validateTheme(theme)

	return theme
}

const getPrefixSelector = (name: string, prefix?: string) => {
	const namespace = toKebabCase(name)
	let selector = namespace

	if (!!prefix)
		selector = `${prefix}-${selector}`

	return `.${selector}`
}

export const handleTheme = <T extends object>(theme: T, prefix?: string): SiteThemeConfig & { config: T } => {
	const prefixSelector = (name: string) => getPrefixSelector(name, prefix)
	const options: SiteThemeConfig & { config: T }= { ...tokens, config: theme, prefix, prefixSelector }

	return options
}
