import { alias, base } from '../../reference'
import type { TokenSizeShape } from '../../types'

interface RadiusScaleTokens
	extends TokenSizeShape {
	none: string
	pill: string
}

const getRadiusScaleTokens = (): RadiusScaleTokens => ({
	none: base.radius('01'),
	sm: base.radius('02'),
	md: base.radius('03'),
	lg: base.radius('04'),
	pill: base.radius('05'),
})

interface RadiusPresetTokens {
	chip: string
	control: string
}

const getRadiusPresetTokens = (): RadiusPresetTokens => ({
	chip: alias.borderRadius('sm'),
	control: alias.borderRadius('pill'),
})

export interface BorderRadiusTokens
	extends RadiusScaleTokens, RadiusPresetTokens {}

export const getBorderRadiusTokens = (): BorderRadiusTokens => {
	const scaleRadius = getRadiusScaleTokens(),
		presetRadius = getRadiusPresetTokens()

	return { ...scaleRadius, ...presetRadius }
}
