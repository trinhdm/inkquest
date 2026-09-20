import { getDefaultProps } from '@/hooks/useProps'
import { render, reset, screen } from '@/tests/test-utils'
import { Quote } from './Quote'

describe('Quote', () => {
	reset('Quote')

	it('wraps the quote prop text in curly quotation marks', () => {
		render(<Quote content="Simplicity is the ultimate sophistication" />)
		expect(screen.getByText('"Simplicity is the ultimate sophistication"')).toBeInTheDocument()
	})

	it('renders the author as a caption', () => {
		render(<Quote author="Leonardo da Vinci" content="Simplicity is the ultimate sophistication" />)
		expect(screen.getByText('Leonardo da Vinci')).toBeInTheDocument()
	})

	it('renders as a div by default per its registered defaults', () => {
		const { container } = render(<Quote content="Default tag" />)
		expect(getDefaultProps<Quote.Props & { as: string }>('Quote').as).toBe('div')
		expect(container.firstChild?.nodeName).toBe('DIV')
	})

	it('renders as a custom element when `as` is overridden', () => {
		const { container } = render(<Quote as="figure" content="Custom tag" />)
		expect(container.querySelector('figure')).toBeInTheDocument()
	})
})
