import { base } from '../../reference'
import type { TokenVariableShape } from '../../types'

export interface PaddingTokens {
	block: TokenVariableShape
	chip: TokenVariableShape

	menu: string

	// hero: string
	// section: string
}

export const getPaddingTokens = (): PaddingTokens => ({
	block: `${base.space('4')} ${base.space('6')}`,
	chip: `${base.space('2')} ${base.space('3')}`,

	menu: base.space('2'),

	// hero: base.space('14'),
	// section: base.space('13'),
	// chip: `${alias.space.inset('xxs')} ${alias.space.inset('xs')}`,
})
