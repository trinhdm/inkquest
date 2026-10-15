import { SITE_URL } from '@/utils/constants'

export const hasValue = <V,>(
	value: V
): boolean => {
	if (value === null || value === undefined)
		return false
	if (typeof value === 'string')
		return value.trim().length > 0
	if (Array.isArray(value))
		return value.length > 0
	if (value instanceof Map || value instanceof Set)
		return value.size > 0
	if (typeof value === 'object')
		return value?.constructor === Object && Object.keys(value).length > 0
	return true
}

const URL_SCHEME = /^[a-z][a-z0-9+.-]*:/i,
	HTTP_SCHEME = /^https?:/i

export const isExternalLink = (href?: string) => {
	if (!href) return false

	const isHttp = HTTP_SCHEME.test(href),
		isUrlScheme = URL_SCHEME.test(href),
		sameProtocol = href.startsWith('//')

	if (!isUrlScheme && !sameProtocol) return false		//	same-origin relative paths, hashes, etc.
	if (isUrlScheme && !isHttp) return false			//	external schemes - e.g. mailto:, tel:
	if (!SITE_URL) return true							//	fallback

	try {
		const url = new URL(href, SITE_URL).hostname
		return url !== new URL(SITE_URL).hostname
	} catch { return true }
}
