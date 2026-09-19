import { act, renderHook } from '@testing-library/react'
import { animate, useReducedMotion } from 'framer-motion'
import { useCountUp } from '../useCountUp'

jest.mock('framer-motion', () => {
	const actual = jest.requireActual('framer-motion')
	return {
		...actual,
		animate: jest.fn(() => ({ stop: jest.fn() })),
		useReducedMotion: jest.fn(() => false),
	}
})

const mockAnimate = animate as jest.Mock
const mockUseReducedMotion = useReducedMotion as jest.Mock

describe('useCountUp', () => {
	afterEach(() => {
		jest.clearAllMocks()
		mockUseReducedMotion.mockReturnValue(false)
	})

	it('shows the "start" value (default 0) formatted while waiting to animate', () => {
		const { result } = renderHook(() => useCountUp({ value: 1234, withinView: true }))

		expect(result.current.display).toBe('0')
	})

	it('kicks off animate() from `start` to the parsed numeric end once viewable', () => {
		renderHook(() => useCountUp({ value: 1234, withinView: true }))

		expect(mockAnimate).toHaveBeenCalledTimes(1)
		const [start, end, options] = mockAnimate.mock.calls[0]
		expect(start).toBe(0)
		expect(end).toBe(1234)
		expect(options.duration).toBe(3)
		expect(options.ease).toEqual([0.16, 1, 0.3, 1])
	})

	it('formats a prefix/suffix value like "$9.2M" and animates toward its numeric core', () => {
		const { result } = renderHook(() => useCountUp({ value: '$9.2M', withinView: true }))

		expect(result.current.display).toBe('$0.0M')
		const [, end] = mockAnimate.mock.calls[0]
		expect(end).toBeCloseTo(9.2)
	})

	it('preserves thousands separators for a comma-grouped value like "12,400+"', () => {
		renderHook(() => useCountUp({ value: '12,400+', withinView: true }))

		const [, end] = mockAnimate.mock.calls[0]
		expect(end).toBe(12400)
	})

	it('updates the displayed value as the animation reports progress via onUpdate', () => {
		const { result } = renderHook(() => useCountUp({ value: 1234, withinView: true }))
		const { onUpdate } = mockAnimate.mock.calls[0][2]

		act(() => onUpdate(617))

		expect(result.current.display).toBe('617')
	})

	it('does not animate a value with no parseable number (e.g. "—"), and shows it as-is', () => {
		const { result } = renderHook(() => useCountUp({ value: '—', withinView: true }))

		expect(result.current.display).toBe('—')
		expect(mockAnimate).not.toHaveBeenCalled()
	})

	it('skips the animation and jumps straight to the final value when `enabled` is false', () => {
		const { result } = renderHook(() => useCountUp({ enabled: false, value: 1234, withinView: true }))

		expect(result.current.display).toBe('1234')
		expect(mockAnimate).not.toHaveBeenCalled()
	})

	it('skips the animation and jumps straight to the final value when reduced motion is preferred', () => {
		mockUseReducedMotion.mockReturnValue(true)

		const { result } = renderHook(() => useCountUp({ value: 1234, withinView: true }))

		expect(result.current.display).toBe('1234')
		expect(mockAnimate).not.toHaveBeenCalled()
	})

	it('does not animate while out of view (`withinView: false`), even though the initial value is still set', () => {
		const { result } = renderHook(() => useCountUp({ value: 1234, withinView: false }))

		expect(result.current.display).toBe('0')
		expect(mockAnimate).not.toHaveBeenCalled()
	})

	it('converts a millisecond `delay` to seconds and forwards it to animate()', () => {
		renderHook(() => useCountUp({ delay: 500, value: 1234, withinView: true }))

		const [, , options] = mockAnimate.mock.calls[0]
		expect(options.delay).toBe(0.5)
	})

	it('omits the `delay` option entirely when none is provided', () => {
		renderHook(() => useCountUp({ value: 1234, withinView: true }))

		const [, , options] = mockAnimate.mock.calls[0]
		expect(options).not.toHaveProperty('delay')
	})

	it('stops the running animation controls on unmount', () => {
		const stop = jest.fn()
		mockAnimate.mockReturnValue({ stop })

		const { unmount } = renderHook(() => useCountUp({ value: 1234, withinView: true }))
		unmount()

		expect(stop).toHaveBeenCalledTimes(1)
	})

	it('respects a custom `start` value for both the initial display and the animate() call', () => {
		const { result } = renderHook(() => useCountUp({ start: 50, value: 100, withinView: true }))

		expect(result.current.display).toBe('50')
		const [start] = mockAnimate.mock.calls[0]
		expect(start).toBe(50)
	})
})
