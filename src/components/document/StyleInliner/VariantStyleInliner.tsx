import { buildVariantSchemes } from '@/lib/theme/buildVariantSchemes'
import { serializeStyles } from './serializer'
import type { ComponentProps } from 'react'

interface VariantStyleInlinerProps
	extends ComponentProps<'style'> {
	names: string[]
}

export const VariantStyleInliner = ({ names, ...props }: VariantStyleInlinerProps) => {
	const tokens = names.flatMap(buildVariantSchemes),
		css = serializeStyles(tokens)

	if (!css) return null

	return (
		<style
			{ ...props }
			data-variant-vars
			dangerouslySetInnerHTML={{ __html: css }}
		/>
	)
}

VariantStyleInliner.displayName = 'VariantStyleInliner'
