import { base } from '../../reference'

export interface SpaceTokens {
	inset: {
		min: string
		xxs: string
		xs: string
		sm: string
		md: string
		lg: string
		xl: string
		xxl: string
		max: string
	}
}

export const getSpaceTokens = (): SpaceTokens => ({
	inset: {
		min: base.size('4'),
		xxs: base.size('8'),
		xs: base.size('12'),
		sm: base.size('16'),
		md: base.size('24'),
		lg: base.size('32'),
		xl: base.size('36'),
		xxl: base.size('40'),
		max: base.size('44'),
	},
	// stack: {},
	// inline: {},

	// gutter: {}
})
