import { alias, base } from '../../reference'
import { byScheme } from '../utils'
import type { ThemeConfig } from '../../themeConfig'

export interface BackgroundTokens {
	page: string
	surface: string
	card: { base: string; hover: string }
	control: string
	gradient: string
}

export const getBackgroundTokens = (config: ThemeConfig): BackgroundTokens => {
	const bgColors = {
		dark: {
			page: base.ink('100'),
			card: base.ink('300'),
		},
		light: {
			page: base.paper('300'),
			card: base.paper('100'),
		}
	}

	const { colors } = byScheme(config, bgColors)

	return {
		page: colors.get.page,
		surface: colors.theme('200'),
		card: {
			base: colors.get.card,
			hover: colors.theme('400'),
		},
		control: alias.background.card(),
		gradient: `linear-gradient(135deg, ${colors.theme('500')}, ${colors.theme('200')})`,
	}
}
