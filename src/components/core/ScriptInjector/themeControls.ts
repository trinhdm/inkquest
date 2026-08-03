import { DEFAULT_THEME_NAME, THEME_STORAGE_KEY } from './constants'
import type { ThemeName } from '@/providers/ThemeProvider'

export const getStoredTheme = (): ThemeName => {
	if (typeof window === 'undefined') return DEFAULT_THEME_NAME

	try {
		const lsTheme = localStorage.getItem(THEME_STORAGE_KEY)
		if (lsTheme === 'light' || lsTheme === 'dark') return lsTheme
	} catch {}

	return window.matchMedia(`(prefers-color-scheme: 'dark')`).matches
		? 'dark'
		: DEFAULT_THEME_NAME
}

export const applyTheme = (theme: ThemeName) => {
	document.documentElement.setAttribute(`data-${THEME_STORAGE_KEY}`, theme)
}

export const persistTheme = (theme: ThemeName) => {
	try {
		localStorage.setItem(THEME_STORAGE_KEY, theme)
	} catch {}
}

interface ThemeScriptOptions {
	lsKey?: string,
	override?: ThemeName,
	theme?: ThemeName,
}

export const buildScript = ({
	lsKey = THEME_STORAGE_KEY,
	override,
	theme = DEFAULT_THEME_NAME,
}: ThemeScriptOptions) => {
	if (!lsKey) return ''
	if (override)
		return `document.documentElement.setAttribute("data-${lsKey}", "${override}");`

	const altTheme = theme === 'dark' ? 'light' : 'dark'
	const script = `;(function() {
		try {
			const lsTheme = localStorage.getItem("${lsKey}");
			let initTheme = lsTheme
			if (lsTheme !== "${theme}" && lsTheme !== "${altTheme}")
				initTheme = window.matchMedia("(prefers-color-theme: dark)").matches ? "dark" : "${theme}";
			document.documentElement.setAttribute("data-${lsKey}", initTheme);
		} catch(e) {}
	})()`

	return script
}

