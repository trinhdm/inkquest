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

	const jsaScript = `document.documentElement.setAttribute("data-${jsaKey}", "");`,
		lsDataKey = `data-${lsKey}`

	if (!lsKey) {
		return ''
	} else if (override) {
		return `document.documentElement.setAttribute("${lsDataKey}", "${override}"); ${jsaScript}`
	}

	const schemes = {
		alt: scheme === 'dark' ? 'light' : 'dark',
		init: 'initScheme',
		stored: 'lsScheme',
	}

	const script = `;(function() {
		${jsaScript}
		try {
			const ${schemes.stored} = localStorage.getItem("${lsKey}");
			let ${schemes.init} = ${schemes.stored}
			if (${schemes.stored} !== "${scheme}" && ${schemes.stored} !== "${schemes.alt}")
				${schemes.init} = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
			document.documentElement.setAttribute("${lsDataKey}", ${schemes.init});
		} catch(e) {}
	})()`

	return script
}
