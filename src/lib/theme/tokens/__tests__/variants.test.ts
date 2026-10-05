import { enumerateVariantPalettes, VARIANT_ORDER } from '../variants'
import type { Tone, Variant } from '../../types'

// enumerateVariantPalettes has real branching logic (structural vs. special
// vs. semantic variant resolution, tone selection, priority fallback) even
// though it lives under tokens/ — everywhere else in tokens/ is declarative
// data, but this file computes its output. Values come from `alias` (real
// reference/semantic.ts accessors, which just emit `var(--inkq-...)`
// strings) rather than the large color/typography token datasets, so real
// composition here doesn't couple this test to designer-tunable values.

// Exhaustive `Record`s of the two axes. TypeScript rejects an object literal
// assigned to `Record<K, V>` that is missing a key OR has an extra one, so if
// `Variant`/`Tone` ever gain or lose a member, this file fails to COMPILE
// rather than silently mis-counting — every count below is derived from
// `Object.keys(...)` on these, never pinned as a literal number.
const VARIANTS: Record<Variant, true> = {
	solid: true, outline: true, ghost: true,
	light: true, dark: true, text: true,
}

const TONES: Record<Tone, true> = {
	neutral: true, action: true,
	danger: true, warning: true, success: true, info: true,
}

describe('enumerateVariantPalettes', () => {
	const all = enumerateVariantPalettes()

	const byVariant = (variant: string, priority?: string) =>
		all.find(p => p.variant === variant && p.priority === priority)
	const byTone = (tone: string, priority?: string) =>
		all.find(p => p.tone === tone && p.priority === priority)
	const byVariantTone = (variant: string, tone: string) =>
		all.find(p => p.variant === variant && p.tone === tone)

	// VARIANT_ORDER's keys ARE the "structural" variants (solid/outline/ghost)
	const structuralVariants = Object.keys(VARIANT_ORDER) as Variant[]
	// every other member of `Variant` is a "special" variant (light/dark/text)
	const specialVariants = (Object.keys(VARIANTS) as Variant[])
		.filter(variant => !structuralVariants.includes(variant))
	// widened back to `Variant[]`: TS 5.5's inferred predicate narrowing would
	// otherwise shrink this to `Exclude<Variant, 'text'>[]`, which then
	// rejects comparison against the full `Variant`-typed `p.variant` below
	const lightDarkVariants: Variant[] = specialVariants.filter(variant => variant !== 'text')

	const allTones = Object.keys(TONES) as Tone[]
	const nonNeutralTones = allTones.filter(tone => tone !== 'neutral')
	// "action" is the brand tone, not a status colour — the remaining 4 are
	// the semantic/status tones the old (pre-cc32b37) test called out by name.
	// Widened back to `Tone[]` for the same reason as `lightDarkVariants` above.
	const semanticTones: Tone[] = allTones.filter(tone => tone !== 'neutral' && tone !== 'action')
	const priorities = Object.values(VARIANT_ORDER) // ['primary', 'secondary', 'tertiary']

	it('produces one entry per structural variant (solid/outline/ghost) with no explicit priority or tone', () => {
		const baseEntries = all.filter(p =>
			structuralVariants.includes(p.variant) && p.priority === undefined && p.tone === undefined
		)
		expect(baseEntries).toHaveLength(structuralVariants.length) // 3: solid, outline, ghost
		expect(byVariant('solid')?.priority).toBeUndefined()
	})

	it('produces a light/dark entry for every non-neutral tone, and a text entry only for the neutral tone', () => {
		// per the source's `specialty.filter(...)`: `text` only ever pairs with
		// 'neutral'; light/dark pair with every OTHER tone, never 'neutral'
		const lightDarkEntries = all.filter(p => lightDarkVariants.includes(p.variant))
		expect(lightDarkEntries).toHaveLength(lightDarkVariants.length * nonNeutralTones.length) // 2 * 5 = 10

		const textEntries = all.filter(p => p.variant === 'text')
		expect(textEntries).toHaveLength(1)
		expect(textEntries[0]?.tone).toBe('neutral')
	})

	it('produces primary/secondary/tertiary entries for every semantic tone (tone + priority both set)', () => {
		const semanticEntries = all.filter(p =>
			p.tone !== undefined && semanticTones.includes(p.tone) && p.priority !== undefined
		)
		expect(semanticEntries).toHaveLength(semanticTones.length * priorities.length) // 4 * 3 = 12

		for (const tone of semanticTones)
			for (const priority of priorities)
				expect(byTone(tone, priority)).toBeDefined()
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

	it('resolves a semantic tone + priority combo using that tone\'s own accessor, not the action tone', () => {
		expect(byTone('danger', 'secondary')?.palette).toEqual({
			background: { base: 'transparent', hover: 'var(--inkq-background-card-hover)' },
			border: { base: 'var(--inkq-color-danger-shade)', hover: 'var(--inkq-color-danger-hover)' },
			color: 'var(--inkq-color-danger)',
		})
	})

	// FIX: this used to call `byVariant('light')` / `byVariant('dark')` with no
	// tone filter, and happened to pass because `.find()` returns the FIRST
	// match and "action" is the first non-neutral key in TONE_ACCESSORS'
	// insertion order — it was never actually asserting "always resolves via
	// the action tone", just whichever tone enumerateVariantPalettes() visits
	// first. Since cc32b37, light/dark resolve PER-TONE (one entry per
	// non-neutral tone, see the test above), so the real contract is keyed on
	// the (variant, tone) pair, not a single hardcoded tone.
	it('resolves "light"/"dark" per-tone: the "action" tone case, and a non-action tone resolving through its OWN accessor', () => {
		expect(byVariantTone('light', 'action')?.palette).toEqual({
			background: 'var(--inkq-accent-muted)',
			border: 'currentColor',
			color: { base: 'var(--inkq-accent)', hover: 'var(--inkq-color-text)' },
		})

		expect(byVariantTone('dark', 'action')?.palette).toEqual({
			background: 'var(--inkq-accent-dim)',
			border: 'var(--inkq-accent-muted)',
			color: { base: 'var(--inkq-accent-hover)', hover: 'var(--inkq-color-text)' },
		})

		expect(byVariantTone('light', 'danger')?.palette).toEqual({
			background: 'var(--inkq-color-danger-muted)',
			border: 'currentColor',
			color: { base: 'var(--inkq-color-danger)', hover: 'var(--inkq-color-text)' },
		})
	})

	it('fills every slot with the transparent/inherit default palette when a shape omits it', () => {
		// "solid" only assigns background + color; border falls back to DEFAULT_PALETTE
		expect(byVariant('solid')?.palette.border).toEqual({ base: 'transparent', hover: 'transparent' })
	})
})
