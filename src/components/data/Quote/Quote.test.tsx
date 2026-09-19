import { getDefaultProps, resetComponentDefaults } from '@/hooks/useProps'
import { renderWithTheme as render, screen } from '@/tests/test-utils'
import { resetVariantStyles } from '@/lib/registries'
import { Quote } from './Quote'

describe('Quote', () => {
	afterEach(() => {
		resetVariantStyles('Quote')
	})

	afterAll(() => {
		resetComponentDefaults('Quote')
	})

	it('wraps the quote prop text in curly quotation marks', () => {
		render(<Quote quote="Simplicity is the ultimate sophistication" />)
		expect(screen.getByText('"Simplicity is the ultimate sophistication"')).toBeInTheDocument()
	})

	it('renders the author as a caption', () => {
		render(<Quote author="Leonardo da Vinci" quote="Simplicity is the ultimate sophistication" />)
		expect(screen.getByText('Leonardo da Vinci')).toBeInTheDocument()
	})

	it('falls back to children when quote is not provided', () => {
		render(<Quote quote={ undefined as unknown as string }>Rendered via children</Quote>)
		expect(screen.getByText('"Rendered via children"')).toBeInTheDocument()
	})

	it('prefers the explicit quote prop over children when both are given', () => {
		render(<Quote quote="Wins">Loses</Quote>)
		expect(screen.getByText('"Wins"')).toBeInTheDocument()
		expect(screen.queryByText(/Loses/)).not.toBeInTheDocument()
	})

	it('renders as a div by default per its registered defaults', () => {
		const { container } = render(<Quote quote="Default tag" />)
		expect(getDefaultProps<Quote.Props & { as: string }>('Quote').as).toBe('div')
		expect(container.firstChild?.nodeName).toBe('DIV')
	})

	it('renders as a custom element when `as` is overridden', () => {
		const { container } = render(<Quote as="figure" quote="Custom tag" />)
		expect(container.querySelector('figure')).toBeInTheDocument()
	})
})
