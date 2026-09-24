import userEvent from '@testing-library/user-event'
import { render, reset, screen } from '@/tests/test-utils'
import { Accordion } from './Accordion'

const buildAccordion = (props: Partial<Accordion.Props> = {}) => (
	<Accordion { ...props }>
		<Accordion.Title>Section title</Accordion.Title>
		<Accordion.Content>Section body</Accordion.Content>
	</Accordion>
)

describe('Accordion', () => {
	reset('Accordion', 'Accordion.Title', 'Accordion.Content')

	it('renders the title as a button and the content as a labelled region', () => {
		render(buildAccordion())

		expect(screen.getByRole('button', { name: 'Section title' })).toBeInTheDocument()
		expect(screen.getByRole('region', { name: 'Section title' })).toHaveTextContent('Section body')
	})

	it('defaults to closed (no data-open, aria-expanded=false) when no open/defaultOpen is given', () => {
		render(buildAccordion())

		const title = screen.getByRole('button', { name: 'Section title' })
		expect(title).toHaveAttribute('aria-expanded', 'false')
		expect(title).not.toHaveAttribute('data-open')
	})

	it('opens uncontrolled on click and reflects it via aria-expanded/data-open', async () => {
		const user = userEvent.setup()
		render(buildAccordion())

		const title = screen.getByRole('button', { name: 'Section title' })
		await user.click(title)

		expect(title).toHaveAttribute('aria-expanded', 'true')
		expect(title).toHaveAttribute('data-open', '')
	})

	it('toggles closed again on a second click when uncontrolled', async () => {
		const user = userEvent.setup()
		render(buildAccordion())

		const title = screen.getByRole('button', { name: 'Section title' })
		await user.click(title)
		await user.click(title)

		expect(title).toHaveAttribute('aria-expanded', 'false')
	})

	it('honours defaultOpen to start expanded', () => {
		render(buildAccordion({ defaultOpen: true }))
		expect(screen.getByRole('button', { name: 'Section title' })).toHaveAttribute('aria-expanded', 'true')
	})

	it('treats `open` as controlled and ignores clicks toggling its own state', async () => {
		const user = userEvent.setup()
		render(buildAccordion({ open: true }))

		const title = screen.getByRole('button', { name: 'Section title' })
		expect(title).toHaveAttribute('aria-expanded', 'true')

		await user.click(title)
		// still true — a controlled accordion only changes via `onToggle`, not internal state
		expect(title).toHaveAttribute('aria-expanded', 'true')
	})

	it('calls onToggle and onItemToggle with the next open state and index on click', async () => {
		const user = userEvent.setup()
		const onToggle = jest.fn()
		const onItemToggle = jest.fn()
		render(buildAccordion({ index: 2, onToggle, onItemToggle }))

		await user.click(screen.getByRole('button', { name: 'Section title' }))

		expect(onToggle).toHaveBeenCalledWith(true)
		expect(onItemToggle).toHaveBeenCalledWith(2, true)
	})

	it('does not toggle or fire callbacks when disabled', async () => {
		const user = userEvent.setup()
		const onToggle = jest.fn()
		render(buildAccordion({ disabled: true, onToggle }))

		const title = screen.getByRole('button', { name: 'Section title' })
		await user.click(title)

		expect(title).toHaveAttribute('aria-expanded', 'false')
		expect(onToggle).not.toHaveBeenCalled()
	})

	it('wires aria-controls on the title to the content region id it renders', () => {
		render(buildAccordion({ id: 'billing' }))

		const title = screen.getByRole('button', { name: 'Section title' })
		const content = screen.getByRole('region', { name: 'Section title' })

		expect(title).toHaveAttribute('aria-controls', content.id)
		expect(content).toHaveAttribute('aria-labelledby', title.id)
	})

	it('defaults to a "plus" indicator, rendering an icon inside the title', () => {
		const { container } = render(buildAccordion())
		expect(container.querySelector('svg')).toBeInTheDocument()
	})

	it('renders no indicator icon when indicator="none"', () => {
		const { container } = render(buildAccordion({ indicator: 'none' }))
		expect(container.querySelector('svg')).not.toBeInTheDocument()
	})

	it('renders a zero-padded step number on the title when layout="steps"', () => {
		render(buildAccordion({ layout: 'steps', index: 0 }))
		expect(screen.getByText('01')).toBeInTheDocument()
	})

	it('renders no step number when layout is not "steps"', () => {
		render(buildAccordion({ index: 0 }))
		expect(screen.queryByText('01')).not.toBeInTheDocument()
	})

	it('throws when Accordion.Title is rendered outside an Accordion', () => {
		const spy = jest.spyOn(console, 'error').mockImplementation(() => {})
		expect(() => render(<Accordion.Title>Orphan</Accordion.Title>)).toThrow(
			'<Accordion.Title /> must be rendered inside <Accordion>'
		)
		spy.mockRestore()
	})

	it('throws when Accordion.Content is rendered outside an Accordion', () => {
		const spy = jest.spyOn(console, 'error').mockImplementation(() => {})
		expect(() => render(<Accordion.Content>Orphan</Accordion.Content>)).toThrow(
			'<Accordion.Content /> must be rendered inside <Accordion>'
		)
		spy.mockRestore()
	})

	it('warns and renders nothing but the wrapper chrome when Title or Content is missing', () => {
		const spy = jest.spyOn(console, 'warn').mockImplementation(() => {})
		render(<Accordion>Just some text</Accordion>)

		expect(spy).toHaveBeenCalled()
		expect(screen.queryByRole('button')).not.toBeInTheDocument()
		spy.mockRestore()
	})

	it('warns about a missing Accordion.Title when there are no matching children at all', () => {
		const spy = jest.spyOn(console, 'warn').mockImplementation(() => {})
		render(<Accordion>{ null }</Accordion>)

		expect(spy).toHaveBeenCalledWith(expect.stringContaining('no Accordion.Title found'))
		spy.mockRestore()
	})

	it('warns about multiple Accordion.Title/Accordion.Content found when more than one of each is given', () => {
		const spy = jest.spyOn(console, 'warn').mockImplementation(() => {})
		render(
			<Accordion>
				<Accordion.Title>One</Accordion.Title>
				<Accordion.Title>Two</Accordion.Title>
				<Accordion.Content>Body</Accordion.Content>
			</Accordion>
		)

		expect(spy).toHaveBeenCalledWith(expect.stringContaining('multiple Accordion.Title, Accordion.Content found'))
		spy.mockRestore()
	})

	it('warns about children outside of Title/Content when an unrelated element is also passed', () => {
		const spy = jest.spyOn(console, 'warn').mockImplementation(() => {})
		render(
			<Accordion>
				<Accordion.Title>Section title</Accordion.Title>
				<Accordion.Content>Section body</Accordion.Content>
				<div>Extra child</div>
			</Accordion>
		)

		expect(spy).toHaveBeenCalledWith(expect.stringContaining('children outside of Accordion.Title, Accordion.Content detected'))
		spy.mockRestore()
	})

	it('renders an unpadded step number (no leading zero) once the index reaches double digits', () => {
		render(buildAccordion({ layout: 'steps', index: 9 }))
		expect(screen.getByText('10')).toBeInTheDocument()
	})
})
