import { resolveStyles } from './resolver'
import { serializeStyles } from './serializer'
import { DEFAULT_THEME } from '@/providers/ThemeProvider/constants'
import { PREFIX_CSS_SELECTOR } from '@/utils/constants'
import type { ComponentProps } from 'react'
import type { SiteTheme } from '@/lib/theme'

interface StyleInlinerProps
	extends ComponentProps<'style'> {
	theme?: SiteTheme
}

export const StyleInliner = ({ theme, ...props }: StyleInlinerProps) => {
	const current = theme ?? DEFAULT_THEME,
		tokens = resolveStyles({ current, prefix: PREFIX_CSS_SELECTOR }),
		styles = serializeStyles({ tokens })

	if (!styles) return null

	// console.log('hi')

	return (
		<style
			{ ...props }
			data-scheme-style
			dangerouslySetInnerHTML={{ __html: styles }}
		/>
	)
}

StyleInliner.displayName = 'StyleInliner'
