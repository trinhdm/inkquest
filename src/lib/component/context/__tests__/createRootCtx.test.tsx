import { render, renderHook } from '@testing-library/react'
import { createRootCtx } from '../createRootCtx'
import type { ReactNode } from 'react'

interface TestCtxValue {
	color?: string
	size?: number
}

describe('createRootCtx', () => {
	const { RootProvider, useRootCtx, useSafeRootCtx, useRootProps } =
		createRootCtx<TestCtxValue>('TestRoot')

	const wrapperWith = (value: TestCtxValue, rootName?: string) =>
		({ children }: { children: ReactNode }) => (
			<RootProvider value={ value } rootName={ rootName }>{ children }</RootProvider>
		)

	describe('useRootCtx', () => {
		it('throws a named error when used outside of its provider', () => {
			const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})

			expect(() => renderHook(() => useRootCtx('Consumer'))).toThrow(
				'<Consumer /> must be rendered inside <TestRoot>'
			)

			consoleErrorSpy.mockRestore()
		})

		it('returns the provided context value plus a `rootName` defaulted from the creator name, plus a derived `baseName`', () => {
			// `baseName` strips `rootName` off `componentName`, then drops one
			// leading `.` separator ONLY if the remainder actually starts with
			// one (`compoundName.startsWith('.') ? 1 : 0`) — so a dotted compound
			// name like `TestRoot.Consumer` correctly yields `consumer`, not a
			// mangled slice of it.
			const { result } = renderHook(() => useRootCtx('TestRoot.Consumer'), {
				wrapper: wrapperWith({ color: 'red', size: 12 }),
			})

			expect(result.current).toEqual({
				color: 'red',
				size: 12,
				rootName: 'TestRoot',
				baseName: 'consumer',
			})
		})

		it('derives baseName as the lowercased rootName when componentName equals rootName', () => {
			const { result } = renderHook(() => useRootCtx('TestRoot'), {
				wrapper: wrapperWith({ color: 'red' }),
			})

			expect(result.current.baseName).toBe('testroot')
		})

		it('lowercases a plain, undotted consumer name that does not contain rootName, without corrupting it', () => {
			// `componentName.replace(rootName, '')` is a no-op here since
			// `rootName` ('TestRoot') isn't a substring of 'Consumer', leaving
			// the whole name intact; the `startsWith('.')` guard means the
			// `.slice(1)` used for the dotted case above is correctly skipped,
			// so nothing gets eaten off the front.
			const { result } = renderHook(() => useRootCtx('Consumer'), {
				wrapper: wrapperWith({ color: 'red' }),
			})

			expect(result.current.baseName).toBe('consumer')
		})

		it('lets the provider override `rootName`', () => {
			const { result } = renderHook(() => useRootCtx('Consumer'), {
				wrapper: wrapperWith({ color: 'blue' }, 'CustomRoot'),
			})

			expect(result.current.rootName).toBe('CustomRoot')
		})

		it('propagates a changed context value down to consumers when the provider re-renders with a new value', () => {
			const seen: (string | undefined)[] = []
			const Consumer = () => {
				const ctx = useRootCtx('Consumer')
				seen.push(ctx.color)
				return null
			}

			const { rerender } = render(
				<RootProvider value={ { color: 'red' } }><Consumer /></RootProvider>
			)
			rerender(
				<RootProvider value={ { color: 'blue' } }><Consumer /></RootProvider>
			)

			expect(seen).toEqual(['red', 'blue'])
		})
	})

	describe('useSafeRootCtx', () => {
		it('returns null outside of a provider instead of throwing', () => {
			const { result } = renderHook(() => useSafeRootCtx())

			expect(result.current).toBeNull()
		})

		it('returns the context value inside a provider', () => {
			const { result } = renderHook(() => useSafeRootCtx(), {
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
