import { useTheme } from '@/providers/ThemeProvider'
import { getClassName } from './getClassName'
import { getStyle } from './getStyle'
import { keyHasValue, pluralizeKeys } from '@/utils/helpers'
import type { CSSProperties } from 'react'
import type { ClassValue } from 'clsx'
import type { PluralizeKeys } from '@/types/utils'
import type { SiteThemeConfig } from '@/lib/theme/types'
import type { SpecsContext, SpecsContract, SpecsSelectors } from '@/lib/component/factory/types'
import type { TokensConfig } from '@/lib/component/tokens'

export interface StyleOptions<S extends SpecsContract> {
	readonly classes?: [SpecsSelectors<S>] extends [never] ? never : Record<string, string>
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
	options: StyleOptions<S>
): StyleFn<S> => {
	const theme = useTheme()
	const prefix = options.prefix ?? theme.prefix,
		opts = { ...options, name, prefix, theme }

	const styleSelector = <T extends SpecsSelectors<S>>(
		selector: T,
		config?: SelectorArgs['config']
	): StyleResults<T> => {
		const check = {
			isRoot: selector === ROOT_SELECTOR,
			isUnstyled: isUnstyled(options.props),
		}

		const args: SharedConfig<S> = { ...opts, check, config, selector }
		const values: StyleResult = {
			className: getClassName<S>(args),
			style: getStyle<S>(args),
		}

		const result: AnyStyleResult = check.isRoot
			? pluralizeKeys(values)
			: values

		return result as StyleResults<T>
	}

	return styleSelector
}
