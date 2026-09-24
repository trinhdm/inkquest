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
			base: alias.accent(),
			hover: alias.accent('hover'),
			active: alias.accent('active'),
			select: alias.accent('tint'),
			disable: alias.accent('muted'),
		},
		control: {
			base: alias.color.text('tertiary'),
			hover: alias.color.text(),
		},
		danger: modColor('red'),
		success: modColor('green'),
		warning: modColor('yellow'),
		info: modColor('blue'),
	}
}
