import { buildVariantSchemes } from '../buildVariantSchemes'

// buildVariantSchemes composes enumerateVariantPalettes() (real, deterministic
// logic — tested directly in tokens/variants.test.ts) with tokenGenerator()
// (also real and already unit-tested). No mocking: nothing here touches the
// large declarative color/typography token datasets.

describe('buildVariantSchemes', () => {
	it('generates one CssRule per enumerated variant palette', () => {
		const rules = buildVariantSchemes()
		expect(rules).toHaveLength(17) // 3 structural + 2 special + 4 tones * 3 priorities
	})

	it('defaults to the unscoped "[data-variant]" attribute selector with no component name', () => {
		const rules = buildVariantSchemes()
		const light = rules.find(r => r.selector === '[data-variant="light"]')
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

	it('for a semantic tone + explicit priority, appends a redundant priority-only :is() clause alongside the base selector', () => {
		// Because `priority` is truthy here, the `if (priority)` branch fires
		// in ADDITION to the base `[data-variant="danger"]` selector already
		// being pushed — the second clause
		// `[data-variant="danger"]:is([data-priority="primary"])` is a strict
		// subset of the first and therefore dead weight in the generated CSS.
		// Locking in current behavior; see the Maintenance Note.
		const rules = buildVariantSchemes()
		const dangerPrimary = rules.find(r => r.selector.includes('"danger"') && r.selector.includes('"primary"'))

		expect(dangerPrimary?.selector).toBe(
			'[data-variant="danger"],\n[data-variant="danger"]:is([data-priority="primary"])'
		)
	})

	it('for a semantic tone + non-primary priority, only emits the single priority-scoped selector (no bare attribute selector)', () => {
		const rules = buildVariantSchemes()
		const dangerSecondary = rules.find(r => r.selector === '[data-variant="danger"]:is([data-priority="secondary"])')
		expect(dangerSecondary).toBeDefined()
	})

	it('does not append any extra priority selector for special variants (light/dark)', () => {
		const rules = buildVariantSchemes()
		const dark = rules.find(r => r.selector === '[data-variant="dark"]')
		expect(dark).toBeDefined()
	})
})
