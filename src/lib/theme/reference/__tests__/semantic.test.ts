import { aliasTokens, semanticTokens } from '../semantic'

// Same "wiring, not restatement" posture as primitive.test.ts: verify the
// catalog is built from the app-wide prefixed accessor (aliasVar) and that
// aliasTokens is a real composition of three sub-groups with no key
// collisions, not that every leaf's exact string matches a hand-copied list.

describe('semanticTokens', () => {
	it('builds prefixed references (uses aliasVar, not baseVar)', () => {
		expect(semanticTokens.background.page()).toBe('var(--inkq-background-page)')
	})

	it('resolves an optional-path color accessor to its base with no argument', () => {
		expect(semanticTokens.color.text()).toBe('var(--inkq-color-text)')
	})

	it('resolves an optional-path color accessor with a state argument', () => {
		expect(semanticTokens.color.text('secondary')).toBe('var(--inkq-color-text-secondary)')
	})

	it('wires nested category groups (font, opacity, motion) under their own segment', () => {
		expect(semanticTokens.font.display()).toBe('var(--inkq-font-display)')
		expect(semanticTokens.opacity.disabled()).toBe('var(--inkq-opacity-disabled)')
		expect(semanticTokens.motion.interactive()).toBe('var(--inkq-motion-interactive)')
	})
})

describe('aliasTokens', () => {
	it('composes theme + property + semantic token groups into one flat namespace', () => {
		expect(aliasTokens.theme()).toBe('var(--inkq-theme)')
		expect(aliasTokens.borderRadius('sm')).toBe('var(--inkq-border-radius-sm)')
		expect(aliasTokens.background.page()).toBe('var(--inkq-background-page)')
	})

	it('gives accent a dedicated "secondary" accessor alongside the primary accent group', () => {
		expect(aliasTokens.accent()).toBe('var(--inkq-accent)')
		expect(aliasTokens.secondary()).toBe('var(--inkq-accent-secondary)')
	})

	it('nests motion transitions under transition.<property>, each a zero-argument accessor', () => {
		expect(aliasTokens.transition.background()).toBe('var(--inkq-motion-background)')
		expect(aliasTokens.transition.color()).toBe('var(--inkq-motion-color)')
	})
})
