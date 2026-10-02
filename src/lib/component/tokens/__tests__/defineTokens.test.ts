import { defineTokens } from '../defineTokens'

// Correction to the assumed contract: defineTokens does NOT touch the DOM or
// emit CSS custom properties. Reading the source, it is a pure identity
// function —
//   export const defineTokens = (settings) => settings
// — whose entire purpose is to let a component author write a `cssVars`
// callback and have TypeScript infer/narrow its prop, tokens, and ctx generic
// parameters through `ThemeCSSConfig`, with zero runtime transformation. The
// actual DOM/CSS-custom-property emission for `:root, :host` lives in
// src/components/document/StyleInliner/resolver.ts (standardizeRules /
// resolveStyles), which is out of this batch's scope. There is nothing to
// assert here beyond "it returns exactly what it was given."

describe('defineTokens', () => {
	it('returns the exact same function reference it was given (pure passthrough, no wrapping)', () => {
		const settings = (_theme: unknown, _props: object, _ctx: unknown) => ({})
		expect(defineTokens(settings)).toBe(settings)
	})

	it('does not touch the document at all', () => {
		const before = document.documentElement.outerHTML
		defineTokens(() => ({ '--foo': 'bar' }))
		expect(document.documentElement.outerHTML).toBe(before)
	})
})
