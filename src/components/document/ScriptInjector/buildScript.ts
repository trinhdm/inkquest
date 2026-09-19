import { configDocument, type DocumentConfig } from '../utils'
import type { ColorScheme } from '@/lib/theme'

interface BuildScriptArgs
	extends DocumentConfig {
	override?: ColorScheme
}

export const buildScript = (args: BuildScriptArgs) => {
	const {
		keys: {
			jsAnimate: jsaKey,
			localStore: lsKey,
		},
		override,
		scheme,
	} = configDocument(args)

	const jsaDataKey = `data-${jsaKey}`,
		lsDataKey = `data-${lsKey}`

	if (!lsKey) {
		return ''
	} else if (override) {
		return `document.documentElement.setAttribute("${lsDataKey}", "${override}");
		document.documentElement.setAttribute("${jsaDataKey}", "");`
	}

	const altScheme = scheme === 'dark' ? 'light' : 'dark',
		lsScheme = 'lsScheme'

	const script = `;(function() {
		try {
			const ${lsScheme} = localStorage.getItem("${lsKey}");
			let initScheme = ${lsScheme}
			if (${lsScheme} !== "${scheme}" && ${lsScheme} !== "${altScheme}")
				initScheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "${scheme}";
			document.documentElement.setAttribute("${lsDataKey}", initScheme);
			document.documentElement.setAttribute("${jsaDataKey}", "");
		} catch(e) {}
	})()`

	return script
}
