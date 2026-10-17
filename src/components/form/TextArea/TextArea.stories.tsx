import { Component, useState } from 'react'
import { expect, fn, userEvent, within } from 'storybook/test'
import { getDefaultProps } from '@/hooks/useProps'
import { Field } from '../Field'
import { BOOLEAN_OPTIONS, SIZE_OPTIONS } from '../Field/options.story'
import type { ReactNode } from 'react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

// Local, not in `options.story.ts`: only this file uses it. `rows` is a free
// number; these straddle the registered `min` (3) and `max` (8).
const ROWS_OPTIONS = [2, 4, 6, 12] as const

const Row = ({ children }: { children: ReactNode }) => (
	<div style={ { display: 'flex', gap: 24, flexWrap: 'wrap' } }>
		{ children }
	</div>
)

const Group = ({ label, children }: { label: string, children: ReactNode }) => (
	<div style={ { display: 'flex', flexDirection: 'column', gap: 8 } }>
		<span style={ { font: 'var(--inkq-text-control)', letterSpacing: '.15em', textTransform: 'uppercase', opacity: 0.6 } }>
			{ label }
		</span>
		{ children }
	</div>
)

interface ErrorBoundaryState {
	message?: string
}

// A `TextArea` outside a `Field` throws. A raw, uncaught throw would take the
// whole canvas down, so the misuse story wraps it in this local boundary.
class RenderErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
	state: ErrorBoundaryState = {}

	static getDerivedStateFromError(error: Error): ErrorBoundaryState {
		return { message: error.message }
	}

	render() {
		if (this.state.message)
			return <span data-testid="text-area-error">{ this.state.message }</span>
		return this.props.children
	}
}

// Raw `Parameters<typeof Field.Textarea>[0]`: `Omit` over it would turn every
// prop into `any` (`as` resolves to `ElementType`).
type AreaStoryProps = Parameters<typeof Field.Textarea>[0]

type Story = StoryObj<AreaStoryProps>

type FieldWrap = Partial<Pick<Field.Props, 'caption' | 'disabled' | 'error' | 'loading' | 'required' | 'size'>>

const read = (el: Element, token: string) =>
	(el as HTMLElement).style.getPropertyValue(token)

// A `TextArea` is always rendered inside a `Field`, which supplies the id, the
// label and the shared state.
const areaTemplate = (args: AreaStoryProps, id: string, field: FieldWrap = {}) => (
	<Field id={ id } label="Bio" { ...field }>
		<Field.Textarea { ...args } />
	</Field>
)

// `NAME` is the undotted `'TextArea'` (it feeds the class names).
const areaDefaults = getDefaultProps<Field.Textarea.Props>('TextArea')

