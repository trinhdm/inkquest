import { schemeControls } from './schemeControls'
import { DEFAULT_COLOR_SCHEME, SCHEME_STORAGE_KEY } from './constants'

describe('schemeControls', () => {
	// jsdom has no matchMedia implementation at all — define a fresh stub
	// before every test (not just once) so per-test call counts (e.g. "was
	// matchMedia called at all") aren't polluted by earlier tests sharing
	// the same underlying jest.fn instance.
	beforeEach(() => {
		Object.defineProperty(window, 'matchMedia', {
			writable: true,
			configurable: true,
			value: jest.fn().mockReturnValue({ matches: false } as MediaQueryList),
		})
	})

	afterEach(() => {
		localStorage.clear()
		document.documentElement.removeAttribute(`data-${ SCHEME_STORAGE_KEY }`)
		document.documentElement.removeAttribute('data-custom-key')
		jest.restoreAllMocks()
	})

	describe('getInitialScheme', () => {
		it('reads a valid persisted scheme from localStorage', () => {
			localStorage.setItem(SCHEME_STORAGE_KEY, 'light')
			const { getInitialScheme } = schemeControls()

			expect(getInitialScheme()).toBe('light')
		})

		it('ignores a garbage value in localStorage and falls back to matchMedia', () => {
			localStorage.setItem(SCHEME_STORAGE_KEY, 'not-a-scheme')
			jest.spyOn(window, 'matchMedia').mockReturnValue({ matches: true } as MediaQueryList)

			const { getInitialScheme } = schemeControls()

			expect(getInitialScheme()).toBe('dark')
		})

		it('falls back to matchMedia when localStorage has no entry', () => {
			jest.spyOn(window, 'matchMedia').mockReturnValue({ matches: false } as MediaQueryList)

			const { getInitialScheme } = schemeControls({ defaultScheme: 'light' })

			expect(getInitialScheme()).toBe('light')
		})

		it('resolves to dark when matchMedia reports a dark-mode preference and no default is overridden', () => {
			jest.spyOn(window, 'matchMedia').mockReturnValue({ matches: true } as MediaQueryList)

			const { getInitialScheme } = schemeControls()

			expect(getInitialScheme()).toBe('dark')
		})

		it('swallows a throwing localStorage.getItem and falls through to matchMedia', () => {
			jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
				throw new Error('storage disabled')
			})
			jest.spyOn(window, 'matchMedia').mockReturnValue({ matches: false } as MediaQueryList)

			const { getInitialScheme } = schemeControls({ defaultScheme: 'light' })

			expect(getInitialScheme()).toBe('light')
		})

		it('respects a custom lsKey when reading from localStorage', () => {
			localStorage.setItem('custom-key', 'light')
			const { getInitialScheme } = schemeControls({ lsKey: 'custom-key' })

			expect(getInitialScheme()).toBe('light')
		})

		it('returns defaultScheme without touching window when window is undefined (SSR)', () => {
			const matchMediaSpy = jest.spyOn(window, 'matchMedia')
			const windowSpy = jest.spyOn(globalThis, 'window', 'get').mockReturnValue(undefined as never)

			const { getInitialScheme } = schemeControls({ defaultScheme: 'light' })

			expect(getInitialScheme()).toBe('light')
			expect(matchMediaSpy).not.toHaveBeenCalled()

			windowSpy.mockRestore()
		})
	})

	describe('getStoredScheme', () => {
		it('reads the persisted scheme off the documentElement attribute', () => {
			document.documentElement.setAttribute(`data-${ SCHEME_STORAGE_KEY }`, 'light')
			const { getStoredScheme } = schemeControls()

			expect(getStoredScheme()).toBe('light')
		})

		it('falls back to defaultScheme when the attribute is absent', () => {
			const { getStoredScheme } = schemeControls({ defaultScheme: 'light' })

			expect(getStoredScheme()).toBe('light')
		})

		it('falls back to defaultScheme when the attribute holds an invalid value', () => {
			document.documentElement.setAttribute(`data-${ SCHEME_STORAGE_KEY }`, 'garbage')
			const { getStoredScheme } = schemeControls({ defaultScheme: 'light' })

			expect(getStoredScheme()).toBe('light')
		})

		it('uses a custom lsKey to look up the attribute', () => {
			document.documentElement.setAttribute('data-custom-key', 'dark')
			const { getStoredScheme } = schemeControls({ lsKey: 'custom-key', defaultScheme: 'light' })

			expect(getStoredScheme()).toBe('dark')
		})
	})

	describe('applyScheme', () => {
		it('sets the data attribute on the documentElement', () => {
			const { applyScheme } = schemeControls()
			applyScheme('light')

			expect(document.documentElement.getAttribute(`data-${ SCHEME_STORAGE_KEY }`)).toBe('light')
		})

		it('uses a custom lsKey when setting the attribute', () => {
			const { applyScheme } = schemeControls({ lsKey: 'custom-key' })
			applyScheme('dark')

			expect(document.documentElement.getAttribute('data-custom-key')).toBe('dark')
		})
	})

	describe('persistScheme', () => {
		it('writes the scheme to localStorage under lsKey', () => {
			const { persistScheme } = schemeControls()
			persistScheme('light')

			expect(localStorage.getItem(SCHEME_STORAGE_KEY)).toBe('light')
		})

		it('uses a custom lsKey when persisting', () => {
			const { persistScheme } = schemeControls({ lsKey: 'custom-key' })
			persistScheme('dark')

			expect(localStorage.getItem('custom-key')).toBe('dark')
		})

		it('swallows a throwing localStorage.setItem without rethrowing', () => {
			jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
				throw new Error('storage disabled')
			})
			const { persistScheme } = schemeControls()

			expect(() => persistScheme('light')).not.toThrow()
		})
	})
})
