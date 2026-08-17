import { alias } from '../../reference'
import type { TokenVariableShape } from '../../types'

export interface PaddingTokens {
	chip: TokenVariableShape
}

export const getPaddingTokens = (): PaddingTokens => ({
	chip: `${alias.space.inset('sm')} ${alias.space.inset('lg')}`,
})
