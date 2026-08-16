import { tokn } from '../../ref'

interface FontFamilyTokens {
	display: string
	heading: string
	body: string
	data: string
}

interface FontSizeTokens {
	display: string
	heading: {
		h1: string
		h2: string
		h3: string
	}
	body: string
	label: {
		base: string
		sm: string
	}
	control: string
}

interface FontWeightTokens {
	normal: string
	medium: string
	bold: string
}
interface LineHeightTokens {
	none: string
	heading: string
	body: string
	label: string
}

export interface FontPropertyTokens {
	fontFamily: FontFamilyTokens
	fontSize: FontSizeTokens
	fontWeight: FontWeightTokens
	lineHeight: LineHeightTokens
}

export const getFontPropertyTokens = (): FontPropertyTokens => ({
	fontFamily: {
		display:	tokn.font('black'),
		heading:	tokn.font('sans'),
		body:		tokn.font('sans'),
		data:		tokn.font('mono'),
	},
	fontSize: {
		display:	tokn.fontSize('96'),
		heading: {
			h1:		tokn.fontSize('32'),
			h2:		tokn.fontSize('24'),
			h3:		tokn.fontSize('20'),
		},
		body:		tokn.fontSize('16'),
		label: {
			base:	tokn.fontSize('14'),
			sm:		tokn.fontSize('12'),
		},
		control:	tokn.fontSize('10'),
	},
	fontWeight: {
		normal:		tokn.weight('400'),
		medium:		tokn.weight('600'),
		bold:		tokn.weight('700'),
	},
	lineHeight: {
		none:		tokn.lineHeight('exact'),
		heading:	tokn.lineHeight('tight'),
		body:		tokn.lineHeight('normal'),
		label:		tokn.lineHeight('snug'),
	},
})
