import { renderHook } from '@testing-library/react'
import { useReplayInView } from '../useReplayInView'
import { revealMargin } from '../constants'
import type { RefObject } from 'react'

const mockUseInView = jest.fn()

jest.mock('framer-motion', () => ({
	useInView: (...args: unknown[]) => mockUseInView(...args),
}))

// `useReplayInView` calls `useInView` twice per render: once with the
// "armed" options (always includes an explicit `once` key, even if
// `undefined`) and once with the plain "onScreen" options (`{ amount: 'some',
// ...rest }`, never an `once` key). Distinguishing by that key lets the mock
// answer each call correctly regardless of call order.
const mockInView = (armed: boolean, onScreen: boolean) => {
	mockUseInView.mockImplementation((_ref: unknown, options: Record<string, unknown>) =>
		'once' in options ? armed : onScreen
	)
}

const ref = { current: null } as RefObject<Element | null>

describe('useReplayInView', () => {
	afterEach(() => {
		mockUseInView.mockReset()
	})

	it('is deterministically false when the stubbed IntersectionObserver never reports a real intersection', () => {
		mockInView(false, false)
		const { result } = renderHook(() => useReplayInView(ref))
		expect(result.current).toBe(false)
	})

	it('arms to true once any part of the trigger area is entered', () => {
		mockInView(true, true)
		const { result } = renderHook(() => useReplayInView(ref))
		expect(result.current).toBe(true)
	})

	it('stays armed while still partially on screen, even after leaving the trigger area', () => {
		mockInView(false, true)
		const { result, rerender } = renderHook(() => useReplayInView(ref))

		mockInView(true, true)
		rerender()
		expect(result.current).toBe(true)

		mockInView(false, true)
		rerender()
		expect(result.current).toBe(true)
	})

	it('disarms only once no part of the element remains on screen', () => {
		mockInView(true, true)
		const { result, rerender } = renderHook(() => useReplayInView(ref))
		expect(result.current).toBe(true)

		mockInView(false, false)
		rerender()
		expect(result.current).toBe(false)
	})

	it('with `once: true`, returns the raw "armed" value directly instead of the latched state', () => {
		mockInView(true, true)
		const { result, rerender } = renderHook(() => useReplayInView(ref, { once: true }))
		expect(result.current).toBe(true)

		mockInView(false, true)
		rerender()
		expect(result.current).toBe(false)
	})

	it('defaults amount to "some" and derives margin from the default lead when neither is passed', () => {
		mockInView(false, false)
		renderHook(() => useReplayInView(ref))

		const [, armedOptions] = mockUseInView.mock.calls.find(([, opts]) => 'once' in opts)!
		expect(armedOptions).toMatchObject({ amount: 'some', margin: revealMargin(), once: false })
	})

	it('derives margin from a custom `lead` when `amount` is not passed', () => {
		mockInView(false, false)
		renderHook(() => useReplayInView(ref, { lead: -10 }))

		const [, armedOptions] = mockUseInView.mock.calls.find(([, opts]) => 'once' in opts)!
		expect(armedOptions.margin).toBe(revealMargin(-10))
	})

	it('uses an explicit `margin` as-is instead of deriving one from `lead`, when `amount` is passed', () => {
		mockInView(false, false)
		renderHook(() => useReplayInView(ref, { amount: 'all', margin: '10px' }))

		const [, armedOptions] = mockUseInView.mock.calls.find(([, opts]) => 'once' in opts)!
		expect(armedOptions).toMatchObject({ amount: 'all', margin: '10px' })
	})

	it('derives no margin when `amount` is explicit and no `margin` is given', () => {
		mockInView(false, false)
		renderHook(() => useReplayInView(ref, { amount: 'all' }))

		const [, armedOptions] = mockUseInView.mock.calls.find(([, opts]) => 'once' in opts)!
		expect(armedOptions.margin).toBeUndefined()
	})

	it('always checks "onScreen" with a plain amount of "some", independent of the configured trigger amount', () => {
		mockInView(false, false)
		renderHook(() => useReplayInView(ref, { amount: 'all' }))

		const [, onScreenOptions] = mockUseInView.mock.calls.find(([, opts]) => !('once' in opts))!
		expect(onScreenOptions).toEqual({ amount: 'some' })
	})
})
