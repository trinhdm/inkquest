import { act, renderHook } from '@testing-library/react'
import { useColorScheme } from '../useColorScheme'
import { DEFAULT_COLOR_SCHEME, SCHEME_STORAGE_KEY } from '@/components/document/constants'

const attr = `data-${ SCHEME_STORAGE_KEY }`

describe('useColorScheme', () => {
	afterEach(() => {
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

	it('setColorScheme updates local state, applies the DOM attribute, and persists to localStorage', () => {
		const { result } = renderHook(() => useColorScheme())

		act(() => result.current.setColorScheme('light'))

		expect(result.current.colorScheme).toBe('light')
		expect(document.documentElement.getAttribute(attr)).toBe('light')
		expect(localStorage.getItem(SCHEME_STORAGE_KEY)).toBe('light')
	})

	it('setColorScheme can flip the scheme back and forth across renders', () => {
		const { result } = renderHook(() => useColorScheme())

		act(() => result.current.setColorScheme('dark'))
		expect(result.current.colorScheme).toBe('dark')

		act(() => result.current.setColorScheme('light'))
		expect(result.current.colorScheme).toBe('light')
		expect(document.documentElement.getAttribute(attr)).toBe('light')
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

		it('stays the opposite of colorScheme across every setColorScheme call', () => {
			document.documentElement.setAttribute(attr, 'light')
			const { result } = renderHook(() => useColorScheme())

			act(() => result.current.setColorScheme('dark'))
			expect(result.current.colorScheme).toBe('dark')
			expect(result.current.altScheme).toBe('light')

			act(() => result.current.setColorScheme('light'))
			expect(result.current.colorScheme).toBe('light')
			expect(result.current.altScheme).toBe('dark')
		})
	})
})
