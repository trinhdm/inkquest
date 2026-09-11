import { getSchemeCSS } from './cache'
import type { ComponentProps } from 'react'
import type { SiteTheme } from '@/lib/theme'

interface StyleInlinerProps
	extends ComponentProps<'style'> {
	prefix?: string
	theme: SiteTheme
}

export const StyleInliner = ({
	prefix,
	theme,
	...props
}: StyleInlinerProps) => {
	const styles = getSchemeCSS(theme, prefix)

	if (!styles) return null

	return (
		<style
			{ ...props }
			data-scheme-style
			dangerouslySetInnerHTML={{ __html: styles }}
			href="css-scheme-base"
			precedence="high"
		/>
	)
}

StyleInliner.displayName = 'StyleInliner'
