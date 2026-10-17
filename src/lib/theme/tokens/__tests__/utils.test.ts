import { byScheme } from '../utils'
import { THEME_CONFIGS } from '../../themeConfig'
import { base } from '../../reference'

const { dark, light } = THEME_CONFIGS
const PAGE = 'var(--inkq-background-page)'

describe('byScheme', () => {
	describe('flags and palettes', () => {
		it('flags the dark config only', () => {
			expect(byScheme(dark).isDark).toBe(true)
			expect(byScheme(light).isDark).toBe(false)
		})

		it('exposes the config theme palette and the opposite one as alt', () => {
			const d = byScheme(dark).colors,
				l = byScheme(light).colors

			expect(d.theme).toBe(base.ink)
			expect(d.alt).toBe(base.paper)
			expect(l.theme).toBe(base.paper)
			expect(l.alt).toBe(base.ink)
		})
	})

	describe('colors.get', () => {
		const values = { dark: 'D', light: 'L' }

		it('picks the value for the active scheme', () => {
			expect(byScheme(dark, values).colors.get).toBe('D')
			expect(byScheme(light, values).colors.get).toBe('L')
		})

		it('is undefined when no values are given', () => {
			expect(byScheme(dark).colors.get).toBeUndefined()
		})

		it('is undefined when the values object lacks the active scheme', () => {
			const partial = { dark: 'D' } as Record<'dark' | 'light', string>
			expect(byScheme(light, partial).colors.get).toBeUndefined()
		})

		it('is undefined when values is not an object', () => {
			const bad = 'nope' as unknown as Record<'dark' | 'light', string>
			expect(byScheme(dark, bad).colors.get).toBeUndefined()
		})

		it('keeps a falsy value for the scheme (0) rather than treating it as missing', () => {
			expect(byScheme(dark, { dark: 0, light: 1 }).colors.get).toBe(0)
		})
	})

	describe('modColor', () => {
		const lch = 'calc(l + -0.035) calc(c + 0.0065) calc(h + -0.25)'

		it('returns every state hue', () => {
			const hues = byScheme(dark).modColor('red')
			expect(Object.keys(hues).sort()).toEqual(
				['active', 'base', 'bright', 'dim', 'hover', 'muted', 'shade', 'tint']
			)
		})

		it('resolves a static color name to its primitive reference', () => {
			expect(byScheme(dark).modColor('red').base).toBe(base.red())
		})

		it('passes a non-static color string through untouched', () => {
			expect(byScheme(dark).modColor('#abcdef').base).toBe('#abcdef')
			expect(byScheme(dark).modColor('var(--x)').base).toBe('var(--x)')
		})

		it('does not treat inherited object keys as static colors', () => {
			expect(byScheme(dark).modColor('toString').base).toBe('toString')
		})

		it('shifts hover by one OKLCH step and active by exactly double', () => {
			const hues = byScheme(dark).modColor('#fff')
			expect(hues.hover).toBe(`oklch(from #fff ${lch})`)
			expect(hues.active).toBe(
				'oklch(from #fff calc(l + -0.07) calc(c + 0.013) calc(h + -0.5))'
			)
		})

		it('mixes tint/bright toward white and shade/dim toward black on dark', () => {
			const hues = byScheme(dark).modColor('#fff')
			expect(hues.tint).toBe(`color-mix(in oklab, ${base.white()} 15%, #fff)`)
			expect(hues.bright).toBe(`color-mix(in oklab, ${base.white()} 50%, #fff)`)
			expect(hues.shade).toBe(`color-mix(in oklab, ${base.black()} 30%, #fff)`)
			expect(hues.dim).toBe(`color-mix(in oklab, ${base.black()} 80%, #fff)`)
		})

		it('swaps the mixers on light', () => {
			const hues = byScheme(light).modColor('#fff')
			expect(hues.tint).toBe(`color-mix(in oklab, ${base.black()} 15%, #fff)`)
			expect(hues.shade).toBe(`color-mix(in oklab, ${base.white()} 30%, #fff)`)
		})

		it('mixes muted with the page background on both schemes', () => {
			expect(byScheme(dark).modColor('#fff').muted).toBe(`color-mix(in oklab, ${PAGE} 85%, #fff)`)
			expect(byScheme(light).modColor('#fff').muted).toBe(`color-mix(in oklab, ${PAGE} 85%, #fff)`)
		})

		it('uses custom percents in place of every default', () => {
			const hues = byScheme(dark).modColor('#fff', {
				tint: 1, shade: 2, bright: 3, dim: 4, muted: 5,
			})
			expect(hues.tint).toContain(' 1%,')
			expect(hues.shade).toContain(' 2%,')
			expect(hues.bright).toContain(' 3%,')
			expect(hues.dim).toContain(' 4%,')
			expect(hues.muted).toContain(' 5%,')
		})

		it('is bound to the scheme: dark and light yield different mixes for the same color', () => {
			expect(byScheme(dark).modColor('#fff').tint).not.toBe(byScheme(light).modColor('#fff').tint)
		})
	})
})
