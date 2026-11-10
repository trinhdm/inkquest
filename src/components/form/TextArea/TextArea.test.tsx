import userEvent from '@testing-library/user-event'
import { getDefaultProps } from '@/hooks/useProps'
import { cleanup, render, reset, screen } from '@/tests/test-utils'
import { Field } from '../Field'
import type { Textarea } from './Textarea'

const token = (el: HTMLElement, name: string) => el.style.getPropertyValue(name)

const renderArea = (props: Partial<Textarea.Props> = {}, field: Partial<Field.Props> = {}) =>
	render(
		<Field id="bio" label="Bio" { ...field as object }>
			<Field.Textarea name="bio" { ...props as object } />
		</Field>
	)

describe('Textarea', () => {
	reset('Field', 'Textarea')

	it('registers a textarea that is resizable, 4 rows, between 3 and 8 rows', () => {
		expect(getDefaultProps('Textarea')).toEqual({ as: 'textarea', resizable: true, rows: 4, max: 8, min: 3 })
	})

	it('renders a textbox labelled by its Field', () => {
		renderArea()

		const area = screen.getByRole('textbox', { name: 'Bio' })
		expect(area.tagName).toBe('TEXTAREA')
		expect(area).toHaveAttribute('id', 'bio-control')
		expect(area).toHaveAttribute('name', 'bio')
	})

	it('uses the default 4 rows and honours an explicit rows', () => {
		renderArea()
		expect(screen.getByLabelText('Bio')).toHaveAttribute('rows', '4')
	})

	it('honours an explicit rows', () => {
		renderArea({ rows: 6 })
		expect(screen.getByLabelText('Bio')).toHaveAttribute('rows', '6')
	})

	it('forwards the placeholder', () => {
		renderArea({ placeholder: 'Tell us more' })
		expect(screen.getByPlaceholderText('Tell us more')).toBe(screen.getByLabelText('Bio'))
	})

	describe('resize tokens', () => {
		it('is vertically resizable with default row bounds', () => {
			renderArea()

			const area = screen.getByLabelText('Bio')
			expect(token(area, '--textarea-resize')).toBe('vertical')
			expect(token(area, '--textarea-max-rows')).toBe('8lh')
			expect(token(area, '--textarea-min-rows')).toBe('3lh')
		})

		it('disables resizing when resizable is false', () => {
			renderArea({ resizable: false, max: undefined, min: undefined })

			const area = screen.getByLabelText('Bio')
			expect(token(area, '--textarea-resize')).toBe('none')
		})

		it('raises the max to rows when rows exceeds max', () => {
			renderArea({ rows: 12, max: 8 })
			expect(token(screen.getByLabelText('Bio'), '--textarea-max-rows')).toBe('12lh')
		})

		it('raises the max to min when min exceeds max', () => {
			renderArea({ rows: 2, min: 10, max: 6 })
			expect(token(screen.getByLabelText('Bio'), '--textarea-max-rows')).toBe('10lh')
		})

		it('uses a custom min and max', () => {
			renderArea({ rows: 5, min: 2, max: 7 })

			const area = screen.getByLabelText('Bio')
			expect(token(area, '--textarea-min-rows')).toBe('2lh')
			expect(token(area, '--textarea-max-rows')).toBe('7lh')
		})
	})

	describe('state attributes', () => {
		it('is disabled through the Field', () => {
			renderArea({}, { disabled: true })
			expect(screen.getByLabelText('Bio')).toBeDisabled()
		})

		it('is required through the Field with aria-required', () => {
			renderArea({}, { required: true })

			const area = screen.getByLabelText(/Bio/)
			expect(area).toBeRequired()
			expect(area).toHaveAttribute('aria-required', 'true')
		})

		it('is read only through the Field, and a positive control stays editable', async () => {
			const user = userEvent.setup()
			renderArea({}, { readonly: true })

			const area = screen.getByLabelText('Bio')
			expect(area).toHaveAttribute('readonly')
			await user.type(area, 'x')
			expect(area).toHaveValue('')

			cleanup()
			renderArea()
			expect(screen.getByLabelText('Bio')).not.toHaveAttribute('readonly')
		})

		it('reaches required, disabled and aria-required from a required, disabled Field', () => {
			renderArea({}, { required: true, disabled: true })

			const area = screen.getByLabelText(/Bio/)
			expect(area).toBeRequired()
			expect(area).toBeDisabled()
			expect(area).toHaveAttribute('aria-required', 'true')
		})

		it('describes the error and flags invalid', () => {
			renderArea({}, { error: 'Too short' })

			const area = screen.getByLabelText('Bio')
			expect(area).toHaveAttribute('aria-invalid', 'true')
			expect(area).toHaveAccessibleDescription('Error: Too short')
			expect(area).toHaveClass('textarea--error')
		})

		it('has no invalid state without an error', () => {
			renderArea()

			const area = screen.getByLabelText('Bio')
			expect(area).not.toHaveAttribute('aria-invalid')
			expect(area).not.toHaveClass('textarea--error')
		})
	})

	describe('size tokens', () => {
		it('pads from the Field size', () => {
			renderArea({}, { size: 'lg' })
			expect(token(screen.getByLabelText('Bio'), '--form-control-padding'))
				.toContain('var(--inkq-field-padding-lg)')
		})

		it('lets its own size win', () => {
			renderArea({ size: 'sm' }, { size: 'lg' })
			expect(token(screen.getByLabelText('Bio'), '--form-control-padding'))
				.toContain('var(--inkq-field-padding-sm)')
		})
	})

	describe('value handling', () => {
		it('accepts typed text including new lines', async () => {
			const user = userEvent.setup()
			renderArea()

			await user.type(screen.getByLabelText('Bio'), 'one{Enter}two')
			expect(screen.getByLabelText('Bio')).toHaveValue('one\ntwo')
		})

		it('calls onChange with the event as the user types', async () => {
			const user = userEvent.setup()
			const onChange = jest.fn()
			renderArea({ onChange, value: '' })

			await user.type(screen.getByLabelText('Bio'), 'ab')
			expect(onChange).toHaveBeenCalledTimes(2)
		})

		it('is read only with a value and no onChange', async () => {
			const user = userEvent.setup()
			renderArea({ value: 'fixed' })

			const area = screen.getByLabelText('Bio')
			expect(area).toHaveAttribute('readonly')
			await user.type(area, 'x')
			expect(area).toHaveValue('fixed')
		})

		it('does not accept typing when disabled', async () => {
			const user = userEvent.setup()
			renderArea({}, { disabled: true })

			await user.type(screen.getByLabelText('Bio'), 'x')
			expect(screen.getByLabelText('Bio')).toHaveValue('')
		})
	})
})
