import { alias } from '../../reference'
import { byScheme } from '../utils'

export interface TextColorTokens {
	text: {
		base: string
		// primary: string
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
			base: alias.secondary(),
			inverse: colors.theme('100'),
			// primary: alias.secondary(),
			secondary: alias.secondary('shade'),
			tertiary: alias.secondary('dim'),
			on: {
				accent: alias.color.text('inverse'),
			},
		},
		link: {
			base: alias.secondary('shade'),
			hover: alias.secondary('tint'),
		},
	}
}
