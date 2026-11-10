import type { SubmitEvent } from 'react'
import { act, renderHook } from '@testing-library/react'
import { useFormHistory } from '../useFormHistory'

type Screen = 'begin' | 'forgot' | 'reset'

const setup = () => renderHook(() => useFormHistory<Screen>('begin'))

const submitEvent = () =>
	({ preventDefault: jest.fn() }) as unknown as SubmitEvent<HTMLFormElement>

describe('useFormHistory', () => {
	it('starts on the first screen with nothing to go back to and no wait', () => {
		const { result } = setup()

		expect(result.current.current).toBe('begin')
		expect(result.current.canGoBack).toBe(false)
		expect(result.current.waiting).toBe(false)
	})

	it('navigate moves forward and back returns one screen at a time', () => {
		const { result } = setup()

		act(() => result.current.navigate('forgot'))
		act(() => result.current.navigate('reset'))
		expect(result.current.current).toBe('reset')
		expect(result.current.canGoBack).toBe(true)

		act(() => result.current.back())
		expect(result.current.current).toBe('forgot')

		act(() => result.current.back())
		expect(result.current.current).toBe('begin')
		expect(result.current.canGoBack).toBe(false)
	})

	it('back on the first screen stays there', () => {
		const { result } = setup()

		act(() => result.current.back())

		expect(result.current.current).toBe('begin')
	})

	it('two back calls before a re-render stop at the first screen', () => {
		const { result } = setup()

		act(() => result.current.navigate('forgot'))
		act(() => {
			result.current.back()
			result.current.back()
		})

		expect(result.current.current).toBe('begin')
		expect(result.current.canGoBack).toBe(false)
	})

	it('navigating to the current screen adds no extra Back step', () => {
		const { result } = setup()

		act(() => result.current.navigate('reset'))
		act(() => result.current.navigate('reset'))
		act(() => result.current.back())

		expect(result.current.current).toBe('begin')
	})

	it('navigate starts the wait only when asked', () => {
		const { result } = setup()

		act(() => result.current.navigate('reset', { wait: true }))
		expect(result.current.waiting).toBe(true)

		act(() => result.current.navigate('forgot'))
		expect(result.current.waiting).toBe(false)
	})

	it('a resend on the same screen starts the wait again', () => {
		const { result } = setup()

		act(() => result.current.navigate('reset', { wait: true }))
		act(() => result.current.stopWait())
		expect(result.current.waiting).toBe(false)

		act(() => result.current.navigate('reset', { wait: true }))
		expect(result.current.waiting).toBe(true)
		expect(result.current.current).toBe('reset')
	})

	it('startWait and stopWait change the wait without moving', () => {
		const { result } = setup()

		act(() => result.current.navigate('reset'))
		act(() => result.current.startWait())
		expect(result.current.waiting).toBe(true)

		act(() => result.current.stopWait())
		expect(result.current.waiting).toBe(false)
		expect(result.current.current).toBe('reset')
	})

	it('back clears the wait', () => {
		const { result } = setup()

		act(() => result.current.navigate('forgot'))
		act(() => result.current.navigate('reset', { wait: true }))
		act(() => result.current.back())

		expect(result.current.current).toBe('forgot')
		expect(result.current.waiting).toBe(false)
	})

	it('restart returns to the first screen and clears the trail and the wait', () => {
		const { result } = setup()

		act(() => result.current.navigate('forgot'))
		act(() => result.current.navigate('reset', { wait: true }))
		act(() => result.current.restart())

		expect(result.current.current).toBe('begin')
		expect(result.current.canGoBack).toBe(false)
		expect(result.current.waiting).toBe(false)
	})

	it('guard lets a submit through when not waiting', () => {
		const { result } = setup()
		const idle = submitEvent(), notWhen = submitEvent()

		result.current.guard(idle)
		result.current.guard(notWhen, { when: false })

		expect(idle.preventDefault).not.toHaveBeenCalled()
		expect(notWhen.preventDefault).not.toHaveBeenCalled()
	})

	it('guard blocks a submit while waiting or when `when` is true', () => {
		const { result } = setup()
		const when = submitEvent(), waiting = submitEvent()

		result.current.guard(when, { when: true })
		act(() => result.current.startWait())
		result.current.guard(waiting)

		expect(when.preventDefault).toHaveBeenCalledTimes(1)
		expect(waiting.preventDefault).toHaveBeenCalledTimes(1)
	})

	it('guard lets a submit through again once the wait stops', () => {
		const { result } = setup()
		const event = submitEvent()

		act(() => result.current.startWait())
		act(() => result.current.stopWait())
		result.current.guard(event)

		expect(event.preventDefault).not.toHaveBeenCalled()
	})
})
