import { base } from '../../reference'
import { byTheme } from '../utils'
import type { ThemeConfig } from '../theme'

export interface BorderColorTokens {
	base: string
	strong: string
}

export const getBorderColorTokens = (config: ThemeConfig): BorderColorTokens => {
	const { colors } = byTheme(config)

	return {
		base: colors.theme('500'),
		strong: colors.theme('600'),
	}
}