const meta: Meta<AreaStoryProps> = {
	component: Field.Textarea,
	title: 'Form/Field/Field.Textarea',
	argTypes: {
		name: {
			control: 'text',
			description: 'Required. Forwarded to the `<textarea>`.',
		},
		placeholder: {
			control: 'text',
			description: 'Forwarded to the `<textarea>`.',
		},
		value: {
			control: 'text',
			description: 'Makes the textarea controlled. With no `onChange` it is rendered `readonly` automatically so React does not warn. See the `ReadOnly` and `Controlled` stories.',
		},
		onChange: {
			control: false,
			description: 'Called once per edit. See the `Typing` and `Controlled` stories.',
		},
		rows: {
			control: 'number',
			description: 'Registered default `4`. Sets the `rows` attribute. A `rows` above `max` raises the `--textarea-max-rows` token to match. See the `Rows` story.',
		},
		resizable: {
			control: 'boolean',
			description: 'Registered default `true`. Sets `--textarea-resize` to `vertical` (`true`) or `none` (`false`). A non-resizable textarea takes no `min`/`max` by type. See the `Resizable` story.',
		},
		min: {
			control: 'number',
			description: 'Registered default `3`. Only with `resizable`. Emitted as `--textarea-min-rows` (`<n>lh`). See the `MinMax` story.',
		},
		max: {
			control: 'number',
			description: 'Registered default `8`. Only with `resizable`. Emitted as `--textarea-max-rows` (`<n>lh`), raised to `rows` or to `min` when either is larger. See the `Rows` and `MinMax` stories.',
		},
		readonly: {
			control: 'boolean',
			description: 'Sets `readonly` on the `<textarea>`. See the `ReadOnly` story.',
		},
		disabled: {
			control: 'boolean',
			description: 'Disables the textarea. Takes the Field\'s value when not set; its own value (even `false`) wins. See the `Disabled` story.',
		},
		required: {
			control: 'boolean',
			description: 'Takes the Field\'s value when not set. Sets the native `required` attribute. `aria-required` comes from the Field\'s own `required` only. See the `Required` story.',
		},
		loading: {
			control: 'boolean',
			description: 'Accepted but has no effect on a TextArea: it is never rendered with the Field\'s spinner. A Field with `loading` still sets `aria-busy` on it.',
		},
		size: {
			control: 'select',
			options: SIZE_OPTIONS,
			description: 'Sizes `--form-control-padding`. Its own `size` beats its Field\'s. See the `Sizes` and `InheritedSize` stories.',
		},
		unstyled: {
			control: 'boolean',
			description: 'Drops the textarea\'s hashed module class and its tokens. Takes the Field\'s value when not set.',
		},
	},
	args: {
		...areaDefaults,
		name: 'bio',
		placeholder: 'Tell us more',
	},
	render: args => areaTemplate(args, 'bio'),
}

export default meta

export const Default: Story = {
	play: async ({ canvasElement }) => {
		const area = within(canvasElement).getByRole('textbox', { name: 'Bio' })

		await expect(area.tagName).toBe('TEXTAREA')
		await expect(area).toHaveAttribute('name', 'bio')
		await expect(area).toHaveAttribute('placeholder', 'Tell us more')
		// the id comes from the surrounding Field, which is what the label points at
		await expect(area).toHaveAttribute('id', 'bio-control')
		await expect(area).toHaveAttribute('rows', '4')
		await expect(area).toBeEnabled()
		await expect(area).not.toBeRequired()
		await expect(area).not.toHaveAttribute('readonly')
		await expect(area).not.toHaveAttribute('aria-invalid')

		// registered defaults: resizable, between 3 and 8 rows
		await expect(read(area, '--textarea-resize')).toBe('vertical')
		await expect(read(area, '--textarea-min-rows')).toBe('3lh')
		await expect(read(area, '--textarea-max-rows')).toBe('8lh')
	},
}

// The `resizable: false` type forbids `min`/`max` (`never`), so each branch
// spells out its own minimal props instead of spreading `args`. The registered
// `min`/`max` defaults are still merged in for a non-resizable textarea, so only
// the resize token is asserted.
export const Resizable: Story = {
	parameters: { controls: { exclude: ['resizable'] } },
	render: () => (
		<Row>
			{ BOOLEAN_OPTIONS.map(resizable => (
				<Group key={ String(resizable) } label={ String(resizable) }>
					<Field id={ `resizable-${resizable}` } label="Bio">
						{ resizable
							? <Field.Textarea name={ `resizable-${resizable}` } resizable />
							: <Field.Textarea max={ undefined } min={ undefined } name={ `resizable-${resizable}` } resizable={ false } /> }
					</Field>
				</Group>
			)) }
		</Row>
	),
	play: async ({ canvasElement }) => {
		const [resizable, fixed] = within(canvasElement).getAllByRole('textbox')

		// `BOOLEAN_OPTIONS` is `[true, false]`, mapped in order.
		await expect(read(resizable, '--textarea-resize')).toBe('vertical')
		await expect(read(fixed, '--textarea-resize')).toBe('none')
	},
}

