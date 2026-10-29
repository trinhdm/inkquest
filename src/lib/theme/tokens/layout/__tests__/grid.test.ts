import { getBreakpointTokens, getContainerTokens, getGridTokens } from '../grid'
import { base } from '../../../reference'

describe('getBreakpointTokens', () => {
	it('orders breakpoints ascending by pixel width from min to max', () => {
		const t = getBreakpointTokens()
		const px = [t.min, t.xs, t.sm, t.md, t.lg, t.xl, t.max].map(
			(v) => Number(/--screen-size-(\d+)/.exec(v)?.[1])
		)

		expect(px.every(Number.isFinite)).toBe(true)
		expect([...px].sort((a, b) => a - b)).toEqual(px)
	})
})

describe('getContainerTokens', () => {
	it('keeps the content block narrower than the page container', () => {
		const { block, page } = getContainerTokens()
		const width = (v: string) => Number(/(\d+)\)$/.exec(v)?.[1])

		expect(width(block)).toBeLessThan(width(page))
	})

	it('keeps the form container narrower than the content block, and every width a real screen size', () => {
		const { block, form, page } = getContainerTokens()
		const width = (v: string) => Number(/(\d+)\)$/.exec(v)?.[1])

		for (const value of [block, form, page]) expect(Number.isFinite(width(value))).toBe(true)
		expect(width(form)).toBeLessThan(width(block))
	})
})

describe('getGridTokens', () => {
	const grid = getGridTokens()

	it('derives the stack gaps from a 5, +2 step progression', () => {
		const { kicker, lede, cta, head } = grid.stack.gap

		expect([kicker, lede, cta, head]).toEqual((['5', '7', '9', '11'] as const).map(step => base.space(step)))
	})

	it('grows stack gaps in reading order: kicker < lede < cta < head', () => {
		const step = (v: string) => Number(/(\d+)\)$/.exec(v)?.[1]),
			{ kicker, lede, cta, head } = grid.stack.gap

		expect([kicker, lede, cta, head].map(step)).toEqual([5, 7, 9, 11])
	})

	it('joins the footer padding as a two-value shorthand of space references', () => {
		expect(grid.footer.padding).toBe(`${base.space('12')} ${base.space('10')}`)
	})

	it('scales field padding through sm, md, lg', () => {
		const { sm, md, lg } = grid.field.padding
		const step = (v: string) => Number(/(\d+)\)$/.exec(v)?.[1])

		expect(step(sm)).toBeLessThan(step(md))
		expect(step(md)).toBeLessThan(step(lg))
	})

	it('makes the navbar taller than the subnav', () => {
		const step = (v: string) => Number(/(\d+)\)$/.exec(v)?.[1])
		expect(step(grid.navbar.size)).toBeGreaterThan(step(grid.subnav.size))
	})

	it('orders the gutters from widest to narrowest: base, content, item, list', () => {
		const step = (v: string) => Number(/(\d+)\)$/.exec(v)?.[1]),
			{ base: wide, content, item, list } = grid.gutter

		expect([wide, content, item, list].map(step).every(Number.isFinite)).toBe(true)
		expect(step(wide)).toBeGreaterThan(step(content))
		expect(step(content)).toBeGreaterThan(step(item))
		expect(step(item)).toBeGreaterThan(step(list))
	})

	it('gives lists a gutter smaller than their indent', () => {
		const step = (v: string) => Number(/(\d+)\)$/.exec(v)?.[1])

		expect(Number.isFinite(step(grid.indent.list))).toBe(true)
		expect(step(grid.indent.list)).toBeGreaterThan(step(grid.gutter.list))
	})

	it('pads the stack with a single space reference, not a shorthand', () => {
		expect(grid.stack.padding).toMatch(/^var\(--[^\s]+\)$/)
	})

	it('pads the hero at least as much as a regular section, and the stack no more than the hero', () => {
		const step = (v: string) => Number(/(\d+)\)$/.exec(v)?.[1])

		expect(step(grid.hero.padding)).toBeGreaterThanOrEqual(step(grid.section.padding))
		expect(step(grid.stack.padding)).toBeLessThanOrEqual(step(grid.hero.padding))
	})

	it('makes the accessible control size larger than the accessible icon size', () => {
		const step = (v: string) => Number(/(\d+)\)$/.exec(v)?.[1]),
			{ control, icon } = grid.accessible

		expect(Number.isFinite(step(control))).toBe(true)
		expect(Number.isFinite(step(icon))).toBe(true)
		expect(step(control)).toBeGreaterThan(step(icon))
	})
})
