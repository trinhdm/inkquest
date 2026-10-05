import { base } from '../../reference'
import type { TokenSizeShape } from '../../types'

export interface ElementTokens {
	icon: TokenSizeShape
	dot: TokenSizeShape
	tile: TokenSizeShape
}

export const getElementTokens = (): ElementTokens => ({
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
	tile: {
		sm: base.space('6'),
		md: base.space('7'),
		lg: base.space('8'),
	},
})
