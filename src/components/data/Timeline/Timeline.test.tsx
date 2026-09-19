import { getDefaultProps } from '@/hooks/useProps'
import { render, reset, screen } from '@/tests/test-utils'
import { Timeline } from './Timeline'

describe('Timeline', () => {
	reset('Timeline', 'TimelineItem')

	it('renders every Timeline.Item child', () => {
		render(
			<Timeline>
				<Timeline.Item content="First entry" title="One" />
				<Timeline.Item content="Second entry" title="Two" />
			</Timeline>
		)

		expect(screen.getByText('One')).toBeInTheDocument()
		expect(screen.getByText('First entry')).toBeInTheDocument()
		expect(screen.getByText('Two')).toBeInTheDocument()
		expect(screen.getByText('Second entry')).toBeInTheDocument()
	})

	it('drops children that are not Timeline.Item instances', () => {
		render(
			<Timeline>
				<Timeline.Item content="Kept entry" title="Kept" />
				<div>Not a timeline item</div>
			</Timeline>
		)

		expect(screen.getByText('Kept')).toBeInTheDocument()
		expect(screen.queryByText('Not a timeline item')).not.toBeInTheDocument()
	})

	it('renders as a div by default per its registered defaults', () => {
		const { container } = render(<Timeline><Timeline.Item content="Only" /></Timeline>)
		expect(getDefaultProps<Timeline.Props & { as: string }>('Timeline').as).toBe('div')
		expect(container.firstChild?.nodeName).toBe('DIV')
	})

	it('renders as a custom element when `as` is overridden', () => {
		const { container } = render(<Timeline as="section"><Timeline.Item content="Only" /></Timeline>)
		expect(container.querySelector('section')).toBeInTheDocument()
	})
})
