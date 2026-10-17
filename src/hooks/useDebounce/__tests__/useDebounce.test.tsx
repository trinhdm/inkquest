import { act, renderHook } from '@testing-library/react'
import { useDebounce } from '../useDebounce'

describe('useDebounce', () => {
	beforeEach(() => { jest.useFakeTimers() })
	afterEach(() => { jest.useRealTimers() })

	it('is idle until debounce is called', () => {
		const callback = jest.fn()
		const { result } = renderHook(() => useDebounce(callback))

		jest.advanceTimersByTime(1000)

		expect(callback).not.toHaveBeenCalled()
		expect(result.current.waiting).toBe(false)
	})

	it('waits the default 250ms before calling back', () => {
		const callback = jest.fn()
		const { result } = renderHook(() => useDebounce(callback))

		act(() => result.current.debounce())
		act(() => { jest.advanceTimersByTime(249) })
		expect(callback).not.toHaveBeenCalled()

		act(() => { jest.advanceTimersByTime(1) })
		expect(callback).toHaveBeenCalledTimes(1)
	})

	it('passes the arguments of the call through to the callback', () => {
		const callback = jest.fn()
		const { result } = renderHook(() => useDebounce(callback, 100))

		act(() => result.current.debounce('ink', 3))
		act(() => { jest.advanceTimersByTime(100) })

		expect(callback).toHaveBeenCalledWith('ink', 3)
	})

	it('reports waiting while a call is pending and clears it once it fires', () => {
		const { result } = renderHook(() => useDebounce(jest.fn(), 100))

		act(() => result.current.debounce())
		expect(result.current.waiting).toBe(true)

		act(() => { jest.advanceTimersByTime(100) })
		expect(result.current.waiting).toBe(false)
	})

	it('restarts the wait on rapid calls and fires once with the latest arguments', () => {
		const callback = jest.fn()
		const { result } = renderHook(() => useDebounce(callback, 100))

		act(() => result.current.debounce('a'))
		act(() => { jest.advanceTimersByTime(80) })
		act(() => result.current.debounce('b'))
		act(() => { jest.advanceTimersByTime(80) })
		act(() => result.current.debounce('c'))

		//	240ms after the first call, but only 80ms after the last
		expect(callback).not.toHaveBeenCalled()
		expect(result.current.waiting).toBe(true)

		act(() => { jest.advanceTimersByTime(100) })
		expect(callback).toHaveBeenCalledTimes(1)
		expect(callback).toHaveBeenCalledWith('c')
	})

	it('fires again for a call made after the previous one has settled', () => {
		const callback = jest.fn()
		const { result } = renderHook(() => useDebounce(callback, 100))

		act(() => result.current.debounce('first'))
		act(() => { jest.advanceTimersByTime(100) })
		act(() => result.current.debounce('second'))
		act(() => { jest.advanceTimersByTime(100) })

		expect(callback.mock.calls).toEqual([['first'], ['second']])
	})

	it('cancel drops the pending call and stops waiting', () => {
		const callback = jest.fn()
		const { result } = renderHook(() => useDebounce(callback, 100))

		act(() => result.current.debounce())
		act(() => result.current.cancel())
		expect(result.current.waiting).toBe(false)

		act(() => { jest.advanceTimersByTime(500) })
		expect(callback).not.toHaveBeenCalled()
	})

	it('cancel with nothing pending is harmless', () => {
		const { result } = renderHook(() => useDebounce(jest.fn()))

		expect(() => act(() => result.current.cancel())).not.toThrow()
		expect(result.current.waiting).toBe(false)
	})

	it('drops the pending call when the component unmounts', () => {
		const callback = jest.fn()
		const { result, unmount } = renderHook(() => useDebounce(callback, 100))

		act(() => result.current.debounce())
		unmount()
		act(() => { jest.advanceTimersByTime(500) })

		expect(callback).not.toHaveBeenCalled()
		expect(jest.getTimerCount()).toBe(0)
	})

	it('calls the latest callback, not the one captured when debounce was called', () => {
		const first = jest.fn(), second = jest.fn()
		const { result, rerender } = renderHook(({ cb }) => useDebounce(cb, 100), {
			initialProps: { cb: first },
		})

		act(() => result.current.debounce())
		rerender({ cb: second })
		act(() => { jest.advanceTimersByTime(100) })

		expect(first).not.toHaveBeenCalled()
		expect(second).toHaveBeenCalledTimes(1)
	})

	it('uses a changed delay for the next call but leaves the pending one alone', () => {
		const callback = jest.fn()
		const { result, rerender } = renderHook(({ delay }) => useDebounce(callback, delay), {
			initialProps: { delay: 100 },
		})

		act(() => result.current.debounce('slow'))
		rerender({ delay: 500 })
		act(() => { jest.advanceTimersByTime(100) })
		expect(callback).toHaveBeenCalledWith('slow')

		act(() => result.current.debounce('fast'))
		act(() => { jest.advanceTimersByTime(499) })
		expect(callback).toHaveBeenCalledTimes(1)
		act(() => { jest.advanceTimersByTime(1) })
		expect(callback).toHaveBeenCalledTimes(2)
	})
})
