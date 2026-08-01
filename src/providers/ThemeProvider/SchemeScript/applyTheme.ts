import { DEFAULT_THEME_NAME } from '../constants'
import type { ThemeName } from '../theme.types'

export const THEME_STORAGE_KEY = 'theme'
const PREFERS_SCHEME = 'dark'
const ALT_SCHEME = PREFERS_SCHEME === 'dark' ? 'dark' : 'light'
const THEME_ATTR = 'data-theme'

const prefersScheme = (scheme: ThemeName) =>
	typeof window !== 'undefined' &&
	window.matchMedia(`(prefers-color-scheme: ${scheme})`).matches

export const getStoredTheme = (): ThemeName => {
	if (typeof window === 'undefined') return DEFAULT_THEME_NAME

	try {
		const stored = localStorage.getItem(THEME_STORAGE_KEY)
		if (stored === 'light' || stored === 'dark') return stored
	} catch {}

	return prefersScheme(PREFERS_SCHEME) ? PREFERS_SCHEME : DEFAULT_THEME_NAME
}

export const applyTheme = (theme: ThemeName) => {
	document.documentElement.setAttribute(THEME_ATTR, theme)
}

export const persistTheme = (theme: ThemeName) => {
	try {
		localStorage.setItem(THEME_STORAGE_KEY, theme)
	} catch {}
}

export const themeInitScript = `(function(){try{
var k="${THEME_STORAGE_KEY}",t=localStorage.getItem(k);
if(t!=="${ALT_SCHEME}"&&t!=="${PREFERS_SCHEME}"){
t=window.matchMedia("(prefers-color-scheme: ${PREFERS_SCHEME})").matches?"${PREFERS_SCHEME}":"${DEFAULT_THEME_NAME}"}
document.documentElement.setAttribute("${THEME_ATTR}",t)
}catch(e){}})()`

//  `try {
//   var _colorScheme = window.localStorage.getItem("${localStorageKey}");
//   var colorScheme = _colorScheme === "light" || _colorScheme === "dark" || _colorScheme === "auto" ? _colorScheme : "${defaultColorScheme}";
//   var computedColorScheme = colorScheme !== "auto" ? colorScheme : window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
//   document.documentElement.setAttribute("data-mantine-color-scheme", computedColorScheme);
// } catch (e) {}
// `;
