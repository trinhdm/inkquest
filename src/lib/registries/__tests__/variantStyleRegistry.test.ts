import { hasInjectedVariantStyles, markVariantStylesInjected, resetVariantStyles } from '../variantStyleRegistry'

describe('variantStyleRegistry', () => {
	afterEach(() => {
		resetVariantStyles()
		document.body.innerHTML = ''
		jest.restoreAllMocks()
	})

	it('returns false for a name that was never marked and has no matching DOM node', () => {
		expect(hasInjectedVariantStyles('Registry.Unmarked')).toBe(false)
	})

	it('returns true once a name has been explicitly marked as injected', () => {
		markVariantStylesInjected('Registry.Marked')

		expect(hasInjectedVariantStyles('Registry.Marked')).toBe(true)
	})

	it('probes the DOM for a `[data-target-vars="<name>"]` node when not already marked', () => {
		const node = document.createElement('style')
		node.setAttribute('data-target-vars', 'Registry.DomProbe')
		document.body.appendChild(node)

		expect(hasInjectedVariantStyles('Registry.DomProbe')).toBe(true)
	})

	it('memoizes a successful DOM probe: only queries the DOM once for repeat calls', () => {
		const node = document.createElement('style')
		node.setAttribute('data-target-vars', 'Registry.Memoized')
		document.body.appendChild(node)

		const querySpy = jest.spyOn(document, 'querySelector')

		expect(hasInjectedVariantStyles('Registry.Memoized')).toBe(true)
		expect(querySpy).toHaveBeenCalledTimes(1)

		// Remove the node from the DOM entirely — a real, un-memoized probe
		// would now find nothing and return `false`.
		node.remove()

		expect(hasInjectedVariantStyles('Registry.Memoized')).toBe(true)
		// No additional DOM query — the in-memory flag short-circuits it.
		expect(querySpy).toHaveBeenCalledTimes(1)
	})

	it('re-queries the DOM on every call while the probe keeps missing', () => {
		const querySpy = jest.spyOn(document, 'querySelector')

		expect(hasInjectedVariantStyles('Registry.NeverInjected')).toBe(false)
		expect(hasInjectedVariantStyles('Registry.NeverInjected')).toBe(false)

		expect(querySpy).toHaveBeenCalledTimes(2)
	})

	it('reset(name) clears only that name, leaving other marked names and forcing a fresh DOM probe', () => {
		markVariantStylesInjected('Registry.KeepMarked')
		markVariantStylesInjected('Registry.ToReset')

		resetVariantStyles('Registry.ToReset')

		expect(hasInjectedVariantStyles('Registry.KeepMarked')).toBe(true)
		expect(hasInjectedVariantStyles('Registry.ToReset')).toBe(false)
	})

	it('reset() with no name clears every marked name', () => {
		markVariantStylesInjected('Registry.A')
		markVariantStylesInjected('Registry.B')

		resetVariantStyles()

		expect(hasInjectedVariantStyles('Registry.A')).toBe(false)
		expect(hasInjectedVariantStyles('Registry.B')).toBe(false)
	})
})
