import { alias } from '../../reference'
import { byScheme } from '../utils'
import type { ThemeConfig } from '../../themeConfig'
import type { TokenStateHues } from '../../types'

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
	action: Pick<TokenStateHues,
		'base' | 'hover' | 'active' | 'select' | 'disable'>
	control: {
		base: string
		hover: string
	}
	danger: TokenStateHues
	success: TokenStateHues
	warning: TokenStateHues
	info: TokenStateHues
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
			select: alias.accent.primary('tint'),
			disable: alias.accent.primary('muted'),
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
