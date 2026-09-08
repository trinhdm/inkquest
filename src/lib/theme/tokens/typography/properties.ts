import { base } from '../../reference'

interface FontFamilyTokens {
	display: string
	heading: string
	body: string
	mono: string
}

interface FontSizeTokens {
	display: string
	heading: {
		h1: string
		h2: string
		h3: string
	}
	body: {
		base: string
		lg: string
	}
	label: {
		base: string
		sm: string
	}
	caption: string
	control: string
}

interface FontWeightTokens {
	normal: string
	semibold: string
	bold: string
}
interface LineHeightTokens {
	none: string
	heading: string
	body: string
	label: string
}

interface LetterSpacingTokens {
	display: string
	heading: string
	stat: string
	meta: string
	prefix: string
	wide: string
}

export interface FontPropertyTokens {
	fontFamily: FontFamilyTokens		// font stack tokens?
	fontSize: FontSizeTokens
	fontWeight: FontWeightTokens
	leading: LineHeightTokens
	tracking: LetterSpacingTokens
}

export const getFontPropertyTokens = (): FontPropertyTokens => ({
	fontFamily: {
		display:	base.fontFamily('black'),
		heading:	base.fontFamily('sans'),
		body:		base.fontFamily('sans'),
		mono:		base.fontFamily('mono'),
	},
	fontSize: {
		display:	base.fontSize('96'),
		heading: {
			h1:		base.fontSize('48'),
			h2:		base.fontSize('40'),
			h3:		base.fontSize('32'),
		},
		body:		{
			base:	base.fontSize('16'),
			lg:		base.fontSize('20'),
		},
		label: {
			base:	base.fontSize('14'),
			sm:		base.fontSize('12'),
		},
		caption:	base.fontSize('12'),
		control:	base.fontSize('10'),
	},
	fontWeight: {
		normal:		base.fontWeight('400'),
		semibold:	base.fontWeight('600'),
		bold:		base.fontWeight('700'),
	},
	leading: {
		none:		base.lineHeight('exact'),
		heading:	base.lineHeight('tight'),
		body:		base.lineHeight('normal'),
		label:		base.lineHeight('snug'),
	},
	tracking: {
		display:	base.letterSpacing('02'),
		heading:	base.letterSpacing('03'),
		stat:		base.letterSpacing('01'),
		meta:		base.letterSpacing('04'),
		prefix:		base.letterSpacing('05'),
		wide:		base.letterSpacing('06'),
	},
})