// `rows` sets the attribute. Above `max` it also raises the max-rows token.
export const Rows: Story = {
	parameters: { controls: { exclude: ['rows'] } },
	render: args => (
		<Row>
			{ ROWS_OPTIONS.map(rows => (
				<Group key={ rows } label={ String(rows) }>
					{ areaTemplate({ ...args, name: `rows-${rows}`, rows }, `rows-${rows}`) }
				</Group>
			)) }
		</Row>
	),
	play: async ({ canvasElement }) => {
		const areas = within(canvasElement).getAllByRole('textbox')

		expect(areas).toHaveLength(ROWS_OPTIONS.length)

		for (const [index, rows] of ROWS_OPTIONS.entries()) {
			await expect(areas[index]).toHaveAttribute('rows', String(rows))
			// registered `max` is 8, raised to `rows` when rows is larger
			await expect(read(areas[index], '--textarea-max-rows')).toBe(`${Math.max(rows, 8)}lh`)
		}
	},
}

// Explicit `min`/`max`. When `min` exceeds `max` the max is raised to `min`.
export const MinMax: Story = {
	parameters: { controls: { exclude: ['min', 'max'] } },
	render: () => (
		<Row>
			<Group label="min=2, max=7, rows=5">
				<Field id="minmax-custom" label="Bio">
					<Field.Textarea max={ 7 } min={ 2 } name="minmax-custom" resizable rows={ 5 } />
				</Field>
			</Group>
			<Group label="min=10, max=6, rows=2">
				<Field id="minmax-inverted" label="Bio">
					<Field.Textarea max={ 6 } min={ 10 } name="minmax-inverted" resizable rows={ 2 } />
				</Field>
			</Group>
		</Row>
	),
	play: async ({ canvasElement }) => {
		const [custom, inverted] = within(canvasElement).getAllByRole('textbox')

		await expect(read(custom, '--textarea-min-rows')).toBe('2lh')
		await expect(read(custom, '--textarea-max-rows')).toBe('7lh')

		await expect(read(inverted, '--textarea-min-rows')).toBe('10lh')
		await expect(read(inverted, '--textarea-max-rows')).toBe('10lh')
	},
}

export const Disabled: Story = {
	parameters: { controls: { exclude: ['disabled'] } },
	render: args => (
		<Row>
			{ BOOLEAN_OPTIONS.map(disabled => (
				<Group key={ String(disabled) } label={ String(disabled) }>
					{ areaTemplate({ ...args, name: `disabled-${disabled}`, disabled }, `disabled-${disabled}`) }
				</Group>
			)) }
		</Row>
	),
	play: async ({ canvasElement }) => {
		const areas = within(canvasElement).getAllByRole('textbox')

		expect(areas).toHaveLength(2)

		// `BOOLEAN_OPTIONS` is `[true, false]`, mapped in order.
		const [off, on] = areas

		await expect(off).toBeDisabled()
		await expect(on).toBeEnabled()

		await userEvent.type(off, 'x')
		await expect(off).toHaveValue('')

		await userEvent.type(on, 'x')
		await expect(on).toHaveValue('x')
	},
}

// Own `required` sets the native attribute. `aria-required` is added from the
// Field's `required` only (see the `Field` stories).
export const Required: Story = {
	parameters: { controls: { exclude: ['required'] } },
	render: args => (
		<Row>
			{ BOOLEAN_OPTIONS.map(required => (
				<Group key={ String(required) } label={ String(required) }>
					{ areaTemplate({ ...args, name: `required-${required}`, required }, `required-${required}`) }
				</Group>
			)) }
		</Row>
	),
	play: async ({ canvasElement }) => {
		const [yes, no] = within(canvasElement).getAllByRole('textbox')

		// `BOOLEAN_OPTIONS` is `[true, false]`, mapped in order.
		await expect(yes).toBeRequired()
		await expect(no).not.toBeRequired()
	},
}

// An explicit `readonly` is focusable and visible, but takes no typing.
export const ReadOnly: Story = {
	parameters: { controls: { exclude: ['readonly'] } },
	render: args => (
		<Row>
			{ BOOLEAN_OPTIONS.map(readonly => (
				<Group key={ String(readonly) } label={ String(readonly) }>
					{ areaTemplate({ ...args, name: `readonly-${readonly}`, readonly }, `readonly-${readonly}`) }
				</Group>
			)) }
		</Row>
	),
	play: async ({ canvasElement }) => {
		const [locked, editable] = within(canvasElement).getAllByRole('textbox')

		// `BOOLEAN_OPTIONS` is `[true, false]`, mapped in order.
		await expect(locked).toHaveAttribute('readonly')
		await expect(editable).not.toHaveAttribute('readonly')

		await userEvent.type(locked, 'x')
		await expect(locked).toHaveValue('')

		await userEvent.type(editable, 'x')
		await expect(editable).toHaveValue('x')
	},
}

