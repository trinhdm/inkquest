import { act, cleanup, renderHook } from '@testing-library/react'
import { useColorScheme } from '../useColorScheme'
import { DEFAULT_COLOR_SCHEME, SCHEME_STORAGE_KEY } from '@/components/document/constants'

const attr = `data-${ SCHEME_STORAGE_KEY }`

describe('useColorScheme', () => {
	afterEach(() => {
		//	unmount first: clearing the attribute with the hook still mounted would notify it outside act()
		cleanup()
		document.documentElement.removeAttribute(attr)
		localStorage.clear()
	})

	it('initializes colorScheme from the documentElement attribute (getStoredScheme)', () => {
		document.documentElement.setAttribute(attr, 'light')

		const { result } = renderHook(() => useColorScheme())

		expect(result.current.colorScheme).toBe('light')
	})

	it('falls back to the default scheme when no attribute is present', () => {
		const { result } = renderHook(() => useColorScheme())

		expect(result.current.colorScheme).toBe(DEFAULT_COLOR_SCHEME)
	})

	it('ignores an invalid persisted attribute value and falls back to the default', () => {
		document.documentElement.setAttribute(attr, 'not-a-real-scheme')

		const { result } = renderHook(() => useColorScheme())

		expect(result.current.colorScheme).toBe(DEFAULT_COLOR_SCHEME)
	})

	//	the hook rereads the scheme from a MutationObserver on <html>, which jsdom delivers as a
	//	microtask after the setter returns, so each change is awaited inside an async act()
	const change = (set: () => void) => act(async () => { set() })
	const opposite = DEFAULT_COLOR_SCHEME === 'dark' ? 'light' : 'dark'

	it('setColorScheme applies the DOM attribute, persists to localStorage and updates colorScheme', async () => {
		const { result } = renderHook(() => useColorScheme())
		expect(result.current.colorScheme).toBe(DEFAULT_COLOR_SCHEME)

		await change(() => result.current.setColorScheme(opposite))

		expect(result.current.colorScheme).toBe(opposite)
		expect(document.documentElement.getAttribute(attr)).toBe(opposite)
		expect(localStorage.getItem(SCHEME_STORAGE_KEY)).toBe(opposite)
	})

	it('setColorScheme can flip the scheme back and forth across renders', async () => {
		const { result } = renderHook(() => useColorScheme())

		await change(() => result.current.setColorScheme(opposite))
		expect(result.current.colorScheme).toBe(opposite)

		await change(() => result.current.setColorScheme(DEFAULT_COLOR_SCHEME))
		expect(result.current.colorScheme).toBe(DEFAULT_COLOR_SCHEME)
		expect(document.documentElement.getAttribute(attr)).toBe(DEFAULT_COLOR_SCHEME)
		expect(localStorage.getItem(SCHEME_STORAGE_KEY)).toBe(DEFAULT_COLOR_SCHEME)
	})

	it('follows an attribute change made outside the hook, e.g. by another tab\'s script', async () => {
		const { result } = renderHook(() => useColorScheme())

		await change(() => document.documentElement.setAttribute(attr, opposite))

		expect(result.current.colorScheme).toBe(opposite)
		expect(result.current.altScheme).toBe(DEFAULT_COLOR_SCHEME)
	})

	it('stops observing <html> on unmount', async () => {
		const { result, unmount } = renderHook(() => useColorScheme())
		const { setColorScheme } = result.current
		unmount()

		//	nothing to re-render, so a late mutation must not warn or throw
		await change(() => setColorScheme(opposite))

		expect(document.documentElement.getAttribute(attr)).toBe(opposite)
	})

	it('setColorScheme identity is stable across re-renders (empty dependency array)', () => {
		const { result, rerender } = renderHook(() => useColorScheme())
		const firstSetter = result.current.setColorScheme

		rerender()

		expect(result.current.setColorScheme).toBe(firstSetter)
	})

	describe('altScheme', () => {
		it('starts as the opposite of a stored light scheme', () => {
			document.documentElement.setAttribute(attr, 'light')

			const { result } = renderHook(() => useColorScheme())

			expect(result.current.altScheme).toBe('dark')
		})

		it('starts as the opposite of a stored dark scheme', () => {
			document.documentElement.setAttribute(attr, 'dark')

			const { result } = renderHook(() => useColorScheme())

			expect(result.current.altScheme).toBe('light')
		})

		it('starts as the opposite of the default scheme when nothing is stored', () => {
			const { result } = renderHook(() => useColorScheme())

			expect(result.current.altScheme).toBe(DEFAULT_COLOR_SCHEME === 'dark' ? 'light' : 'dark')
			expect(result.current.altScheme).not.toBe(result.current.colorScheme)
		})

		it('stays the opposite of colorScheme across every setColorScheme call', async () => {
			document.documentElement.setAttribute(attr, 'light')
			const { result } = renderHook(() => useColorScheme())
			expect(result.current.colorScheme).toBe('light')
			expect(result.current.altScheme).toBe('dark')

			await change(() => result.current.setColorScheme('dark'))
			expect(result.current.colorScheme).toBe('dark')
			expect(result.current.altScheme).toBe('light')

			await change(() => result.current.setColorScheme('light'))
			expect(result.current.colorScheme).toBe('light')
			expect(result.current.altScheme).toBe('dark')
		})
	})
})
