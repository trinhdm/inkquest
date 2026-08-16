import { alias } from '../../reference'
import type { FontPropertyTokens } from './properties'

interface FontProperties
	extends Record<keyof FontPropertyTokens, string> {}

export interface FontPresetTokens {
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

export const getFontPresetTokens = (): FontPresetTokens => {
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
