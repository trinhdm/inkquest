import { DEFAULT_COLOR_SCHEME, SCHEME_STORAGE_KEY } from './constants'
import type { ColorScheme } from '@/lib/theme'

interface SchemeControlsOptions {
	defaultScheme?: ColorScheme
	lsKey?: string
}

export const schemeControls = ({
	defaultScheme = DEFAULT_COLOR_SCHEME,
	lsKey = SCHEME_STORAGE_KEY,
}: SchemeControlsOptions = {}) => {
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
