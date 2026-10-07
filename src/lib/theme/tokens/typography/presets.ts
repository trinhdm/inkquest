import { alias, base } from '../../reference'

interface FontProperties {
	fontFamily: string
	fontSize: string
	fontWeight: string
	lineHeight: string
}

interface LayoutFontGroup {
	// body: FontProperties
	eyebrow: FontProperties
}

export interface FontPresetTokens {
	h1: FontProperties
	h2: FontProperties
	h3: FontProperties
	h4: FontProperties
	h5: FontProperties
	body: FontProperties
	section: LayoutFontGroup
	control: FontProperties
	navigation: FontProperties
	numeric: FontProperties
	prose: FontProperties

	label: {
		base: FontProperties
		mono: FontProperties
	}
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

	const labelSharedProps = {
		fontSize: 	alias.fontSize('label'),
		fontWeight: base.fontWeight('600'),
		lineHeight: alias.lineHeight('label'),
	}

	return {
		h1: {
			...displaySharedProps,
			fontSize: 	alias.fontSize('h1'),
		},
		h2: {
			...displaySharedProps,
			fontSize: 	alias.fontSize('h2'),
		},
		h3: {
			...headingSharedProps,
			fontSize: 	alias.fontSize('h3'),
		},
		h4: {
			...headingSharedProps,
			fontSize: 	alias.fontSize('h4'),
			fontWeight: base.fontWeight('700'),
			lineHeight: alias.lineHeight('label'),
		},
		h5: {
			...headingSharedProps,
			fontSize: 	alias.fontSize('h5'),
			lineHeight: alias.lineHeight('label'),
		},
		body: {
			...contentSharedProps,
			fontSize: 	alias.fontSize('body'),
		},
		section: {
			// body: {
			// 	...contentSharedProps,
			// 	fontSize: 	alias.fontSize('body', 'lg'),
			// },
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
			base: {
				...labelSharedProps,
				fontFamily: alias.fontFamily('body'),
			},
			mono: {
				...labelSharedProps,
				fontFamily: alias.fontFamily('mono'),
				fontSize: 	alias.fontSize('label', 'sm'),
			},
		},
		navigation: {
			fontFamily: alias.fontFamily('body'),
			fontSize: 	alias.fontSize('label'),
			fontWeight: base.fontWeight('600'),
			lineHeight: alias.lineHeight('body'),
		},
		control: {
			fontFamily: alias.fontFamily('mono'),
			fontSize: 	alias.fontSize('control'),
			fontWeight: base.fontWeight('700'),
			lineHeight: alias.lineHeight('label'),
		},
		numeric: {
			fontFamily: alias.fontFamily('mono'),
			fontSize: 	alias.fontSize('body'),
			fontWeight: base.fontWeight('400'),
			lineHeight: alias.lineHeight('body'),
		},
		prose: {
			...contentSharedProps,
			fontSize: 	alias.fontSize('body', 'lg'),
		},
	}
}
