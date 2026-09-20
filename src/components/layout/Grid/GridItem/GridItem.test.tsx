import { getDefaultProps } from '@/hooks/useProps'
import { render, reset, screen } from '@/tests/test-utils'
import { Grid } from '../Grid'

describe('Grid.Item', () => {
	reset('Grid.Item')

	it('renders its children', () => {
		render(<Grid.Item>Item content</Grid.Item>)
		expect(screen.getByText('Item content')).toBeInTheDocument()
	})

	it('registers no default props of its own', () => {
		expect(getDefaultProps('Grid.Item')).toEqual({})
	})

	it('does not require an enclosing Grid to render, unlike a context-bound compound part', () => {
		render(<Grid.Item>Standalone item</Grid.Item>)
		expect(screen.getByText('Standalone item')).toBeInTheDocument()
	})

	it('renders as a div regardless of a custom className passed through', () => {
		const { container } = render(<Grid.Item className="custom">Item content</Grid.Item>)
		expect(container.firstElementChild?.tagName).toBe('DIV')
		expect(container.firstElementChild).toHaveClass('custom')
	})
})
