import { useMemo, type CSSProperties } from 'react'
// import { useTheme } from '@/providers/ThemeProvider'
import { getAttributes } from './getAttributes'
import { getClassName } from './getClassName'
import { getStyles } from './getStyle'
import { PREFIX_CSS_SELECTOR } from '@/utils/constants'
import type { SiteTheme, ThemeCSSConfig } from '@/lib/theme'
import type { ValidSpecs } from '@/types/spec'

interface StyleOptions<S extends ValidSpecs<S>> {
	readonly classes?: Record<string, string>
	cssVars?: ThemeCSSConfig<S>
	name?: string
	prefix?: string
	props: S['props']
	// unstyled?: boolean
}

export interface SharedConfig<S extends ValidSpecs<S>>
	extends StyleOptions<S> {
	check: {
		isRoot: boolean
		isUnstyled: boolean
	}
	config: object | undefined
	selector: string
	// theme: SiteTheme
}

type StyleResult = {
	className?: string
	style?: CSSProperties
}

type StyleConfig<S extends ValidSpecs<S>> = (
	selector: SharedConfig<S>['selector'],
	config?: SharedConfig<S>['config']
) => StyleResult

const ROOT_SELECTOR = 'root'
const BASE_OPTIONS = {
	prefix: PREFIX_CSS_SELECTOR,
}

export const useStyles = <S extends ValidSpecs<S>>(
	opts: StyleOptions<S>
): StyleConfig<S> => {
	// const theme = useTheme()
	const hasOpts = !!Object.keys(opts).length

	return useMemo(() => {
		if (!hasOpts) return (() => ({})) as StyleConfig<S>

		const base = { ...BASE_OPTIONS, ...opts },
			cache = new Map<string, StyleResult>()

		return ((selector, config) => {
			const cacheKey = `${selector}:${config ? JSON.stringify(config) : ''}`
			const cached = cache.get(cacheKey)
			if (cached) return cached

			const check = {
				isRoot: selector === ROOT_SELECTOR,
				isUnstyled: Object.hasOwn(opts.props, 'unstyled')
					&& (opts.props as Record<'unstyled', unknown>).unstyled === "true"
			}

			const args = { ...base, check, config, selector } as SharedConfig<S>
			const values = {
				...getAttributes(args),
				className: getClassName(args),
				style: getStyles(args),
			}

			cache.set(cacheKey, values)
			return values
		}) as StyleConfig<S>
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [hasOpts, opts.name, opts.classes, opts.cssVars, opts.props])
}
