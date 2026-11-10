import { act, cleanup, renderHook } from '@testing-library/react'
import { useActiveID } from '../useActiveID'

const IDS = ['overview', 'data', 'cookies']

//	the spy's line sits 20% of the way down the viewport
const lineY = () => window.innerHeight * .2

let tops: Record<string, number>
let observers: SpyObserver[]

class SpyObserver {
	observe = jest.fn()
	disconnect = jest.fn()

	constructor(public callback: IntersectionObserverCallback, public options?: IntersectionObserverInit) {
		observers.push(this)
	}
}

//	the observer's own entries are ignored by the hook, which re-reads every rect
const crossLine = () => act(() => {
	const observer = observers[observers.length - 1]
	observer.callback([], observer as unknown as IntersectionObserver)
})

//	jsdom lays nothing out, so each section reports the top the test gives it
const layOut = (next: Record<string, number>) => { tops = { ...tops, ...next } }

const setScrollY = (value: number) =>
	Object.defineProperty(window, 'scrollY', { configurable: true, value, writable: true })

const setHash = (id: string) => window.history.replaceState(null, '', `#${ id }`)

//	runs queued animation frames by hand so a test can change the page between them
let frames: FrameRequestCallback[]
const flushFrames = () => act(() => {
	while (frames.length) frames.shift()!(0)
})

