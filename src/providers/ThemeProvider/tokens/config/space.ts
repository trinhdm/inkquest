import { tokn } from '../ref'

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

export const spaceTokens = (): SpaceTokens => ({
	inset: {
		xs: tokn.size('4'),
		sm: tokn.size('8'),
		md: tokn.size('12'),
		lg: tokn.size('16'),
		xl: tokn.size('24'),
		xxl: tokn.size('32'),
	},
	// stack: {},
	// inline: {},
})
