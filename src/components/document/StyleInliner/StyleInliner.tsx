import { resolveStyles } from './resolver'
import { serializeStyles } from './serializer'
// import { useTheme } from '@/providers/ThemeProvider'
// import { DEFAULT_THEME } from '@/providers/ThemeProvider/constants'
// import { PREFIX_CSS_SELECTOR } from '@/utils/constants'
import type { ComponentProps } from 'react'
import type { SiteTheme } from '@/lib/theme'

interface StyleInlinerProps
	extends ComponentProps<'style'> {
	prefix?: string
	theme: SiteTheme
}

export const StyleInliner = ({ prefix, theme, ...props }: StyleInlinerProps) => {
	const tokens = resolveStyles({ current: theme, prefix }),
		styles = serializeStyles(tokens)

	// const current = theme ?? DEFAULT_THEME,
	// 	tokens = resolveStyles({ current, prefix }),
	// 	styles = serializeStyles(tokens)

	if (!styles) return null

	return (
		<style
			{ ...props }
			data-scheme-style
			dangerouslySetInnerHTML={{ __html: styles }}
		/>
	)
}

StyleInliner.displayName = 'StyleInliner'
