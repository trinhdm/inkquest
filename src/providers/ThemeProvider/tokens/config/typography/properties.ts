import { base } from '../../reference'

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
		display:	base.font('black'),
		heading:	base.font('sans'),
		body:		base.font('sans'),
		data:		base.font('mono'),
	},
	fontSize: {
		display:	base.fontSize('96'),
		heading: {
			h1:		base.fontSize('32'),
			h2:		base.fontSize('24'),
			h3:		base.fontSize('20'),
		},
		body:		base.fontSize('16'),
		label: {
			base:	base.fontSize('14'),
			sm:		base.fontSize('12'),
		},
		control:	base.fontSize('10'),
	},
	fontWeight: {
		normal:		base.weight('400'),
		medium:		base.weight('600'),
		bold:		base.weight('700'),
	},
	lineHeight: {
		none:		base.lineHeight('exact'),
		heading:	base.lineHeight('tight'),
		body:		base.lineHeight('normal'),
		label:		base.lineHeight('snug'),
	},
})
