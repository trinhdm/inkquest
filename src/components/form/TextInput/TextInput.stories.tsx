import { Component, useState } from 'react'
import { expect, fn, userEvent, within } from 'storybook/test'
import { getDefaultProps } from '@/hooks/useProps'
import { Field } from '../Field'
import { BOOLEAN_OPTIONS, ICON_POSITION_OPTIONS, INPUT_TYPE_OPTIONS, SIZE_OPTIONS } from '../Field/options.story'
import type { ReactNode } from 'react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

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

// A `TextInput` outside a `Field` throws. A raw, uncaught throw would take the
// whole canvas down, so the misuse story wraps it in this local boundary.
class RenderErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
	state: ErrorBoundaryState = {}

	static getDerivedStateFromError(error: Error): ErrorBoundaryState {
		return { message: error.message }
	}

	render() {
		if (this.state.message)
			return <span data-testid="text-input-error">{ this.state.message }</span>
		return this.props.children
	}
}

// Raw `Parameters<typeof Field.Input>[0]`: `Omit` over it would turn every
// prop into `any` (`as` resolves to `ElementType`).
type InputStoryProps = Parameters<typeof Field.Input>[0]

type Story = StoryObj<InputStoryProps>

type FieldWrap = Partial<Pick<Field.Props, 'caption' | 'disabled' | 'error' | 'loading' | 'required' | 'size'>>

const read = (el: Element, token: string) =>
	(el as HTMLElement).style.getPropertyValue(token)

// A `TextInput` is always rendered inside a `Field`, which supplies the id, the
// label and the shared state.
const inputTemplate = (args: InputStoryProps, id: string, field: FieldWrap = {}) => (
	<Field id={ id } label="Name" { ...field }>
		<Field.Input { ...args } />
	</Field>
)

// `NAME` is the undotted `'TextInput'` (it feeds the class names).
const inputDefaults = getDefaultProps<Field.Input.Props>('TextInput')

const meta: Meta<InputStoryProps> = {
	component: Field.Input,
	title: 'Form/Field/Field.Input',
	argTypes: {
		name: {
			control: 'text',
			description: 'Required. Forwarded to the `<input>`.',
		},
		placeholder: {
			control: 'text',
			description: 'Forwarded to the `<input>`.',
		},
		value: {
			control: 'text',
			description: 'Makes the input controlled. With no `onChange` it is rendered `readOnly` automatically so React does not warn. See the `ReadOnly` and `Controlled` stories.',
		},
		onChange: {
			control: false,
			description: 'Called once per keystroke. See the `Typing` and `Controlled` stories.',
		},
		type: {
			control: 'select',
			options: INPUT_TYPE_OPTIONS,
			description: 'Registered default `\'text\'`. A Field (or Field.Group) `type` is used when the input sets none. Every type except `text` gets a leading icon and accepts `iconPosition`/`onIconClick`. See the `Types` story.',
		},
		iconPosition: {
			control: 'select',
			options: ICON_POSITION_OPTIONS,
			description: 'Only for icon types (anything but `text`). Sets `--form-control-icon-inset` on the icon (`0 auto` left, the default; `auto 0` right). See the `IconPosition` story.',
		},
		onIconClick: {
			control: false,
			description: 'Only for icon types. Called when the icon is clicked. A `password` icon is an eye, but nothing reveals the password by itself. See the `IconClick` story.',
		},
		readOnly: {
			control: 'boolean',
			description: 'Sets `readonly` on the `<input>`. See the `ReadOnly` story.',
		},
		disabled: {
			control: 'boolean',
			description: 'Disables the input. Takes the Field\'s value when not set; its own value (even `false`) wins. See the `Disabled` story.',
		},
		required: {
			control: 'boolean',
			description: 'Registered default `false`; the Field\'s value is used when not set. Sets the native `required` attribute. `aria-required` comes from the Field\'s own `required` only. See the `Required` story.',
		},
		loading: {
			control: 'boolean',
			description: 'Shows the Field\'s spinner beside the input. Unlike `loading` on the Field, it does not set `aria-busy`. See the `Loading` story.',
		},
		size: {
			control: 'select',
			options: SIZE_OPTIONS,
			description: 'Sizes `--form-control-padding`. Its own `size` beats its Field\'s. See the `Sizes` and `InheritedSize` stories.',
		},
		unstyled: {
			control: 'boolean',
			description: 'Drops the input\'s hashed module class and its tokens. Takes the Field\'s value when not set.',
		},
	},
	args: {
		...inputDefaults,
		name: 'name',
		placeholder: 'Jane Doe',
	},
	render: args => inputTemplate(args, 'name'),
}

