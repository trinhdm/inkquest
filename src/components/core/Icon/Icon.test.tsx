import { getDefaultProps } from '@/hooks/useProps'
import { render, reset, screen } from '@/tests/test-utils'
import { Icon } from './Icon'
import type { Route } from 'next'

describe('Icon', () => {
	reset('Icon')

	it('renders the svg for a mapped icon type', () => {
		const { container } = render(<Icon type="close" />)
		expect(container.querySelector('svg')).toBeInTheDocument()
	})

	it('applies the registered default tag and size', () => {
		// `as` is registered in the defaults registry at runtime, but it's
		// declared on the component's Specs rather than its Props — widen the
		// generic to match what `.set()` actually stored.
		const defaults = getDefaultProps<
			Icon.Props & Pick<Icon.Specs['defaults'], 'as'>
		>('Icon')
		const { container } = render(<Icon type="close" />)
		const svg = container.querySelector('svg')

		expect(svg?.tagName.toLowerCase()).toBe(defaults.as)
		// lucide-react renders `size` as both a `width` and `height` attribute
		expect(svg).toHaveAttribute('width', `${defaults.size}`)
		expect(svg).toHaveAttribute('height', `${defaults.size}`)
	})

	it('respects an explicit size override', () => {
		const { container } = render(<Icon type="close" size={ 32 } />)
		const svg = container.querySelector('svg')

		expect(svg).toHaveAttribute('width', '32')
		expect(svg).toHaveAttribute('height', '32')
	})

	it('sets fill to currentColor when filled is true', () => {
		const { container } = render(<Icon type="like" filled />)
		expect(container.querySelector('svg')).toHaveAttribute('fill', 'currentColor')
	})

	it('sets fill to none when filled is unset', () => {
		const { container } = render(<Icon type="like" />)
		expect(container.querySelector('svg')).toHaveAttribute('fill', 'none')
	})

	it('passes through color and strokeWidth to the underlying lucide icon', () => {
		const { container } = render(<Icon type="close" color="red" strokeWidth={ 3 } />)
		const svg = container.querySelector('svg')

		expect(svg).toHaveAttribute('stroke', 'red')
		expect(svg).toHaveAttribute('stroke-width', '3')
	})

	it('renders nothing for an unknown icon type', () => {
		// `ICON_MAP[type]` is undefined for anything outside `LucideType`; the
		// component returns `null` rather than throwing. Cast is required since
		// `LucideType` is a closed union — this exercises the runtime guard for a
		// value that could slip through at a JS call site or from unvalidated data.
		const { container } = render(<Icon type={ 'not-a-real-icon' as Icon.Props['type'] } />)
		expect(container).toBeEmptyDOMElement()
	})

	it('labels a lucide glyph with its type, without an img role', () => {
		const { container } = render(<Icon type="close" />)
		const svg = container.querySelector('svg')

		expect(svg).toHaveAttribute('aria-label', 'close icon')
		expect(svg).not.toHaveAttribute('role')
	})

	it('labels a social-brand glyph with its type, with no img role and no title', () => {
		const { container } = render(<Icon type="instagram" />)
		const svg = container.querySelector('svg')

		expect(svg).toHaveAttribute('aria-label', 'instagram icon')
		expect(svg).not.toHaveAttribute('role')
		expect(svg?.querySelector('title')).not.toBeInTheDocument()
	})

	it('hides a glyph from assistive tech by default, as a decorative icon', () => {
		const { container } = render(<Icon type="close" />)
		expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true')
	})

	it('registers hidden, color, size and strokeLinecap defaults', () => {
		const defaults = getDefaultProps<Icon.Props & Pick<Icon.Specs['defaults'], 'as'>>('Icon')

		expect(defaults).toEqual({
			as: 'svg',
			color: 'currentColor',
			hidden: true,
			size: 16,
			strokeLinecap: 'round',
		})
	})

	it('exposes the glyph to assistive tech when hidden is false', () => {
		const { container } = render(<Icon type="close" hidden={ false } />)
		const svg = container.querySelector('svg')

		expect(svg).not.toHaveAttribute('aria-hidden', 'true')
		expect(svg).toHaveAttribute('aria-label', 'close icon')
	})

	it('draws a lucide glyph in currentColor by default', () => {
		const { container } = render(<Icon type="close" />)
		expect(container.querySelector('svg')).toHaveAttribute('stroke', 'currentColor')
	})

	it('draws a social-brand glyph with the default color and round line caps', () => {
		const { container } = render(<Icon type="instagram" />)
		const svg = container.querySelector('svg')

		expect(svg).toHaveAttribute('stroke', 'currentColor')
		expect(svg).toHaveAttribute('stroke-linecap', 'round')
	})

	it('lets a social brand override the color and line cap', () => {
		const { container } = render(<Icon type="instagram" color="red" strokeLinecap="square" />)
		const svg = container.querySelector('svg')

		expect(svg).toHaveAttribute('stroke', 'red')
		expect(svg).toHaveAttribute('stroke-linecap', 'square')
	})

	describe('root element', () => {
		it('wraps the glyph in a span, not a bare svg', () => {
			const { container } = render(<Icon type="close" />)
			const root = container.firstElementChild

			expect(root?.tagName.toLowerCase()).toBe('span')
			expect(root?.querySelector('svg')).toBeInTheDocument()
			expect(container.querySelectorAll('a')).toHaveLength(0)
		})

		it('wraps the glyph in a link when href is set', () => {
			render(<Icon type="close" href="/about" hidden={ false } />)
			const link = screen.getByRole('link')

			expect(link).toHaveAttribute('href', '/about')
			expect(link.querySelector('svg')).toBeInTheDocument()
			expect(link).not.toHaveAttribute('target')
			expect(link).not.toHaveAttribute('rel')
		})

		it('opens an external href in a new tab with a safe rel', () => {
			render(<Icon type="instagram" href={ 'https://instagram.com/inkquest' as Route } hidden={ false } />)
			const link = screen.getByRole('link')

			expect(link).toHaveAttribute('href', 'https://instagram.com/inkquest')
			expect(link).toHaveAttribute('target', '_blank')
			expect(link).toHaveAttribute('rel', 'noopener noreferrer')
		})

		it('renders no link for an unknown icon type, even with an href', () => {
			const { container } = render(
				<Icon type={ 'not-a-real-icon' as Icon.Props['type'] } href="/about" />
			)
			expect(container).toBeEmptyDOMElement()
		})
	})
})
