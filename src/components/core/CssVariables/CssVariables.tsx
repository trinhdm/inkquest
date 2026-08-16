'use client'

import { useMemo, type ComponentProps } from 'react'
import { useTheme } from '@/providers/ThemeProvider'
import { resolveCssVars, serializeCssVars } from './build'
import { PREFIX_CSS_SELECTOR } from '@/utils/constants'

interface CssVariablesProps
	extends ComponentProps<'style'> {}

export const CssVariables = (props: CssVariablesProps) => {
	const theme = useTheme()

	const css = useMemo(() => {
		const tokens = resolveCssVars({ current: theme, prefix: PREFIX_CSS_SELECTOR })
		return serializeCssVars(tokens)
	}, [theme])

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
