import { hasInjectVariant, markInjectVariant, resetVariantStyles } from '../variantsRegistry'

describe('variant styles registry', () => {
	afterEach(() => {
		resetVariantStyles()
		document.body.innerHTML = ''
		jest.restoreAllMocks()
	})

	it('returns false for a name that was never marked and has no matching DOM node', () => {
		expect(hasInjectVariant('Registry.Unmarked')).toBe(false)
	})

	it('returns true once a name has been explicitly marked as injected', () => {
		markInjectVariant('Registry.Marked')

		expect(hasInjectVariant('Registry.Marked')).toBe(true)
	})

	it('probes the DOM for a `[data-target-vars="<name>"]` node when not already marked', () => {
		const node = document.createElement('style')
		node.setAttribute('data-target-vars', 'Registry.DomProbe')
		document.body.appendChild(node)

		expect(hasInjectVariant('Registry.DomProbe')).toBe(true)
	})

	it('memoizes a successful DOM probe: only queries the DOM once for repeat calls', () => {
		const node = document.createElement('style')
		node.setAttribute('data-target-vars', 'Registry.Memoized')
		document.body.appendChild(node)

		const querySpy = jest.spyOn(document, 'querySelector')

		expect(hasInjectVariant('Registry.Memoized')).toBe(true)
		expect(querySpy).toHaveBeenCalledTimes(1)

		// Remove the node from the DOM entirely — a real, un-memoized probe
		// would now find nothing and return `false`.
		node.remove()

		expect(hasInjectVariant('Registry.Memoized')).toBe(true)
		// No additional DOM query — the in-memory flag short-circuits it.
		expect(querySpy).toHaveBeenCalledTimes(1)
	})

	it('re-queries the DOM on every call while the probe keeps missing', () => {
		const querySpy = jest.spyOn(document, 'querySelector')

		expect(hasInjectVariant('Registry.NeverInjected')).toBe(false)
		expect(hasInjectVariant('Registry.NeverInjected')).toBe(false)

		expect(querySpy).toHaveBeenCalledTimes(2)
	})

	it('reset(name) clears only that name, leaving other marked names and forcing a fresh DOM probe', () => {
		markInjectVariant('Registry.KeepMarked')
		markInjectVariant('Registry.ToReset')

		resetVariantStyles('Registry.ToReset')

		expect(hasInjectVariant('Registry.KeepMarked')).toBe(true)
		expect(hasInjectVariant('Registry.ToReset')).toBe(false)
	})

	it('returns false without probing the DOM when `document` is undefined (SSR guard)', () => {
		const originalDescriptor = Object.getOwnPropertyDescriptor(global, 'document')!
		const querySpy = jest.spyOn(document, 'querySelector')
		Object.defineProperty(global, 'document', { value: undefined, configurable: true })

		try {
			expect(hasInjectVariant('Registry.SSR')).toBe(false)
			expect(querySpy).not.toHaveBeenCalled()
		} finally {
			Object.defineProperty(global, 'document', originalDescriptor)
		}
	})

	it('reset() with no name clears every marked name', () => {
		markInjectVariant('Registry.A')
		markInjectVariant('Registry.B')

		resetVariantStyles()

		expect(hasInjectVariant('Registry.A')).toBe(false)
		expect(hasInjectVariant('Registry.B')).toBe(false)
	})
})
