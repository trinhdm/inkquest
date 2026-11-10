import { useState } from 'react'
import userEvent from '@testing-library/user-event'
import { getDefaultProps } from '@/hooks/useProps'
import { render, reset, screen } from '@/tests/test-utils'
import { Field } from '../Field'

const Controlled = ({ onChange }: { onChange?: (value: string) => void }) => {
	const [value, setValue] = useState('')

	return (
		<Field id="c" label="Controlled">
			<Field.Input
				name="c"
				onChange={ e => {
					setValue(e.target.value)
					onChange?.(e.target.value)
				} }
				value={ value }
			/>
		</Field>
	)
}

describe('TextInput', () => {
	reset('Field', 'TextInput')

	it('defaults to an input element of type text, and not required', () => {
		expect(getDefaultProps('TextInput')).toEqual({ as: 'input', type: 'text' })

		render(<Field id="a" label="A"><Field.Input name="a" /></Field>)
		const input = screen.getByRole('textbox', { name: 'A' })
		expect(input).toHaveAttribute('type', 'text')
		expect(input).not.toBeRequired()
	})

	it('forwards name and placeholder to the input', () => {
		render(<Field id="a" label="A"><Field.Input name="email" placeholder="you@example.com" /></Field>)

		const input = screen.getByPlaceholderText('you@example.com')
		expect(input).toHaveAttribute('name', 'email')
		expect(input).toBe(screen.getByLabelText('A'))
	})

	it('forwards autoComplete to the input', () => {
		render(<Field id="a" label="A"><Field.Input autoComplete="current-password" name="a" type="password" /></Field>)
		expect(screen.getByLabelText('A')).toHaveAttribute('autocomplete', 'current-password')
	})

	it('takes its id from the surrounding Field so the label can find it', () => {
		render(<Field id="user" label="User"><Field.Input name="u" /></Field>)

		expect(screen.getByLabelText('User')).toHaveAttribute('id', 'user-control')
	})

	describe('type', () => {
		it.each(['email', 'number', 'password', 'search', 'tel', 'url'] as const)(
			'renders a %s input',
			type => {
				render(<Field id="a" label="A"><Field.Input name="a" type={ type } /></Field>)

				expect(screen.getByLabelText('A')).toHaveAttribute('type', type)
			}
		)

		it('exposes searchbox and spinbutton roles for search and number', () => {
			render(
				<>
					<Field id="s" label="S"><Field.Input name="s" type="search" /></Field>
					<Field id="n" label="N"><Field.Input name="n" type="number" /></Field>
				</>
			)

			expect(screen.getByRole('searchbox', { name: 'S' })).toBeInTheDocument()
			expect(screen.getByRole('spinbutton', { name: 'N' })).toBeInTheDocument()
		})

		it('inherits type from the Field when it sets none', () => {
			render(<Field id="a" label="A" type="email"><Field.Input name="a" /></Field>)

			expect(screen.getByLabelText('A')).toHaveAttribute('type', 'email')
		})

		it('prefers its own type over the Field type', () => {
			render(<Field id="a" label="A" type="email"><Field.Input name="a" type="tel" /></Field>)

			expect(screen.getByLabelText('A')).toHaveAttribute('type', 'tel')
		})
	})

	describe('icon', () => {
		it('renders no icon for plain text', () => {
			const { container } = render(<Field id="a" label="A"><Field.Input name="a" /></Field>)

			expect(container.querySelector('.text-input__icon')).toBeNull()
		})

		it('renders a type icon for email', () => {
			const { container } = render(<Field id="a" label="A"><Field.Input name="a" type="email" /></Field>)

			expect(container.querySelector('.text-input__icon svg')).toBeInTheDocument()
		})

		it('puts the icon on the left by default and the right when asked', () => {
			render(
				<>
					<Field id="l" label="L"><Field.Input name="l" type="email" /></Field>
					<Field id="r" label="R"><Field.Input name="r" type="email" iconPosition="right" /></Field>
				</>
			)

			// the icon span follows the input inside the field's control wrapper
			const iconOf = (label: string) =>
				screen.getByLabelText(label).closest('.field__control')?.querySelector('.text-input__icon') as HTMLElement

			const left = iconOf('L'),
				right = iconOf('R')

			expect(left).toBeInTheDocument()
			expect(right).toBeInTheDocument()

			expect(left.style.getPropertyValue('--form-control-icon-inset')).toBe('0 auto')
			expect(right.style.getPropertyValue('--form-control-icon-inset')).toBe('auto 0')
		})
	})

	describe('password toggle', () => {
		it('renders a labelled, non-submitting toggle button', () => {
			render(<Field id="a" label="A"><Field.Input name="a" type="password" /></Field>)
			const toggle = screen.getByRole('button', { name: 'Show password' })
			expect(toggle).toHaveAttribute('type', 'button')
			expect(toggle).toHaveAttribute('aria-pressed', 'false')
		})
		it('sits inside the icon span, which follows the input in the control wrapper', () => {
			render(<Field id="a" label="A"><Field.Input name="a" type="password" /></Field>)
			const input = screen.getByLabelText('A'),
				toggle = screen.getByRole('button', { name: 'Show password' }),
				icon = toggle.closest('.text-input__icon') as HTMLElement

			expect(icon).toBeInTheDocument()
			expect(input.nextElementSibling).toBe(icon)
			expect(input.closest('.field__control')).toContainElement(icon)
		})
		it('points aria-controls at the input', () => {
			render(<Field id="a" label="A"><Field.Input name="a" type="password" /></Field>)
			expect(screen.getByRole('button', { name: 'Show password' })).toHaveAttribute('aria-controls', 'a-control')
		})
		it('shows and hides the password on click', async () => {
			const user = userEvent.setup()
			render(<Field id="a" label="A"><Field.Input name="a" type="password" /></Field>)
			const input = screen.getByLabelText('A'),
				toggle = screen.getByRole('button', { name: 'Show password' })
			await user.click(toggle)
			expect(input).toHaveAttribute('type', 'text')
			expect(toggle).toHaveAttribute('aria-pressed', 'true')
			await user.click(toggle)
			expect(input).toHaveAttribute('type', 'password')
			expect(toggle).toHaveAttribute('aria-pressed', 'false')
		})
		it('comes after the input in tab order and toggles with Enter and Space', async () => {
			const user = userEvent.setup()
			render(<Field id="a" label="A"><Field.Input name="a" type="password" /></Field>)
			const input = screen.getByLabelText('A'),
				toggle = screen.getByRole('button', { name: 'Show password' })
			await user.tab()
			expect(input).toHaveFocus()
			await user.tab()
			expect(toggle).toHaveFocus()
			await user.keyboard('{Enter}')
			expect(input).toHaveAttribute('type', 'text')
			await user.keyboard(' ')
			expect(input).toHaveAttribute('type', 'password')
		})
		it('works when the password type comes from the Field', async () => {
			const user = userEvent.setup()
			render(<Field id="a" label="A" type="password"><Field.Input name="a" /></Field>)
			await user.click(screen.getByRole('button', { name: 'Show password' }))
			expect(screen.getByLabelText('A')).toHaveAttribute('type', 'text')
		})
		it('is disabled with its Field', () => {
			render(<Field id="a" label="A" disabled><Field.Input name="a" type="password" /></Field>)
			expect(screen.getByRole('button', { name: 'Show password' })).toBeDisabled()
		})
		it('leaves the icon of other types as decoration', () => {
			render(<Field id="a" label="A"><Field.Input name="a" type="email" /></Field>)
			expect(screen.queryByRole('button')).toBeNull()
		})
	})

	describe('state attributes', () => {
		it('is disabled through the Field', () => {
			render(<Field id="a" label="A" disabled><Field.Input name="a" /></Field>)

			expect(screen.getByLabelText('A')).toBeDisabled()
		})

		it('is required through the Field and exposes aria-required', () => {
			render(<Field id="a" label="A" required><Field.Input name="a" /></Field>)

			const input = screen.getByLabelText(/A/)
			expect(input).toBeRequired()
			expect(input).toHaveAttribute('aria-required', 'true')
		})

		it('is read only through the Field, and a positive control stays editable', () => {
			render(
				<>
					<Field id="a" label="A" readonly><Field.Input name="a" /></Field>
					<Field id="b" label="B"><Field.Input name="b" /></Field>
				</>
			)

			expect(screen.getByLabelText('A')).toHaveAttribute('readonly')
			expect(screen.getByLabelText('B')).not.toHaveAttribute('readonly')
		})

		it('does not accept typing when read only through the Field', async () => {
			const user = userEvent.setup()
			render(<Field id="a" label="A" readonly><Field.Input name="a" /></Field>)

			await user.type(screen.getByLabelText('A'), 'x')
			expect(screen.getByLabelText('A')).toHaveValue('')
		})

		it('drops required, aria-required and the asterisk when the Field is required and read only', () => {
			render(
				<>
					<Field id="a" label="A" required readonly><Field.Input name="a" /></Field>
					<Field id="b" label="B" required><Field.Input name="b" /></Field>
				</>
			)

			const readonly = screen.getByLabelText('A'),
				editable = screen.getByLabelText(/B/)

			expect(readonly).toHaveAttribute('readonly')
			expect(readonly).not.toBeRequired()
			expect(readonly).not.toHaveAttribute('aria-required')
			expect(screen.getByText('A').querySelector('[aria-hidden]')).toBeNull()

			// positive control: without readonly all three are present
			expect(editable).toBeRequired()
			expect(editable).toHaveAttribute('aria-required', 'true')
			expect(screen.getByText('B').querySelector('[aria-hidden="true"]')).toHaveTextContent('*')
		})

		it('applies the error modifier class and invalid aria from the Field error', () => {
			render(<Field id="a" label="A" error="Bad"><Field.Input name="a" /></Field>)

			const input = screen.getByLabelText('A')
			expect(input).toHaveClass('text-input--error')
			expect(input).toHaveAttribute('aria-invalid', 'true')
		})

		it('has no error class or aria-invalid without an error', () => {
			render(<Field id="a" label="A"><Field.Input name="a" /></Field>)

			const input = screen.getByLabelText('A')
			expect(input).not.toHaveClass('text-input--error')
			expect(input).not.toHaveAttribute('aria-invalid')
		})
	})

	describe('loading', () => {
		it('shows the loader right after the input and marks it busy when the Field is loading', () => {
			const { container } = render(<Field id="a" label="A" loading><Field.Input name="a" /></Field>)

			const input = screen.getByLabelText('A')
			expect(input).toHaveAttribute('aria-busy', 'true')
			expect(input.nextElementSibling).toBe(container.querySelector('svg.field__loader'))
			expect(container.firstElementChild).toHaveAttribute('data-loading')
		})

		it('has no loader or aria-busy when the Field is idle', () => {
			const { container } = render(<Field id="a" label="A"><Field.Input name="a" /></Field>)

			expect(screen.getByLabelText('A')).not.toHaveAttribute('aria-busy')
			expect(container.querySelector('svg.field__loader')).toBeNull()
		})
	})

	describe('size tokens', () => {
		it('sizes padding from the Field size', () => {
			render(<Field id="a" label="A" size="lg"><Field.Input name="a" /></Field>)

			expect((screen.getByLabelText('A') as HTMLElement).style.getPropertyValue('--form-control-padding'))
				.toContain('var(--inkq-field-padding-lg)')
		})

		it('lets its own size win over the Field size', () => {
			render(<Field id="a" label="A" size="lg"><Field.Input name="a" size="sm" /></Field>)

			const padding = (screen.getByLabelText('A') as HTMLElement).style.getPropertyValue('--form-control-padding')
			expect(padding).toContain('var(--inkq-field-padding-sm)')
			expect(padding).not.toContain('var(--inkq-field-padding-lg)')
		})
	})

	describe('value handling', () => {
		it('accepts typed input when uncontrolled', async () => {
			const user = userEvent.setup()
			render(<Field id="a" label="A"><Field.Input name="a" /></Field>)

			await user.type(screen.getByLabelText('A'), 'hello')
			expect(screen.getByLabelText('A')).toHaveValue('hello')
		})

		it('calls onChange for each keystroke and reflects the controlled value', async () => {
			const user = userEvent.setup()
			const onChange = jest.fn()
			render(<Controlled onChange={ onChange } />)

			await user.type(screen.getByLabelText('Controlled'), 'abc')
			expect(onChange).toHaveBeenCalledTimes(3)
			expect(onChange).toHaveBeenLastCalledWith('abc')
			expect(screen.getByLabelText('Controlled')).toHaveValue('abc')
		})

		it('is read only when given a value but no onChange, so React does not warn', async () => {
			const user = userEvent.setup()
			render(<Field id="a" label="A"><Field.Input name="a" value="fixed" /></Field>)

			const input = screen.getByLabelText('A')
			expect(input).toHaveAttribute('readonly')
			await user.type(input, 'x')
			expect(input).toHaveValue('fixed')
		})

		it('is editable when given a value and an onChange', () => {
			render(<Field id="a" label="A"><Field.Input name="a" value="v" onChange={ () => {} } /></Field>)

			expect(screen.getByLabelText('A')).not.toHaveAttribute('readonly')
		})
	})
})
