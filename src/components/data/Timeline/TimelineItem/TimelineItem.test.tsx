import { render, reset, screen } from '@/tests/test-utils'
import { TimelineItem } from './TimelineItem'

describe('TimelineItem', () => {
	reset('TimelineItem')

	it('renders the title and content text', () => {
		render(<TimelineItem content="Something happened" title="Launch day" />)

		expect(screen.getByText('Launch day')).toBeInTheDocument()
		expect(screen.getByText('Something happened')).toBeInTheDocument()
	})

	it('renders no title span when title is omitted', () => {
		const { container } = render(<TimelineItem content="Untitled entry" />)
		expect(screen.getByText('Untitled entry')).toBeInTheDocument()
		// only the bullet + rail marker spans remain — the conditional
		// title span never mounts, without asserting on its hashed class
		expect(container.querySelectorAll('span')).toHaveLength(2)
	})

	it('falls back to children when content is not provided', () => {
		render(<TimelineItem content={ undefined as unknown as string }>Rendered via children</TimelineItem>)
		expect(screen.getByText('Rendered via children')).toBeInTheDocument()
	})

	it('prefers the explicit `content` prop over children when both are given', () => {
		render(<TimelineItem content="Wins">Loses</TimelineItem>)
		expect(screen.getByText('Wins')).toBeInTheDocument()
		expect(screen.queryByText('Loses')).not.toBeInTheDocument()
	})

	it('renders a custom bullet node', () => {
		render(<TimelineItem bullet={ <span data-testid="custom-bullet" /> } content="Body" />)
		expect(screen.getByTestId('custom-bullet')).toBeInTheDocument()
	})
})
