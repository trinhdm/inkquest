import { primitiveTokens } from '../primitive'
import { ICON_SCALE } from '../../scales'

// primitiveTokens is a catalog of accessor functions assembled from
// reference/utils.ts's token.path/optPath/endPath factories (already unit
// tested directly). These tests only check the catalog's *wiring* — that
// each entry is bound to the right category and the right builder kind
// (unprefixed baseVar) — not an exhaustive restatement of every key.

describe('primitiveTokens', () => {
	it('builds unprefixed references (uses baseVar, not aliasVar)', () => {
		expect(primitiveTokens.ink('300')).toBe('var(--ink-300)')
		expect(primitiveTokens.space('4')).toBe('var(--space-4)')
	})

	it('wires each color scale to its own category name', () => {
		expect(primitiveTokens.oxblood('100')).toBe('var(--oxblood-100)')
		expect(primitiveTokens.paper('600')).toBe('var(--paper-600)')
	})

	it('exposes static (single-value) colors via a fixed "100" step, with no path argument', () => {
		expect(primitiveTokens.red()).toBe('var(--red-100)')
		expect(primitiveTokens.black()).toBe('var(--black-100)')
	})

	it('is an optional-path ("state") accessor for easing, resolving the bare category with no path', () => {
		expect(primitiveTokens.easing()).toBe('var(--easing)')
		expect(primitiveTokens.easing('out')).toBe('var(--easing-out)')
	})

	it('wires the font sub-accessors under their own category names, not nested under "font"', () => {
		expect(primitiveTokens.fontFamily('sans')).toBe('var(--font-family-sans)')
		expect(primitiveTokens.lineHeight('normal')).toBe('var(--line-height-normal)')
		expect(primitiveTokens.letterSpacing('01')).toBe('var(--letter-spacing-01)')
	})

	// ICON_SCALE is a numeric tuple (it used to be a { sm, md, lg } object keyed
	// by name), so `icon` is keyed by the pixel size and emits `--icon-size-<px>`
	it('wires icon to the iconSize category, keyed by each pixel size in ICON_SCALE', () => {
		expect(ICON_SCALE.length).toBeGreaterThan(0)

		for (const px of ICON_SCALE)
			expect(primitiveTokens.icon(`${px}`)).toBe(`var(--icon-size-${px})`)
	})
})
