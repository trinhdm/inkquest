import { renderHook } from '@testing-library/react'
import { useRef } from 'react'
import { useOutsideClick } from '../useOutsideClick'

const setup = (callback: (...args: any[]) => any) =>
	renderHook(({ cb }) => {
		const ref = useRef<HTMLDivElement | null>(null)
		useOutsideClick(ref, cb)
		return ref
	}, { initialProps: { cb: callback } })

describe('useOutsideClick', () => {
	let container: HTMLDivElement
	let inside: HTMLButtonElement
	let outside: HTMLButtonElement

	beforeEach(() => {
		container = document.createElement('div')
		inside = document.createElement('button')
		container.appendChild(inside)
		outside = document.createElement('button')
		document.body.appendChild(container)
		document.body.appendChild(outside)
	})

	afterEach(() => {
		document.body.innerHTML = ''
	})

	it('calls the callback on a mousedown outside the ref element', () => {
		const callback = jest.fn()
		const { result } = setup(callback)
		result.current.current = container

		outside.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }))

		expect(callback).toHaveBeenCalledTimes(1)
	})

	it('calls the callback on a touchstart outside the ref element', () => {
		const callback = jest.fn()
		const { result } = setup(callback)
		result.current.current = container

		outside.dispatchEvent(new TouchEvent('touchstart', { bubbles: true }))

		expect(callback).toHaveBeenCalledTimes(1)
	})

	it('does not call the callback for a click inside the ref element', () => {
		const callback = jest.fn()
		const { result } = setup(callback)
		result.current.current = container

		inside.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }))

		expect(callback).not.toHaveBeenCalled()
	})

	it('does not call the callback for a click on the boundary element itself', () => {
		const callback = jest.fn()
		const { result } = setup(callback)
		result.current.current = container

		container.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }))

		expect(callback).not.toHaveBeenCalled()
	})

	it('does nothing when the ref has not yet been attached to a node', () => {
		const callback = jest.fn()
		setup(callback)
		// result.current.current is left as null (never attached)

		outside.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }))

		expect(callback).not.toHaveBeenCalled()
	})

	it('attaches exactly one mousedown and one touchstart listener on mount', () => {
		const addSpy = jest.spyOn(document, 'addEventListener')
		setup(jest.fn())

		const mousedownCalls = addSpy.mock.calls.filter(([type]) => type === 'mousedown')
		const touchstartCalls = addSpy.mock.calls.filter(([type]) => type === 'touchstart')

		expect(mousedownCalls).toHaveLength(1)
		expect(touchstartCalls).toHaveLength(1)

		addSpy.mockRestore()
	})

	it('removes both listeners on unmount', () => {
		const removeSpy = jest.spyOn(document, 'removeEventListener')
		const { unmount } = setup(jest.fn())

		unmount()

		const removedTypes = removeSpy.mock.calls.map(([type]) => type)
		expect(removedTypes).toEqual(expect.arrayContaining(['mousedown', 'touchstart']))

		removeSpy.mockRestore()
	})

	it('does not re-attach listeners when only the callback identity changes (same ref)', () => {
		const addSpy = jest.spyOn(document, 'addEventListener')
		const { rerender } = setup(jest.fn())

		addSpy.mockClear()
		rerender({ cb: jest.fn() })

		expect(addSpy).not.toHaveBeenCalled()

		addSpy.mockRestore()
	})

	it('always invokes the latest callback after repeated open/close (callback re-renders)', () => {
		const firstCallback = jest.fn()
		const secondCallback = jest.fn()
		const { result, rerender } = setup(firstCallback)
		result.current.current = container

		rerender({ cb: secondCallback })

		outside.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }))

		expect(firstCallback).not.toHaveBeenCalled()
		expect(secondCallback).toHaveBeenCalledTimes(1)
	})

	it('handles repeated outside clicks across multiple dispatches', () => {
		const callback = jest.fn()
		const { result } = setup(callback)
		result.current.current = container

		outside.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }))
		outside.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }))
		outside.dispatchEvent(new TouchEvent('touchstart', { bubbles: true }))

		expect(callback).toHaveBeenCalledTimes(3)
	})
})
