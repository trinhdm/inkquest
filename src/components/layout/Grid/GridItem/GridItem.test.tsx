import { getDefaultProps } from '@/hooks/useProps'
import { render, reset, screen } from '@/tests/test-utils'
import { Grid } from '../Grid'

describe('Grid.Item', () => {
	reset('Grid.Item')

	it('renders its children', () => {
		render(<Grid.Item>Item content</Grid.Item>)
		expect(screen.getByText('Item content')).toBeInTheDocument()
	})

	it('registers `as: "div"` as its only default', () => {
		expect(getDefaultProps('Grid.Item')).toEqual({ as: 'div' })
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

	describe('span', () => {
		const span = (el: Element | null) => (el as HTMLElement).style.getPropertyValue('--grid-span-col')

		it('sets --grid-span-col to "span N" for a positive span', () => {
			const { container } = render(<Grid.Item span={ 3 }>Wide</Grid.Item>)
			expect(span(container.firstElementChild)).toBe('span 3')
		})

		it('sets no --grid-span-col when span is omitted', () => {
			const { container } = render(<Grid.Item>Plain</Grid.Item>)
			expect(span(container.firstElementChild)).toBe('')
		})

		it('treats span={ 0 } as unset rather than emitting "span 0"', () => {
			const { container } = render(<Grid.Item span={ 0 }>Zero</Grid.Item>)
			expect(span(container.firstElementChild)).toBe('')
		})

		it('keeps span off the DOM, using it only for the --grid-span-col token', () => {
			const { container } = render(<Grid.Item span={ 2 }>Wide</Grid.Item>)

			// positive control: the token is still emitted
			expect(span(container.firstElementChild)).toBe('span 2')
			expect(container.firstElementChild).not.toHaveAttribute('span')
		})
	})
})
