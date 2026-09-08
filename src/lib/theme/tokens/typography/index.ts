import { getFontPresetTokens, type FontPresetTokens } from './presets'
import { getFontPropertyTokens, type FontPropertyTokens } from './properties'

export interface TypographyTokens
	extends FontPropertyTokens, FontPresetTokens {
}

export const getTypographyTokens = (): TypographyTokens => {
	const fontProperties = getFontPropertyTokens(),
		fontPresets = getFontPresetTokens()

	return { ...fontProperties, ...fontPresets }
}
