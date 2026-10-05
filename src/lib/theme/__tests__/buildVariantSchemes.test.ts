import { buildVariantSchemes } from '../buildVariantSchemes'
import { enumerateVariantPalettes } from '../tokens/variants'

// buildVariantSchemes composes enumerateVariantPalettes() (real, deterministic
// logic — tested directly in tokens/variants.test.ts) with tokenGenerator()
// (also real and already unit-tested). No mocking: nothing here touches the
// large declarative color/typography token datasets.

describe('buildVariantSchemes', () => {
	it('generates one CssRule per enumerated variant palette', () => {
		const rules = buildVariantSchemes()
		// tied to the real enumeration output (not a pinned number) — buildVariantSchemes
		// maps 1:1 over enumerateVariantPalettes(), so an axis change there
		// surfaces here as a single assertion about that relationship, not a
		// stale magic count
		expect(rules).toHaveLength(enumerateVariantPalettes().length)
	})

	it('defaults to the unscoped "[data-variant]" attribute selector with no component name', () => {
		const rules = buildVariantSchemes()
		// the FIRST rule emitted for a given variant gets the bare, unscoped
		// selector as its leading clause; later rules for the SAME variant (a
		// different tone) only add combinator clauses on top of it — assert on
		// that leading segment, since which tone happens to be visited first is
		// an enumeration-order detail, not anything under test here
		const light = rules.find(r => r.selector.split(',\n')[0] === '[data-variant="light"]')
		expect(light).toBeDefined()
	})

	it('prefixes each var with "--variant-" regardless of the component name/prefix arguments', () => {
		const [solid] = buildVariantSchemes()
		expect(solid.vars).toEqual({
			'--variant-background': 'var(--inkq-accent)',
			'--variant-background-hover': 'var(--inkq-accent-hover)',
			'--variant-border': 'transparent',
			'--variant-border-hover': 'transparent',
			'--variant-color': 'var(--inkq-color-text-on-accent)',
		})
	})

	it('scopes the selector under a class built from prefix + kebab-cased name when both are given', () => {
		const rules = buildVariantSchemes('Button', 'inkq')
		const solid = rules.find(r => r.selector.startsWith('.inkq-button[data-variant="solid"]'))
		expect(solid).toBeDefined()
	})

	it('appends a priority-scoped selector for a structural variant, listing the OTHER structural variants', () => {
		const [solid] = buildVariantSchemes()
		expect(solid.selector).toBe(
			'[data-variant="solid"],\n[data-priority="primary"]:is([data-variant="outline"], [data-variant="ghost"])'
		)
	})

	// BUG, not a desired contract: when a component name IS supplied, the
	// base selector gets scoped to `.${prefix}-${name}`, but the
	// VARIANT_ORDER fallback selector (the `[data-priority="..."]:is(...)`
	// clause pushed for solid/outline/ghost) is built from the raw
	// `[data-variant="x"]` attribute selectors with no `.${rootClass}`
	// prefix at all (buildVariantSchemes.ts line ~40). For a scoped
	// component this fallback rule ends up matching ANY element in the
	// document with that attribute combination, not just instances of the
	// named component. This test pins the current (unscoped fallback)
	// behavior; see the Maintenance Note.
	it('BUG: the structural-variant priority fallback selector is not scoped to the component class', () => {
		const rules = buildVariantSchemes('Button', 'inkq')
		const solid = rules.find(r => r.selector.startsWith('.inkq-button[data-variant="solid"]'))

		expect(solid?.selector).toBe(
			'.inkq-button[data-variant="solid"],\n[data-priority="primary"]:is([data-variant="outline"], [data-variant="ghost"])'
		)
	})

	// FIX (cc32b37): semantic colour moved off `variant` onto a separate
	// `tone` axis, so a "danger" entry is no longer `variant="danger"` — it is
	// `variant="solid"` (primary maps to "solid" via VARIANT_ORDER) PLUS
	// `tone="danger"`. `tone` is always set alongside `priority` on these
	// "ordered" entries, and the `if (priority) { if (!tone) ... }` guard
	// only pushes a priority clause when tone is ABSENT — so for every real
	// tone+priority combo the priority clause is suppressed and only the
	// tone clause survives. "solid"'s bare `[data-variant="solid"]` selector
	// was already registered by the structural-variant entry (processed
	// earlier in enumerateVariantPalettes()'s output), so it isn't repeated here.
	it('for an ordered (tone + priority) entry, the tone clause wins and the priority clause is suppressed', () => {
		const rules = buildVariantSchemes()
		const dangerPrimary = rules.find(r => r.selector.includes('"danger"') && r.selector.includes('"solid"'))

		expect(dangerPrimary?.selector).toBe('[data-variant="solid"]:is([data-tone="danger"])')
	})

	it('the same priority-suppression applies at a non-primary priority — the surviving clause still keys off the mapped structural variant', () => {
		// danger + "secondary" priority maps to variant="outline"
		const rules = buildVariantSchemes()
		const dangerSecondary = rules.find(r => r.selector.includes('"danger"') && r.selector.includes('"outline"'))

		expect(dangerSecondary?.selector).toBe('[data-variant="outline"]:is([data-tone="danger"])')
	})

	it('never appends a priority clause for special variants (light/dark/text), since they are not registered in VARIANT_ORDER — but still appends their tone clause', () => {
		const rules = buildVariantSchemes()
		// the first "dark" rule enumerated pairs with the "action" tone (see
		// tokens/variants.test.ts); pinning the full selector doubles as the
		// positive control that its tone clause IS present, alongside the
		// (implicit, by exact match) absence of any data-priority clause
		const dark = rules.find(r => r.selector.startsWith('[data-variant="dark"]'))

		expect(dark?.selector).toBe('[data-variant="dark"],\n[data-variant="dark"]:is([data-tone="action"])')
	})
})
