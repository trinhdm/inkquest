import { alias, base } from '../../reference'
import { byTheme, colorMod } from '../utils'
import type { ColorMixtures } from '../types'
import type { ThemeConfig } from '../theme'

export interface ColorTokens {
	text: {
		base: string
		primary: string
		secondary: string
		tertiary: string
		inverse: string
		on: {
			accent: string
		}
	}
	link: {
		base: string
		hover: string
	}
	action: {
		base: string
		hover: string
		active: string
		muted: string
	}
	danger: ColorMixtures
	success: ColorMixtures
	warning: ColorMixtures
	info: ColorMixtures
}

export const getColorTokens = (config: ThemeConfig): ColorTokens => {
	const { colors } = byTheme(config)
	const scaleBase = colors.theme('100')

	return {
		text: {
			base: colors.alt('100'),
			inverse: colors.theme('100'),
			primary: alias.accent.secondary(),
			secondary: alias.accent.secondary('active'),
			tertiary: alias.accent.secondary('shade'),
			on: {
				accent: colors.theme('100'),
			},
		},
		link: {
			base: alias.accent.secondary('shade'),
			hover: alias.accent.secondary('tint'),
		},
		action: {
			base: alias.accent.primary(),
			hover: alias.accent.primary('hover'),
			active: alias.accent.primary('active'),
			muted: alias.accent.primary('muted'),
		},
		danger: colorMod('red'),
		success: colorMod('green'),
		warning: colorMod('yellow'),
		info: colorMod('blue'),
	}
}
