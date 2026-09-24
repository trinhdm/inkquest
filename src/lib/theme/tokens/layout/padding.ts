import { base } from '../../reference'
import type { TokenVariableShape } from '../../types'

export interface PaddingTokens {
	block: TokenVariableShape
	chip: TokenVariableShape

	menu: string
}

export const getPaddingTokens = (): PaddingTokens => ({
	block: `${base.space('4')} ${base.space('6')}`,
	chip: `${base.space('2')} ${base.space('3')}`,

	menu: base.space('2'),
})