// `value` with no `onChange` would make React warn about a frozen textarea, so
// the component renders it `readonly` for you. With an `onChange` it stays editable.
export const ValueWithoutOnChange: Story = {
	parameters: { controls: { exclude: ['value', 'onChange'] } },
	render: args => (
		<Row>
			<Group label="value, no onChange">
				{ areaTemplate({ ...args, name: 'value-fixed', value: 'fixed' }, 'value-fixed') }
			</Group>
			<Group label="value + onChange">
				{ areaTemplate({ ...args, name: 'value-editable', value: 'editable', onChange: () => {} }, 'value-editable') }
			</Group>
		</Row>
	),
	play: async ({ canvasElement }) => {
		const [fixed, editable] = within(canvasElement).getAllByRole('textbox')

		await expect(fixed).toHaveAttribute('readonly')
		await userEvent.type(fixed, 'x')
		await expect(fixed).toHaveValue('fixed')

		await expect(editable).not.toHaveAttribute('readonly')
	},
}

// Uncontrolled: the DOM owns the value; `onChange` fires once per edit, and
// Enter inserts a new line (7 edits: o, n, e, Enter, t, w, o).
export const Typing: Story = {
	args: { onChange: fn() },
	play: async ({ args, canvasElement }) => {
		const area = within(canvasElement).getByRole('textbox')

		await userEvent.type(area, 'one{Enter}two')

		await expect(area).toHaveValue('one\ntwo')
		await expect(args.onChange).toHaveBeenCalledTimes(7)
	},
}

const ControlledArea = ({ onChange }: { onChange?: Field.Textarea.Props['onChange'] }) => {
	const [value, setValue] = useState('')

	return (
		<Field id="controlled" label="Bio">
			<Field.Textarea
				name="controlled"
				onChange={ event => {
					setValue(event.target.value)
					onChange?.(event)
				} }
				value={ value }
			/>
		</Field>
	)
}

export const Controlled: Story = {
	args: { onChange: fn() },
	parameters: { controls: { exclude: ['value'] } },
	render: args => <ControlledArea onChange={ args.onChange } />,
	play: async ({ args, canvasElement }) => {
		const area = within(canvasElement).getByRole('textbox')

		await userEvent.type(area, 'abc')

		await expect(area).toHaveValue('abc')
		await expect(args.onChange).toHaveBeenCalledTimes(3)
	},
}

// `error` lives on the Field: it flags the textarea invalid and describes it.
export const Errors: Story = {
	parameters: { controls: { exclude: ['name'] } },
	render: args => (
		<Row>
			<Group label="error">
				{ areaTemplate({ ...args, name: 'error-set' }, 'error-set', { error: 'Too short' }) }
			</Group>
			<Group label="undefined">
				{ areaTemplate({ ...args, name: 'error-none' }, 'error-none') }
			</Group>
		</Row>
	),
	play: async ({ canvasElement }) => {
		const [withError, without] = within(canvasElement).getAllByRole('textbox')

		await expect(withError).toHaveAttribute('aria-invalid', 'true')
		await expect(withError).toHaveAccessibleDescription('Too short')

		await expect(without).not.toHaveAttribute('aria-invalid')
		await expect(without).not.toHaveAttribute('aria-describedby')
	},
}

