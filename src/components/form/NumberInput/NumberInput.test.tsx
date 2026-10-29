import { getDefaultProps } from '@/hooks/useProps'
import { render, reset, screen } from '@/tests/test-utils'
import { Field } from '../Field'
import { FieldProvider, type FieldContext } from '../Field/Field.context'
import { NumberInput } from './NumberInput'

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

	describe('defaults', () => {
		it('registers an input tag, text type and a one-character limit', () => {
			expect(getDefaultProps('NumberInput')).toEqual({
				as: 'input', maxLength: 1, type: 'text',
			})
		})
	})

	describe('digit inputs (inputmode set)', () => {
		it('limits a digit box to one character by default', () => {
			render(<Field id="d" label="Digit"><Field.Number name="d" type="text" inputmode="numeric" /></Field>)

			const input = screen.getByLabelText('Digit')
			expect(input).toHaveAttribute('maxlength', '1')
			expect(input).toHaveAttribute('inputmode', 'numeric')
		})

		it('lets the caller raise the limit', () => {
			render(<Field id="d" label="Digit"><Field.Number name="d" type="text" inputmode="tel" maxLength={ 6 } /></Field>)

			expect(screen.getByLabelText('Digit')).toHaveAttribute('maxlength', '6')
		})
	})

	// the types say `maxLength?: never` for number and tel, so a limit of 1 on them is a mistake
	describe('type="number" and type="tel"', () => {
		it.each(['number', 'tel'] as const)('puts no character limit on a type="%s" input', type => {
			render(<Field id="n" label="Amount"><Field.Number name="n" type={ type } /></Field>)

			expect(screen.getByLabelText('Amount')).not.toHaveAttribute('maxlength')
		})
	})

	describe('loader', () => {
		it('shows the loader beside a digit input (inputmode set)', () => {
			const { container } = render(
				<Field id="d" label="Digit" loading>
					<Field.Number name="d" type="text" inputmode="numeric" />
				</Field>
			)

			expect(container.querySelector('svg.field__loader')).toBeInTheDocument()
		})

		it('shows no loader without inputmode, even while the Field is loading', () => {
			const { container } = render(
				<Field id="n" label="Amount" loading>
					<Field.Number name="n" type="number" />
				</Field>
			)

			// positive control: the Field itself is busy
			expect(screen.getByLabelText('Amount')).toHaveAttribute('aria-busy', 'true')
			expect(container.querySelector('svg.field__loader')).toBeNull()
		})
	})

	describe('icon', () => {
		const context = (overrides: Partial<FieldContext> = {}): FieldContext => ({
			aria: { busy: undefined, describedby: undefined, invalid: undefined, required: undefined },
			clsx: { selector: { error: false, inline: false, button: false, keypad: false } },
			hasError: false,
			icon: <svg data-testid="field-icon" />,
			idx: { control: 'n-control', error: 'n-error', info: 'n-info' },
			...overrides,
		})

		const renderIn = (value: FieldContext, props: Partial<NumberInput.Props> = {}) =>
			render(
				<FieldProvider value={ value }>
					<NumberInput { ...({ name: 'n', type: 'text', inputmode: 'numeric', ...props } as NumberInput.Props) } />
				</FieldProvider>
			)

		it('draws the Field icon before the input when inputmode is set', () => {
			const { container } = renderIn(context())
			const icon = screen.getByTestId('field-icon'),
				input = container.querySelector('input') as HTMLInputElement

			expect(icon.closest('.number-input__icon')).toBeInTheDocument()
			expect(icon.compareDocumentPosition(input) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
		})

		it('draws no icon without inputmode', () => {
			renderIn(context(), { inputmode: undefined, type: 'number' } as Partial<NumberInput.Props>)

			expect(screen.queryByTestId('field-icon')).not.toBeInTheDocument()
		})

		it('draws no icon in the inline layout', () => {
			renderIn(context({ layout: 'inline' }))

			expect(screen.queryByTestId('field-icon')).not.toBeInTheDocument()
		})
	})
})
