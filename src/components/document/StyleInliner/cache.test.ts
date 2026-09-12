import { resolveStyles } from './resolver'
import { serializeStyles } from './serializer'
import { buildVariantSchemes } from '@/lib/theme/buildVariantSchemes'
import type { SiteTheme } from '@/lib/theme'
import type { getSchemeCSS as GetSchemeCSS, getVariantCSS as GetVariantCSS } from './cache'

jest.mock('./resolver', () => ({ resolveStyles: jest.fn() }))
jest.mock('./serializer', () => ({ serializeStyles: jest.fn() }))
jest.mock('@/lib/theme/buildVariantSchemes', () => ({ buildVariantSchemes: jest.fn() }))

const mockResolveStyles = resolveStyles as jest.Mock
const mockSerializeStyles = serializeStyles as jest.Mock
const mockBuildVariantSchemes = buildVariantSchemes as jest.Mock

// The caches in `./cache` are module-level state (a WeakMap and a Map) with
// no exported reset — see Maintenance Note. `jest.isolateModules` forces a
// fresh module instance (and therefore fresh, empty caches) per test so
// hit/miss assertions can't leak across `it` blocks.
const loadCache = () => {
	let cache: { getSchemeCSS: typeof GetSchemeCSS; getVariantCSS: typeof GetVariantCSS }
	jest.isolateModules(() => {
		cache = require('./cache')
	})
	return cache!
}

describe('getSchemeCSS', () => {
	beforeEach(() => {
		mockResolveStyles.mockReturnValue([{ selector: ':root', vars: {} }])
		mockSerializeStyles.mockImplementation(rules => JSON.stringify(rules))
	})

	afterEach(() => {
		jest.clearAllMocks()
	})

	it('resolves and serializes on the first call for a theme (cache miss)', () => {
		const { getSchemeCSS } = loadCache()
		const theme = {} as SiteTheme

		const css = getSchemeCSS(theme)

		expect(mockResolveStyles).toHaveBeenCalledTimes(1)
		expect(mockResolveStyles).toHaveBeenCalledWith({ current: theme, prefix: undefined })
		expect(mockSerializeStyles).toHaveBeenCalledTimes(1)
		expect(css).toBe(JSON.stringify([{ selector: ':root', vars: {} }]))
	})

	it('returns the cached value on a second call with the same theme and prefix (cache hit)', () => {
		const { getSchemeCSS } = loadCache()
		const theme = {} as SiteTheme

		getSchemeCSS(theme, 'inkq')
		getSchemeCSS(theme, 'inkq')

		expect(mockResolveStyles).toHaveBeenCalledTimes(1)
		expect(mockSerializeStyles).toHaveBeenCalledTimes(1)
	})

	it('treats different prefixes for the same theme object as separate cache entries', () => {
		const { getSchemeCSS } = loadCache()
		const theme = {} as SiteTheme

		getSchemeCSS(theme, 'a')
		getSchemeCSS(theme, 'b')

		expect(mockResolveStyles).toHaveBeenCalledTimes(2)
		expect(mockResolveStyles).toHaveBeenNthCalledWith(1, { current: theme, prefix: 'a' })
		expect(mockResolveStyles).toHaveBeenNthCalledWith(2, { current: theme, prefix: 'b' })
	})

	it('treats an undefined prefix and an empty-string prefix as the same cache key', () => {
		const { getSchemeCSS } = loadCache()
		const theme = {} as SiteTheme

		getSchemeCSS(theme)
		getSchemeCSS(theme, '')

		// both normalize to the '' key in the per-theme Map, so only one resolve
		expect(mockResolveStyles).toHaveBeenCalledTimes(1)
	})

	it('keys the cache by theme object identity — distinct theme objects miss independently', () => {
		const { getSchemeCSS } = loadCache()
		const themeA = {} as SiteTheme
		const themeB = {} as SiteTheme

		getSchemeCSS(themeA)
		getSchemeCSS(themeB)

		expect(mockResolveStyles).toHaveBeenCalledTimes(2)
	})

	it('caches a falsy-but-defined empty string result without re-resolving', () => {
		mockSerializeStyles.mockReturnValue('')
		const { getSchemeCSS } = loadCache()
		const theme = {} as SiteTheme

		getSchemeCSS(theme)
		getSchemeCSS(theme)

		expect(mockResolveStyles).toHaveBeenCalledTimes(1)
	})
})

describe('getVariantCSS', () => {
	beforeEach(() => {
		mockBuildVariantSchemes.mockImplementation((name: string) => [{ selector: name, vars: {} }])
		mockSerializeStyles.mockImplementation(rules => JSON.stringify(rules))
	})

	afterEach(() => {
		jest.clearAllMocks()
	})

	it('builds the unnamed variant scheme when names is undefined (cache miss)', () => {
		const { getVariantCSS } = loadCache()

		getVariantCSS()

		expect(mockBuildVariantSchemes).toHaveBeenCalledTimes(1)
		expect(mockBuildVariantSchemes).toHaveBeenCalledWith('', undefined)
	})

	it('builds the unnamed variant scheme when names is an empty array', () => {
		const { getVariantCSS } = loadCache()

		getVariantCSS([])

		expect(mockBuildVariantSchemes).toHaveBeenCalledWith('', undefined)
	})

	it('flat-maps buildVariantSchemes across every provided name', () => {
		const { getVariantCSS } = loadCache()

		getVariantCSS(['solid', 'outline'], 'inkq')

		expect(mockBuildVariantSchemes).toHaveBeenCalledTimes(2)
		expect(mockBuildVariantSchemes).toHaveBeenNthCalledWith(1, 'solid', 'inkq')
		expect(mockBuildVariantSchemes).toHaveBeenNthCalledWith(2, 'outline', 'inkq')
	})

	it('returns the cached value for an identical names+prefix key without rebuilding (cache hit)', () => {
		const { getVariantCSS } = loadCache()

		getVariantCSS(['solid'], 'inkq')
		getVariantCSS(['solid'], 'inkq')

		expect(mockBuildVariantSchemes).toHaveBeenCalledTimes(1)
		expect(mockSerializeStyles).toHaveBeenCalledTimes(1)
	})

	it('treats different name orderings as different cache keys', () => {
		const { getVariantCSS } = loadCache()

		getVariantCSS(['solid', 'outline'])
		mockBuildVariantSchemes.mockClear()
		getVariantCSS(['outline', 'solid'])

		expect(mockBuildVariantSchemes).toHaveBeenCalledTimes(2)
	})

	it('treats different prefixes for the same names as different cache keys', () => {
		const { getVariantCSS } = loadCache()

		getVariantCSS(['solid'], 'a')
		getVariantCSS(['solid'], 'b')

		expect(mockBuildVariantSchemes).toHaveBeenCalledTimes(2)
	})
})
