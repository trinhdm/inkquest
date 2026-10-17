import { getBorderColorTokens } from '../color'
import { base } from '../../../reference'
import { THEME_CONFIGS } from '../../../themeConfig'

describe('getBorderColorTokens', () => {
	it('takes base and strong from the active theme palette, strong being the heavier step', () => {
		expect(getBorderColorTokens(THEME_CONFIGS.dark)).toEqual({
			base: base.ink('500'),
			strong: base.ink('600'),
		})
		expect(getBorderColorTokens(THEME_CONFIGS.light)).toEqual({
			base: base.paper('500'),
			strong: base.paper('600'),
		})
	})
})
