import { Component, useState } from 'react'
import { expect, fn, userEvent, within } from 'storybook/test'
import { getDefaultProps } from '@/hooks/useProps'
import { Field } from '../Field'
import { BOOLEAN_OPTIONS, CHOICE_TYPE_OPTIONS, SIZE_OPTIONS } from '../Field/options.story'
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

// A `Choice` outside a `Field` throws. A raw, uncaught throw would take the
// whole canvas down, so the misuse story wraps it in this local boundary.
class RenderErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
	state: ErrorBoundaryState = {}

	static getDerivedStateFromError(error: Error): ErrorBoundaryState {
		return { message: error.message }
	}

	render() {
		if (this.state.message)
			return <span data-testid="choice-error">{ this.state.message }</span>
		return this.props.children
	}
}

// Raw `Parameters<typeof Field.Choice>[0]`: `Omit` over it would turn every
// prop into `any` (`as` resolves to `ElementType`).
type ChoiceStoryProps = Parameters<typeof Field.Choice>[0]

type Story = StoryObj<ChoiceStoryProps>

type FieldWrap = Partial<Pick<Field.Props, 'caption' | 'disabled' | 'error' | 'loading' | 'required' | 'size'>>

const read = (el: Element, token: string) =>
	(el as HTMLElement).style.getPropertyValue(token)

// A `Choice` is always rendered inside a `Field`, which supplies the id, the
// label and the shared state. The Field id doubles as the label's anchor.
const choiceTemplate = (args: ChoiceStoryProps, id: string, field: FieldWrap = {}) => (
	<Field id={ id } label="Pro plan" { ...field }>
		<Field.Choice { ...args } />
	</Field>
)

const choiceDefaults = getDefaultProps<Field.Choice.Props>('Choice')

const meta: Meta<ChoiceStoryProps> = {
	component: Field.Choice,
	title: 'Form/Field/Field.Choice',
	argTypes: {
		name: {
			control: 'text',
			description: 'Required. Forwarded to the `<input>`. Radios that share a `name` form one selection.',
		},
		value: {
			control: 'text',
			description: 'Required. Forwarded to the `<input value>`.',
		},
		type: {
			control: 'select',
			options: CHOICE_TYPE_OPTIONS,
			description: 'Registered default `\'radio\'`. A Field (or Field.Group) `type` is used when the Choice sets none. See the `Types` story.',
		},
		checked: {
			control: 'boolean',
			description: 'Controlled state; pass it together with `onChange`. Leave it out for an uncontrolled choice. See the `Controlled` story.',
		},
		onChange: {
			control: false,
			description: 'Called once per user toggle. See the `Clickable` story.',
		},
		onClick: {
			control: false,
			description: 'Called on every click of the input, including a click on its label. See the `Clickable` story.',
		},
		disabled: {
			control: false,
			description: 'Not accepted on a Choice (`never`). Set `disabled` on the Field only; the Choice reads it from context. See the `Disabled` story.',
		},
		required: {
			control: false,
			description: 'Not accepted on a Choice (`never`). Set `required` on the Field only; it gives the input the native `required` attribute and `aria-required`. See the `Required` story.',
		},
		size: {
			control: 'select',
			options: SIZE_OPTIONS,
			description: 'Sizes `--form-control-padding`. Its own `size` beats its Field\'s. See the `Sizes` and `InheritsFromField` stories.',
		},
		loading: {
			control: false,
			description: 'Not accepted on a Choice (`never`). Set `loading` on the Field only. A Field with `loading` still sets `aria-busy` on the Choice (see `InheritsFromField`).',
		},
		unstyled: {
			control: 'boolean',
			description: 'Drops the input\'s hashed module class and its tokens. Takes the Field\'s value when not set.',
		},
	},
	args: {
		...choiceDefaults,
		name: 'plan',
		value: 'pro',
	},
	render: args => choiceTemplate(args, 'plan'),
}

export default meta

