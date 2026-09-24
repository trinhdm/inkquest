import { render, reset, screen } from '@/tests/test-utils'
import { Timeline } from '../Timeline'

describe('Timeline.Item', () => {
	reset('Timeline.Item')

	it('renders the title and content text', () => {
		render(<Timeline.Item content="Something happened" title="Launch day" />)

		expect(screen.getByText('Launch day')).toBeInTheDocument()
		expect(screen.getByText('Something happened')).toBeInTheDocument()
	})

	it('renders no title span when title is omitted', () => {
		const { container } = render(<Timeline.Item content="Untitled entry" />)
		expect(screen.getByText('Untitled entry')).toBeInTheDocument()
		// only the bullet + rail marker spans remain — the conditional
		// title span never mounts, without asserting on its hashed class
		expect(container.querySelectorAll('span')).toHaveLength(2)
	})

	it('prefers the explicit `content` prop over children when both are given', () => {
		render(<Timeline.Item content="Wins">Loses</Timeline.Item>)
		expect(screen.getByText('Wins')).toBeInTheDocument()
		expect(screen.queryByText('Loses')).not.toBeInTheDocument()
	})

	it('renders a custom bullet node', () => {
		render(<Timeline.Item bullet={ <span data-testid="custom-bullet" /> } content="Body" />)
		expect(screen.getByTestId('custom-bullet')).toBeInTheDocument()
	})
})
