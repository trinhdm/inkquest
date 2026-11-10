import userEvent from '@testing-library/user-event'
import { render, reset, screen, within } from '@/tests/test-utils'
import { Field } from '../Field'
import { Form } from '../../Form'

describe('Field.Group', () => {
	reset('Field', 'Field.Group', 'Group', 'TextInput', 'Textarea', 'CodeInput', 'Choice', 'Form', 'Grid', 'Grid.Item')

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

	describe('required group', () => {
		it('makes every control required, shows the asterisk on the legend only, and not on any label', () => {
			render(
				<Field.Group legend="Contact" required>
					<Field id="a" label="First"><Field.Input name="a" /></Field>
					<Field id="b" label="Count"><Field.Code name="b" type="number" /></Field>
					<Field id="c" label="Notes"><Field.Textarea name="c" /></Field>
					<Field id="d" label="Agree"><Field.Choice name="d" type="checkbox" value="1" /></Field>
				</Field.Group>
			)

			for (const label of ['First', 'Count', 'Notes', 'Agree']) {
				const control = screen.getByLabelText(label)
				expect(control).toBeRequired()
				expect(control).toHaveAttribute('aria-required', 'true')
				expect(screen.getByText(label).querySelector('[aria-hidden]')).toBeNull()
			}

			const asterisks = screen.getAllByText('*')
			expect(asterisks).toHaveLength(1)
			expect(screen.getByText('Contact')).toContainElement(asterisks[0])
		})

		it('leaves controls optional when the group is not required (positive control)', () => {
			render(
				<Field.Group legend="Contact">
					<Field id="a" label="First"><Field.Input name="a" /></Field>
				</Field.Group>
			)

			expect(screen.getByLabelText('First')).not.toBeRequired()
			expect(screen.getByLabelText('First')).not.toHaveAttribute('aria-required')
		})
	})

	describe('context propagation', () => {
		it('disables a textarea and a choice as well as a text input', () => {
			render(
				<Field.Group legend="G" disabled>
					<Field id="a" label="A"><Field.Input name="a" /></Field>
					<Field id="b" label="B"><Field.Textarea name="b" /></Field>
					<Field id="c" label="C"><Field.Choice name="c" type="checkbox" value="1" /></Field>
				</Field.Group>
			)

			expect(screen.getByLabelText('A')).toBeDisabled()
			expect(screen.getByLabelText('B')).toBeDisabled()
			expect(screen.getByLabelText('C')).toBeDisabled()
		})

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

	describe('structure', () => {
		it('wraps the fieldset in a div root', () => {
			const { container } = render(
				<Field.Group legend="G">
					<Field id="a" label="A"><Field.Input name="a" /></Field>
				</Field.Group>
			)

			const root = container.firstElementChild as HTMLElement
			expect(root.tagName).toBe('DIV')
			expect(root).toContainElement(screen.getByRole('group', { name: 'G' }))
			expect(screen.getByRole('group', { name: 'G' }).parentElement).toBe(root)
		})

		it('renders the root as the given element', () => {
			const { container } = render(
				<Field.Group as="section" legend="G">
					<Field id="a" label="A"><Field.Input name="a" /></Field>
				</Field.Group>
			)

			expect(container.firstElementChild?.tagName).toBe('SECTION')
		})

		it('puts the legend first inside the fieldset', () => {
			render(
				<Field.Group legend="G">
					<Field id="a" label="A"><Field.Input name="a" /></Field>
				</Field.Group>
			)

			expect(screen.getByRole('group', { name: 'G' }).firstElementChild?.tagName).toBe('LEGEND')
		})

		it('gives the fieldset no explicit role, since it is already a group', () => {
			render(
				<Field.Group legend="G">
					<Field id="a" label="A"><Field.Input name="a" /></Field>
				</Field.Group>
			)

			expect(screen.getByRole('group', { name: 'G' })).not.toHaveAttribute('role')
		})
	})

	describe('group pass-through props', () => {
		it('hands columns and justify to the group as custom properties', () => {
			render(
				<Field.Group legend="G" columns={ 3 } justify="center">
					<Field id="a" label="A"><Field.Input name="a" /></Field>
				</Field.Group>
			)

			const set = screen.getByRole('group', { name: 'G' })
			expect(set.style.getPropertyValue('--group-item-count')).toBe('3')
			expect(set.style.getPropertyValue('--group-justify')).toBe('center')
		})

		it('marks full width and dividers on the fieldset', () => {
			render(
				<Field.Group legend="G" fullWidth divider>
					<Field id="a" label="A"><Field.Input name="a" /></Field>
				</Field.Group>
			)

			const set = screen.getByRole('group', { name: 'G' })
			expect(set).toHaveAttribute('data-block')
			expect(set).toHaveAttribute('data-divide')
		})

		it('marks neither when they are not set (positive control for the test above)', () => {
			render(
				<Field.Group legend="G">
					<Field id="a" label="A"><Field.Input name="a" /></Field>
				</Field.Group>
			)

			const set = screen.getByRole('group', { name: 'G' })
			expect(set).not.toHaveAttribute('data-block')
			expect(set).not.toHaveAttribute('data-divide')
		})

		it('reflects orientation as aria-orientation on the fieldset', () => {
			render(
				<Field.Group legend="G" orientation="horizontal">
					<Field id="a" label="A"><Field.Input name="a" /></Field>
				</Field.Group>
			)

			expect(screen.getByRole('group', { name: 'G' })).toHaveAttribute('aria-orientation', 'horizontal')
		})

		it('keeps the animation props off the DOM', () => {
			const error = jest.spyOn(console, 'error').mockImplementation(() => {})

			try {
				const { container } = render(
					<Field.Group legend="G" animated duration={ 300 } stagger={ 50 }>
						<Field id="a" label="A"><Field.Input name="a" /></Field>
					</Field.Group>
				)

				const root = container.firstElementChild as HTMLElement
				expect(root).not.toHaveAttribute('duration')
				expect(root).not.toHaveAttribute('stagger')
				expect(error).not.toHaveBeenCalled()
			} finally {
				error.mockRestore()
			}
		})
	})

	describe('form errors', () => {
		const renderInForm = (errors: Record<string, string | undefined>, groupName: string | null = 'contact') =>
			render(
				<Form state={ { errors, formError: undefined, message: undefined } } mountFocus={ false } shiftFocus={ false }>
					<Field.Group legend="Contact" name={ groupName ?? undefined }>
						<Field id="a" label="First"><Field.Input name="first" /></Field>
					</Field.Group>
				</Form>
			)

		it('shows the form error for the group name, prefixed for screen readers', () => {
			const { container } = renderInForm({ contact: 'Add at least one way to reach you' })

			const message = container.querySelector('.field-group__error') as HTMLElement
			expect(message).toHaveTextContent('Error: Add at least one way to reach you')
			expect(message.querySelector('.sr')).toHaveTextContent('Error:')
			expect(screen.getByRole('group', { name: 'Contact' })).toContainElement(message)
		})

		it('describes the fieldset with the error message', () => {
			const { container } = renderInForm({ contact: 'Add at least one way to reach you' })

			const set = screen.getByRole('group', { name: 'Contact' }),
				message = container.querySelector('.field-group__error') as HTMLElement

			expect(set).toHaveAttribute('aria-describedby', message.id)
			expect(set).toHaveAccessibleDescription('Error: Add at least one way to reach you')
		})

		it('marks the Fields inside invalid while the group has an error', () => {
			renderInForm({ contact: 'Add at least one way to reach you' })

			expect(screen.getByLabelText('First')).toHaveAttribute('aria-invalid', 'true')
		})

		it('shows no error and no aria-describedby when the form has none for this group', () => {
			const { container } = renderInForm({ other: 'Not mine' })

			expect(container.querySelector('.field-group__error')).toBeNull()
			expect(screen.getByRole('group', { name: 'Contact' })).not.toHaveAttribute('aria-describedby')
			expect(screen.getByLabelText('First')).not.toHaveAttribute('aria-invalid')
		})

		it('treats a whitespace-only error as no error', () => {
			const { container } = renderInForm({ contact: '   ' })

			expect(container.querySelector('.field-group__error')).toBeNull()
			expect(screen.getByRole('group', { name: 'Contact' })).not.toHaveAttribute('aria-describedby')
		})

		it('looks nothing up when the group has no name', () => {
			const { container } = renderInForm({ contact: 'Add at least one way to reach you' }, null)

			expect(container.querySelector('.field-group__error')).toBeNull()
		})

		it('renders without a Form around it, with no error', () => {
			const { container } = render(
				<Field.Group legend="G" name="contact">
					<Field id="a" label="A"><Field.Input name="a" /></Field>
				</Field.Group>
			)

			expect(container.querySelector('.field-group__error')).toBeNull()
		})
	})
})
