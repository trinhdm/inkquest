import type { ThemeName } from '@/providers/ThemeProvider'

const DEFAULT_THEME_NAME: ThemeName = 'dark'
const THEME_STORAGE_KEY = 'theme'

// const prefersScheme = (scheme: ThemeName) =>
// 	typeof window !== 'undefined' &&
// 	window.matchMedia(`(prefers-color-scheme: ${scheme})`).matches

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

	const scheme = override ?? theme,
		altScheme = scheme === 'dark' ? 'light' : 'dark'

	const script = `;(function() {
		try {
			const lsTheme = localStorage.getItem("${lsKey}");
			let computed = lsTheme
			if (lsTheme !== "${altScheme}" || lsTheme !== "${scheme}")
				window.matchMedia("(prefers-color-scheme: ${scheme})").matches ? "${scheme}" : "${DEFAULT_THEME_NAME}";
			document.documentElement.setAttribute("data-${lsKey}", computed);
		} catch(e) {}
	})()`

	return script
}

