import userEvent from '@testing-library/user-event'
import { render, reset, screen, fireEvent, within } from '@/tests/test-utils'
import { Field } from '../Field'
import { Form } from '../Form'

const renderCode = (props: object = {}, field: object = {}) =>
	render(
		<Form onSubmit={ e => e.preventDefault() }>
			<Field id="code" label="Verification code" caption="6 digits" { ...field as object }>
				<Field.Code name="code" { ...props as object } />
			</Field>
		</Form>
	)

const boxes = () => screen.getAllByRole('textbox') as HTMLInputElement[]
const hidden = (c: HTMLElement) => c.querySelector('input[type="hidden"]') as HTMLInputElement

describe('CodeInput', () => {
	reset('Field', 'CodeInput')

	it('is a named group of 6 labelled boxes', () => {
		renderCode()
		const group = screen.getByRole('group', { name: 'Verification code' })
		const inGroup = within(group).getAllByRole('textbox')
		expect(inGroup).toHaveLength(6)
		inGroup.forEach((b, i) => expect(b).toHaveAccessibleName(`Digit ${i + 1} of 6`))
	})

	it('sets the autocomplete, inputmode and no maxlength', () => {
		renderCode()
		const b = boxes()
		expect(b[0]).toHaveAttribute('autocomplete', 'one-time-code')
		b.slice(1).forEach(x => expect(x).toHaveAttribute('autocomplete', 'off'))
		b.forEach(x => {
			expect(x).toHaveAttribute('inputmode', 'numeric')
			expect(x).toHaveAttribute('type', 'text')
			expect(x).not.toHaveAttribute('maxlength')
			expect(x).not.toHaveAttribute('name')
		})
	})

	it('has exactly one tab stop', () => {
		renderCode()
		expect(boxes().filter(b => b.tabIndex === 0)).toHaveLength(1)
	})

	it('types a full code: ends on box 6, sets the hidden value, completes once', async () => {
		const onComplete = jest.fn()
		const { container } = renderCode({ onComplete })
		await userEvent.click(boxes()[0])
		await userEvent.keyboard('123456')
		expect(boxes().map(b => b.value).join('')).toBe('123456')
		expect(boxes()[5]).toHaveFocus()
		expect(hidden(container)).toHaveAttribute('name', 'code')
		expect(hidden(container).value).toBe('123456')
		expect(onComplete).toHaveBeenCalledTimes(1)
	})

	it('ignores a letter and keeps focus', async () => {
		renderCode()
		await userEvent.click(boxes()[0])
		await userEvent.keyboard('a')
		expect(boxes()[0].value).toBe('')
		expect(boxes()[0]).toHaveFocus()
	})

	it('retyping the same digit moves on', async () => {
		renderCode({ defaultValue: '123456' })
		await userEvent.click(boxes()[0])
		expect(boxes()[0]).toHaveFocus()
		await userEvent.keyboard('1')
		expect(boxes()[1]).toHaveFocus()
	})

	it('Backspace in a filled box clears it and stays', async () => {
		renderCode({ defaultValue: '123456' })
		await userEvent.click(boxes()[2])
		await userEvent.keyboard('{Backspace}')
		expect(boxes()[2].value).toBe('')
		expect(boxes()[2]).toHaveFocus()
	})

	it('Backspace in an empty box clears the previous one and moves there', async () => {
		renderCode({ defaultValue: '12' })
		await userEvent.click(boxes()[2])
		// all boxes are not empty, so focus stays on box 3 (empty)
		expect(boxes()[2]).toHaveFocus()
		await userEvent.keyboard('{Backspace}')
		expect(boxes()[1].value).toBe('')
		expect(boxes()[1]).toHaveFocus()
	})

	it('arrows, Home and End move and stop at the ends', async () => {
		renderCode({ defaultValue: '123456' })
		await userEvent.click(boxes()[2])
		await userEvent.keyboard('{ArrowLeft}')
		expect(boxes()[1]).toHaveFocus()
		await userEvent.keyboard('{Home}{ArrowLeft}')
		expect(boxes()[0]).toHaveFocus()
		await userEvent.keyboard('{End}{ArrowRight}')
		expect(boxes()[5]).toHaveFocus()
	})

	it('pasting a full code into box 4 fills from box 1', async () => {
		const { container } = renderCode()
		await userEvent.click(boxes()[0])
		boxes()[3].focus() // empty code sends focus back to box 1; paste there
		await userEvent.paste('123456')
		expect(boxes().map(b => b.value).join('')).toBe('123456')
		expect(hidden(container).value).toBe('123456')
	})

	it('pasting 34 into box 3 fills boxes 3-4', async () => {
		renderCode({ defaultValue: '12' })
		await userEvent.click(boxes()[2])
		await userEvent.paste('34')
		expect(boxes().map(b => b.value).join('')).toBe('1234')
	})

	it('spreads an autofilled "123 456" from box 1', () => {
		const { container } = renderCode()
		fireEvent.change(boxes()[0], { target: { value: '123 456' } })
		expect(boxes().map(b => b.value).join('')).toBe('123456')
		expect(hidden(container).value).toBe('123456')
	})

	it('leaves a 5-digit value and no new onComplete when a box is cleared', async () => {
		const onComplete = jest.fn()
		const { container } = renderCode({ defaultValue: '123456', onComplete })
		await userEvent.click(boxes()[2])
		await userEvent.keyboard('{Backspace}')
		expect(hidden(container).value).toBe('12456')
		expect(onComplete).not.toHaveBeenCalled()
	})

	it('puts the error on every box and the description on box 1 and the group', () => {
		render(
			<Form state={ { errors: { code: 'Enter the 6-digit code' } } }>
				<Field id="code" label="Verification code">
					<Field.Code name="code" />
				</Field>
			</Form>
		)
		boxes().forEach(b => expect(b).toHaveAttribute('aria-invalid', 'true'))
		expect(boxes()[0]).toHaveAccessibleDescription('Enter the 6-digit code')
		expect(boxes()[1]).not.toHaveAttribute('aria-describedby')
		expect(screen.getByRole('group')).toHaveAccessibleDescription('Enter the 6-digit code')
		expect(boxes()[0]).toHaveFocus() // an error moves focus to box 1
	})

	it('clicking the label focuses box 1', async () => {
		renderCode()
		await userEvent.click(screen.getByText('Verification code'))
		expect(boxes()[0]).toHaveFocus()
	})

	it('autoSubmit submits once on a full code', async () => {
		const onSubmit = jest.fn(e => e.preventDefault())
		render(
			<Form onSubmit={ onSubmit }>
				<Field id="code" label="Code">
					<Field.Code autoSubmit name="code" />
				</Field>
			</Form>
		)
		await userEvent.click(boxes()[0])
		await userEvent.keyboard('123456')
		expect(onSubmit).toHaveBeenCalledTimes(1)
	})
})
