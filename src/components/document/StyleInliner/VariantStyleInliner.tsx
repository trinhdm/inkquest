import { buildVariantSchemes } from '@/lib/theme/buildVariantSchemes'
import { serializeStyles } from './serializer'
import type { ComponentProps } from 'react'

interface VariantStyleInlinerProps
	extends ComponentProps<'style'> {
	names?: string[]
	prefix?: string
}

export const VariantStyleInliner = ({ names, prefix, ...props }: VariantStyleInlinerProps) => {
	const tokens = !!names?.length
		? names.flatMap(name => buildVariantSchemes(name, prefix))
		: buildVariantSchemes('', prefix)
	const styles = serializeStyles(tokens)

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
