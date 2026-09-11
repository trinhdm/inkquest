import { buildVariantSchemes } from '@/lib/theme/buildVariantSchemes'
import { resolveStyles } from './resolver'
import { serializeStyles } from './serializer'
import type { SiteTheme } from '@/lib/theme'

// Keyed by theme object identity — DEFAULT_THEME is a module constant, so
// this hits on every render without hashing the resolved token tree.
// If an `override` theme is ever wired through StyleInliner, extend this
// key (and the WeakMap value shape) to include it — see StyleInliner.tsx.
const schemeCache = new WeakMap<SiteTheme, Map<string, string>>()

export const getSchemeCSS = (theme: SiteTheme, prefix?: string) => {
	let byPrefix = schemeCache.get(theme)
	if (!byPrefix) schemeCache.set(theme, byPrefix = new Map())

	const key = prefix ?? ''
	let css = byPrefix.get(key)
	if (css === undefined)
		byPrefix.set(key, css = serializeStyles(resolveStyles({ current: theme, prefix })))

	return css
}

// No object identity to key variants on — buildVariantSchemes takes plain
// strings, so the cache key is just the argument tuple.
const variantCache = new Map<string, string>()

export const getVariantCSS = (names?: string[], prefix?: string) => {
	const key = `${ prefix ?? '' }::${ names?.join('|') ?? '' }`

	let css = variantCache.get(key)
	if (css === undefined) {
		const tokens = names?.length
			? names.flatMap(name => buildVariantSchemes(name, prefix))
			: buildVariantSchemes('', prefix)

		variantCache.set(key, css = serializeStyles(tokens))
	}

	return css
}
