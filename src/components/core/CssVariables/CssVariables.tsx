'use client'

import { useTheme } from '@/providers/ThemeProvider'
import { resolveCssVars, serializeCssVars } from './build'
import { PREFIX_CSS_SELECTOR } from '@/utils/constants'
import type { ComponentProps } from 'react'

interface CssVariablesProps
	extends ComponentProps<'style'> {}

export const CssVariables = (props: CssVariablesProps) => {
	const theme = useTheme(),
		tokens = resolveCssVars({ current: theme, prefix: PREFIX_CSS_SELECTOR }),
		css = serializeCssVars(tokens)

	if (!css) return null

	console.log(css)

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
