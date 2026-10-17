import { apiTokens } from '../api'
import { tokens } from '../index'
import { aliasTokens } from '../semantic'

// api.ts is the narrowed, component-facing view over aliasVar. These tests
// check the wiring (prefixed references, correct category segments) and that
// it re-exports semantic accessors rather than rebuilding them.

describe('apiTokens', () => {
	it('is the same object the barrel exposes as `tokens`', () => {
		expect(tokens).toBe(apiTokens)
	})

	it('re-exports the semantic space/fontSize/letterSpacing accessors by identity', () => {
		expect(apiTokens.space).toBe(aliasTokens.space)
		expect(apiTokens.fontSize).toBe(aliasTokens.fontSize)
		expect(apiTokens.letterSpacing).toBe(aliasTokens.letterSpacing)
	})

	describe('presets.text', () => {
		it.each([1, 2, 3, 4, 5, 6])('exposes a zero-argument h%i accessor', (n) => {
			const key = `h${n}` as 'h1'
			expect(apiTokens.presets.text[key]()).toBe(`var(--inkq-text-h${n})`)
		})

		it.each(['body', 'label', 'control', 'navigation', 'prose'] as const)(
			'resolves %s to its single prefixed reference',
			(name) => {
				expect(apiTokens.presets.text[name]()).toBe(`var(--inkq-text-${name})`)
			}
		)

		it('resolves nested presets (section, caption) with and without a sub-path', () => {
			expect(apiTokens.presets.text.eyebrow()).toBe('var(--inkq-text-eyebrow)')
			expect(apiTokens.presets.text.caption()).toBe('var(--inkq-text-caption)')
			expect(apiTokens.presets.text.caption('image')).toBe('var(--inkq-text-caption-image)')
		})
	})

	it('resolves the motion presets by name', () => {
		expect(apiTokens.presets.motion('box')).toBe('var(--inkq-motion-box)')
		expect(apiTokens.presets.motion('colors')).toBe('var(--inkq-motion-colors)')
	})

	it('resolves component element tokens under their own category', () => {
		expect(apiTokens.el.icon.size('md')).toBe('var(--inkq-icon-md)')
		expect(apiTokens.el.field.padding('sm')).toBe('var(--inkq-field-padding-sm)')
	})

	it('resolves padding under the short `pad` segment', () => {
		expect(apiTokens.padding('block')).toBe('var(--inkq-pad-block)')
	})

	it('does not leak primitive (unprefixed) references', () => {
		expect(apiTokens.presets.text.h1()).not.toMatch(/^var\(--(?!inkq-)/)
		expect(apiTokens.padding('chip')).toMatch(/^var\(--inkq-/)
	})
})
