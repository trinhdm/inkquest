import { alias, tokn } from '../ref'

export interface TypographyTokens {
	family: { display: string; title: string; body: string }
	weight: { normal: string; bold: string; bolder: string }
	display: { fontFamily: string; fontSize: string; fontWeight: string; lineHeight: string }
	title: { fontFamily: string; fontSize: string; fontWeight: string; lineHeight: string }
	body: { fontFamily: string; fontSize: string; fontWeight: string; lineHeight: string }
}


export const typographyTokens = (): TypographyTokens => {
	const fontProperties = {
		family: {
			display: tokn.font('black'),
			title: tokn.font('sans'),
			body: tokn.font('sans'),
			label: tokn.font('mono'),
		},
		size: {
			title: {
				h1: tokn.fontSize('32'),
				h2: tokn.fontSize('24'),
				h3: tokn.fontSize('20'),
			},
			body: tokn.fontSize('16'),
			label: {
				base: tokn.fontSize('14'),
				sm: tokn.fontSize('12'),
			},
		},
		weight: {
			normal: tokn.weight('400'),
			bold: tokn.weight('600'),
			bolder: tokn.weight('700'),
		},
	}

	return {
		...fontProperties,
		display: {
			fontFamily: alias.font.family('display'),
			fontSize: tokn.fontSize('96'),
			fontWeight: alias.font.weight('bolder'),
			lineHeight: tokn.lineHeight('lg'),
		},
		title: {
			fontFamily: alias.font.family('body'),
			fontSize: tokn.fontSize('24'),
			fontWeight: alias.font.weight('bold'),
			lineHeight: tokn.lineHeight('lg'),
		},
		body: {
			fontFamily: alias.font.family('body'),
			fontSize: tokn.fontSize('16'),
			fontWeight: alias.font.weight('normal'),
			lineHeight: tokn.lineHeight('sm'),
		},
		// 	caption: {},
		// 	label: {},
	}
}