export const Default: Story = {
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			radio = canvas.getByRole('radio', { name: 'Pro plan' })

		await expect(radio).toHaveAttribute('type', 'radio')
		await expect(radio).toHaveAttribute('name', 'plan')
		await expect(radio).toHaveAttribute('value', 'pro')
		// the id comes from the surrounding Field, which is what the label points at
		await expect(radio).toHaveAttribute('id', 'plan-control')
		await expect(radio).toBeEnabled()
		await expect(radio).not.toBeChecked()
		await expect(radio).not.toBeRequired()
		await expect(radio).not.toHaveAttribute('aria-invalid')
	},
}

export const Types: Story = {
	parameters: { controls: { exclude: ['type'] } },
	render: args => (
		<Row>
			{ CHOICE_TYPE_OPTIONS.map(type => (
				<Group key={ type } label={ type }>
					{ choiceTemplate({ ...args, name: `type-${type}`, type }, `type-${type}`) }
				</Group>
			)) }
		</Row>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)

		// `CHOICE_TYPE_OPTIONS` is `['radio', 'checkbox']`, mapped in order.
		const radio = canvas.getByRole('radio'),
			checkbox = canvas.getByRole('checkbox')

		await expect(radio).toHaveAttribute('type', 'radio')
		await expect(checkbox).toHaveAttribute('type', 'checkbox')
	},
}

export const Disabled: Story = {
	parameters: { controls: { exclude: ['disabled'] } },
	render: args => (
		<Row>
			{ BOOLEAN_OPTIONS.map(disabled => (
				<Group key={ String(disabled) } label={ String(disabled) }>
					{ choiceTemplate(
						{ ...args, name: `disabled-${disabled}`, type: 'checkbox' },
						`disabled-${disabled}`,
						{ disabled }
					) }
				</Group>
			)) }
		</Row>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			boxes = canvas.getAllByRole('checkbox')

		expect(boxes).toHaveLength(2)

		// `BOOLEAN_OPTIONS` is `[true, false]`, mapped in order.
		const [off, on] = boxes

		await expect(off).toBeDisabled()
		await expect(on).toBeEnabled()

		// focus first: Tab skips the disabled one
		await userEvent.tab()
		await expect(off).not.toHaveFocus()
		await expect(on).toHaveFocus()

		await userEvent.click(off)
		await expect(off).not.toBeChecked()

		await userEvent.click(on)
		await expect(on).toBeChecked()
	},
}

// `required` is set on the Field only. It gives the input both the native
// `required` attribute and `aria-required` (see `InheritsFromField`).
export const Required: Story = {
	parameters: { controls: { exclude: ['required'] } },
	render: args => (
		<Row>
			{ BOOLEAN_OPTIONS.map(required => (
				<Group key={ String(required) } label={ String(required) }>
					{ choiceTemplate(
						{ ...args, name: `required-${required}`, type: 'checkbox' },
						`required-${required}`,
						{ required }
					) }
				</Group>
			)) }
		</Row>
	),
	play: async ({ canvasElement }) => {
		const [yes, no] = within(canvasElement).getAllByRole('checkbox')

		// `BOOLEAN_OPTIONS` is `[true, false]`, mapped in order.
		await expect(yes).toBeRequired()
		await expect(no).not.toBeRequired()
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
					{ choiceTemplate(
						{ ...args, name: `size-${size}`, size },
						`size-${size}`,
						{ size: 'md' }
					) }
				</Group>
			)) }
		</Row>
	),
	play: async ({ canvasElement }) => {
		const radios = within(canvasElement).getAllByRole('radio')

		expect(radios).toHaveLength(SIZE_OPTIONS.length)

		// `SIZE_OPTIONS` is `['sm', 'md', 'lg']`, mapped in order.
		for (const [index, size] of SIZE_OPTIONS.entries()) {
			const padding = read(radios[index], '--form-control-padding')

			await expect(padding).toContain(`var(--inkq-field-padding-${size})`)

			if (size !== 'md') await expect(padding).not.toContain('var(--inkq-field-padding-md)')
		}
	},
}

