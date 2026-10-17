import { alias, base } from '../../reference'

interface FontProperties {
	fontFamily: string
	fontSize: string
	fontWeight: string
	lineHeight: string
}

export interface FontPresetTokens {
	h1: FontProperties
	h2: FontProperties
	h3: FontProperties
	h4: FontProperties
	h5: FontProperties
	h6: FontProperties

	body: {
		base: FontProperties
		sm: FontProperties
	}

	eyebrow: FontProperties
	control: FontProperties
	navigation: FontProperties
	numeric: FontProperties
	prose: FontProperties

	error: FontProperties
	label: {
		base: FontProperties
		mono: FontProperties
	}
	caption: {
		base: FontProperties
		image: FontProperties
	}

	title?: FontProperties
	subtitle?: FontProperties
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

	const textSharedProps = {
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
		h6: {
			...headingSharedProps,
			fontSize: 	alias.fontSize('h6'),
			lineHeight: alias.lineHeight('body'),
		},
		body: {
			base: {
				...textSharedProps,
				fontSize: 	alias.fontSize('body'),
			},
			sm: {
				...textSharedProps,
				fontSize: 	alias.fontSize('caption'),
			},
		},
		eyebrow: {
			...captionSharedProps,
			fontSize: 	alias.fontSize('caption'),
		},
		caption: {
			base: {
				...captionSharedProps,
				fontSize: 	alias.fontSize('control'),
			},
			image: {
				fontFamily: alias.fontFamily('body'),
				fontSize: 	base.fontSize('10'),
				fontWeight: base.fontWeight('600'),
				lineHeight: alias.lineHeight('label'),
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
		error: {
			fontFamily: alias.fontFamily('body'),
			fontSize: 	alias.fontSize('caption'),
			fontWeight: base.fontWeight('400'),
			lineHeight: alias.lineHeight('exact'),
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
			...textSharedProps,
			fontSize: 	alias.fontSize('body', 'lg'),
		},
	}
}
