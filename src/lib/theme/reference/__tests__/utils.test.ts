import { aliasVar, baseVar, createAccessor, createStateAccessor, createValueRef } from '../utils'

describe('baseVar', () => {
	it('builds an unprefixed var() reference from path segments', () => {
		expect(baseVar('ink', '300')).toBe('var(--ink-300)')
	})

	it('kebab-cases the first path segment (via formatToken)', () => {
		expect(baseVar('fontSize', '16')).toBe('var(--font-size-16)')
	})
})

describe('aliasVar', () => {
	it('builds a var() reference prefixed with the app-wide token prefix', () => {
		expect(aliasVar('accent')).toBe('var(--inkq-accent)')
	})

	it('prefixes multi-segment paths the same way', () => {
		expect(aliasVar('color', 'text')).toBe('var(--inkq-color-text)')
	})
})

describe('createAccessor', () => {
	it('curries a category prefix in front of whatever path is supplied at call time', () => {
		const radius = createAccessor(baseVar, 'radius')
		expect(radius('01')).toBe('var(--radius-01)')
	})

	it('supports a multi-segment category', () => {
		const danger = createAccessor(aliasVar, 'color', 'danger')
		expect(danger('shade')).toBe('var(--inkq-color-danger-shade)')
	})
})

describe('createStateAccessor', () => {
	it('resolves to the bare category when called with no path (the "base" state)', () => {
		const border = createStateAccessor(aliasVar, 'border')
		expect(border()).toBe('var(--inkq-border)')
	})

	it('resolves to category + state when a path segment is supplied', () => {
		const border = createStateAccessor(aliasVar, 'border')
		expect(border('strong')).toBe('var(--inkq-border-strong)')
	})
})

describe('createValueRef', () => {
	it('produces a zero-argument accessor for a fixed, fully-qualified path', () => {
		const page = createValueRef(aliasVar, 'background', 'page')
		expect(page()).toBe('var(--inkq-background-page)')
	})
})
