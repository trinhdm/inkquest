import '@testing-library/jest-dom'

// jsdom has no `IntersectionObserver`. Several components in
// `src/components/data/` and `src/components/layout/Group` call
// framer-motion's `useInView` (or `inView(...)`) unconditionally in an
// effect on mount, which constructs `new IntersectionObserver(...)`
// directly — with no polyfill that throws a ReferenceError inside the
// effect and fails the render. This stub never fires an intersection
// (its `observe` is a no-op), so any "in view" state driven by it settles
// to `false` deterministically — tests that need `true` should pass an
// explicit `withinView` prop instead of relying on a real observer firing.
class IntersectionObserverMock implements IntersectionObserver {
	readonly root: Element | Document | null = null
	readonly rootMargin: string = ''
	readonly thresholds: ReadonlyArray<number> = []
	observe = jest.fn()
	unobserve = jest.fn()
	disconnect = jest.fn()
	takeRecords = jest.fn((): IntersectionObserverEntry[] => [])
}

Object.defineProperty(window, 'IntersectionObserver', {
	writable: true,
	configurable: true,
	value: IntersectionObserverMock,
})
Object.defineProperty(global, 'IntersectionObserver', {
	writable: true,
	configurable: true,
	value: IntersectionObserverMock,
})
