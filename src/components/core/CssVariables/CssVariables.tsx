import { resolveCssVars, serializeCssVars } from './build'
import { PREFIX_CSS_SELECTOR } from '@/utils/constants'
import { DEFAULT_THEME } from '@/providers/ThemeProvider/constants'
import type { ComponentProps } from 'react'
import type { SiteTheme } from '@/lib/theme'

interface CssVariablesProps
	extends ComponentProps<'style'> {
		theme?: SiteTheme
	}

export const CssVariables = ({ theme, ...props }: CssVariablesProps) => {
	const tokens = resolveCssVars({ current: theme ?? DEFAULT_THEME, prefix: PREFIX_CSS_SELECTOR }),
		css = serializeCssVars(tokens)

	if (!css) return null

	// console.log(css)

	return (
		<style
			{ ...props }
			data-theme-vars
			dangerouslySetInnerHTML={{ __html: css }}
		/>
	)
}

CssVariables.displayName = 'CssVariables'
// rename to StyleInliner or Themer
