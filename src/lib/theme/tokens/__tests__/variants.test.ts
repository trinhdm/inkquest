import { enumerateVariantPalettes } from '../variants'

// enumerateVariantPalettes has real branching logic (structural vs. special
// vs. semantic variant resolution, tone selection, priority fallback) even
// though it lives under tokens/ — everywhere else in tokens/ is declarative
// data, but this file computes its output. Values come from `alias` (real
// reference/semantic.ts accessors, which just emit `var(--inkq-...)`
// strings) rather than the large color/typography token datasets, so real
// composition here doesn't couple this test to designer-tunable values.

describe('enumerateVariantPalettes', () => {
	const all = enumerateVariantPalettes()
	const byVariant = (variant: string, priority?: string) =>
		all.find(p => p.variant === variant && p.priority === priority)

	it('produces one entry per structural variant (solid/outline/ghost) with no explicit priority', () => {
		expect(all.filter(p => ['solid', 'outline', 'ghost'].includes(p.variant))).toHaveLength(3)
		expect(byVariant('solid')?.priority).toBeUndefined()
	})

	it('produces one entry per special variant (light/dark) with no explicit priority', () => {
		expect(all.filter(p => ['light', 'dark'].includes(p.variant))).toHaveLength(2)
	})

	it('produces primary/secondary/tertiary entries for each of the 4 semantic tones', () => {
		const semanticTones = ['danger', 'warning', 'success', 'info']
		const semanticEntries = all.filter(p => semanticTones.includes(p.variant))
		expect(semanticEntries).toHaveLength(semanticTones.length * 3)

		for (const tone of semanticTones)
			for (const priority of ['primary', 'secondary', 'tertiary'])
				expect(byVariant(tone, priority)).toBeDefined()
	})

	it('resolves the "solid" structural variant to the action tone\'s primary shape', () => {
		expect(byVariant('solid')?.palette).toEqual({
			background: { base: 'var(--inkq-accent)', hover: 'var(--inkq-accent-hover)' },
			border: { base: 'transparent', hover: 'transparent' },
			color: 'var(--inkq-color-text-on-accent)',
		})
	})

	it('resolves the "outline" structural variant to the neutral tone\'s secondary shape', () => {
		expect(byVariant('outline')?.palette).toEqual({
			background: { base: 'transparent', hover: 'var(--inkq-background-card-hover)' },
			border: { base: 'var(--inkq-border-strong)', hover: 'var(--inkq-color-action)' },
			color: 'var(--inkq-color-text)',
		})
	})

	it('resolves the "ghost" structural variant to the neutral tone\'s tertiary shape', () => {
		expect(byVariant('ghost')?.palette).toEqual({
			background: { base: 'transparent', hover: 'var(--inkq-background-card)' },
			border: { base: 'transparent', hover: 'var(--inkq-border)' },
			color: 'var(--inkq-color-text)',
		})
	})

	it('resolves a semantic variant + priority combo using that tone\'s own accessor, not the action tone', () => {
		expect(byVariant('danger', 'secondary')?.palette).toEqual({
			background: { base: 'transparent', hover: 'var(--inkq-background-card-hover)' },
			border: { base: 'var(--inkq-color-danger-shade)', hover: 'var(--inkq-color-danger-hover)' },
			color: 'var(--inkq-color-danger)',
		})
	})

	it('special variants ("light"/"dark") always use the action tone, regardless of variant name', () => {
		expect(byVariant('light')?.palette).toEqual({
			background: 'var(--inkq-accent-muted)',
			border: 'currentColor',
			color: { base: 'var(--inkq-accent)', hover: 'var(--inkq-color-text)' },
		})

		expect(byVariant('dark')?.palette).toEqual({
			background: 'var(--inkq-accent-dim)',
			border: 'var(--inkq-accent-muted)',
			color: { base: 'var(--inkq-accent-hover)', hover: 'var(--inkq-color-text)' },
		})
	})

	it('fills every slot with the transparent/inherit default palette when a shape omits it', () => {
		// "solid" only assigns background + color; border falls back to DEFAULT_PALETTE
		expect(byVariant('solid')?.palette.border).toEqual({ base: 'transparent', hover: 'transparent' })
	})
})
