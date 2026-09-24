import { configDocument, type DocumentConfig } from '../utils'
import type { ColorScheme } from '@/lib/theme'

export const schemeControls = (args: DocumentConfig = {}) => {
	const {
		keys: { localStore: lsKey },
		scheme: defaultScheme,
	} = configDocument(args)

	return {
		getInitialScheme: () => {
			if (typeof window === 'undefined') return defaultScheme

			try {
				const lsScheme = localStorage.getItem(lsKey)
				if (lsScheme === 'light' || lsScheme === 'dark') return lsScheme
			} catch {}

			return window.matchMedia('(prefers-color-scheme: dark)').matches
				? 'dark'
				: defaultScheme
		},
		getStoredScheme: () => {
			if (typeof document === 'undefined') return defaultScheme
			const data = document.documentElement.getAttribute(`data-${lsKey}`)
			return data === 'light' || data === 'dark' ? data : defaultScheme
		},
		applyScheme: (scheme: ColorScheme) =>
			void document.documentElement.setAttribute(`data-${lsKey}`, scheme),
		persistScheme: (scheme: ColorScheme) => {
			try {
				localStorage.setItem(lsKey, scheme)
			} catch {}
		},
	}
}
