import { defineTokens } from '../defineTokens'

// defineTokens does NOT touch the DOM or emit CSS custom properties. It is a
// curried identity function —
//   export const defineTokens = <S>() => <R>(settings) => settings as TokensConfig<S>
// — whose entire purpose is type-level. The first call carries the component's
// spec; the second infers the shape the callback actually returns, which is
// what lets TypeScript reject a token variable the spec never declared. See
// factory/types/specs.test-d.ts for the assertions on that contract.
//
// The actual DOM/CSS-custom-property emission for `:root, :host` lives in
// src/components/document/StyleInliner/resolver.ts (standardizeRules /
// resolveStyles), which is out of this batch's scope. There is nothing to
// assert here beyond "it hands back exactly what it was given, and calls it
// with exactly what it was passed."

interface TestSpecs {
	props: { size?: 'sm' | 'md' }
	selectors: 'root'
	tokens: { root: '--test-gap' }
}

describe('defineTokens', () => {
	it('returns the exact same function reference it was given (pure passthrough, no wrapping)', () => {
		const settings = () => ({ root: { '--test-gap': '1rem' } })
		expect(defineTokens<TestSpecs>()(settings)).toBe(settings)
	})

	it('forwards context, props and theme through to the callback unchanged', () => {
		// getStyle calls the returned function with exactly this object, so the
		// identity above is only useful if the arguments survive the round trip.
		const settings = jest.fn(() => ({ root: { '--test-gap': '1rem' } }))
		const args = {
			context: undefined,
			props: { size: 'sm' } as const,
			theme: { el: {} } as never,
		}

		const tokens = defineTokens<TestSpecs>()(settings)
		const result = tokens(args)

		expect(settings).toHaveBeenCalledTimes(1)
		expect(settings).toHaveBeenCalledWith(args)
		expect(result).toEqual({ root: { '--test-gap': '1rem' } })
	})

	it('does not touch the document at all', () => {
		const before = document.documentElement.outerHTML
		defineTokens<TestSpecs>()(() => ({ root: { '--test-gap': '1rem' } }))
		expect(document.documentElement.outerHTML).toBe(before)
	})
})
