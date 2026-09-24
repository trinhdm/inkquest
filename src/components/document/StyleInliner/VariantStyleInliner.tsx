import { getVariantCSS } from './cache'
import type { ComponentProps } from 'react'

interface VariantStyleInlinerProps
	extends ComponentProps<'style'> {
	names?: string[]
	prefix?: string
}

export const VariantStyleInliner = ({
	names,
	prefix,
	...props
}: VariantStyleInlinerProps) => {
	const styles = getVariantCSS(names, prefix)

	if (!styles) return null

	return (
		<style
			{ ...props }
			data-variant-vars
			dangerouslySetInnerHTML={{ __html: styles }}
			href="css-variant-base"
			precedence="high"
		/>
	)
}

VariantStyleInliner.displayName = 'VariantStyleInliner'
