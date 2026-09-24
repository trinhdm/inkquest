import userEvent from '@testing-library/user-event'
import { render, reset, screen } from '@/tests/test-utils'
import { Accordion } from '../Accordion'

type ItemProps =
	Omit<Accordion.Props, 'children'>

const item = (title: string, content: string, props?: ItemProps) => (
	<Accordion key={ title } { ...props }>
		<Accordion.Title>{ title }</Accordion.Title>
		<Accordion.Content>{ content }</Accordion.Content>
	</Accordion>
)

describe('Accordion.Title', () => {
	reset('Accordion.Group', 'Accordion', 'Accordion.Title', 'Accordion.Content')

	it('renders as a native button element', () => {
		render(
			<Accordion>
				<Accordion.Title>Section title</Accordion.Title>
				<Accordion.Content>Body</Accordion.Content>
			</Accordion>
		)
		expect(screen.getByRole('button', { name: 'Section title' }).tagName).toBe('BUTTON')
	})

	it('renders a chevron indicator icon when indicator="chevron"', () => {
		const { container } = render(
			<Accordion indicator="chevron">
				<Accordion.Title>Section title</Accordion.Title>
				<Accordion.Content>Body</Accordion.Content>
			</Accordion>
		)
		expect(container.querySelector('svg')).toBeInTheDocument()
	})

	it('sets the native disabled attribute on the button when Accordion is disabled', () => {
		render(
			<Accordion disabled>
				<Accordion.Title>Section title</Accordion.Title>
				<Accordion.Content>Body</Accordion.Content>
			</Accordion>
		)
		expect(screen.getByRole('button', { name: 'Section title' })).toBeDisabled()
	})

	it('supports Home/End keyboard navigation to jump to the first/last title in the group', async () => {
		const user = userEvent.setup()
		render(
			<Accordion.Group>
				{ item('One', 'First body') }
				{ item('Two', 'Second body') }
				{ item('Three', 'Third body') }
			</Accordion.Group>
		)

		const [first, , third] = screen.getAllByRole('button')
		first.focus()

		await user.keyboard('{End}')
		expect(third).toHaveFocus()

		await user.keyboard('{Home}')
		expect(first).toHaveFocus()
	})

	it('ignores keys other than ArrowUp/ArrowDown/Home/End, leaving focus untouched', async () => {
		const user = userEvent.setup()
		render(
			<Accordion.Group>
				{ item('One', 'First body') }
				{ item('Two', 'Second body') }
			</Accordion.Group>
		)

		const [first] = screen.getAllByRole('button')
		first.focus()

		await user.keyboard('{ArrowLeft}')
		expect(first).toHaveFocus()
	})

	it('does nothing on keydown when the title has no enclosing [data-group] ancestor', async () => {
		const user = userEvent.setup()
		render(
			<Accordion>
				<Accordion.Title>Section title</Accordion.Title>
				<Accordion.Content>Body</Accordion.Content>
			</Accordion>
		)

		const title = screen.getByRole('button', { name: 'Section title' })
		title.focus()

		// no [data-group] ancestor outside an Accordion.Group — the handler
		// bails out early rather than throwing on a null querySelector result
		await user.keyboard('{ArrowDown}')
		expect(title).toHaveFocus()
	})

	it('arrow-key nav skips a non-collapsible title in a mixed group', async () => {
		const user = userEvent.setup()
		render(
			<Accordion.Group>
				{ item('One', 'First body') }
				{ item('Two', 'Second body', { collapsible: false }) }
				{ item('Three', 'Third body') }
			</Accordion.Group>
		)

		const buttons = screen.getAllByRole('button')
		expect(buttons).toHaveLength(2)   // the middle title is a div

		buttons[0].focus()
		await user.keyboard('{ArrowDown}')
		expect(buttons[1]).toHaveFocus()  // fails today: focus stays on buttons[0]

		await user.keyboard('{ArrowDown}')
		expect(buttons[0]).toHaveFocus()  // wraps across the skipped div
	})
})
