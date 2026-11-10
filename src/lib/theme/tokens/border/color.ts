// import { base } from '../../reference'
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

	// const controlMix = {
	// 	dark: { base: 45, hover: 60 },
	// 	light: { base: 90, hover: 100 },
	// }

	// const { colors } = byScheme(config, controlMix)
	// const toControl = (percent: number) =>
	// 	colorMix(alias.secondary(), percent, alias.background.card())

	// return {
	// 	base,
	// 	strong (unchanged),
	// 	control: {
	// 		base: toControl(colors.get.base),
	// 		hover: toControl(colors.get.hover)
	// 	}
	// }
}
