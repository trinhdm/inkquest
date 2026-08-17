import { alias } from '../../reference'
import { byScheme } from '../utils'

export interface TextColorTokens {
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
}

export const getTextColorTokens = (
	configuration: ReturnType<typeof byScheme>
): TextColorTokens => {
	const { colors } = configuration

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
	}
}
