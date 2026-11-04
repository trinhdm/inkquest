import { renderHook } from '@testing-library/react'
import type { ReactNode } from 'react'
import { createPageCtx } from '../createPageCtx'

interface Data { title: string }

describe('createPageCtx', () => {
	const { usePageCtx, useSafePageCtx, PageProvider } = createPageCtx<Data>('privacy')

	const withPage = (value: Data) => {
		const Wrapper = ({ children }: { children: ReactNode }) => (
			<PageProvider value={ value }>{ children }</PageProvider>
		)
		return Wrapper
	}

	describe('inside a provider', () => {
		it('exposes the value with the page slug added as pageID', () => {
			const { result } = renderHook(() => usePageCtx(), { wrapper: withPage({ title: 'Privacy' }) })

			expect(result.current).toEqual({ title: 'Privacy', pageID: 'privacy' })
		})

		it('lets the slug win over a pageID smuggled into the value', () => {
			const value = { title: 'x', pageID: 'other' } as Data
			const { result } = renderHook(() => usePageCtx(), { wrapper: withPage(value) })

			expect(result.current.pageID).toBe('privacy')
		})

		it('gives useSafePageCtx the same value', () => {
			const { result } = renderHook(() => useSafePageCtx(), { wrapper: withPage({ title: 'Privacy' }) })

			expect(result.current).toEqual({ title: 'Privacy', pageID: 'privacy' })
		})

		it('keeps the same object across re-renders while the value is unchanged', () => {
			const value = { title: 'Privacy' }
			const { result, rerender } = renderHook(() => usePageCtx(), { wrapper: withPage(value) })
			const first = result.current

			rerender()

			expect(result.current).toBe(first)
		})

		it('updates when the provider gets a new value', () => {
			let value: Data = { title: 'one' }
			const { result, rerender } = renderHook(() => usePageCtx(), {
				wrapper: ({ children }: { children: ReactNode }) =>
					<PageProvider value={ value }>{ children }</PageProvider>,
			})
			expect(result.current.title).toBe('one')

			value = { title: 'two' }
			rerender()
			expect(result.current.title).toBe('two')
		})
	})

	describe('outside a provider', () => {
		let error: jest.SpyInstance
		beforeEach(() => { error = jest.spyOn(console, 'error').mockImplementation(() => {}) })
		afterEach(() => { error.mockRestore() })

		it('usePageCtx throws naming the calling component', () => {
			expect(() => renderHook(() => usePageCtx('Hero')))
				.toThrow('privacy: <Hero /> must be rendered inside <privacy>')
		})

		it('usePageCtx throws a generic message when no component is named', () => {
			expect(() => renderHook(() => usePageCtx()))
				.toThrow('privacy: This component must be rendered inside <privacy>')
		})

		it('useSafePageCtx returns null instead of throwing', () => {
			const { result } = renderHook(() => useSafePageCtx())
			expect(result.current).toBeNull()
		})
	})

	it('keeps separate pages isolated from each other', () => {
		const other = createPageCtx<Data>('terms')
		const { result } = renderHook(() => other.useSafePageCtx(), { wrapper: withPage({ title: 'Privacy' }) })

		expect(result.current).toBeNull()
	})
})
