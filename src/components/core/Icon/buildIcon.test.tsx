import { render } from '@/tests/test-utils'
import { buildIcon } from './buildIcon'
import type { StyleFn } from '@/hooks/useStyles'
import type { Icon } from './Icon'

// `buildIcon` only spreads `styles('glyph')` onto the glyph, so the selector name
// as the class is enough to prove which element the styles landed on
const styles = ((name: string) => ({ className: `s-${name}` })) as unknown as StyleFn<Icon.Specs>

const renderGlyph = (props: Icon.Props, tag?: 'svg') => {
	const { container } = render(<>{ buildIcon({ props, styles, tag }) }</>)
	return container
}

describe('buildIcon', () => {
	describe('social brands', () => {
		// each brand ships its own viewBox and optical stroke width
		it.each([
			['google', '1.776 1.776 23.999 23.999', '1.999'],
			['apple', '-0.799 -0.7999 25.599 25.599', '2.133'],
			['instagram', '-1.33 -1.33 26.66 26.66', '2.222'],
			['tiktok', '0.833 1.333 21.333 21.333', '1.777'],
			['x', '1.06 0.86 23.28 23.28', undefined],
		] as const)('draws %s as a labelled image with its own viewBox', (type, viewBox, strokeWidth) => {
			const svg = renderGlyph({ type }, 'svg').querySelector('svg')

			expect(svg).toBeInTheDocument()
			expect(svg).toHaveAttribute('role', 'img')
			expect(svg).toHaveAttribute('aria-label', `${type} icon`)
			expect(svg).toHaveAttribute('viewBox', viewBox)
			expect(svg?.querySelector('title')).toHaveTextContent(type)
			expect(svg?.querySelector('path, rect, circle')).toBeInTheDocument()
			if (strokeWidth) expect(svg).toHaveAttribute('stroke-width', strokeWidth)
		})

		it('applies size to both width and height, and color to the stroke', () => {
			const svg = renderGlyph({ type: 'google', size: 28, color: 'tomato' }, 'svg').querySelector('svg')

			expect(svg).toHaveAttribute('width', '28')
			expect(svg).toHaveAttribute('height', '28')
			expect(svg).toHaveAttribute('stroke', 'tomato')
		})

		it('leaves the glyph unfilled, except for x which is a solid mark', () => {
			expect(renderGlyph({ type: 'tiktok' }, 'svg').querySelector('svg')).toHaveAttribute('fill', 'none')
			expect(renderGlyph({ type: 'x' }, 'svg').querySelector('svg')).toHaveAttribute('fill', 'currentColor')
		})

		it('passes the glyph styles to the svg', () => {
			expect(renderGlyph({ type: 'apple' }, 'svg').querySelector('svg')).toHaveClass('s-glyph')
		})

		it('hides a brand glyph from assistive tech when hidden is set, with a visible control', () => {
			const hidden = renderGlyph({ type: 'apple', hidden: true }, 'svg').querySelector('svg')
			const shown = renderGlyph({ type: 'apple' }, 'svg').querySelector('svg')

			expect(hidden).toHaveAttribute('aria-hidden', 'true')
			expect(shown).not.toHaveAttribute('aria-hidden')
		})
	})

	describe('lucide icons', () => {
		it('passes the glyph styles to the svg', () => {
			expect(renderGlyph({ type: 'close' }).querySelector('svg')).toHaveClass('s-glyph')
		})

		it('is unaffected by the brand tag, drawing the mapped lucide svg', () => {
			const svg = renderGlyph({ type: 'close' }, 'svg').querySelector('svg')

			expect(svg).toBeInTheDocument()
			expect(svg).not.toHaveAttribute('role')
		})
	})

	it('returns null for a type that is neither mapped nor a known brand', () => {
		expect(buildIcon({
			props: { type: 'nope' } as unknown as Icon.Props,
			styles,
			tag: 'svg',
		})).toBeNull()
	})
})
