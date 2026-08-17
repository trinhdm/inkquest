import { base } from '../../reference'

export interface SpaceTokens {
	inset: {
		xs: string
		sm: string
		md: string
		lg: string
		xl: string
		xxl: string
	}
}

export const getSpaceTokens = (): SpaceTokens => ({
	inset: {
		xs: base.size('4'),
		sm: base.size('8'),
		md: base.size('12'),
		lg: base.size('16'),
		xl: base.size('24'),
		xxl: base.size('32'),
	},
	// stack: {},
	// inline: {},
})
