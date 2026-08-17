import { base } from '../../reference'
import { byScheme } from '../utils'
import type { ThemeConfig } from '../../themeConfig'

export interface BorderColorTokens {
	base: string
	strong: string
}

export const getBorderColorTokens = (config: ThemeConfig): BorderColorTokens => {
	const { colors } = byScheme(config)

	return {
		base: colors.theme('500'),
		strong: colors.theme('600'),
	}
}
