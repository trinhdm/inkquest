import { act, renderHook } from '@testing-library/react'
import { useActiveID } from '../useActiveID'

const IDS = ['overview', 'data', 'cookies']

let fire: IntersectionObserverCallback
const disconnectSpy = jest.fn()

class SpyObserver {
	constructor(callback: IntersectionObserverCallback) {
		fire = callback
	}

	observe = jest.fn()
	disconnect = disconnectSpy
}

const entry = (id: string, isIntersecting: boolean) =>
	({ isIntersecting, target: document.getElementById(id) }) as unknown as IntersectionObserverEntry

const report = (...entries: IntersectionObserverEntry[]) =>
	act(() => fire(entries, {} as IntersectionObserver))

describe('useActiveID', () => {
	const original = window.IntersectionObserver

	beforeEach(() => {
		IDS.forEach(id => {
			const section = document.createElement('section')
			section.id = id
			document.body.appendChild(section)
		})
		window.IntersectionObserver = SpyObserver as unknown as typeof IntersectionObserver
	})

	afterEach(() => {
		window.IntersectionObserver = original
		document.body.innerHTML = ''
		disconnectSpy.mockClear()
	})

	it('starts on the first id', () => {
		const { result } = renderHook(() => useActiveID(IDS))
		expect(result.current).toBe('overview')
	})

	it('switches to the section crossing the line', () => {
		const { result } = renderHook(() => useActiveID(IDS))
		report(entry('cookies', true))
		expect(result.current).toBe('cookies')
	})

	it('picks the first section in page order when two cross the line', () => {
		const { result } = renderHook(() => useActiveID(IDS))
		report(entry('cookies', true), entry('data', true))
		expect(result.current).toBe('data')
	})

	it('keeps the last active id when every section leaves the line', () => {
		const { result } = renderHook(() => useActiveID(IDS))
		report(entry('data', true))
		report(entry('data', false))
		expect(result.current).toBe('data')
	})

	it('disconnects the observer on unmount', () => {
		const { unmount } = renderHook(() => useActiveID(IDS))
		unmount()
		expect(disconnectSpy).toHaveBeenCalledTimes(1)
	})
})
