import userEvent from '@testing-library/user-event'
import { render, reset, screen, within } from '@/tests/test-utils'
import { Field } from '../Field'

describe('Field.Group', () => {
	reset('Field', 'Field.Group', 'Group', 'TextInput', 'Choice')

	let warn: jest.SpyInstance

	beforeEach(() => {
		warn = jest.spyOn(console, 'warn').mockImplementation(() => {})
	})

	afterEach(() => {
		warn.mockRestore()
	})

	it('renders a fieldset named by its legend', () => {
		render(
			<Field.Group legend="Contact details">
				<Field id="a" label="A"><Field.Input name="a" /></Field>
			</Field.Group>
		)

		const group = screen.getByRole('group', { name: 'Contact details' })
		expect(group.tagName).toBe('FIELDSET')
		expect(group.querySelector('legend')).toHaveTextContent('Contact details')
	})

	it('renders every Field it is given, each still labelled', () => {
		render(
			<Field.Group legend="Contact">
				<Field id="first" label="First"><Field.Input name="first" /></Field>
				<Field id="last" label="Last"><Field.Input name="last" /></Field>
			</Field.Group>
		)

		const group = screen.getByRole('group', { name: 'Contact' })
		expect(within(group).getByLabelText('First')).toBeInTheDocument()
		expect(within(group).getByLabelText('Last')).toBeInTheDocument()
	})

	it('marks the legend required with an asterisk hidden from assistive tech', () => {
		render(
			<Field.Group legend="Contact" required>
				<Field id="a" label="A"><Field.Input name="a" /></Field>
			</Field.Group>
		)

		expect(screen.getByText('*')).toHaveAttribute('aria-hidden', 'true')
		expect(screen.getByRole('group', { name: 'Contact' })).toBeInTheDocument()
	})

	it('shows no asterisk when not required', () => {
		render(
			<Field.Group legend="Contact">
				<Field id="a" label="A"><Field.Input name="a" /></Field>
			</Field.Group>
		)

		expect(screen.queryByText('*')).not.toBeInTheDocument()
	})

	describe('context propagation', () => {
		it('disables every Field in the group', () => {
			render(
				<Field.Group legend="G" disabled>
					<Field id="a" label="A"><Field.Input name="a" /></Field>
					<Field id="b" label="B"><Field.Textarea name="b" /></Field>
				</Field.Group>
			)

			expect(screen.getByLabelText('A')).toBeDisabled()
			expect(screen.getByLabelText('B')).toBeDisabled()
		})

		it('leaves fields enabled when the group is not disabled', () => {
			render(
				<Field.Group legend="G">
					<Field id="a" label="A"><Field.Input name="a" /></Field>
				</Field.Group>
			)

			expect(screen.getByLabelText('A')).toBeEnabled()
		})

		it('lets a Field override the group with its own disabled prop', () => {
			render(
				<Field.Group legend="G" disabled>
					<Field id="a" label="A" disabled={ false }><Field.Input name="a" /></Field>
					<Field id="b" label="B"><Field.Input name="b" /></Field>
				</Field.Group>
			)

			expect(screen.getByLabelText('A')).toBeEnabled()
			expect(screen.getByLabelText('B')).toBeDisabled()
		})

		it('sets data-disabled on each disabled Field root', () => {
			render(
				<Field.Group legend="G" disabled>
					<Field id="a" label="A"><Field.Input name="a" /></Field>
				</Field.Group>
			)

			expect(screen.getByLabelText('A').closest('[data-disabled]')).toBeInTheDocument()
		})

		it('moves every label after its control with labelPosition="last"', () => {
			render(
				<Field.Group legend="G" labelPosition="last">
					<Field id="a" label="A"><Field.Input name="a" /></Field>
					<Field id="b" label="B"><Field.Input name="b" /></Field>
				</Field.Group>
			)

			;['A', 'B'].forEach(name => {
				const input = screen.getByLabelText(name)
				expect(input.compareDocumentPosition(screen.getByText(name)) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
			})
		})

		it('applies the button layout to every Field', () => {
			const { container } = render(
				<Field.Group legend="Plan" layout="button">
					<Field id="a" label="Free"><Field.Choice name="plan" value="free" /></Field>
					<Field id="b" label="Pro"><Field.Choice name="plan" value="pro" /></Field>
				</Field.Group>
			)

			expect(container.querySelectorAll('.field--button')).toHaveLength(2)
			expect(screen.getByRole('radio', { name: /Free/ })).toBeInTheDocument()
			expect(screen.getByRole('radio', { name: /Pro/ })).toBeInTheDocument()
		})

		it('lets a Field override the group layout', () => {
			const { container } = render(
				<Field.Group legend="Plan" layout="button">
					<Field id="a" label="Free" layout="default"><Field.Choice name="plan" value="free" /></Field>
					<Field id="b" label="Pro"><Field.Choice name="plan" value="pro" /></Field>
				</Field.Group>
			)

			expect(container.querySelectorAll('.field--button')).toHaveLength(1)
		})

		it('passes the group type down to controls that do not set their own', () => {
			render(
				<Field.Group legend="Opts" type="checkbox">
					<Field id="a" label="A"><Field.Choice name="a" value="a" /></Field>
				</Field.Group>
			)

			expect(screen.getByRole('checkbox', { name: 'A' })).toBeInTheDocument()
		})
	})

	describe('interaction', () => {
		it('selects only one radio in a group and reports it checked', async () => {
			const user = userEvent.setup()
			render(
				<Field.Group legend="Plan">
					<Field id="a" label="Free"><Field.Choice name="plan" value="free" /></Field>
					<Field id="b" label="Pro"><Field.Choice name="plan" value="pro" /></Field>
				</Field.Group>
			)

			await user.click(screen.getByLabelText('Free'))
			await user.click(screen.getByLabelText('Pro'))

			expect(screen.getByLabelText('Pro')).toBeChecked()
			expect(screen.getByLabelText('Free')).not.toBeChecked()
		})

		it('does not let a disabled group be typed into', async () => {
			const user = userEvent.setup()
			render(
				<Field.Group legend="G" disabled>
					<Field id="a" label="A"><Field.Input name="a" /></Field>
				</Field.Group>
			)

			await user.type(screen.getByLabelText('A'), 'x')
			expect(screen.getByLabelText('A')).toHaveValue('')
		})
	})

	describe('child filtering', () => {
		it('warns about and drops anything that is not a Field', () => {
			render(
				<Field.Group legend="G">
					<Field id="a" label="A"><Field.Input name="a" /></Field>
					<p>stray</p>
				</Field.Group>
			)

			expect(warn).toHaveBeenCalledWith('Group: ignoring unrelated <p>.')
			expect(screen.queryByText('stray')).not.toBeInTheDocument()
			expect(screen.getByLabelText('A')).toBeInTheDocument()
		})

		it('stays silent when every child is a Field', () => {
			render(
				<Field.Group legend="G">
					<Field id="a" label="A"><Field.Input name="a" /></Field>
				</Field.Group>
			)

			expect(warn).not.toHaveBeenCalled()
		})
	})
})
