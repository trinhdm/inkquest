import userEvent from '@testing-library/user-event'
import { render, reset, screen } from '@/tests/test-utils'
import { Accordion } from '../Accordion'

const item = (title: string, content: string) => (
	<Accordion key={ title }>
		<Accordion.Title>{ title }</Accordion.Title>
		<Accordion.Content>{ content }</Accordion.Content>
	</Accordion>
)

describe('Accordion.Group', () => {
	reset('Accordion.Group', 'Accordion', 'Accordion.Title', 'Accordion.Content')

	it('renders as a group container with a data-group marker', () => {
		const { container } = render(
			<Accordion.Group>
				{ item('One', 'First body') }
				{ item('Two', 'Second body') }
			</Accordion.Group>
		)
		expect(container.querySelector('[data-group]')).toBeInTheDocument()
	})

	it('assigns each child Accordion its position via context (steps layout numbering)', () => {
		render(
			<Accordion.Group layout="steps">
				{ item('One', 'First body') }
				{ item('Two', 'Second body') }
				{ item('Three', 'Third body') }
			</Accordion.Group>
		)

		expect(screen.getByText('01')).toBeInTheDocument()
		expect(screen.getByText('02')).toBeInTheDocument()
		expect(screen.getByText('03')).toBeInTheDocument()
	})

	it('defaults to type="single": opening one item closes any other that was open', async () => {
		const user = userEvent.setup()
		render(
			<Accordion.Group defaultOpen={ 0 }>
				{ item('One', 'First body') }
				{ item('Two', 'Second body') }
			</Accordion.Group>
		)

		const [first, second] = screen.getAllByRole('button')
		expect(first).toHaveAttribute('aria-expanded', 'true')
		expect(second).toHaveAttribute('aria-expanded', 'false')

		await user.click(second)

		expect(first).toHaveAttribute('aria-expanded', 'false')
		expect(second).toHaveAttribute('aria-expanded', 'true')
	})

	it('allows several open at once when type="multiple"', async () => {
		const user = userEvent.setup()
		render(
			<Accordion.Group defaultOpen={ [] } type="multiple">
				{ item('One', 'First body') }
				{ item('Two', 'Second body') }
			</Accordion.Group>
		)

		const [first, second] = screen.getAllByRole('button')
		await user.click(first)
		await user.click(second)

		expect(first).toHaveAttribute('aria-expanded', 'true')
		expect(second).toHaveAttribute('aria-expanded', 'true')
	})

	it('defaults collapsible=true: clicking the only open item in "single" mode closes it', async () => {
		const user = userEvent.setup()
		render(
			<Accordion.Group defaultOpen={ 0 }>
				{ item('One', 'First body') }
				{ item('Two', 'Second body') }
			</Accordion.Group>
		)

		const [first] = screen.getAllByRole('button')
		expect(first).toHaveAttribute('aria-expanded', 'true')

		await user.click(first)
		expect(first).toHaveAttribute('aria-expanded', 'false')
	})

	it('when collapsible=false, clicking the only open item in "single" mode leaves it open', async () => {
		const user = userEvent.setup()
		render(
			<Accordion.Group collapsible={ false } defaultOpen={ 0 }>
				{ item('One', 'First body') }
				{ item('Two', 'Second body') }
			</Accordion.Group>
		)

		const [first] = screen.getAllByRole('button')
		expect(first).toHaveAttribute('aria-expanded', 'true')

		await user.click(first)
		expect(first).toHaveAttribute('aria-expanded', 'true')
	})

	it('honours defaultOpen as an array of indices when type="multiple"', () => {
		render(
			<Accordion.Group defaultOpen={ [0, 2] } type="multiple">
				{ item('One', 'First body') }
				{ item('Two', 'Second body') }
				{ item('Three', 'Third body') }
			</Accordion.Group>
		)

		const [first, second, third] = screen.getAllByRole('button')
		expect(first).toHaveAttribute('aria-expanded', 'true')
		expect(second).toHaveAttribute('aria-expanded', 'false')
		expect(third).toHaveAttribute('aria-expanded', 'true')
	})

	it('supports ArrowDown/ArrowUp keyboard navigation between titles in the group', async () => {
		const user = userEvent.setup()
		render(
			<Accordion.Group>
				{ item('One', 'First body') }
				{ item('Two', 'Second body') }
			</Accordion.Group>
		)

		const [first, second] = screen.getAllByRole('button')
		first.focus()
		await user.keyboard('{ArrowDown}')
		expect(second).toHaveFocus()

		await user.keyboard('{ArrowUp}')
		expect(first).toHaveFocus()
	})

	it('closes an item in type="multiple" mode when it is clicked again (removes it from openItems)', async () => {
		const user = userEvent.setup()
		render(
			<Accordion.Group defaultOpen={ [] } type="multiple">
				{ item('One', 'First body') }
				{ item('Two', 'Second body') }
			</Accordion.Group>
		)

		const [first, second] = screen.getAllByRole('button')
		await user.click(first)
		await user.click(second)
		expect(first).toHaveAttribute('aria-expanded', 'true')
		expect(second).toHaveAttribute('aria-expanded', 'true')

		await user.click(first)
		expect(first).toHaveAttribute('aria-expanded', 'false')
		expect(second).toHaveAttribute('aria-expanded', 'true')
	})

	it('drops children that are not Accordion instances', () => {
		render(
			<Accordion.Group>
				{ item('One', 'First body') }
				<div>not an accordion</div>
			</Accordion.Group>
		)

		expect(screen.queryByText('not an accordion')).not.toBeInTheDocument()
		expect(screen.getAllByRole('button')).toHaveLength(1)
	})
})
