import { render, reset, screen } from '@/tests/test-utils'
import { Group } from '../Group'

describe('Group.Item', () => {
	reset('Group', 'Group.Item')

	it('renders its children inside a real Group', () => {
		render(
			<Group>
				<Group.Item>Item content</Group.Item>
			</Group>
		)
		expect(screen.getByText('Item content')).toBeInTheDocument()
	})

	it('renders as a div, since Group.Item has no registered `as` default of its own', () => {
		render(
			<Group>
				<Group.Item>Item content</Group.Item>
			</Group>
		)
		expect(screen.getByText('Item content').tagName).toBe('DIV')
	})

	it('throws when rendered outside a Group, per the REQUIRED useGroupCtx reader', () => {
		// Suppress the expected console.error noise from React's own
		// uncaught-error logging during this render.
		const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {})

		expect(() => render(<Group.Item>Standalone</Group.Item>))
			.toThrow('<Group.Item /> must be rendered inside <Group>')

		consoleError.mockRestore()
	})
})
