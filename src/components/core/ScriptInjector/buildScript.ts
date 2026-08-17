import { DEFAULT_COLOR_SCHEME, SCHEME_STORAGE_KEY } from './constants'
import type { ColorScheme } from '@/lib/theme'

interface BuildScriptArgs {
	lsKey?: string
	override?: ColorScheme
	scheme?: ColorScheme
}

export const buildScript = ({
	lsKey = SCHEME_STORAGE_KEY,
	override,
	scheme = DEFAULT_COLOR_SCHEME,
}: BuildScriptArgs) => {
	if (!lsKey) return ''
	if (override)
		return `document.documentElement.setAttribute("data-${lsKey}", "${override}");`

	const altScheme = scheme === 'dark' ? 'light' : 'dark'
	const script = `;(function() {
		try {
			const lsScheme = localStorage.getItem("${lsKey}");
			let initScheme = lsScheme
			if (lsScheme !== "${scheme}" && lsScheme !== "${altScheme}")
				initScheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "${scheme}";
			document.documentElement.setAttribute("data-${lsKey}", initScheme);
		} catch(e) {}
	})()`

	return script
}
