import { resetVariantStyles } from '@/lib/registries'
import { resetComponentDefaults } from '@/lib/registries/componentDefaultProps'
import { renderWithTheme as render, screen } from '@/tests/test-utils'
import userEvent from '@testing-library/user-event'
import { Accordion } from '../Accordion'
import { AccordionGroup } from './AccordionGroup'

const item = (title: string, content: string) => (
	<Accordion key={ title }>
		<Accordion.Title>{ title }</Accordion.Title>
		<Accordion.Content>{ content }</Accordion.Content>
	</Accordion>
)

describe('AccordionGroup', () => {
	afterEach(() => {
		resetVariantStyles('AccordionGroup')
		resetVariantStyles('Accordion')
		resetVariantStyles('AccordionTitle')
		resetVariantStyles('AccordionContent')
	})

	afterAll(() => {
		resetComponentDefaults('AccordionGroup')
		resetComponentDefaults('Accordion')
		resetComponentDefaults('AccordionTitle')
		resetComponentDefaults('AccordionContent')
	})

	it('renders as a group container with a data-group marker', () => {
		const { container } = render(
			<AccordionGroup>
				{ item('One', 'First body') }
				{ item('Two', 'Second body') }
			</AccordionGroup>
		)
		expect(container.querySelector('[data-group]')).toBeInTheDocument()
	})

	it('assigns each child Accordion its position via context (steps layout numbering)', () => {
		render(
			<AccordionGroup layout="steps">
				{ item('One', 'First body') }
				{ item('Two', 'Second body') }
				{ item('Three', 'Third body') }
			</AccordionGroup>
		)

		expect(screen.getByText('01')).toBeInTheDocument()
		expect(screen.getByText('02')).toBeInTheDocument()
		expect(screen.getByText('03')).toBeInTheDocument()
	})

	it('defaults to type="single": opening one item closes any other that was open', async () => {
		const user = userEvent.setup()
		render(
			<AccordionGroup defaultOpen={ 0 }>
				{ item('One', 'First body') }
				{ item('Two', 'Second body') }
			</AccordionGroup>
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
			<AccordionGroup defaultOpen={ [] } type="multiple">
				{ item('One', 'First body') }
				{ item('Two', 'Second body') }
			</AccordionGroup>
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
			<AccordionGroup defaultOpen={ 0 }>
				{ item('One', 'First body') }
				{ item('Two', 'Second body') }
			</AccordionGroup>
		)

		const [first] = screen.getAllByRole('button')
		expect(first).toHaveAttribute('aria-expanded', 'true')

		await user.click(first)
		expect(first).toHaveAttribute('aria-expanded', 'false')
	})

	it('when collapsible=false, clicking the only open item in "single" mode leaves it open', async () => {
		const user = userEvent.setup()
		render(
			<AccordionGroup collapsible={ false } defaultOpen={ 0 }>
				{ item('One', 'First body') }
				{ item('Two', 'Second body') }
			</AccordionGroup>
		)

		const [first] = screen.getAllByRole('button')
		expect(first).toHaveAttribute('aria-expanded', 'true')

		await user.click(first)
		expect(first).toHaveAttribute('aria-expanded', 'true')
	})

	it('honours defaultOpen as an array of indices when type="multiple"', () => {
		render(
			<AccordionGroup defaultOpen={ [0, 2] } type="multiple">
				{ item('One', 'First body') }
				{ item('Two', 'Second body') }
				{ item('Three', 'Third body') }
			</AccordionGroup>
		)

		const [first, second, third] = screen.getAllByRole('button')
		expect(first).toHaveAttribute('aria-expanded', 'true')
		expect(second).toHaveAttribute('aria-expanded', 'false')
		expect(third).toHaveAttribute('aria-expanded', 'true')
	})

	it('supports ArrowDown/ArrowUp keyboard navigation between titles in the group', async () => {
		const user = userEvent.setup()
		render(
			<AccordionGroup>
				{ item('One', 'First body') }
				{ item('Two', 'Second body') }
			</AccordionGroup>
		)

		const [first, second] = screen.getAllByRole('button')
		first.focus()
		await user.keyboard('{ArrowDown}')
		expect(second).toHaveFocus()

		await user.keyboard('{ArrowUp}')
		expect(first).toHaveFocus()
	})

	it('drops children that are not Accordion instances', () => {
		render(
			<AccordionGroup>
				{ item('One', 'First body') }
				<div>not an accordion</div>
			</AccordionGroup>
		)

		expect(screen.queryByText('not an accordion')).not.toBeInTheDocument()
		expect(screen.getAllByRole('button')).toHaveLength(1)
	})
})
