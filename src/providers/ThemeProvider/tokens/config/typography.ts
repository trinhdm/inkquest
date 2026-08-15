import { alias, tokn } from '../ref'

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

interface FontPropertyTokens {
	fontFamily: FontFamilyTokens
	fontSize: FontSizeTokens
	fontWeight: FontWeightTokens
	lineHeight: LineHeightTokens
}

const fontPropertyTokens = (): FontPropertyTokens => ({
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

interface FontProperties
	extends Record<keyof FontPropertyTokens, string> {}

interface FontPresetTokens {
	hero: FontProperties
	h1: FontProperties
	h2: FontProperties
	h3: FontProperties
	body: FontProperties
	label: FontProperties
	control: FontProperties

	title?: FontProperties
	subtitle?: FontProperties
	eyebrow?: FontProperties
	overline?: FontProperties
	caption?: FontProperties
	alert?: FontProperties
	data?: FontProperties
	meta?: FontProperties
	navigation?: FontProperties
}

const fontPresetTokens = (): FontPresetTokens => {
	const displaySharedProps = {
		fontFamily: alias.fontFamily('display'),
		fontWeight: alias.fontWeight('bold'),
		lineHeight: alias.lineHeight('heading'),
	}

	const headingSharedProps = {
		fontFamily: alias.fontFamily('heading'),
		fontWeight: alias.fontWeight('medium'),
		lineHeight: alias.lineHeight('heading'),
	}

	return {
		hero: {
			...displaySharedProps,
			fontSize: 	alias.fontSize('display'),
		},
		h1: {
			...headingSharedProps,
			fontSize: 	alias.fontSize('heading', 'h1'),
		},
		h2: {
			...headingSharedProps,
			fontSize: 	alias.fontSize('heading', 'h2'),
		},
		h3: {
			...headingSharedProps,
			fontSize: 	alias.fontSize('heading', 'h3'),
		},
		body: {
			fontFamily: alias.fontFamily('body'),
			fontSize: 	alias.fontSize('body'),
			fontWeight: alias.fontWeight('normal'),
			lineHeight: alias.lineHeight('body'),
		},
		label: {
			fontFamily: alias.fontFamily('body'),
			fontSize: 	alias.fontSize('label'),
			fontWeight: alias.fontWeight('bold'),
			lineHeight: alias.lineHeight('label'),
		},
		control: {
			fontFamily: alias.fontFamily('data'),
			fontSize: 	alias.fontSize('control'),
			fontWeight: alias.fontWeight('bold'),
			lineHeight: alias.lineHeight('label'),
		},
	}
}

export interface TypographyTokens
	extends FontPropertyTokens, FontPresetTokens {}

export const typographyTokens = (): TypographyTokens => {
	const fontProperties = fontPropertyTokens(),
		fontPresets = fontPresetTokens()

	return { ...fontProperties, ...fontPresets }
}
