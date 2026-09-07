import { useMemo, type CSSProperties } from 'react'
import { useTheme } from '@/providers/ThemeProvider'
import { getClassName } from './getClassName'
import { getStyles } from './getStyle'
import { keyHasValue, pluralizeKeys } from '@/utils/helpers'
import type { SiteThemeConfig, ThemeCSSConfig } from '@/lib/theme'
import type { SpecAttributes } from '@/types/shared'
import type { PluralizeKeys } from '@/types/utils'

interface StyleOptions<P extends object, V extends object = object> {
	readonly classes?: Record<string, string>
	prefix?: string
	props: P
	tokens?: ThemeCSSConfig<P, V>
}

interface SelectorArgs {
	check: {
		isRoot: boolean
		isUnstyled: boolean
	}
	config?: SpecAttributes
	selector: string
}

export interface SharedConfig<P extends object, V extends object = object>
	extends SelectorArgs, StyleOptions<P, V> {
	name: string
	theme: SiteThemeConfig
}

type StyleFn = (
	selector: SelectorArgs['selector'],
	config?: SelectorArgs['config']
) => StyleResult | PluralizeKeys<StyleResult>

interface StyleResult {
	className?: string
	style?: CSSProperties
}

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
