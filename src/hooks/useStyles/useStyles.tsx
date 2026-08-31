import { useMemo, type CSSProperties } from 'react'
import { useTheme } from '@/providers/ThemeProvider'
import { getClassName } from './getClassName'
import { getStyles } from './getStyle'
import { isObject } from '@/utils/helpers'
import type { PolymorphicSpec, SpecAttributes, ValidSpecs } from '@/types/spec'
import type { SiteThemeConfig, ThemeCSSConfig } from '@/lib/theme'

interface StyleOptions<S extends ValidSpecs<S>> {
	readonly classes?: Record<string, string>
	prefix?: string
	props: S['props'] & PolymorphicSpec<S>
	tokens?: ThemeCSSConfig<S>
}

interface SelectorArgs {
	check: {
		isRoot: boolean
		isUnstyled: boolean
	}
	config?: SpecAttributes
	selector: string
}

export interface SharedConfig<S extends ValidSpecs<S>>
	extends SelectorArgs, StyleOptions<S> {
	name: string
	theme: SiteThemeConfig
}

type StyleFn = (
	selector: SelectorArgs['selector'],
	config?: SelectorArgs['config']
) => StyleResult

interface StyleResult {
	classNames?: string
	styles?: CSSProperties
}

// type StyleCacheKey<T extends StyleFn> =
// 	`${Parameters<T>[0]}:${Parameters<T>[1] extends string ? Parameters<T>[1] : ''}`

const ROOT_SELECTOR = 'root'

const isUnstyled = <S extends ValidSpecs<S>>(props: StyleOptions<S>['props']): boolean =>
	isObject(props)
	&& Object.hasOwn(props, 'unstyled')
	&& !!(props as S['props'] & Record<'unstyled', unknown>).unstyled

export const useStyles = <S extends ValidSpecs<S>>(
	name: string,
	opts: StyleOptions<S>
): StyleFn => {
	const theme = useTheme()
	const choices = Object.keys(opts),
		hasOptions = !!choices.length

	return useMemo<StyleFn>(() => {
		if (!hasOptions) return (() => ({ classNames: '', styles: {} }))
		// console.log({ props: opts.props })

		const prefix = opts.prefix ?? theme.prefix,
			args = { ...opts, name, prefix, theme },
			cache = new Map<string, StyleResult>()

		return ((selector, config) => {
			let cacheKey = `${selector}:`
			if (config) cacheKey += JSON.stringify(config)

			const cached = cache.get(cacheKey)
			if (cached) return cached

			const check = {
				isRoot: selector === ROOT_SELECTOR,
				isUnstyled: isUnstyled(opts.props),
			}

			// const args: SelectorArgs = { check, config, selector }
			// Object.assign(options, args)
			const options: SharedConfig<S> = { ...args, check, config, selector }

			const values = {
				classNames: getClassName(options),
				styles: getStyles(options),
			}

			cache.set(cacheKey, values)
			return values
		})
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [hasOptions, name, opts, theme])
}
