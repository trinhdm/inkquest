import { act, renderHook } from '@testing-library/react'
import { useReducedMotion } from 'framer-motion'
import { useReveal } from '../useReveal'
import { REVEAL_DATAKEYS } from '../helpers'

// `useReveal` composes `useReplayInView`, which (per its own suite) settles
// deterministically to `false` under the `IntersectionObserver` stub in
// `jest.setup.ts`. Every test here drives the visible/hidden path explicitly
// via `withinView`, which pins the state and bypasses the observer entirely —
// exactly the escape hatch the source comments describe.
jest.mock('framer-motion', () => {
	const actual = jest.requireActual('framer-motion')
	return {
		...actual,
		useReducedMotion: jest.fn(() => false),
	}
})

const mockUseReducedMotion = useReducedMotion as jest.Mock

describe('useReveal', () => {
	afterEach(() => {
		jest.clearAllMocks()
		mockUseReducedMotion.mockReturnValue(false)
	})

	it('is not visible while animated and pinned out of view (withinView: false)', () => {
		const { result } = renderHook(() => useReveal({ withinView: false }))
		expect(result.current.visible).toBe(false)
	})

	it('is visible once pinned in view (withinView: true)', () => {
		const { result } = renderHook(() => useReveal({ withinView: true }))
		expect(result.current.visible).toBe(true)
	})

	it('is always visible when animated is false, regardless of view state', () => {
		const { result } = renderHook(() => useReveal({ animated: false, withinView: false }))
		expect(result.current.visible).toBe(true)
	})

	// no `withinView` here: it pins the state outright and would short-circuit
	// the `reducedMotion` check entirely (`withinView ?? (reducedMotion || inView)`)
	it('is always visible when reduced motion is preferred, deferring to it since withinView is not pinned', () => {
		mockUseReducedMotion.mockReturnValue(true)
		const { result } = renderHook(() => useReveal())
		expect(result.current.visible).toBe(true)
	})

	it('is always visible when `unstyled` is set, since animation is suppressed', () => {
		const { result } = renderHook(() => useReveal({ unstyled: true, withinView: false }))
		expect(result.current.visible).toBe(true)
	})

	describe('others (reveal root data attributes)', () => {
		it('marks the root with the base reveal attribute while animated', () => {
			const { result } = renderHook(() => useReveal({ withinView: false }))
			expect(result.current.others).toHaveProperty(REVEAL_DATAKEYS.root.base, '')
		})

		it('marks the root as actively revealing while visible and not yet settled', () => {
			const { result } = renderHook(() => useReveal({ withinView: true }))
			expect(result.current.others).toHaveProperty(REVEAL_DATAKEYS.root.active, '')
			expect(result.current.others).not.toHaveProperty(REVEAL_DATAKEYS.root.settled)
		})

		it('does not mark the root as revealing while hidden', () => {
			const { result } = renderHook(() => useReveal({ withinView: false }))
			expect(result.current.others).not.toHaveProperty(REVEAL_DATAKEYS.root.active)
		})

		it('renders no reveal data attributes at all when animated is false', () => {
			const { result } = renderHook(() => useReveal({ animated: false, withinView: true }))
			expect(result.current.others).toEqual({})
		})
	})

	describe('item()', () => {
		it('returns a reveal data attribute keyed to the given index while animated', () => {
			const { result } = renderHook(() => useReveal({ withinView: true }))
			expect(result.current.item(2)).toEqual({ [REVEAL_DATAKEYS.child]: '2' })
		})

		it('returns an empty object when animated is false', () => {
			const { result } = renderHook(() => useReveal({ animated: false, withinView: true }))
			expect(result.current.item(2)).toEqual({})
		})

		it('reflects index 0 as "0", not an omitted/falsy attribute', () => {
			const { result } = renderHook(() => useReveal({ withinView: true }))
			expect(result.current.item(0)).toEqual({ [REVEAL_DATAKEYS.child]: '0' })
		})
	})

	describe('reveal() counter', () => {
		it('hands out sequential indices from next() on each call', () => {
			const { result } = renderHook(() => useReveal({ withinView: true }))
			const counter = result.current.reveal()

			expect(counter.next()).toEqual({ [REVEAL_DATAKEYS.child]: '0' })
			expect(counter.next()).toEqual({ [REVEAL_DATAKEYS.child]: '1' })
		})

		it('reserve() returns the current index and advances by `total`, so a later next() picks up after it', () => {
			const { result } = renderHook(() => useReveal({ withinView: true }))
			const counter = result.current.reveal()

			expect(counter.reserve(2)).toBe(0)
			expect(counter.next()).toEqual({ [REVEAL_DATAKEYS.child]: '2' })
		})

		it('reserve() returns undefined and does not advance when not animated', () => {
			const { result } = renderHook(() => useReveal({ animated: false, withinView: true }))
			const counter = result.current.reveal()

			expect(counter.reserve(3)).toBeUndefined()
			expect(counter.next()).toEqual({})
		})

		it('hands back a fresh counter (starting at 0) on every call to reveal()', () => {
			const { result } = renderHook(() => useReveal({ withinView: true }))

			const first = result.current.reveal()
			first.next()
			first.next()

			const second = result.current.reveal()
			expect(second.next()).toEqual({ [REVEAL_DATAKEYS.child]: '0' })
		})
	})

	it('exposes a ref object for the caller to attach to its root element', () => {
		const { result } = renderHook(() => useReveal({ withinView: true }))
		expect(result.current.ref).toHaveProperty('current')
	})

	it('does not settle (data-revealed) when the ref is never attached to a real element', async () => {
		const { result } = renderHook(() => useReveal({ withinView: true }))

		await act(async () => {
			await new Promise(resolve => requestAnimationFrame(resolve))
		})

		expect(result.current.others).not.toHaveProperty(REVEAL_DATAKEYS.root.settled)
	})
})
