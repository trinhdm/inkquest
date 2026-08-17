import { resolveCssVars, serializeCssVars } from './build'
import { DEFAULT_THEME } from '@/providers/ThemeProvider/constants'
import { PREFIX_CSS_SELECTOR } from '@/utils/constants'
import type { ComponentProps } from 'react'
import type { SiteTheme } from '@/lib/theme'

interface CssVariablesProps
	extends ComponentProps<'style'> {
	theme?: SiteTheme
}

export const CssVariables = ({ theme, ...props }: CssVariablesProps) => {
	const current = theme ?? DEFAULT_THEME,
		tokens = resolveCssVars({ current, prefix: PREFIX_CSS_SELECTOR }),
		css = serializeCssVars({ tokens })

	if (!css) return null

	// console.log(css)

	return (
		<style
			{ ...props }
			data-scheme-style
			dangerouslySetInnerHTML={{ __html: css }}
		/>
	)
}

CssVariables.displayName = 'CssVariables'
