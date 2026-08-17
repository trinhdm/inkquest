import { alias } from '../../reference'
import { byScheme } from '../utils'
import type { ColorMixtures } from '../../types'
import type { ThemeConfig } from '../../themeConfig'

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
	control: {
		base: string
		hover: string
	}
	danger: ColorMixtures
	success: ColorMixtures
	warning: ColorMixtures
	info: ColorMixtures
}

export const getColorTokens = (config: ThemeConfig): ColorTokens => {
	const { colors, modColor } = byScheme(config)

	return {
		text: {
			base: colors.alt('100'),
			inverse: colors.theme('100'),
			primary: alias.accent.secondary(),
			secondary: alias.accent.secondary('active'),
			tertiary: alias.accent.secondary('shade'),
			on: {
				accent: alias.color.text('inverse'),
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
		control: {
			base: alias.color.text('tertiary'),
			hover: alias.color.text('primary'),
		},
		danger: modColor('red'),
		success: modColor('green'),
		warning: modColor('yellow'),
		info: modColor('blue'),
	}
}
