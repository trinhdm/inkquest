import { getDefaultProps } from '@/hooks/useProps'
import { render, reset, screen } from '@/tests/test-utils'
import { Container } from './Container'

describe('Container', () => {
	reset('Container')

	it('renders children inside the root', () => {
		render(<Container>Container content</Container>)
		expect(screen.getByText('Container content')).toBeInTheDocument()
	})

	it('renders as the registered default tag ("section")', () => {
		const defaults = getDefaultProps<Container.Props & { as?: string }>('Container')
		const { container } = render(<Container>content</Container>)

		expect(defaults.as).toBe('section')
		expect(container.firstElementChild?.tagName).toBe(defaults.as?.toUpperCase())
	})

	it('renders the polymorphic "as" element instead of the registered default', () => {
		const { container } = render(<Container as="div">content</Container>)
		expect(container.firstElementChild?.tagName).toBe('DIV')
	})

	it('adds data-block when fullWidth is set', () => {
		render(<Container fullWidth>content</Container>)
		expect(screen.getByText('content').closest('section')).toHaveAttribute('data-block')
	})

	it('renders no data-block attribute at all when fullWidth is unset (falsy flags render no attribute)', () => {
		render(<Container>content</Container>)
		expect(screen.getByText('content').closest('section')).not.toHaveAttribute('data-block')
	})
})
