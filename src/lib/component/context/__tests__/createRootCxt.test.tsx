import { render, renderHook } from '@testing-library/react'
import type { ReactNode } from 'react'
import { createRootCxt } from '../createRootCxt'

interface TestCtxValue {
	color?: string
	size?: number
}

describe('createRootCxt', () => {
	const { RootCxtProvider, useRootCxt, useSafeRootCxt, useRootProps } =
		createRootCxt<TestCtxValue>('TestRoot')

	const wrapperWith = (value: TestCtxValue, rootName?: string) =>
		({ children }: { children: ReactNode }) => (
			<RootCxtProvider value={ value } rootName={ rootName }>{ children }</RootCxtProvider>
		)

	describe('useRootCxt', () => {
		it('throws a named error when used outside of its provider', () => {
			const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})

			expect(() => renderHook(() => useRootCxt('Consumer'))).toThrow(
				'<Consumer /> must be rendered inside <TestRoot>'
			)

			consoleErrorSpy.mockRestore()
		})

		it('returns the provided context value plus a `rootName` defaulted from the creator name', () => {
			const { result } = renderHook(() => useRootCxt('Consumer'), {
				wrapper: wrapperWith({ color: 'red', size: 12 }),
			})

			expect(result.current).toEqual({ color: 'red', size: 12, rootName: 'TestRoot' })
		})

		it('lets the provider override `rootName`', () => {
			const { result } = renderHook(() => useRootCxt('Consumer'), {
				wrapper: wrapperWith({ color: 'blue' }, 'CustomRoot'),
			})

			expect(result.current.rootName).toBe('CustomRoot')
		})

		it('propagates a changed context value down to consumers when the provider re-renders with a new value', () => {
			const seen: (string | undefined)[] = []
			const Consumer = () => {
				const ctx = useRootCxt('Consumer')
				seen.push(ctx.color)
				return null
			}

			const { rerender } = render(
				<RootCxtProvider value={ { color: 'red' } }><Consumer /></RootCxtProvider>
			)
			rerender(
				<RootCxtProvider value={ { color: 'blue' } }><Consumer /></RootCxtProvider>
			)

			expect(seen).toEqual(['red', 'blue'])
		})
	})

	describe('useSafeRootCxt', () => {
		it('returns null outside of a provider instead of throwing', () => {
			const { result } = renderHook(() => useSafeRootCxt())

			expect(result.current).toBeNull()
		})

		it('returns the context value inside a provider', () => {
			const { result } = renderHook(() => useSafeRootCxt(), {
				wrapper: wrapperWith({ color: 'green' }),
			})

			expect(result.current).toEqual({ color: 'green', rootName: 'TestRoot' })
		})
	})

	describe('useRootProps', () => {
		it('returns props untouched when there is no surrounding provider', () => {
			const { result } = renderHook(() => useRootProps({ label: 'hi' }))

			expect(result.current).toEqual({ label: 'hi' })
		})

		it('fills in a key absent from the caller props with the context value', () => {
			const { result } = renderHook(() => useRootProps({ label: 'hi' } as { label: string, color?: string }), {
				wrapper: wrapperWith({ color: 'red' }),
			})

			expect(result.current).toEqual({ label: 'hi', color: 'red' })
		})

		it('lets an explicit own prop win over the inherited context value', () => {
			const { result } = renderHook(
				() => useRootProps({ color: 'blue' } as { color?: string }),
				{ wrapper: wrapperWith({ color: 'red' }) }
			)

			expect(result.current).toEqual({ color: 'blue' })
		})

		it('does not let an explicit `undefined` own prop be overwritten by the inherited context value', () => {
			// `Object.hasOwn` sees the key regardless of its `undefined` value,
			// so this is treated as "explicitly unset", not "absent".
			const { result } = renderHook(
				() => useRootProps({ color: undefined } as { color?: string }),
				{ wrapper: wrapperWith({ color: 'red' }) }
			)

			expect(result.current).toEqual({ color: undefined })
			expect(Object.hasOwn(result.current, 'color')).toBe(true)
		})

		it('never inherits `rootName` from context even though it is present on the context value', () => {
			const { result } = renderHook(() => useRootProps({}), {
				wrapper: wrapperWith({ color: 'red' }, 'CustomRoot'),
			})

			expect(result.current).toEqual({ color: 'red' })
			expect(Object.hasOwn(result.current, 'rootName')).toBe(false)
		})

		it('does not inherit a context key whose value is undefined', () => {
			const { result } = renderHook(() => useRootProps({} as { size?: number }), {
				wrapper: wrapperWith({ size: undefined }),
			})

			expect(result.current).toEqual({})
		})
	})
})
