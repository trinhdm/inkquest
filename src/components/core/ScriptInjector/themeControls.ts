import { DEFAULT_THEME_NAME, THEME_STORAGE_KEY } from './constants'
import type { ThemeName } from '@/providers/ThemeProvider'

interface ThemeControlsOptions {
	defaultTheme?: ThemeName,
	lsKey?: string,
}

export const themeControls = ({
	defaultTheme = DEFAULT_THEME_NAME,
	lsKey = THEME_STORAGE_KEY,
}: ThemeControlsOptions = {}) => {
	return {
		getInitialTheme: () => {
			if (typeof window === 'undefined') return defaultTheme

			try {
				const lsTheme = localStorage.getItem(lsKey)
				if (lsTheme === 'light' || lsTheme === 'dark') return lsTheme
			} catch {}

			return window.matchMedia(`(prefers-color-scheme: 'dark')`).matches
				? 'dark'
				: defaultTheme
		},
		getStoredTheme: () => {
			if (typeof document === 'undefined') return defaultTheme
			const data = document.documentElement.getAttribute(`data-${lsKey}`)
			return data === 'light' || data === 'dark' ? data : defaultTheme
		},
		applyTheme: (theme: ThemeName) =>
			void document.documentElement.setAttribute(`data-${lsKey}`, theme),
		persistTheme: (theme: ThemeName) => {
			try {
				localStorage.setItem(lsKey, theme)
			} catch {}
		},
	}
}