// A Choice with none of its own props takes the Field's `size`, `required`,
// `disabled`, `type` and `loading`. Only `size` and `type` can be overridden on
// the Choice itself; state is set on the Field only.
export const InheritsFromField: Story = {
	parameters: {
		layout: 'padded',
		controls: { exclude: ['disabled', 'required', 'size', 'type'] },
	},
	render: () => (
		<Row>
			<Group label="Field size=lg, required, type=checkbox">
				<Field id="inherit-a" label="Inherited" required size="lg" type="checkbox">
					<Field.Choice name="inherit-a" value="a" />
				</Field>
			</Group>
			<Group label="Field disabled">
				<Field disabled id="inherit-b" label="Disabled by Field">
					<Field.Choice name="inherit-b" value="b" />
				</Field>
			</Group>
			<Group label="Field loading">
				<Field id="inherit-d" label="Busy" loading>
					<Field.Choice name="inherit-d" value="d" />
				</Field>
			</Group>
		</Row>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)

		const inherited = canvas.getByRole('checkbox', { name: /Inherited/ })
		await expect(inherited).toBeRequired()
		await expect(inherited).toHaveAttribute('aria-required', 'true')
		await expect(read(inherited, '--form-control-padding')).toContain('var(--inkq-field-padding-lg)')

		await expect(canvas.getByRole('radio', { name: 'Disabled by Field' })).toBeDisabled()
		await expect(canvas.getByRole('radio', { name: 'Busy' })).toHaveAttribute('aria-busy', 'true')
	},
}

// `error` lives on the Field: it flags the input invalid and describes it. The
// description is read out with a visually hidden `Error: ` prefix.
export const Errors: Story = {
	parameters: { controls: { exclude: ['name'] } },
	render: args => (
		<Row>
			<Group label="error">
				{ choiceTemplate({ ...args, name: 'error-set', type: 'checkbox' }, 'error-set', { error: 'Pick one to continue' }) }
			</Group>
			<Group label="undefined">
				{ choiceTemplate({ ...args, name: 'error-none', type: 'checkbox' }, 'error-none') }
			</Group>
		</Row>
	),
	play: async ({ canvasElement }) => {
		const [withError, without] = within(canvasElement).getAllByRole('checkbox')

		await expect(withError).toHaveAttribute('aria-invalid', 'true')
		await expect(withError).toHaveAccessibleDescription('Error: Pick one to continue')

		await expect(without).not.toHaveAttribute('aria-invalid')
		await expect(without).not.toHaveAttribute('aria-describedby')
	},
}

// Mouse: each click on the input (or its label) toggles a checkbox and fires
// `onChange` and `onClick` exactly once.
export const Clickable: Story = {
	args: {
		type: 'checkbox',
		onChange: fn(),
		onClick: fn(),
	},
	play: async ({ args, canvasElement }) => {
		const canvas = within(canvasElement),
			box = canvas.getByRole('checkbox')

		await userEvent.click(box)
		await expect(box).toBeChecked()
		await expect(args.onChange).toHaveBeenCalledTimes(1)
		await expect(args.onClick).toHaveBeenCalledTimes(1)

		await userEvent.click(box)
		await expect(box).not.toBeChecked()
		await expect(args.onChange).toHaveBeenCalledTimes(2)
		await expect(args.onClick).toHaveBeenCalledTimes(2)

		// the label is wired to the input, so clicking it toggles too
		await userEvent.click(canvas.getByText('Pro plan'))
		await expect(box).toBeChecked()
		await expect(args.onChange).toHaveBeenCalledTimes(3)
		await expect(args.onClick).toHaveBeenCalledTimes(3)
	},
}

