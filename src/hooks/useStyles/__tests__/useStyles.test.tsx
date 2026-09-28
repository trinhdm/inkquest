import { renderHook } from '@testing-library/react'
import { ThemeProvider } from '@/providers/ThemeProvider'
import { useStyles } from '../useStyles'
import type { ReactNode } from 'react'

// `getClassName` and `getStyle` (the two functions `useStyles` composes) each
// have their own suite — this one covers `useStyles`'s own composition:
// pluralizing root results, memoizing the returned function, and caching
// per-selector/per-config results within a single render.
const wrapper = ({ children }: { children: ReactNode }) => (
	<ThemeProvider>{ children }</ThemeProvider>
)

describe('useStyles', () => {
	it('returns pluralized `classNames`/`styles` keys for the root selector', () => {
		const { result } = renderHook(
			() => useStyles('Widget', { props: {} }),
			{ wrapper }
		)

		const styleResult = result.current('root')
		expect(styleResult).toHaveProperty('classNames')
		expect(styleResult).toHaveProperty('styles')
		expect(styleResult).not.toHaveProperty('className')
		expect(styleResult).not.toHaveProperty('style')
	})

	it('returns singular `className`/`style` keys for a non-root selector', () => {
		const { result } = renderHook(
			() => useStyles('Widget', { props: {} }),
			{ wrapper }
		)

		const styleResult = result.current('icon')
		expect(styleResult).toHaveProperty('className')
		expect(styleResult).toHaveProperty('style')
		expect(styleResult).not.toHaveProperty('classNames')
	})

	it('resolves a semantic class name derived from the component name and selector', () => {
		const { result } = renderHook(
			() => useStyles('Widget', { props: {} }),
			{ wrapper }
		)

		expect(result.current('icon').className).toContain('widget__icon')
	})

	it('caches the result for an identical selector+config pair within the same styles function', () => {
		const { result } = renderHook(
			() => useStyles('Widget', { props: {} }),
			{ wrapper }
		)

		const first = result.current('icon')
		const second = result.current('icon')
		expect(first).toBe(second)
	})

	it('does not share a cache entry between different config objects for the same selector', () => {
		const { result } = renderHook(
			() => useStyles('Widget', { props: {} }),
			{ wrapper }
		)

		const withConfig = result.current('icon', { module: { active: true } })
		const withoutConfig = result.current('icon')
		expect(withConfig).not.toBe(withoutConfig)
	})

	// SOURCE BUG (not asserted as correct behavior below): `useStyles`'s
	// `useMemo` lists `theme` (from `useTheme()`) as a dep, but `useTheme`
	// destructures `{ config, ...theme } = ctx` fresh on every call — a new
	// object identity even when the context value itself hasn't changed. That
	// defeats the memo: the returned styles function (and its selector cache)
	// is rebuilt on every render of the consuming component, regardless of
	// whether `props`/`classes`/`tokens` actually changed. Documented here as
	// the real, currently-observed behavior rather than the memoized contract
	// the code comments imply.
	it('rebuilds the styles function on every rerender, even with unchanged props, because `useTheme()` returns a new object identity each call', () => {
		const props = {}
		const { rerender, result } = renderHook(
			() => useStyles('Widget', { props }),
			{ wrapper }
		)

		const firstFn = result.current
		rerender()
		expect(result.current).not.toBe(firstFn)
	})

	it('returns a new styles function (fresh cache) when `props` changes identity', () => {
		const { rerender, result } = renderHook(
			({ props }: { props: object }) => useStyles('Widget', { props }),
			{ initialProps: { props: {} }, wrapper }
		)

		const firstFn = result.current
		rerender({ props: {} })
		expect(result.current).not.toBe(firstFn)
	})

	it('reads CSS custom properties from `tokens` for the current selector', () => {
		const tokens = jest.fn(() => ({ root: { '--widget-color': 'red' } }))
		const { result } = renderHook(
			() => useStyles('Widget', { props: {}, tokens }),
			{ wrapper }
		)

		expect(result.current('root').styles).toEqual({ '--widget-color': 'red' })
	})
})
