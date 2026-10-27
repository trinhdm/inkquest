import { useState } from 'react'
import userEvent from '@testing-library/user-event'
import { getDefaultProps } from '@/hooks/useProps'
import { render, reset, screen } from '@/tests/test-utils'
import { Field } from '../Field'

describe('Choice', () => {
	reset('Field', 'Choice')

	it('defaults to a radio', () => {
		expect(getDefaultProps('Choice')).toEqual({ as: 'input', type: 'radio' })

		render(<Field id="a" label="A"><Field.Choice name="a" value="1" /></Field>)
		expect(screen.getByRole('radio', { name: 'A' })).toBeInTheDocument()
	})

	it('renders a checkbox when asked', () => {
		render(<Field id="a" label="A"><Field.Choice name="a" type="checkbox" value="1" /></Field>)

		expect(screen.getByRole('checkbox', { name: 'A' })).toBeInTheDocument()
		expect(screen.queryByRole('radio')).not.toBeInTheDocument()
	})

	it('forwards name and value, and takes its id from the Field', () => {
		render(<Field id="pick" label="Pick"><Field.Choice name="group" value="v1" /></Field>)

		const input = screen.getByLabelText('Pick')
		expect(input).toHaveAttribute('name', 'group')
		expect(input).toHaveAttribute('value', 'v1')
		expect(input).toHaveAttribute('id', 'pick-control')
	})

	it('inherits the type from the Field when it sets none', () => {
		render(<Field id="a" label="A" type="checkbox"><Field.Choice name="a" value="1" /></Field>)

		expect(screen.getByRole('checkbox', { name: 'A' })).toBeInTheDocument()
	})

	describe('state attributes', () => {
		it('is disabled through the Field', () => {
			render(<Field id="a" label="A" disabled><Field.Choice name="a" value="1" /></Field>)

			expect(screen.getByLabelText('A')).toBeDisabled()
		})

		it('puts no readonly attribute on the input, and React logs no invalid-DOM-property warning', () => {
			const error = jest.spyOn(console, 'error').mockImplementation(() => {})

			try {
				render(
					<>
						<Field id="a" label="A" readonly><Field.Choice name="a" value="1" /></Field>
						<Field id="b" label="B" readonly><Field.Choice name="b" type="checkbox" value="1" /></Field>
					</>
				)

				for (const label of ['A', 'B']) {
					const input = screen.getByLabelText(label)
					expect(input).not.toHaveAttribute('readonly')
					expect(input).not.toHaveAttribute('readOnly')
				}
				expect(error).not.toHaveBeenCalled()
			} finally {
				error.mockRestore()
			}
		})

		it('stays interactive inside a read-only Field, since HTML ignores readonly on choices', async () => {
			const user = userEvent.setup()
			render(<Field id="a" label="A" readonly><Field.Choice name="a" type="checkbox" value="1" /></Field>)

			await user.click(screen.getByLabelText('A'))
			expect(screen.getByLabelText('A')).toBeChecked()
		})

		it('keeps required, aria-required and the asterisk off a required, read-only Field', () => {
			render(
				<>
					<Field id="a" label="A" required readonly><Field.Choice name="a" type="checkbox" value="1" /></Field>
					<Field id="b" label="B" required><Field.Choice name="b" type="checkbox" value="1" /></Field>
				</>
			)

			const readonly = screen.getByLabelText('A')
			expect(readonly).not.toBeRequired()
			expect(readonly).not.toHaveAttribute('aria-required')
			expect(screen.getByLabelText(/B/)).toBeRequired()
		})

		it('reaches required, disabled and aria-required from a required, disabled Field', () => {
			render(<Field id="a" label="A" required disabled><Field.Choice name="a" type="checkbox" value="1" /></Field>)

			const box = screen.getByLabelText(/A/)
			expect(box).toBeRequired()
			expect(box).toBeDisabled()
			expect(box).toHaveAttribute('aria-required', 'true')
		})

		it('is enabled by default', () => {
			render(<Field id="a" label="A"><Field.Choice name="a" value="1" /></Field>)

			expect(screen.getByLabelText('A')).toBeEnabled()
		})

		it('is required through the Field with aria-required', () => {
			render(<Field id="a" label="A" required><Field.Choice name="a" type="checkbox" value="1" /></Field>)

			const box = screen.getByLabelText(/A/)
			expect(box).toBeRequired()
			expect(box).toHaveAttribute('aria-required', 'true')
		})

		it('flags invalid and describes the error', () => {
			render(<Field id="a" label="A" error="Pick one"><Field.Choice name="a" value="1" /></Field>)

			const input = screen.getByLabelText('A')
			expect(input).toHaveAttribute('aria-invalid', 'true')
			expect(input).toHaveAccessibleDescription('Error: Pick one')
		})

		it('has no invalid state without an error', () => {
			render(<Field id="a" label="A"><Field.Choice name="a" value="1" /></Field>)

			expect(screen.getByLabelText('A')).not.toHaveAttribute('aria-invalid')
		})
	})

	describe('interaction', () => {
		it('checks and unchecks a checkbox', async () => {
			const user = userEvent.setup()
			render(<Field id="a" label="A"><Field.Choice name="a" type="checkbox" value="1" /></Field>)

			const box = screen.getByRole('checkbox', { name: 'A' })
			await user.click(box)
			expect(box).toBeChecked()
			await user.click(box)
			expect(box).not.toBeChecked()
		})

		it('does not toggle while disabled', async () => {
			const user = userEvent.setup()
			render(<Field id="a" label="A" disabled><Field.Choice name="a" type="checkbox" value="1" /></Field>)

			await user.click(screen.getByLabelText('A'))
			expect(screen.getByLabelText('A')).not.toBeChecked()
		})

		it('reports changes through onChange', async () => {
			const user = userEvent.setup()
			const onChange = jest.fn()
			render(
				<Field id="a" label="A">
					<Field.Choice name="a" type="checkbox" value="1" checked={ false } onChange={ onChange } />
				</Field>
			)

			await user.click(screen.getByLabelText('A'))
			expect(onChange).toHaveBeenCalledTimes(1)
		})

		it('follows a controlled checked value', async () => {
			const user = userEvent.setup()
			const Controlled = () => {
				const [checked, setChecked] = useState(false)
				return (
					<Field id="a" label="A">
						<Field.Choice
							checked={ checked }
							name="a"
							onChange={ e => setChecked(e.target.checked) }
							type="checkbox"
							value="1"
						/>
					</Field>
				)
			}
			render(<Controlled />)

			await user.click(screen.getByLabelText('A'))
			expect(screen.getByLabelText('A')).toBeChecked()
		})

		it('lets the user pick one radio at a time', async () => {
			const user = userEvent.setup()
			render(
				<>
					<Field id="a" label="Small"><Field.Choice name="size" value="s" /></Field>
					<Field id="b" label="Large"><Field.Choice name="size" value="l" /></Field>
				</>
			)

			await user.click(screen.getByRole('radio', { name: 'Small' }))
			await user.click(screen.getByRole('radio', { name: 'Large' }))
			expect(screen.getByRole('radio', { name: 'Large' })).toBeChecked()
			expect(screen.getByRole('radio', { name: 'Small' })).not.toBeChecked()
		})

		it('calls onClick', async () => {
			const user = userEvent.setup()
			const onClick = jest.fn()
			render(<Field id="a" label="A"><Field.Choice name="a" value="1" onClick={ onClick } /></Field>)

			await user.click(screen.getByLabelText('A'))
			expect(onClick).toHaveBeenCalledTimes(1)
		})
	})
})