// Keyboard: Space toggles a checkbox. (Enter does nothing on a native
// checkbox, so it is not asserted.)
export const KeyboardActivation: Story = {
	args: {
		type: 'checkbox',
		onChange: fn(),
	},
	play: async ({ args, canvasElement }) => {
		const box = within(canvasElement).getByRole('checkbox')

		await userEvent.tab()
		await expect(box).toHaveFocus()

		await userEvent.keyboard(' ')
		await expect(box).toBeChecked()
		await expect(args.onChange).toHaveBeenCalledTimes(1)

		await userEvent.keyboard(' ')
		await expect(box).not.toBeChecked()
		await expect(args.onChange).toHaveBeenCalledTimes(2)
	},
}

// Tab order only: a disabled choice is skipped.
export const KeyboardFocus: Story = {
	parameters: { controls: { exclude: ['name'] } },
	render: args => (
		<Row>
			{ choiceTemplate({ ...args, name: 'focus-a', type: 'checkbox' }, 'focus-a') }
			{ choiceTemplate({ ...args, name: 'focus-b', type: 'checkbox' }, 'focus-b', { disabled: true }) }
			{ choiceTemplate({ ...args, name: 'focus-c', type: 'checkbox' }, 'focus-c') }
		</Row>
	),
	play: async ({ canvasElement }) => {
		const [first, skipped, last] = within(canvasElement).getAllByRole('checkbox')

		await userEvent.tab()
		await expect(first).toHaveFocus()

		await userEvent.tab()
		await expect(skipped).not.toHaveFocus()
		await expect(last).toHaveFocus()
	},
}

// Radios in separate Fields share a selection through a common `name`.
export const RadioGroup: Story = {
	parameters: { controls: { exclude: ['name', 'value'] } },
	render: args => (
		<Row>
			{ choiceTemplate({ ...args, name: 'size', value: 's' }, 'radio-s') }
			{ choiceTemplate({ ...args, name: 'size', value: 'm' }, 'radio-m') }
		</Row>
	),
	play: async ({ canvasElement }) => {
		const [small, medium] = within(canvasElement).getAllByRole('radio')

		await userEvent.click(small)
		await expect(small).toBeChecked()

		await userEvent.click(medium)
		await expect(medium).toBeChecked()
		await expect(small).not.toBeChecked()
	},
}

const ControlledChoice = ({ onChange }: { onChange?: Field.Choice.Props['onChange'] }) => {
	const [checked, setChecked] = useState(false)

	return (
		<Field id="controlled" label="Accept terms">
			<Field.Choice
				checked={ checked }
				name="controlled"
				onChange={ event => {
					setChecked(event.target.checked)
					onChange?.(event)
				} }
				type="checkbox"
				value="yes"
			/>
		</Field>
	)
}

export const Controlled: Story = {
	args: { onChange: fn() },
	parameters: { controls: { exclude: ['checked'] } },
	render: args => <ControlledChoice onChange={ args.onChange } />,
	play: async ({ args, canvasElement }) => {
		const box = within(canvasElement).getByRole('checkbox', { name: 'Accept terms' })

		await expect(box).not.toBeChecked()

		await userEvent.click(box)
		await expect(box).toBeChecked()
		await expect(args.onChange).toHaveBeenCalledTimes(1)
	},
}

// A `Choice` reads its Field from context, so on its own it throws.
export const RequiresFieldParent: Story = {
	parameters: { layout: 'padded' },
	render: args => (
		<Row>
			<Group label="inside a Field (valid)">
				{ choiceTemplate(args, 'valid-choice') }
			</Group>
			<Group label="standalone: throws (guarded by useFieldCtx)">
				<RenderErrorBoundary>
					<Field.Choice { ...args } />
				</RenderErrorBoundary>
			</Group>
		</Row>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)

		await expect(canvas.getByRole('radio', { name: 'Pro plan' })).toBeInTheDocument()

		const fallback = await canvas.findByTestId('choice-error')
		await expect(fallback).toHaveTextContent('<Choice /> must be a direct child of <Field>')
	},
}