export default meta

export const Default: Story = {
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			input = canvas.getByRole('textbox', { name: 'Name' })

		await expect(input).toHaveAttribute('type', 'text')
		await expect(input).toHaveAttribute('name', 'name')
		await expect(input).toHaveAttribute('placeholder', 'Jane Doe')
		// the id comes from the surrounding Field, which is what the label points at
		await expect(input).toHaveAttribute('id', 'name-control')
		await expect(input).toBeEnabled()
		await expect(input).not.toBeRequired()
		await expect(input).not.toHaveAttribute('readonly')
		await expect(input).not.toHaveAttribute('aria-invalid')

		// plain text has no type icon
		await expect(input.previousElementSibling).toBeNull()
	},
}

// Each type is set explicitly, so the minimal props are spelled out rather
// than spreading `args`. Every type but `text` renders an icon span just before
// the input.
export const Types: Story = {
	parameters: {
		layout: 'padded',
		controls: { exclude: ['type'] },
	},
	render: () => (
		<Row>
			{ INPUT_TYPE_OPTIONS.map(type => (
				<Group key={ type } label={ type }>
					<Field id={ `type-${type}` } label="Input">
						<Field.Input name={ `type-${type}` } type={ type } />
					</Field>
				</Group>
			)) }
		</Row>
	),
	play: async ({ canvasElement }) => {
		const inputs = canvasElement.querySelectorAll('input')

		expect(inputs).toHaveLength(INPUT_TYPE_OPTIONS.length)

		for (const [index, type] of INPUT_TYPE_OPTIONS.entries()) {
			const input = inputs[index],
				icon = input.previousElementSibling

			await expect(input).toHaveAttribute('type', type)

			if (type === 'text') await expect(icon).toBeNull()
			else await expect(icon?.querySelector('svg')).toBeInTheDocument()
		}
	},
}

export const IconPosition: Story = {
	parameters: { controls: { exclude: ['iconPosition'] } },
	render: () => (
		<Row>
			<Group label="undefined (default: left)">
				<Field id="icon-default" label="Email">
					<Field.Input name="icon-default" type="email" />
				</Field>
			</Group>
			{ ICON_POSITION_OPTIONS.map(iconPosition => (
				<Group key={ iconPosition } label={ iconPosition }>
					<Field id={ `icon-${iconPosition}` } label="Email">
						<Field.Input iconPosition={ iconPosition } name={ `icon-${iconPosition}` } type="email" />
					</Field>
				</Group>
			)) }
		</Row>
	),
	play: async ({ canvasElement }) => {
		const [defaultInput, leftInput, rightInput] = within(canvasElement).getAllByRole('textbox')

		// `ICON_POSITION_OPTIONS` is `['left', 'right']`, mapped in order.
		await expect(read(defaultInput.previousElementSibling as Element, '--form-control-icon-inset')).toBe('0 auto')
		await expect(read(leftInput.previousElementSibling as Element, '--form-control-icon-inset')).toBe('0 auto')
		await expect(read(rightInput.previousElementSibling as Element, '--form-control-icon-inset')).toBe('auto 0')
	},
}

