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
	h3: FluidFontGroup
	h4: FluidFontGroup
	body: FontProperties
	section: LayoutFontGroup
	label: FontProperties
	control: FontProperties
	navigation: FontProperties
	prose: FontProperties

	caption: {
		base: FontProperties
		image: FontProperties
		item: FontProperties
	}

	title?: FontProperties
	subtitle?: FontProperties
	eyebrow?: FontProperties
	overline?: FontProperties
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

	const captionSharedProps = {
		fontFamily: alias.fontFamily('mono'),
		fontWeight: base.fontWeight('400'),
		lineHeight: alias.lineHeight('label'),
	}

	return {
		h1: {
			base: {
				...headingSharedProps,
				fontSize: 	alias.fontSize('heading', 'h1'),
			},
			fluid: {
				...displaySharedProps,
				fontSize: 	`clamp(${alias.fontSize('heading', 'h1')}, 4vw, ${alias.fontSize('display')})`,
			},
		},
		h2: {
			base: {
				...headingSharedProps,
				fontSize: 	alias.fontSize('heading', 'h2'),
			},
			fluid: {
				...displaySharedProps,
				fontSize: 	`clamp(${alias.fontSize('heading', 'h2')}, 3vw, ${alias.fontSize('heading', 'h1')})`,
			},
		},
		h3: {
			base: {
				...headingSharedProps,
				fontSize: 	alias.fontSize('heading', 'h3'),
			},
			fluid: {
				...displaySharedProps,
				fontSize: 	`clamp(${alias.fontSize('heading', 'h3')}, 3vw, ${alias.fontSize('heading', 'h2')})`,
			},
		},
		h4: {
			base: {
				...headingSharedProps,
				fontSize: 	alias.fontSize('heading', 'h4'),
				fontWeight: base.fontWeight('700'),
				lineHeight: alias.lineHeight('label'),
			},
			fluid: {
				...displaySharedProps,
				fontSize: 	`clamp(${alias.fontSize('heading', 'h4')}, 3vw, ${alias.fontSize('heading', 'h3')})`,
				fontWeight: base.fontWeight('700'),
				lineHeight: alias.lineHeight('label'),
			},
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
		caption: {
			base: {
				...captionSharedProps,
				fontSize: 	alias.fontSize('caption'),
			},
			image: {
				fontFamily: alias.fontFamily('body'),
				fontSize: 	base.fontSize('10'),
				fontWeight: base.fontWeight('600'),
				lineHeight: alias.lineHeight('label'),
			},
			item: {
				...captionSharedProps,
				fontSize: 	alias.fontSize('control'),
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
		prose: {
			fontFamily: alias.fontFamily('mono'),
			fontSize: 	alias.fontSize('body'),
			fontWeight: base.fontWeight('400'),
			lineHeight: alias.lineHeight('body'),
		},
	}
}
