import { getTypographyTokens } from '../index'
import { getFontPropertyTokens } from '../properties'
import { getFontPresetTokens } from '../presets'

describe('getTypographyTokens', () => {
	it('splits the output into font properties and text presets', () => {
		expect(getTypographyTokens()).toEqual({
			font: getFontPropertyTokens(),
			text: getFontPresetTokens(),
		})
	})
})
