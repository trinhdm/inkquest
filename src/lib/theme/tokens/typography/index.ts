import { getFontPresetTokens, type FontPresetTokens } from './presets'
import { getFontPropertyTokens, type FontPropertyTokens } from './properties'

export interface TypographyTokens {
	font: FontPropertyTokens
	text: FontPresetTokens
}

export const getTypographyTokens = (): TypographyTokens => {
	const fontProperties = getFontPropertyTokens(),
		fontPresets = getFontPresetTokens()

	return {
		font: fontProperties,
		text: fontPresets,
	}
}
