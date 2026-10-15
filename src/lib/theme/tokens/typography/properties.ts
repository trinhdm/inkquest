import { alias, base } from '../../reference'
import type { TokenSizeShape } from '../../types/token.types'

interface FontFamilyTokens {
	display: string
	heading: string
	body: string
	mono: string
}

interface HeadingFontGroup {
	base: string
	fluid: string
}
interface FontSizeTokens {
	h1: HeadingFontGroup
	h2: HeadingFontGroup
	h3: HeadingFontGroup
	h4: HeadingFontGroup
	h5: HeadingFontGroup
	h6: HeadingFontGroup

	display: TokenSizeShape

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
	prose: string
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
		h1:	{
			base:	base.fontSize('48'),
			fluid:	`clamp(${alias.fontSize('h1')}, 4vw, ${alias.fontSize('display', 'lg')})`,
		},
		h2:	{
			base:	base.fontSize('40'),
			fluid: 	`clamp(${alias.fontSize('h2')}, 3vw, ${alias.fontSize('h1')})`,
		},
		h3:	{
			base:	base.fontSize('32'),
			fluid: 	`clamp(${alias.fontSize('h3')}, 3vw, ${alias.fontSize('h2')})`,
		},
		h4:	{
			base:	base.fontSize('24'),
			fluid: 	`clamp(${alias.fontSize('h4')}, 3vw, ${alias.fontSize('h3')})`,
		},
		h5:	{
			base:	base.fontSize('20'),
			fluid: 	`clamp(${alias.fontSize('h5')}, 3vw, ${alias.fontSize('h4')})`,
		},
		h6:	{
			base:	base.fontSize('16'),
			fluid: 	`clamp(${alias.fontSize('h6')}, 3vw, ${alias.fontSize('h5')})`,
		},
		display:	{
			sm:		base.fontSize('60'),
			md:		base.fontSize('72'),
			lg:		base.fontSize('96'),
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
		prose:		base.lineHeight('loose'),
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
