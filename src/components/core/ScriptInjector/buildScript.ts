import { DEFAULT_THEME_NAME, THEME_STORAGE_KEY } from './constants'
import type { ThemeName } from '@/lib/theme'

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
				initTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "${theme}";
			document.documentElement.setAttribute("data-${lsKey}", initTheme);
		} catch(e) {}
	})()`

	return script
}
