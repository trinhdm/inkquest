import { base } from '../../reference'
import type { TokenSizeShape, TokenVariableShape } from '../../types'

export interface SpaceTokens {
	chip: TokenVariableShape
	icon: string

	group: {
		base: TokenVariableShape
		lg: TokenVariableShape
	}
	grid: TokenSizeShape & {
		base: TokenVariableShape
		xl: TokenVariableShape
	}

	menu: TokenVariableShape
}

export const getSpaceTokens = (): SpaceTokens => ({
	chip: `${base.space('1')} ${base.space('2')}`,
	icon: base.space('1'),

	menu: base.space('6'),
	grid: {
		base: base.space('6'),
		sm: base.space('8'),
		md: base.space('10'),
		lg: base.space('12'),
		xl: base.space('14'),
	},
	group: {
		base: `${base.space('3')} ${base.space('4')}`,
		lg: `${base.space('4')} ${base.space('5')}`,
	},
})
