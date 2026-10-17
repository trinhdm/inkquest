import userEvent from '@testing-library/user-event'
import { getDefaultProps } from '@/hooks/useProps'
import { render, reset, screen } from '@/tests/test-utils'
import { Field } from './Field'

describe('Field', () => {
	reset('Field', 'Field.Group', 'TextInput', 'TextArea', 'Choice')

	let warn: jest.SpyInstance

	beforeEach(() => {
		warn = jest.spyOn(console, 'warn').mockImplementation(() => {})
	})

	afterEach(() => {
		warn.mockRestore()
	})

	describe('defaults', () => {
		it('registers a div root, not required, medium size', () => {
			expect(getDefaultProps('Field')).toEqual(expect.objectContaining({
				as: 'div', required: false, size: 'md',
			}))
		})

		it('exposes its parts through the parent', () => {
			expect(Field.Input.displayName).toBe('TextInput')
			expect(Field.Textarea.displayName).toBe('TextArea')
			expect(Field.Choice.displayName).toBe('Choice')
			expect(Field.Group.displayName).toBe('Field.Group')
		})
	})

	describe('label association', () => {
		it('labels a text input so it can be found by its label text', () => {
			render(
				<Field id="email" label="Email address">
					<Field.Input name="email" />
				</Field>
			)

			const input = screen.getByLabelText('Email address')
			expect(input.tagName).toBe('INPUT')
			expect(input).toHaveAttribute('id', 'email-control')
		})

		it('labels a textarea', () => {
			render(
				<Field id="bio" label="Biography">
					<Field.Textarea name="bio" />
				</Field>
			)

			expect(screen.getByLabelText('Biography').tagName).toBe('TEXTAREA')
		})

		it('labels a checkbox and a radio by role', () => {
			render(
				<>
					<Field id="terms" label="Accept terms">
						<Field.Choice name="terms" type="checkbox" value="yes" />
					</Field>
					<Field id="plan" label="Pro plan">
						<Field.Choice name="plan" value="pro" />
					</Field>
				</>
			)

			expect(screen.getByRole('checkbox', { name: 'Accept terms' })).toBeInTheDocument()
			expect(screen.getByRole('radio', { name: 'Pro plan' })).toBeInTheDocument()
		})

		it('kebab-cases the id the label points at', () => {
			render(
				<Field id="FirstName" label="First name">
					<Field.Input name="first" />
				</Field>
			)

			expect(screen.getByLabelText('First name')).toHaveAttribute('id', 'first-name-control')
		})

		it('focuses the control when the label is clicked', async () => {
			const user = userEvent.setup()
			render(
				<Field id="city" label="City">
					<Field.Input name="city" />
				</Field>
			)

			await user.click(screen.getByText('City'))
			expect(screen.getByLabelText('City')).toHaveFocus()
		})

		it('renders the label after the control with labelPosition="last"', () => {
			render(
				<Field id="a" label="After" labelPosition="last">
					<Field.Input name="a" />
				</Field>
			)

			const input = screen.getByLabelText('After'),
				label = screen.getByText('After')
			expect(input.compareDocumentPosition(label) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
		})

		it('renders the label before the control by default', () => {
			render(
				<Field id="a" label="Before">
					<Field.Input name="a" />
				</Field>
			)

			const input = screen.getByLabelText('Before'),
				label = screen.getByText('Before')
			expect(input.compareDocumentPosition(label) & Node.DOCUMENT_POSITION_PRECEDING).toBeTruthy()
		})

		it('renders no label element without a label prop', () => {
			const { container } = render(
				<Field id="a">
					<Field.Input name="a" aria-label="Bare" />
				</Field>
			)

			expect(container.querySelector('label')).toBeNull()
			expect(screen.getByLabelText('Bare')).toBeInTheDocument()
		})
	})

	describe('required', () => {
		it('marks the control required and hides the asterisk from assistive tech', () => {
			render(
				<Field id="name" label="Name" required>
					<Field.Input name="name" />
				</Field>
			)

			const input = screen.getByLabelText(/Name/)
			expect(input).toBeRequired()
			expect(input).toHaveAttribute('aria-required', 'true')
			expect(screen.getByText('*')).toHaveAttribute('aria-hidden', 'true')
		})

		it('is not required by default (positive control: required one differs)', () => {
			render(
				<>
					<Field id="a" label="Optional">
						<Field.Input name="a" />
					</Field>
					<Field id="b" label="Needed" required>
						<Field.Input name="b" />
					</Field>
				</>
			)

			const optional = screen.getByLabelText('Optional')
			expect(optional).not.toBeRequired()
			expect(optional).not.toHaveAttribute('aria-required')
			expect(screen.getByLabelText(/Needed/)).toBeRequired()
		})
	})

	describe('error', () => {
		it('links the error message to the control and flags it invalid', () => {
			render(
				<Field id="email" label="Email" error="Enter a valid email">
					<Field.Input name="email" />
				</Field>
			)

			const input = screen.getByLabelText('Email'),
				message = screen.getByText('Enter a valid email')

			expect(input).toHaveAttribute('aria-invalid', 'true')
			expect(input).toHaveAccessibleDescription('Enter a valid email')
			expect(input).toHaveAttribute('aria-describedby', message.id)
			expect(message.id).toBe('email-error')
		})

		it('sets data-invalid on the root when there is an error', () => {
			const { container } = render(
				<Field id="a" label="A" error="Nope">
					<Field.Input name="a" />
				</Field>
			)

			expect(container.firstElementChild).toHaveAttribute('data-invalid')
		})

		it('treats a whitespace-only error as no error', () => {
			const { container } = render(
				<Field id="a" label="A" error="   ">
					<Field.Input name="a" />
				</Field>
			)

			const input = screen.getByLabelText('A')
			expect(input).not.toHaveAttribute('aria-invalid')
			expect(input).not.toHaveAttribute('aria-describedby')
			expect(container.firstElementChild).not.toHaveAttribute('data-invalid')
			expect(container.querySelector('#a-error')).toBeNull()
		})

		it('reports errors on textarea and checkbox controls too', () => {
			render(
				<>
					<Field id="t" label="Text" error="Too short">
						<Field.Textarea name="t" />
					</Field>
					<Field id="c" label="Check" error="Required">
						<Field.Choice name="c" type="checkbox" value="1" />
					</Field>
				</>
			)

			expect(screen.getByLabelText('Text')).toHaveAccessibleDescription('Too short')
			expect(screen.getByLabelText('Check')).toHaveAttribute('aria-invalid', 'true')
		})
	})

	describe('caption', () => {
		it('renders the caption text', () => {
			render(
				<Field id="a" label="A" caption="We never share it">
					<Field.Input name="a" />
				</Field>
			)

			expect(screen.getByText('We never share it')).toBeInTheDocument()
		})
	})

	describe('disabled and loading', () => {
		it('disables the control and sets data-disabled on the root', () => {
			const { container } = render(
				<Field id="a" label="A" disabled>
					<Field.Input name="a" />
				</Field>
			)

			expect(screen.getByLabelText('A')).toBeDisabled()
			expect(container.firstElementChild).toHaveAttribute('data-disabled')
		})

		it('renders no data-disabled when enabled', () => {
			const { container } = render(
				<Field id="a" label="A">
					<Field.Input name="a" />
				</Field>
			)

			expect(screen.getByLabelText('A')).toBeEnabled()
			expect(container.firstElementChild).not.toHaveAttribute('data-disabled')
		})

		it('marks a loading field busy and shows a loader beside the control', () => {
			const { container } = render(
				<Field id="a" label="A" loading>
					<Field.Input name="a" />
				</Field>
			)

			expect(container.firstElementChild).toHaveAttribute('data-loading')
			expect(screen.getByLabelText('A')).toHaveAttribute('aria-busy', 'true')
			expect(container.querySelector('svg.field__loader')).toBeInTheDocument()
		})

		it('shows the loader when the control itself is loading', () => {
			const { container } = render(
				<Field id="a" label="A">
					<Field.Input name="a" loading />
				</Field>
			)

			expect(container.querySelector('svg.field__loader')).toBeInTheDocument()
		})

		it('has no loader or data-loading when idle', () => {
			const { container } = render(
				<Field id="a" label="A">
					<Field.Input name="a" />
				</Field>
			)

			expect(container.querySelector('svg.field__loader')).toBeNull()
			expect(container.firstElementChild).not.toHaveAttribute('data-loading')
			expect(screen.getByLabelText('A')).not.toHaveAttribute('aria-busy')
		})
	})

	describe('size', () => {
		it('derives padding and icon tokens from the size', () => {
			const { container } = render(
				<Field id="a" label="A" size="lg">
					<Field.Input name="a" />
				</Field>
			)

			const root = container.firstElementChild as HTMLElement
			expect(root.style.getPropertyValue('--field-padding-block')).toBe('var(--inkq-field-padding-lg)')
			expect(root.style.getPropertyValue('--field-icon-size')).toBe('calc(var(--inkq-icon-lg) - .125rem)')
		})

		it('uses the registered default size when none is given', () => {
			const { container } = render(
				<Field id="a" label="A">
					<Field.Input name="a" />
				</Field>
			)

			const root = container.firstElementChild as HTMLElement
			expect(root.style.getPropertyValue('--field-padding-block')).toBe('var(--inkq-field-padding-md)')
		})
	})

	describe('icons', () => {
		it('renders a type icon for non-text inputs', () => {
			const { container } = render(
				<Field id="a" label="A">
					<Field.Input name="a" type="email" />
				</Field>
			)

			expect(container.querySelector('.text-input__icon svg')).toBeInTheDocument()
		})

		it('renders no icon for plain text (positive control: email has one)', () => {
			const { container } = render(
				<>
					<Field id="a" label="A">
						<Field.Input name="a" />
					</Field>
					<Field id="b" label="B">
						<Field.Input name="b" type="email" />
					</Field>
				</>
			)

			expect(container.querySelectorAll('.text-input__icon')).toHaveLength(1)
		})
	})

	describe('button layout', () => {
		it('keeps the control reachable by its label while hiding it visually', () => {
			const { container } = render(
				<Field id="opt" label="Option A" caption="Details" layout="button">
					<Field.Choice name="opt" value="a" />
				</Field>
			)

			expect(screen.getByRole('radio', { name: /Option A/ })).toBeInTheDocument()
			expect(screen.getByText('Details')).toBeInTheDocument()
			expect(container.querySelector('.field__control')).toHaveClass('sr')
			expect(container.firstElementChild).toHaveClass('field--button')
		})

		it('does not render an asterisk or error text in the button layout', () => {
			render(
				<Field id="opt" label="Option A" layout="button" required error="Nope">
					<Field.Choice name="opt" value="a" />
				</Field>
			)

			expect(screen.queryByText('*')).not.toBeInTheDocument()
			expect(screen.queryByText('Nope')).not.toBeInTheDocument()
		})
	})

	describe('user interaction', () => {
		it('types into the labelled input', async () => {
			const user = userEvent.setup()
			render(
				<Field id="n" label="Name">
					<Field.Input name="n" />
				</Field>
			)

			const input = screen.getByLabelText('Name')
			await user.type(input, 'Ada')
			expect(input).toHaveValue('Ada')
		})

		it('does not accept typing while disabled', async () => {
			const user = userEvent.setup()
			render(
				<Field id="n" label="Name" disabled>
					<Field.Input name="n" />
				</Field>
			)

			const input = screen.getByLabelText('Name')
			await user.type(input, 'Ada')
			expect(input).toHaveValue('')
		})

		it('toggles a checkbox by clicking its label', async () => {
			const user = userEvent.setup()
			render(
				<Field id="t" label="Accept">
					<Field.Choice name="t" type="checkbox" value="y" />
				</Field>
			)

			await user.click(screen.getByText('Accept'))
			expect(screen.getByRole('checkbox', { name: 'Accept' })).toBeChecked()
		})
	})

	describe('child filtering', () => {
		it('warns about and drops an unrelated element', () => {
			render(
				<Field id="a" label="A">
					<Field.Input name="a" />
					<div>stray</div>
				</Field>
			)

			expect(warn).toHaveBeenCalledWith('Field: ignoring unrelated <div>.')
			expect(screen.queryByText('stray')).not.toBeInTheDocument()
			expect(screen.getByLabelText('A')).toBeInTheDocument()
		})

		it('warns about stray text', () => {
			render(
				<Field id="a" label="A">
					loose text
					<Field.Input name="a" />
				</Field>
			)

			expect(warn).toHaveBeenCalledWith('Field: ignoring unrelated loose text.')
		})

		it('renders only the first control and warns that the rest are over the limit', () => {
			render(
				<Field id="a" label="A">
					<Field.Input name="one" />
					<Field.Textarea name="two" />
				</Field>
			)

			expect(screen.queryByRole('textbox', { name: 'A' })).toBeInTheDocument()
			expect(document.querySelector('textarea')).toBeNull()
			expect(warn).toHaveBeenCalledTimes(1)
			expect(warn).toHaveBeenCalledWith('Field: 2 children found; a Field needs less than 2 children.')
		})

		it('stays silent for a single valid control', () => {
			render(
				<Field id="a" label="A">
					<Field.Input name="a" />
				</Field>
			)

			expect(warn).not.toHaveBeenCalled()
		})
	})

	describe('context requirement', () => {
		it('throws when a control is rendered outside a Field', () => {
			const error = jest.spyOn(console, 'error').mockImplementation(() => {})

			try {
				expect(() => render(<Field.Input name="x" />)).toThrow(
					"Field: <TextInput /> must be a direct child of <Field>; it can't be returned from another component"
				)
			} finally {
				error.mockRestore()
			}
		})
	})

	describe('polymorphism', () => {
		it('renders the root as the given element', () => {
			const { container } = render(
				<Field as="section" id="a" label="A">
					<Field.Input name="a" />
				</Field>
			)

			expect(container.firstElementChild?.tagName).toBe('SECTION')
		})
	})
})
