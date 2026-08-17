import { alias } from '../../reference'
import { byScheme } from '../utils'
import type { TokenStateHues } from '../../types'

export interface StateHueTokens {
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

export const getStateHueTokens = (
	configuration: ReturnType<typeof byScheme>
): StateHueTokens => {
	const { modColor } = configuration

	return {
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
