import { tokn } from '../ref'
import type { ThemeConfig } from './theme'

export interface BackgroundConfig {
	scheme: ThemeConfig['scheme']
	name: ThemeConfig['name']
}

export interface BackgroundTokens {
	page: string
	// surface: string
	card: { base: string; hover: string }
}

export const backgroundTokens = ({ scheme, name }: ThemeConfig): BackgroundTokens => ({
	page: name === 'dark'
		? tokn[scheme]('100')
		: tokn[scheme]('300'),
	// surface: Token.alias('primary', '02'),
	card: {
		base: name === 'dark'
			? tokn[scheme]('300')
			: tokn[scheme]('100'),
		hover: tokn[scheme]('400')
	}
})
