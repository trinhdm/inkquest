import { getFontPresetTokens, type FontPresetTokens } from './presets'
import { getFontPropertyTokens, type FontPropertyTokens } from './properties'
import { getTrackingTokens, type TrackingTokens } from './tracking'

export interface TypographyTokens
	extends FontPropertyTokens, FontPresetTokens {
	tracking: TrackingTokens
}

export const getTypographyTokens = (): TypographyTokens => {
	const fontProperties = getFontPropertyTokens(),
		fontPresets = getFontPresetTokens(),
		tracking = getTrackingTokens()

	return { ...fontProperties, ...fontPresets, tracking }
}
