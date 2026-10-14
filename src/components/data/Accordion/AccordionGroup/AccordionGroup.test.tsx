import userEvent from '@testing-library/user-event'
import { render, reset, screen } from '@/tests/test-utils'
import { getDefaultProps } from '@/hooks/useProps'
import { Accordion } from '@/components/data/Accordion'

const item = (title: string, content: string) => (
	<Accordion key={ title }>
		<Accordion.Title>{ title }</Accordion.Title>
		<Accordion.Content>{ content }</Accordion.Content>
	</Accordion>
)

describe('Accordion.Group', () => {
	// `Accordion.Title` renders a real `Icon` for its default "plus" indicator.
	reset('Accordion.Group', 'Accordion', 'Accordion.Title', 'Accordion.Content', 'Icon')

	it('registers defaults of collapsible="single", defaultOpen=0, order=3, size="md"', () => {
		expect(getDefaultProps<Accordion.Group.Props>('Accordion.Group')).toEqual({
			collapsible: 'single',
			defaultOpen: 0,
			order: 3,
			size: 'md',
		})
	})

	it('defaults defaultOpen to 0, so the first item starts open with no defaultOpen given', () => {
		render(
			<Accordion.Group>
				{ item('One', 'First body') }
				{ item('Two', 'Second body') }
			</Accordion.Group>
		)

		const [first, second] = screen.getAllByRole('button')
		expect(first).toHaveAttribute('aria-expanded', 'true')
		expect(second).toHaveAttribute('aria-expanded', 'false')
	})

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

	it('defaults to collapsible="single": opening one item closes any other that was open', async () => {
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

	it('allows several open at once when collapsible="multiple"', async () => {
		const user = userEvent.setup()
		render(
			<Accordion.Group defaultOpen={ [] } collapsible="multiple">
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

	it('when collapsible=false, the only open item in "single" mode stays open and is non-interactive', async () => {
		const user = userEvent.setup()
		render(
			<Accordion.Group collapsible={ false } defaultOpen={ 0 }>
				{ item('One', 'First body') }
				{ item('Two', 'Second body') }
			</Accordion.Group>
		)

		expect(screen.queryAllByRole('button')).toHaveLength(0)

		const [first] = screen.getAllByRole('region')
		expect(first).toBeVisible()

		const title = document.querySelector('[data-title]') as HTMLElement
		expect(title.tagName).toBe('DIV')
		expect(title).not.toHaveAttribute('aria-expanded')

		await user.click(title)
		expect(first).toBeVisible()
		expect(title).not.toHaveAttribute('aria-expanded')
	})

	it('honours defaultOpen as an array of indices when collapsible="multiple"', () => {
		render(
			<Accordion.Group defaultOpen={ [0, 2] } collapsible="multiple">
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

	it('closes an item in collapsible="multiple" mode when it is clicked again (removes it from openItems)', async () => {
		const user = userEvent.setup()
		render(
			<Accordion.Group defaultOpen={ [] } collapsible="multiple">
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

	it('drops children that are not Accordion instances, and warns about them', () => {
		const warn = jest.spyOn(console, 'warn').mockImplementation(() => {})

		try {
			render(
				<Accordion.Group>
					{ item('One', 'First body') }
					<div>not an accordion</div>
				</Accordion.Group>
			)

			expect(screen.queryByText('not an accordion')).not.toBeInTheDocument()
			expect(screen.getAllByRole('button')).toHaveLength(1)
			expect(warn).toHaveBeenCalledWith('Accordion.Group: ignoring unrelated <div>.')
		} finally {
			warn.mockRestore()
		}
	})
})
