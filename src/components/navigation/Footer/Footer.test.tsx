import { getDefaultProps } from '@/hooks/useProps'
import { render, reset, screen } from '@/tests/test-utils'
import { Footer } from './Footer'

describe('Footer', () => {
	reset('Footer')

	it('renders the tagline', () => {
		render(<Footer />)
		expect(screen.getByText('Find your artist. Own the ink.')).toBeInTheDocument()
	})

	it('renders the copyright notice', () => {
		render(<Footer />)
		expect(screen.getByText('© 2026 Inkquest, Inc.')).toBeInTheDocument()
	})

	it('renders as the registered default tag (footer)', () => {
		const defaults = getDefaultProps<Footer.Props & { as: string }>('Footer')
		const { container } = render(<Footer />)

		expect(container.firstElementChild?.tagName).toBe((defaults.as as string).toUpperCase())
		expect(container.querySelector('footer')).toBeInTheDocument()
	})

	it('renders the polymorphic "as" element instead of the default footer tag', () => {
		const { container } = render(<Footer as="div" />)

		expect(container.querySelector('footer')).not.toBeInTheDocument()
		expect(container.firstElementChild?.tagName).toBe('DIV')
	})
})