export const IconClick: Story = {
	args: {
		type: 'password',
		onIconClick: fn(),
	},
	play: async ({ args, canvasElement }) => {
		const input = within(canvasElement).getByLabelText('Name'),
			icon = input.previousElementSibling as HTMLElement

		await userEvent.click(icon)
		await expect(args.onIconClick).toHaveBeenCalledTimes(1)

		// the icon alone does not change the input
		await expect(input).toHaveAttribute('type', 'password')
	},
}

export const Disabled: Story = {
	parameters: { controls: { exclude: ['disabled'] } },
	render: args => (
		<Row>
			{ BOOLEAN_OPTIONS.map(disabled => (
				<Group key={ String(disabled) } label={ String(disabled) }>
					{ inputTemplate({ ...args, name: `disabled-${disabled}`, disabled }, `disabled-${disabled}`) }
				</Group>
			)) }
		</Row>
	),
	play: async ({ canvasElement }) => {
		const inputs = within(canvasElement).getAllByRole('textbox')

		expect(inputs).toHaveLength(2)

		// `BOOLEAN_OPTIONS` is `[true, false]`, mapped in order.
		const [off, on] = inputs

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
					{ inputTemplate({ ...args, name: `required-${required}`, required }, `required-${required}`) }
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

// An explicit `readOnly` is focusable and visible, but takes no typing.
export const ReadOnly: Story = {
	parameters: { controls: { exclude: ['readOnly'] } },
	render: args => (
		<Row>
			{ BOOLEAN_OPTIONS.map(readOnly => (
				<Group key={ String(readOnly) } label={ String(readOnly) }>
					{ inputTemplate({ ...args, name: `readonly-${readOnly}`, readOnly }, `readonly-${readOnly}`) }
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

// `value` with no `onChange` would make React warn about a frozen input, so the
// component renders it `readOnly` for you. With an `onChange` it stays editable.
export const ValueWithoutOnChange: Story = {
	parameters: { controls: { exclude: ['value', 'onChange'] } },
	render: args => (
		<Row>
			<Group label="value, no onChange">
				{ inputTemplate({ ...args, name: 'value-fixed', value: 'fixed' }, 'value-fixed') }
			</Group>
			<Group label="value + onChange">
				{ inputTemplate({ ...args, name: 'value-editable', value: 'editable', onChange: () => {} }, 'value-editable') }
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

// Uncontrolled: the DOM owns the value; `onChange` still fires once per key.
export const Typing: Story = {
	args: { onChange: fn() },
	play: async ({ args, canvasElement }) => {
		const input = within(canvasElement).getByRole('textbox')

		await userEvent.type(input, 'hello')

		await expect(input).toHaveValue('hello')
		await expect(args.onChange).toHaveBeenCalledTimes(5)
	},
}

const ControlledInput = ({ onChange }: { onChange?: Field.Input.Props['onChange'] }) => {
	const [value, setValue] = useState('')

	return (
		<Field id="controlled" label="Name">
			<Field.Input
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
	render: args => <ControlledInput onChange={ args.onChange } />,
	play: async ({ args, canvasElement }) => {
		const input = within(canvasElement).getByRole('textbox')

		await userEvent.type(input, 'abc')

		await expect(input).toHaveValue('abc')
		await expect(args.onChange).toHaveBeenCalledTimes(3)
	},
}

// The spinner is an `svg` in the control wrapper. A plain `text` input has no
// type icon, so the wrapper holds an `svg` only while loading.
export const Loading: Story = {
	parameters: { controls: { exclude: ['loading'] } },
	render: args => (
		<Row>
			{ BOOLEAN_OPTIONS.map(loading => (
				<Group key={ String(loading) } label={ String(loading) }>
					{ inputTemplate({ ...args, name: `loading-${loading}`, loading }, `loading-${loading}`) }
				</Group>
			)) }
		</Row>
	),
	play: async ({ canvasElement }) => {
		const [loading, idle] = within(canvasElement).getAllByRole('textbox')

		// `BOOLEAN_OPTIONS` is `[true, false]`, mapped in order.
		await expect(loading.parentElement?.querySelectorAll('svg')).toHaveLength(1)
		await expect(idle.parentElement?.querySelectorAll('svg')).toHaveLength(0)
	},
}

// `error` lives on the Field: it flags the input invalid and describes it.
export const Errors: Story = {
	parameters: { controls: { exclude: ['name'] } },
	render: args => (
		<Row>
			<Group label="error">
				{ inputTemplate({ ...args, name: 'error-set' }, 'error-set', { error: 'Enter your name' }) }
			</Group>
			<Group label="undefined">
				{ inputTemplate({ ...args, name: 'error-none' }, 'error-none') }
			</Group>
		</Row>
	),
	play: async ({ canvasElement }) => {
		const [withError, without] = within(canvasElement).getAllByRole('textbox')

		await expect(withError).toHaveAttribute('aria-invalid', 'true')
		await expect(withError).toHaveAccessibleDescription('Enter your name')

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
					{ inputTemplate({ ...args, name: `size-${size}`, size }, `size-${size}`, { size: 'md' }) }
				</Group>
			)) }
		</Row>
	),
	play: async ({ canvasElement }) => {
		const inputs = within(canvasElement).getAllByRole('textbox')

		expect(inputs).toHaveLength(SIZE_OPTIONS.length)

		// `SIZE_OPTIONS` is `['sm', 'md', 'lg']`, mapped in order.
		for (const [index, size] of SIZE_OPTIONS.entries()) {
			const padding = read(inputs[index], '--form-control-padding')

			await expect(padding).toContain(`var(--inkq-field-padding-${size})`)

			if (size !== 'md') await expect(padding).not.toContain('var(--inkq-field-padding-md)')
		}
	},
}

// With no `size` of its own, the input takes the Field's.
export const InheritedSize: Story = {
	parameters: { controls: { exclude: ['size'] } },
	render: args => (
		<Row>
			{ SIZE_OPTIONS.map(size => (
				<Group key={ size } label={ `Field size=${size}` }>
					{ inputTemplate({ ...args, name: `inherited-${size}` }, `inherited-${size}`, { size }) }
				</Group>
			)) }
		</Row>
	),
	play: async ({ canvasElement }) => {
		const inputs = within(canvasElement).getAllByRole('textbox')

		for (const [index, size] of SIZE_OPTIONS.entries())
			await expect(read(inputs[index], '--form-control-padding')).toContain(`var(--inkq-field-padding-${size})`)
	},
}

// Tab order only: a disabled input is skipped, a read-only one is reached.
export const KeyboardFocus: Story = {
	parameters: { controls: { exclude: ['name'] } },
	render: args => (
		<Row>
			{ inputTemplate({ ...args, name: 'focus-a' }, 'focus-a') }
			{ inputTemplate({ ...args, name: 'focus-b' }, 'focus-b', { disabled: true }) }
			{ inputTemplate({ ...args, name: 'focus-c', readOnly: true }, 'focus-c') }
		</Row>
	),
	play: async ({ canvasElement }) => {
		const [first, skipped, readOnly] = within(canvasElement).getAllByRole('textbox')

		await userEvent.tab()
		await expect(first).toHaveFocus()

		await userEvent.tab()
		await expect(skipped).not.toHaveFocus()
		await expect(readOnly).toHaveFocus()
	},
}

// A `TextInput` reads its Field from context, so on its own it throws.
export const RequiresFieldParent: Story = {
	parameters: { layout: 'padded' },
	render: args => (
		<Row>
			<Group label="inside a Field (valid)">
				{ inputTemplate(args, 'valid-input') }
			</Group>
			<Group label="standalone: throws (guarded by useFieldCtx)">
				<RenderErrorBoundary>
					<Field.Input { ...args } />
				</RenderErrorBoundary>
			</Group>
		</Row>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)

		await expect(canvas.getByRole('textbox', { name: 'Name' })).toBeInTheDocument()

		const fallback = await canvas.findByTestId('text-input-error')
		await expect(fallback).toHaveTextContent('<TextInput /> must be a direct child of <Field>')
	},
}