// Own `size` beats the Field's. Every Field here is `md`, so a non-`md` own
// size must show up in the padding token and the `md` one must not.
export const Sizes: Story = {
	parameters: { controls: { exclude: ['size'] } },
	render: args => (
		<Row>
			{ SIZE_OPTIONS.map(size => (
				<Group key={ size } label={ size }>
					{ areaTemplate({ ...args, name: `size-${size}`, size }, `size-${size}`, { size: 'md' }) }
				</Group>
			)) }
		</Row>
	),
	play: async ({ canvasElement }) => {
		const areas = within(canvasElement).getAllByRole('textbox')

		expect(areas).toHaveLength(SIZE_OPTIONS.length)

		// `SIZE_OPTIONS` is `['sm', 'md', 'lg']`, mapped in order.
		for (const [index, size] of SIZE_OPTIONS.entries()) {
			const padding = read(areas[index], '--form-control-padding')

			await expect(padding).toContain(`var(--inkq-field-padding-${size})`)

			if (size !== 'md') await expect(padding).not.toContain('var(--inkq-field-padding-md)')
		}
	},
}

// With no `size` of its own, the textarea takes the Field's.
export const InheritedSize: Story = {
	parameters: { controls: { exclude: ['size'] } },
	render: args => (
		<Row>
			{ SIZE_OPTIONS.map(size => (
				<Group key={ size } label={ `Field size=${size}` }>
					{ areaTemplate({ ...args, name: `inherited-${size}` }, `inherited-${size}`, { size }) }
				</Group>
			)) }
		</Row>
	),
	play: async ({ canvasElement }) => {
		const areas = within(canvasElement).getAllByRole('textbox')

		for (const [index, size] of SIZE_OPTIONS.entries())
			await expect(read(areas[index], '--form-control-padding')).toContain(`var(--inkq-field-padding-${size})`)
	},
}

// A Field with `loading` marks its textarea busy. The spinner itself is not
// rendered beside a textarea (only `TextInput` places it).
export const FieldLoading: Story = {
	parameters: { controls: { exclude: ['loading'] } },
	render: args => (
		<Row>
			{ BOOLEAN_OPTIONS.map(loading => (
				<Group key={ String(loading) } label={ `Field loading=${loading}` }>
					{ areaTemplate({ ...args, name: `loading-${loading}` }, `loading-${loading}`, { loading }) }
				</Group>
			)) }
		</Row>
	),
	play: async ({ canvasElement }) => {
		const [busy, idle] = within(canvasElement).getAllByRole('textbox')

		// `BOOLEAN_OPTIONS` is `[true, false]`, mapped in order.
		await expect(busy).toHaveAttribute('aria-busy', 'true')
		await expect(idle).not.toHaveAttribute('aria-busy')
	},
}

// Tab order only: a disabled textarea is skipped, a read-only one is reached.
export const KeyboardFocus: Story = {
	parameters: { controls: { exclude: ['name'] } },
	render: args => (
		<Row>
			{ areaTemplate({ ...args, name: 'focus-a' }, 'focus-a') }
			{ areaTemplate({ ...args, name: 'focus-b' }, 'focus-b', { disabled: true }) }
			{ areaTemplate({ ...args, name: 'focus-c', readonly: true }, 'focus-c') }
		</Row>
	),
	play: async ({ canvasElement }) => {
		const [first, skipped, readonly] = within(canvasElement).getAllByRole('textbox')

		await userEvent.tab()
		await expect(first).toHaveFocus()

		await userEvent.tab()
		await expect(skipped).not.toHaveFocus()
		await expect(readonly).toHaveFocus()
	},
}

// A `TextArea` reads its Field from context, so on its own it throws.
export const RequiresFieldParent: Story = {
	parameters: { layout: 'padded' },
	render: args => (
		<Row>
			<Group label="inside a Field (valid)">
				{ areaTemplate(args, 'valid-area') }
			</Group>
			<Group label="standalone: throws (guarded by useFieldCtx)">
				<RenderErrorBoundary>
					<Field.Textarea { ...args } />
				</RenderErrorBoundary>
			</Group>
		</Row>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)

		await expect(canvas.getByRole('textbox', { name: 'Bio' })).toBeInTheDocument()

		const fallback = await canvas.findByTestId('text-area-error')
		await expect(fallback).toHaveTextContent('<TextArea /> must be a direct child of <Field>')
	},
}
