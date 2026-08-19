import { buildVariantSchemes } from '@/lib/theme/buildVariantSchemes'
import { serializeStyles } from './serializer'
import type { ComponentProps } from 'react'

interface VariantStyleInlinerProps
	extends ComponentProps<'style'> {
	names: string[]
}

export const VariantStyleInliner = ({ names, ...props }: VariantStyleInlinerProps) => {
	const tokens = names.flatMap(buildVariantSchemes),
		styles = serializeStyles(tokens)

	if (!styles) return null

	return (
		<style
			{ ...props }
			data-variant-vars
			dangerouslySetInnerHTML={{ __html: styles }}
		/>
	)
}

VariantStyleInliner.displayName = 'VariantStyleInliner'
