import userEvent from '@testing-library/user-event'
import { render, reset, screen } from '@/tests/test-utils'
import { Accordion } from '../Accordion'

describe('Accordion.Content', () => {
	reset('Accordion', 'Accordion.Title', 'Accordion.Content')

	it('renders as a labelled region containing its children', () => {
		render(
			<Accordion>
				<Accordion.Title>Section title</Accordion.Title>
				<Accordion.Content>Section body</Accordion.Content>
			</Accordion>
		)
		expect(screen.getByRole('region', { name: 'Section title' })).toHaveTextContent('Section body')
	})

	it('marks the inner wrapper inert while closed', () => {
		const { container } = render(
			<Accordion>
				<Accordion.Title>Section title</Accordion.Title>
				<Accordion.Content>Section body</Accordion.Content>
			</Accordion>
		)

		const inner = container.querySelector('[role="region"] > div')
		expect(inner).toHaveAttribute('inert')
	})

	it('removes inert from the inner wrapper once opened', async () => {
		const user = userEvent.setup()
		const { container } = render(
			<Accordion>
				<Accordion.Title>Section title</Accordion.Title>
				<Accordion.Content>Section body</Accordion.Content>
			</Accordion>
		)

		await user.click(screen.getByRole('button', { name: 'Section title' }))

		const inner = container.querySelector('[role="region"] > div')
		expect(inner).not.toHaveAttribute('inert')
	})
})
