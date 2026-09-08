import { base } from '../../reference'

export interface ElementTokens {
	icon: {
		sm: string
		md: string
		lg: string
	}
	dot: {
		sm: string
		md: string
		lg: string
	}
	tile: {
		sm: string
		md: string
		lg: string
	}
}

export const getElementTokens = (): ElementTokens => ({
	icon: {
		sm: base.space('3'),
		md: base.space('4'),
		lg: base.space('5'),
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
		// xl: base.space('56'),
	},

	// navbar: base.space('11'),
	// subnav: base.space('8'),
})
