import { buildVariantSchemes } from '@/lib/theme/buildVariantSchemes'
import { serializeVariantSchemes } from './serializer'
import type { ComponentProps } from 'react'

interface VariantStyleInlinerProps
	extends ComponentProps<'style'> {
	names: string[]
}

export const VariantStyleInliner = ({ names, ...props }: VariantStyleInlinerProps) => {
	const css = names
		.map(name => serializeVariantSchemes(buildVariantSchemes(name)))
		.filter(Boolean)
		.join('\n\n')

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
