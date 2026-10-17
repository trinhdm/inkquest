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
})
