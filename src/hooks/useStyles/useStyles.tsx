import { useMemo, type CSSProperties } from 'react'
import { useTheme } from '@/providers/ThemeProvider'
import { getClassName } from './getClassName'
import { getStyle } from './getStyle'
import { keyHasValue, pluralizeKeys } from '@/utils/helpers'
import type { ClassValue } from 'clsx'
import type { PluralizeKeys } from '@/types/utils'
import type { SiteThemeConfig } from '@/lib/theme/types'
import type { SpecsContext, SpecsContract, SpecsSelectors, TokensConfig } from '@/lib/component'

export interface StyleOptions<S extends SpecsContract> {
	readonly classes?: S['selectors'] extends string ? Record<string, string> : never
	context?: SpecsContext<S>
	prefix?: string
	props: S['props']
	tokens?: TokensConfig<S>
}

interface SelectorConfigScope {
	global?: ClassValue
	module?: ClassValue
	selector?: ClassValue
}

interface SelectorArgs {
	check: {
		isRoot: boolean
		isUnstyled: boolean
	}
	config?: true | SelectorConfigScope
	selector: string
}

export interface SharedConfig<S extends SpecsContract>
	extends SelectorArgs, StyleOptions<S> {
	name: string
	theme: SiteThemeConfig
}

interface StyleResult {
	className?: string
	style?: CSSProperties
}

type AnyStyleResult =
	| StyleResult
	| PluralizeKeys<StyleResult>

type StyleResults<T extends SelectorArgs['selector']> =
	T extends typeof ROOT_SELECTOR
		? PluralizeKeys<StyleResult>
		: StyleResult

export type StyleFn<S extends SpecsContract> = <T extends SpecsSelectors<S>>(
	selector: T,
	config?: SelectorArgs['config'],
) => StyleResults<T>

const ROOT_SELECTOR = 'root'

const isUnstyled = <S extends SpecsContract>(props: StyleOptions<S>['props']): boolean =>
	keyHasValue(props, { unstyled: true })

export const useStyles = <S extends SpecsContract>(
	name: string,
	opts: StyleOptions<S>
): StyleFn<S> => {
	const theme = useTheme()

	return useMemo<StyleFn<S>>(() => {
		const prefix = opts.prefix ?? theme.prefix,
			sharedArgs = { ...opts, name, prefix, theme },
			cache = new Map<string, AnyStyleResult>()

		const styleSelector = <T extends SpecsSelectors<S>>(
			selector: T,
			config?: SelectorArgs['config']
		): StyleResults<T> => {
			let cacheKey = `${selector}:`
			if (config) cacheKey += JSON.stringify(config)

			const cached = cache.get(cacheKey)
			if (cached) return cached as StyleResults<T>

			const check = {
				isRoot: selector === ROOT_SELECTOR,
				isUnstyled: isUnstyled(opts.props),
			}

			const args: SharedConfig<S> = { ...sharedArgs, check, config, selector }

			const values: StyleResult = {
				className: getClassName<S>(args),
				style: getStyle<S>(args),
			}

			const result: AnyStyleResult = check.isRoot
				? pluralizeKeys(values)
				: values

			cache.set(cacheKey, result)
			return result as StyleResults<T>
		}

		return styleSelector
	}, [
		name, theme,
		// eslint-disable-next-line react-hooks/exhaustive-deps
		opts.classes, opts.context, opts.prefix, opts.props, opts.tokens,
	])
}