describe('useActiveID', () => {
	const original = window.IntersectionObserver
	const hadScrollEnd = 'onscrollend' in window

	beforeEach(() => {
		IDS.forEach(id => {
			const section = document.createElement('section')
			section.id = id
			section.getBoundingClientRect = () => ({ top: tops[id] ?? 0 }) as DOMRect
			document.body.appendChild(section)
		})

		observers = []
		frames = []
		//	overview is at the line; the others are further down the page
		tops = { overview: 0, data: 500, cookies: 900 }

		window.IntersectionObserver = SpyObserver as unknown as typeof IntersectionObserver
		jest.spyOn(window, 'requestAnimationFrame').mockImplementation(cb => frames.push(cb))

		//	jsdom has no `scrollend`; the hook only holds a clicked target when it exists
		if (!hadScrollEnd) Object.defineProperty(window, 'onscrollend', { configurable: true, value: null })
	})

	afterEach(() => {
		//	unmount first: RTL's own cleanup runs after this block, so an unmount
		//	left until then would bleed its `disconnect` into the next test
		cleanup()
		jest.restoreAllMocks()
		window.IntersectionObserver = original
		document.body.innerHTML = ''
		window.history.replaceState(null, '', window.location.pathname)
		setScrollY(0)
		if (!hadScrollEnd) delete (window as { onscrollend?: unknown }).onscrollend
	})

	describe('scroll spy', () => {
		it('starts on the first id', () => {
			const { result } = renderHook(() => useActiveID(IDS))
			expect(result.current[0]).toBe('overview')
		})

		it('watches every section with a 1%-tall band at the spy line', () => {
			renderHook(() => useActiveID(IDS))

			expect(observers).toHaveLength(1)
			expect(observers[0].observe).toHaveBeenCalledTimes(IDS.length)
			expect(observers[0].options?.rootMargin).toBe('-20% 0px -79% 0px')
		})

		it('switches to the last section whose top has passed the line', () => {
			const { result } = renderHook(() => useActiveID(IDS))

			layOut({ overview: -700, data: lineY() - 1, cookies: lineY() + 1 })
			crossLine()

			expect(result.current[0]).toBe('data')
		})

		it('counts a section sitting exactly on the line as passed', () => {
			const { result } = renderHook(() => useActiveID(IDS))

			layOut({ data: lineY() })
			crossLine()

			expect(result.current[0]).toBe('data')
		})

		it('falls back to the first id when every section is still below the line', () => {
			const { result } = renderHook(() => useActiveID(IDS))
			layOut({ data: 500 })
			crossLine()
			expect(result.current[0]).toBe('overview')

			layOut({ overview: 400, data: 600, cookies: 900 })
			crossLine()
			expect(result.current[0]).toBe('overview')
		})

		it('follows the page back up as well as down', () => {
			const { result } = renderHook(() => useActiveID(IDS))

			layOut({ overview: -900, data: -400, cookies: 0 })
			crossLine()
			expect(result.current[0]).toBe('cookies')

			layOut({ overview: -100, data: 400, cookies: 900 })
			crossLine()
			expect(result.current[0]).toBe('overview')
		})

		it('skips ids with no element on the page', () => {
			const { result } = renderHook(() => useActiveID(['ghost', ...IDS]))

			layOut({ overview: -700, data: 0, cookies: 400 })
			crossLine()

			expect(result.current[0]).toBe('data')
			expect(observers[0].observe).toHaveBeenCalledTimes(IDS.length)
		})

		it('does not build an observer when none of the ids exist', () => {
			const { result } = renderHook(() => useActiveID(['ghost']))

			expect(observers).toHaveLength(0)
			expect(result.current[0]).toBe('ghost')
		})

		it('re-subscribes to the new list when the ids change', () => {
			const extra = document.createElement('section')
			extra.id = 'extra'
			extra.getBoundingClientRect = () => ({ top: tops.extra ?? 900 }) as DOMRect
			document.body.appendChild(extra)

			const { result, rerender } = renderHook(({ ids }) => useActiveID(ids), {
				initialProps: { ids: IDS },
			})
			const [first] = observers

			rerender({ ids: ['data', 'extra'] })

			expect(first.disconnect).toHaveBeenCalledTimes(1)
			expect(observers).toHaveLength(2)
			expect(observers[1].observe).toHaveBeenCalledTimes(2)

			//	overview is no longer tracked, so only the new list decides the active id
			layOut({ overview: 0, data: -300, extra: 0 })
			crossLine()
			expect(result.current[0]).toBe('extra')

			layOut({ data: 600, extra: 900 })
			crossLine()
			expect(result.current[0]).toBe('data')
		})

		it('disconnects the observer on unmount', () => {
			const { unmount } = renderHook(() => useActiveID(IDS))
			const [observer] = observers

			expect(observer.disconnect).not.toHaveBeenCalled()
			unmount()
			expect(observer.disconnect).toHaveBeenCalledTimes(1)
		})

		it('stops listening for scrollend and popstate on unmount', () => {
			const remove = jest.spyOn(window, 'removeEventListener')
			const { unmount } = renderHook(() => useActiveID(IDS))

			unmount()

			const removed = remove.mock.calls.map(([type]) => type)
			expect(removed).toEqual(expect.arrayContaining(['scrollend', 'popstate']))
		})
	})

	describe('travelTo', () => {
		it('jumps to the id straight away', () => {
			const { result } = renderHook(() => useActiveID(IDS))

			act(() => result.current[1]('cookies'))

			expect(result.current[0]).toBe('cookies')
		})

		it('holds the target while the spy still reads an earlier section', () => {
			const { result } = renderHook(() => useActiveID(IDS))
			act(() => result.current[1]('cookies'))

			//	the page is mid-glide: data is the section at the line
			layOut({ overview: -700, data: 0, cookies: 400 })
			crossLine()

			expect(result.current[0]).toBe('cookies')
		})

		it('releases the hold once the page arrives, so the spy leads again', () => {
			const { result } = renderHook(() => useActiveID(IDS))
			act(() => result.current[1]('cookies'))

			layOut({ overview: -900, data: -400, cookies: 0 })
			crossLine()
			expect(result.current[0]).toBe('cookies')

			//	the reader scrolls back up: a released hold no longer pins cookies
			layOut({ overview: -100, data: 400, cookies: 900 })
			crossLine()
			expect(result.current[0]).toBe('overview')
		})

		it('does not hold an id the page is already showing', () => {
			const { result } = renderHook(() => useActiveID(IDS))
			layOut({ overview: -700, data: 0, cookies: 400 })
			crossLine()
			expect(result.current[0]).toBe('data')

			act(() => result.current[1]('data'))
			layOut({ overview: -100, data: 400, cookies: 900 })
			crossLine()

			expect(result.current[0]).toBe('overview')
		})

		it('does not hold anything where the browser has no scrollend event', () => {
			delete (window as { onscrollend?: unknown }).onscrollend
			const { result } = renderHook(() => useActiveID(IDS))
			act(() => result.current[1]('cookies'))
			expect(result.current[0]).toBe('cookies')

			crossLine()

			expect(result.current[0]).toBe('overview')
		})
	})

	describe('scrollend', () => {
		const settle = () => act(() => { window.dispatchEvent(new Event('scrollend')) })

		//	the page is not at the bottom, so a target below the line has simply fallen short
		const midPage = () => Object.defineProperty(document.documentElement, 'scrollHeight', { configurable: true, value: 5000 })

		afterEach(() => {
			delete (document.documentElement as { scrollHeight?: unknown }).scrollHeight
		})

		it('does nothing when no travel is in flight', () => {
			const { result } = renderHook(() => useActiveID(IDS))

			settle()

			expect(frames).toHaveLength(0)
			expect(result.current[0]).toBe('overview')
		})

		it('ignores a scroll that ended before the URL hash moved to the target', () => {
			midPage()
			const { result } = renderHook(() => useActiveID(IDS))
			act(() => result.current[1]('cookies'))
			setHash('data')

			settle()

			expect(frames).toHaveLength(0)
			expect(result.current[0]).toBe('cookies')
		})

		it('hands control back to the spy when the page rests short of the target', () => {
			midPage()
			const { result } = renderHook(() => useActiveID(IDS))
			act(() => result.current[1]('cookies'))
			setHash('cookies')
			layOut({ overview: -700, data: 0, cookies: 400 })

			settle()
			//	waits two frames before judging that the page has stopped
			expect(result.current[0]).toBe('cookies')
			flushFrames()
			flushFrames()

			expect(result.current[0]).toBe('data')
		})

		it('keeps the target when the page is at the bottom and cannot scroll it to the line', () => {
			const { result } = renderHook(() => useActiveID(IDS))
			act(() => result.current[1]('cookies'))
			setHash('cookies')
			layOut({ overview: -700, data: 0, cookies: 400 })
			//	jsdom reports a 0px-tall document, so the page counts as scrolled to the end

			settle()
			flushFrames()
			flushFrames()

			expect(result.current[0]).toBe('cookies')
		})

		it('stays put when the reader is still scrolling by the time the frames land', () => {
			midPage()
			const { result } = renderHook(() => useActiveID(IDS))
			act(() => result.current[1]('cookies'))
			setHash('cookies')
			layOut({ overview: -700, data: 0, cookies: 400 })

			settle()
			setScrollY(120)
			flushFrames()
			flushFrames()

			expect(result.current[0]).toBe('cookies')
		})

		it('releases the hold after resting, so later scrolling is followed', () => {
			midPage()
			const { result } = renderHook(() => useActiveID(IDS))
			act(() => result.current[1]('cookies'))
			setHash('cookies')
			layOut({ overview: -700, data: 0, cookies: 400 })
			settle()
			flushFrames()
			flushFrames()

			layOut({ overview: -100, data: 400, cookies: 900 })
			crossLine()

			expect(result.current[0]).toBe('overview')
		})
	})

	describe('popstate', () => {
		it('drops the hold and follows wherever the browser left the page', () => {
			const { result } = renderHook(() => useActiveID(IDS))
			act(() => result.current[1]('cookies'))
			layOut({ overview: -700, data: 0, cookies: 400 })

			act(() => { window.dispatchEvent(new PopStateEvent('popstate')) })

			expect(result.current[0]).toBe('data')
		})

		it('lets the spy lead afterwards instead of resuming the old hold', () => {
			const { result } = renderHook(() => useActiveID(IDS))
			act(() => result.current[1]('cookies'))
			layOut({ overview: -700, data: 0, cookies: 400 })
			act(() => { window.dispatchEvent(new PopStateEvent('popstate')) })

			layOut({ overview: 0, data: 500 })
			crossLine()

			expect(result.current[0]).toBe('overview')
		})
	})
})
