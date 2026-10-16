import { SITE_URL } from '@/utils/constants'

const URL_SCHEME = /^[a-z][a-z0-9+.-]*:/i,
	HTTP_SCHEME = /^https?:/i

export const isExternalLink = (href?: string) => {
	if (!href) return false

	const isInternal = href.startsWith('/') || href.startsWith('#')
	if (isInternal) return false

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

//	a stand-in origin for resolving relative links
//	(`.invalid` is reserved, so it can never be a real site)
const PLACEHOLDER_ORIGIN = 'https://same-page.invalid'

export const isAnchorLink = (
	href?: string,
	pathname?: string | null
) => {
	if (!href || !pathname) return false

	try {
		const url = new URL(href, `${PLACEHOLDER_ORIGIN}${pathname}`)
		return url.origin === PLACEHOLDER_ORIGIN
			&& url.pathname === pathname
			&& !url.search								//	queries link to different content
			&& !!url.hash								//	same page link - e.g. #section
	} catch { return false }
}
