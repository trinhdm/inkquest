import { base } from '../../reference'

export interface TrackingTokens {
	display: string
	heading: string
	stat: string
	meta: string
	prefix: string
	eyebrow: string
}

export const getTrackingTokens = (): TrackingTokens => ({
	display:	base.tracking('xs'),
	heading:	base.tracking('sm'),
	stat:		base.tracking('md'),
	meta:		base.tracking('lg'),
	prefix:		base.tracking('xl'),
	eyebrow:	base.tracking('xxl'),
})

// export interface LetterSpacingTokens {
// 	display: string
// 	heading: string
// 	prefix: string
// 	meta: string
// 	stat: string
// 	eyebrow: string
// }

// export const getLetterSpacingTokens = (): LetterSpacingTokens => ({
// 	display:	base.tracking('xs'),
// 	heading:	base.tracking('sm'),
// 	prefix:		base.tracking('md'),
// 	meta:		base.tracking('lg'),
// 	stat:		base.tracking('xl'),
// 	eyebrow:	base.tracking('xxl'),
// })
