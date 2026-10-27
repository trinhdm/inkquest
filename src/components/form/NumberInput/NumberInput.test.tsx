import { render, reset, screen } from '@/tests/test-utils'
import { Field } from '../Field'

describe('NumberInput', () => {
	reset('Field', 'NumberInput')

	it('renders an input of the given type labelled by its Field', () => {
		render(<Field id="n" label="Count"><Field.Number name="n" type="number" /></Field>)

		const input = screen.getByRole('spinbutton', { name: 'Count' })
		expect(input).toHaveAttribute('id', 'n-control')
		expect(input).toHaveAttribute('name', 'n')
	})

	it('is read only through the Field, and a positive control stays editable', () => {
		render(
			<>
				<Field id="a" label="A" readonly><Field.Number name="a" type="number" /></Field>
				<Field id="b" label="B"><Field.Number name="b" type="number" /></Field>
			</>
		)

		expect(screen.getByLabelText('A')).toHaveAttribute('readonly')
		expect(screen.getByLabelText('B')).not.toHaveAttribute('readonly')
	})

	it('reaches required, disabled and aria-required from a required, disabled Field', () => {
		render(<Field id="a" label="A" required disabled><Field.Number name="a" type="number" /></Field>)

		const input = screen.getByLabelText(/A/)
		expect(input).toBeRequired()
		expect(input).toBeDisabled()
		expect(input).toHaveAttribute('aria-required', 'true')
	})

	it('drops required and aria-required when the Field is required and read only', () => {
		render(<Field id="a" label="A" required readonly><Field.Number name="a" type="number" /></Field>)

		const input = screen.getByLabelText('A')
		expect(input).toHaveAttribute('readonly')
		expect(input).not.toBeRequired()
		expect(input).not.toHaveAttribute('aria-required')
	})
})
