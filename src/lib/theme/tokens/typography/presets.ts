import { alias, base } from '../../reference'

interface FontProperties {
	fontFamily: string
	fontSize: string
	fontWeight: string
	lineHeight: string
}

interface FluidFontGroup {
	base: FontProperties
	fluid: FontProperties
}

interface LayoutFontGroup {
	body: FontProperties
	eyebrow: FontProperties
}

export interface FontPresetTokens {
	h1: FluidFontGroup
	h2: FluidFontGroup
	h3: FontProperties
	body: FontProperties
	section: LayoutFontGroup
	label: FontProperties
	control: FontProperties
	navigation: FontProperties

	title?: FontProperties
	subtitle?: FontProperties
	eyebrow?: FontProperties
	overline?: FontProperties
	caption?: FontProperties
	alert?: FontProperties
	data?: FontProperties
	meta?: FontProperties
}

export const getFontPresetTokens = (): FontPresetTokens => {
	const displaySharedProps = {
		fontFamily: alias.fontFamily('display'),
		fontWeight: base.fontWeight('700'),
		lineHeight: alias.lineHeight('heading'),
	}

	const headingSharedProps = {
		fontFamily: alias.fontFamily('heading'),
		fontWeight: base.fontWeight('600'),
		lineHeight: alias.lineHeight('heading'),
	}

	const contentSharedProps = {
		fontFamily: alias.fontFamily('body'),
		fontWeight: base.fontWeight('400'),
		lineHeight: alias.lineHeight('body'),
	}

	return {
		h1: {
			base: {
				...headingSharedProps,
				fontSize: 	alias.fontSize('heading', 'h1'),
			},
			fluid: {
				...displaySharedProps,
				fontSize: 	`clamp(${alias.fontSize('heading', 'h1')}, 5vw, ${alias.fontSize('display')})`,
			},
		},
		h2: {
			base: {
				...headingSharedProps,
				fontSize: 	alias.fontSize('heading', 'h2'),
			},
			fluid: {
				...displaySharedProps,
				fontSize: 	`clamp(${alias.fontSize('heading', 'h2')}, 2.5vw, ${alias.fontSize('heading', 'h1')})`,
			},
		},
		h3: {
			...headingSharedProps,
			fontSize: 	alias.fontSize('heading', 'h3'),
		},
		body: {
			...contentSharedProps,
			fontSize: 	alias.fontSize('body'),
		},
		section: {
			body: {
				...contentSharedProps,
				fontSize: 	alias.fontSize('body', 'lg'),
			},
			eyebrow: {
				fontFamily: alias.fontFamily('mono'),
				fontSize: 	alias.fontSize('caption'),
				fontWeight: base.fontWeight('400'),
				lineHeight: alias.lineHeight('label'),
			},
		},
		label: {
			fontFamily: alias.fontFamily('body'),
			fontSize: 	base.fontSize('14'),
			fontWeight: base.fontWeight('600'),
			lineHeight: alias.lineHeight('label'),
		},
		navigation: {
			fontFamily: alias.fontFamily('body'),
			fontSize: 	base.fontSize('14'),
			fontWeight: base.fontWeight('600'),
			lineHeight: alias.lineHeight('body'),
		},
		control: {
			fontFamily: alias.fontFamily('mono'),
			fontSize: 	alias.fontSize('control'),
			fontWeight: base.fontWeight('700'),
			lineHeight: alias.lineHeight('label'),
		},
	}
}
