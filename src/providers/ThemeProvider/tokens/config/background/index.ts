import { base } from '../../reference'
import type { ThemeConfig } from '../theme'

export interface BackgroundTokens {
	page: string
	// surface: string
	card: { base: string; hover: string }
}

export const getBackgroundTokens = ({ scheme, name }: ThemeConfig): BackgroundTokens => ({
	page: name === 'dark'
		? base[scheme]('100')
		: base[scheme]('300'),
	// surface: Token.alias('primary', '02'),
	card: {
		base: name === 'dark'
			? base[scheme]('300')
			: base[scheme]('100'),
		hover: base[scheme]('400')
	}
})
