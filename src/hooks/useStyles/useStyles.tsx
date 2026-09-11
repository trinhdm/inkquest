import { useMemo, type CSSProperties } from 'react'
import { useTheme } from '@/providers/ThemeProvider'
import { getClassName } from './getClassName'
import { getStyles } from './getStyle'
import { keyHasValue, pluralizeKeys } from '@/utils/helpers'
import type { ClassValue } from 'clsx'
import type { PluralizeKeys } from '@/types/utils'
import type { SiteThemeConfig, ThemeCSSConfig } from '@/lib/theme'

interface StyleOptions<P extends object, V extends object = object> {
	readonly classes?: Record<string, string>
	prefix?: string
	props: P
	tokens?: ThemeCSSConfig<P, V>
}

interface SelectorConfigOptions {
	global?: ClassValue
	module?: ClassValue
}

interface SelectorArgs {
	check: {
		isRoot: boolean
		isUnstyled: boolean
	}
	config?: true | SelectorConfigOptions
	selector: string
}

export interface SharedConfig<P extends object, V extends object = object>
	extends SelectorArgs, StyleOptions<P, V> {
	name: string
	theme: SiteThemeConfig
}

interface StyleResult {
	className?: string
	style?: CSSProperties
}

type StyleResults<S extends SelectorArgs['selector']> =
	S extends typeof ROOT_SELECTOR
		? PluralizeKeys<StyleResult>
		: StyleResult

type StyleFn = <S extends SelectorArgs['selector']>(
	selector: S,
	config?: SelectorArgs['config']
) => StyleResults<S>

const ROOT_SELECTOR = 'root'

const isUnstyled = <P extends object>(props: StyleOptions<P>['props']): boolean =>
	keyHasValue(props, { unstyled: true })

export const useStyles = <P extends object, V extends object = object>(
	name: string,
	opts: StyleOptions<P, V>
): StyleFn => {
	const theme = useTheme()
	const choices = Object.keys(opts),
		hasOptions = !!choices.length

	return useMemo<StyleFn>(() => {
		if (!hasOptions) return (() => ({ className: '', style: {} }))

		const prefix = opts.prefix ?? theme.prefix,
			sharedArgs = { ...opts, name, prefix, theme },
			cache = new Map<string, ReturnType<StyleFn>>()

		return ((selector, config) => {
			let cacheKey = `${selector}:`
			if (config) cacheKey += JSON.stringify(config)

			const cached = cache.get(cacheKey)
			if (cached) return cached

			const check = {
				isRoot: selector === ROOT_SELECTOR,
				isUnstyled: isUnstyled(opts.props),
			}

			const args: SharedConfig<P, V> = { ...sharedArgs, check, config, selector }

			const values: ReturnType<StyleFn> = {
				className: getClassName(args),
				style: getStyles(args),
			}

			const result: ReturnType<StyleFn> = check.isRoot
				? pluralizeKeys(values)
				: values

			cache.set(cacheKey, result)
			return result
		})
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [hasOptions, name, opts, theme])
}
