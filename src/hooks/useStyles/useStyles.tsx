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
	prefix?: string
	props: S['props']
	tokens?: ThemeCSSConfig<S>
	// unstyled?: boolean
}

export interface SharedConfig<S extends ValidSpecs<S>>
	extends StyleOptions<S> {
	check: {
		isRoot: boolean
		isUnstyled: boolean
	}
	config: object | undefined
	name: string
	selector: string
	// theme: SiteTheme
}

type StyleFn<S extends ValidSpecs<S>> = (
	selector: SharedConfig<S>['selector'],
	config?: SharedConfig<S>['config']
) => StyleResult

type StyleResult = {
	classNames?: string
	styles?: CSSProperties
}

const ROOT_SELECTOR = 'root'
const DEFAULT_OPTIONS = {
	prefix: PREFIX_CSS_SELECTOR,		// store this in context
}

export const useStyles = <S extends ValidSpecs<S>>(
	name: string,
	opts: StyleOptions<S>
): StyleFn<S> => {
	// const theme = useTheme()
	const choices = Object.keys(opts),
		hasOptions = !!choices.length

	return useMemo(() => {
		if (!hasOptions) return (() => ({ classNames: '', styles: {} })) as StyleFn<S>

		const options: StyleOptions<S> = { ...DEFAULT_OPTIONS, ...opts },
			cache = new Map<string, StyleResult>()

		return ((selector, config) => {
			const cacheKey = `${selector}:${config ? JSON.stringify(config) : ''}`
			const cached = cache.get(cacheKey)
			if (cached) return cached

			const check = {
				isRoot: selector === ROOT_SELECTOR,
				isUnstyled: Object.hasOwn(options.props, 'unstyled')
					&& !!(options.props as Record<'unstyled', unknown>).unstyled
			}

			const args: SharedConfig<S> = { ...options, check, config, name, selector }
			const values = {
				...getAttributes(args),
				classNames: getClassName(args),
				styles: getStyles(args),
			}

			cache.set(cacheKey, values)
			return values
		}) as StyleFn<S>
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [hasOptions, name, ...choices])
}
