import { base } from '../../reference'
import type { TokenSizeShape } from '../../types'

export interface ElementTokens {
	avatar: TokenSizeShape
	dot: TokenSizeShape
	icon: TokenSizeShape
}

export const getElementTokens = (): ElementTokens => ({
	avatar: {
		sm: base.space('6'),
		md: base.space('8'),
		lg: base.space('10'),
	},
	icon: {
		sm: base.icon('14'),
		md: base.icon('16'),
		lg: base.icon('18'),
	},
	dot: {
		sm: base.space('1'),
		md: base.space('2'),
		lg: base.space('3'),
	},
})
