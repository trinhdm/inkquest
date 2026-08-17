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
	container: string
}

export const getElementTokens = (): ElementTokens => ({
	icon: {
		sm: base.size('12'),
		md: base.size('16'),
		lg: base.size('20'),
	},
	dot: {
		sm: base.size('6'),
		md: base.size('8'),
		lg: base.size('10'),
	},
	tile: {
		sm: base.size('24'),
		md: base.size('32'),
		lg: base.size('40'),
		// xl: base.size('56'),
	},
	container: base.screenSize('1280'),
})
