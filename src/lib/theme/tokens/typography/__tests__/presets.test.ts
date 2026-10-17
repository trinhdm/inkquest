import { getFontPresetTokens } from '../presets'
import { alias, base } from '../../../reference'

describe('getFontPresetTokens', () => {
	const text = getFontPresetTokens()

	it('gives h1 and h2 the display family and heavy weight', () => {
		for (const h of [text.h1, text.h2]) {
			expect(h.fontFamily).toBe(alias.fontFamily('display'))
			expect(h.fontWeight).toBe(base.fontWeight('700'))
			expect(h.lineHeight).toBe(alias.lineHeight('heading'))
		}
	})

	it('gives h3 through h6 the heading family', () => {
		for (const h of [text.h3, text.h4, text.h5, text.h6])
			expect(h.fontFamily).toBe(alias.fontFamily('heading'))
	})

	it('overrides only what differs from the heading defaults on h4, h5 and h6', () => {
		expect(text.h3.lineHeight).toBe(alias.lineHeight('heading'))
		expect(text.h3.fontWeight).toBe(base.fontWeight('600'))
		expect(text.h4.fontWeight).toBe(base.fontWeight('700'))
		expect(text.h4.lineHeight).toBe(alias.lineHeight('label'))
		expect(text.h5.lineHeight).toBe(alias.lineHeight('label'))
		expect(text.h5.fontWeight).toBe(base.fontWeight('600'))
		expect(text.h6.lineHeight).toBe(alias.lineHeight('body'))
	})

	it.each(['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] as const)('sizes %s from its own font-size alias', (h) => {
		expect(text[h].fontSize).toBe(alias.fontSize(h))
	})

	it('sizes prose one step above body, with body-family content defaults', () => {
		expect(text.body.fontSize).toBe(alias.fontSize('body'))
		expect(text.prose.fontSize).toBe(alias.fontSize('body', 'lg'))
		expect(text.prose.fontFamily).toBe(text.body.fontFamily)
		expect(text.prose.fontWeight).toBe(text.body.fontWeight)
	})

	it('shares label properties between base and mono, differing in family and size', () => {
		expect(text.label.base.fontWeight).toBe(text.label.mono.fontWeight)
		expect(text.label.base.lineHeight).toBe(text.label.mono.lineHeight)
		expect(text.label.base.fontFamily).toBe(alias.fontFamily('body'))
		expect(text.label.mono.fontFamily).toBe(alias.fontFamily('mono'))
		expect(text.label.mono.fontSize).toBe(alias.fontSize('label', 'sm'))
		expect(text.label.base.fontSize).toBe(alias.fontSize('label'))
	})

	it('sets caption variants in the mono family except the image caption', () => {
		expect(text.caption.base.fontFamily).toBe(alias.fontFamily('mono'))
		expect(text.caption.item.fontFamily).toBe(alias.fontFamily('mono'))
		expect(text.caption.image.fontFamily).toBe(alias.fontFamily('body'))
	})

	it('provides all four font longhands on every required preset (shorthand collapse needs them)', () => {
		const presets = [
			text.h1, text.h2, text.h3, text.h4, text.h5, text.h6,
			text.body, text.control, text.navigation, text.numeric, text.prose,
			text.section.eyebrow, text.label.base, text.label.mono,
			text.caption.base, text.caption.image, text.caption.item,
		]
		for (const preset of presets) {
			expect(Object.keys(preset).sort()).toEqual(['fontFamily', 'fontSize', 'fontWeight', 'lineHeight'])
			for (const value of Object.values(preset)) expect(value).toMatch(/^var\(--/)
		}
	})
})
