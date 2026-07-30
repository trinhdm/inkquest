import { getPalette } from './getPalette';
import type { SiteTheme } from './theme.types';

export const DEFAULT_THEME: SiteTheme = {
	// colors: string[]
	// font: FontProperties

	// headings: {
	// 	size:
	// },

	breakpoints: {
		xs: '36rem',
		sm: '48rem',
		md: '60rem',
		lg: '72rem',
		xl: '80rem',
	},

	getPalette,
}
