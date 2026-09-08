import { base } from '../../reference'
import type { TokenVariableShape } from '../../types'

export interface SpaceTokens {
	chip: TokenVariableShape
	icon: string

	group: {
		base: TokenVariableShape
		lg: TokenVariableShape
	}
	menu: TokenVariableShape
}

export const getSpaceTokens = (): SpaceTokens => ({
	chip: `${base.space('1')} ${base.space('2')}`,
	icon: base.space('1'),

	menu: `${base.space('2')} ${base.space('6')}`,
	group: {
		base: `${base.space('3')} ${base.space('4')}`,
		lg: `${base.space('4')} ${base.space('5')}`,
	},
})
