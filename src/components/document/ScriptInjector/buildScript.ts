import { configDocument, type DocumentConfig } from '../utils'
import type { ColorScheme } from '@/lib/theme'

interface BuildScriptArgs
	extends DocumentConfig {
	override?: ColorScheme
}

export const buildScript = (args: BuildScriptArgs) => {
	const {
		keys: { localStore: lsKey },
		override,
		scheme,
	} = configDocument(args)

	const lsDataKey = `data-${lsKey}`

	if (!lsKey)
		return ''
	else if (override)
		return `document.documentElement.setAttribute("${lsDataKey}", "${override}");`

	const altScheme = scheme === 'dark' ? 'light' : 'dark',
		lsScheme = 'lsScheme'

	const script = `;(function() {
		try {
			const ${lsScheme} = localStorage.getItem("${lsKey}");
			let initScheme = ${lsScheme}
			if (${lsScheme} !== "${scheme}" && ${lsScheme} !== "${altScheme}")
				initScheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "${scheme}";
			document.documentElement.setAttribute("${lsDataKey}", initScheme);
		} catch(e) {}
	})()`

	return script
}
