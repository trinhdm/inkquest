import { base } from '../../reference'
// import type { TokenVariableShape } from '../../types'

export interface BreakpointTokens {
	min: string
	xs: string
	sm: string
	md: string
	lg: string
	xl: string
	max: string
}

export const getBreakpointTokens = (): BreakpointTokens => ({
	min: base.screen('320'),
	xs: base.screen('480'),
	sm: base.screen('768'),
	md: base.screen('1024'),
	lg: base.screen('1280'),
	xl: base.screen('1440'),
	max: base.screen('1920'),
})

export interface ContainerTokens {
	block: string
	page: string
}

export const getContainerTokens = (): ContainerTokens => ({
	block: base.screen('600'),
	page: base.screen('1280'),
})

interface LayoutItemTokens {
	gap: {
		kicker: string
		lede: string
		cta: string
	}
	padding: string
}

export interface GridTokens {
	gutter: string
	hero: LayoutItemTokens
	section: LayoutItemTokens

	navbar: { size: string }
	subnav: { size: string }
}

export const getGridTokens = (): GridTokens => ({
	gutter: base.space('10'),

	hero: {
		padding: base.space('16'),

		gap: {
			kicker: base.space('6'),
			lede: base.space('7'),
			cta: base.space('8'),
		},
	},

	section: {
		padding: base.space('15'),

		gap: {
			kicker: base.space('6'),
			lede: base.space('7'),
			cta: base.space('8'),
		},
	},

	navbar: { size: base.space('13') },
	subnav: { size: base.space('10') },
})
