import { getAttributes } from './getAttributes'
import { getClassName } from './getClassName'
import { getStyles } from './getStyle'
import { useTheme, type SiteTheme } from '@/providers/ThemeProvider'
import { PREFIX_CSS_SELECTOR } from '@/utils/constants'
import type { CSSProperties } from 'react'
import type { ThemeCSSConfig } from '@/lib/theme'
import type { ValidSpecs } from '@/types/spec'

interface StyleOptions<S extends ValidSpecs<S>> {
	readonly classes?: Record<string, string>
	cssVars?: ThemeCSSConfig<S>
	name?: string
	prefix?: string
	props: S['props']
	// unstyled: boolean
}

export interface SharedConfig<S extends ValidSpecs<S>>
	extends StyleOptions<S> {
	config: object | undefined
	selector: string
	theme: SiteTheme
}

type StyleConfig<S extends ValidSpecs<S>> = (
	selector: SharedConfig<S>['selector'],
	config?: SharedConfig<S>['config']
) => {
	className: string
	style: CSSProperties
}

export const useStyles = <S extends ValidSpecs<S>>(opts: StyleOptions<S>): StyleConfig<S> => {
	if (!Object.keys(opts).length) return {} as StyleConfig<S>

	const theme = useTheme()
	let args = { ...opts, theme } as SharedConfig<S>
	args.prefix = args['prefix'] ?? PREFIX_CSS_SELECTOR

	return (selector, config) => {
		args = { ...args, config, selector }
		const attrs = getAttributes(args)

		return {
			...attrs,
			className: getClassName(args),
			style: getStyles(args),
		}
	}
	// return Object.fromEntries((Object.entries(styles).filter(([_, value]) => !!value)))
}
