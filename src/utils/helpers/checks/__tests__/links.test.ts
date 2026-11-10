import { isAnchorLink, isExternalLink } from '../links'

let mockSiteUrl = 'https://inkquest.com'

//	a getter, so each test can set the origin `links.ts` reads at call time
jest.mock('@/utils/constants', () => ({
	get SITE_URL() { return mockSiteUrl },
}))

describe('isExternalLink', () => {
	beforeEach(() => { mockSiteUrl = 'https://inkquest.com' })

	it.each([undefined, ''])('treats %p as not external', href => {
		expect(isExternalLink(href)).toBe(false)
	})

	it.each(['/path', '/path?x=1#y', '#section', '#'])('treats the internal link %p as not external', href => {
		expect(isExternalLink(href)).toBe(false)
	})

	it.each(['relative/page', 'page.html', '../up', '?q=1'])('treats the relative link %p as not external', href => {
		expect(isExternalLink(href)).toBe(false)
	})

	it.each(['mailto:hi@inkquest.com', 'tel:+15551234567', 'sms:123', 'javascript:void(0)'])(
		'treats the non-http scheme in %p as not external',
		href => { expect(isExternalLink(href)).toBe(false) },
	)

	it('treats an absolute link on the site host as not external', () => {
		expect(isExternalLink('https://inkquest.com/about')).toBe(false)
		expect(isExternalLink('http://inkquest.com')).toBe(false)
	})

	it('treats an absolute link on another host as external', () => {
		expect(isExternalLink('https://example.com/about')).toBe(true)
	})

	it('treats a subdomain as a different host', () => {
		expect(isExternalLink('https://blog.inkquest.com')).toBe(true)
	})

	it('ignores scheme case', () => {
		expect(isExternalLink('HTTPS://example.com')).toBe(true)
		expect(isExternalLink('MAILTO:a@b.co')).toBe(false)
	})

	it('compares the host only, not the port', () => {
		expect(isExternalLink('https://inkquest.com:8443/x')).toBe(false)
	})

	describe('protocol-relative links (//host)', () => {
		it('treats a //link to another host as external', () => {
			expect(isExternalLink('//other.com/x')).toBe(true)
		})

		it('treats a //link to the site host as not external', () => {
			expect(isExternalLink('//inkquest.com/about')).toBe(false)
		})

		it('compares the host only, not the port, the same way as an absolute link', () => {
			expect(isExternalLink('//inkquest.com:8443/x')).toBe(false)
			expect(isExternalLink('//inkquest.com:8443/x')).toBe(isExternalLink('https://inkquest.com:8443/x'))
		})
	})

	describe('without a SITE_URL', () => {
		beforeEach(() => { mockSiteUrl = '' })

		it('falls back to external for any http link', () => {
			expect(isExternalLink('https://inkquest.com')).toBe(true)
			expect(isExternalLink('https://example.com')).toBe(true)
		})

		it('falls back to external for a //link too', () => {
			expect(isExternalLink('//other.com/x')).toBe(true)
		})

		it('still keeps internal and non-http links internal', () => {
			expect(isExternalLink('/path')).toBe(false)
			expect(isExternalLink('#hash')).toBe(false)
			expect(isExternalLink('mailto:a@b.co')).toBe(false)
		})
	})

	describe('with an unparseable URL', () => {
		it('treats an invalid http link as external', () => {
			expect(isExternalLink('http://')).toBe(true)
		})

		it('treats every http link as external when SITE_URL itself is invalid', () => {
			mockSiteUrl = 'not a url'
			expect(isExternalLink('https://inkquest.com')).toBe(true)
		})
	})
})

describe('isAnchorLink', () => {
	it('is true for a hash on the same page', () => {
		expect(isAnchorLink('#section', '/faqs')).toBe(true)
	})

	it('is true for a path-plus-hash that points at the current page', () => {
		expect(isAnchorLink('/faqs#section', '/faqs')).toBe(true)
	})

	it('is false for a hash on a different page', () => {
		expect(isAnchorLink('/about#section', '/faqs')).toBe(false)
	})

	it('is false when the link has a query string, since it points to different content', () => {
		expect(isAnchorLink('/faqs?tab=2#section', '/faqs')).toBe(false)
		expect(isAnchorLink('?tab=2#section', '/faqs')).toBe(false)
	})

	it('is false for the same page without a hash', () => {
		expect(isAnchorLink('/faqs', '/faqs')).toBe(false)
	})

	it('is false for a bare "#", which has no fragment', () => {
		expect(isAnchorLink('#', '/faqs')).toBe(false)
	})

	it('is false for a null or missing pathname', () => {
		expect(isAnchorLink('#section', null)).toBe(false)
		expect(isAnchorLink('#section', undefined)).toBe(false)
		expect(isAnchorLink('#section', '')).toBe(false)
	})

	it('is false for a missing or empty href', () => {
		expect(isAnchorLink(undefined, '/faqs')).toBe(false)
		expect(isAnchorLink('', '/faqs')).toBe(false)
	})

	it('is false for an absolute link to another origin, even with the same path', () => {
		expect(isAnchorLink('https://example.com/faqs#section', '/faqs')).toBe(false)
	})

	it('is false for input that cannot be parsed as a URL', () => {
		expect(isAnchorLink('http://', '/faqs')).toBe(false)
	})

	it('matches the pathname exactly, including a trailing slash', () => {
		expect(isAnchorLink('/faqs/#section', '/faqs')).toBe(false)
	})
})
