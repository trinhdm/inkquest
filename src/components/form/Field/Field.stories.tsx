import { expect, userEvent, within } from 'storybook/test'
import { getDefaultProps } from '@/hooks/useProps'
import { Field } from './Field'
import {
	BOOLEAN_OPTIONS, CHOICE_TYPE_OPTIONS, INPUT_TYPE_OPTIONS,
	LABEL_POSITION_OPTIONS, LAYOUT_OPTIONS, SIZE_OPTIONS,
} from './options.story'
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

// `Parameters<typeof Field>[0]` reads the real accepted prop type straight off
// the component (the `Field.Props` namespace export alone lacks `unstyled`,
// `attributes`, etc.).
type FieldStoryProps = Parameters<typeof Field>[0]

// `Field.Props` is a union on `layout` (`button` forbids `size` and
// `labelPosition`, `inline` forbids `iconPosition`, `keypad` forbids `caption`,
// `labelPosition` and `iconPosition`), but the polymorphic wrapper flattens
// `Parameters<typeof Field>[0]` into ONE object type whose `layout` is the whole
// union. It is not a union, so `Extract`/`Exclude` can't pick a branch (`Extract`
// gives `never`); intersecting with `{ layout?: 'default' }` narrows `layout`
// instead. Almost every story uses the default layout; the `Layouts` story spells
// out its own minimal props for every branch.
type DefaultLayoutArgs = FieldStoryProps & { layout?: 'default' }

type Story = StoryObj<FieldStoryProps>

const asDefault = (args: FieldStoryProps) => args as DefaultLayoutArgs

const read = (el: Element, token: string) =>
	(el as HTMLElement).style.getPropertyValue(token)

// The Field root is the control wrapper's parent: root > control > input.
const rootOf = (control: Element) => control.parentElement?.parentElement as HTMLElement

const labelOf = (control: Element) => (control as HTMLInputElement).labels?.[0] as HTMLElement

// Every non-default layout adds `inkq-field--<layout>` as a literal modifier
// class on the Field root (the stylesheet targets it with `[class$="button"]`
// and the like). The root is not always the control's grandparent (the `inline`
// layout adds a container), so walk up from the control.
const hasLayoutClass = (el: Element, layout: string) => {
	for (let node: Element | null = el; node; node = node.parentElement)
		if ([...node.classList].some(name => name.endsWith(`--${layout}`))) return true
	return false
}

const MODIFIER_LAYOUTS = LAYOUT_OPTIONS.filter(layout => layout !== 'default')

// The `layout` union forbids different props per branch, so every branch spells
// out its own minimal props instead of spreading `args`. Each example uses its
// own id and `name` so the side-by-side groups never collide.
const layoutExample = (layout: (typeof LAYOUT_OPTIONS)[number]) => {
	switch (layout) {
		case 'button': return (
			<Field caption="Unlimited sessions" id="layout-button" label="Pro plan" layout="button">
				<Field.Choice name="layout-button" value="pro" />
			</Field>
		)
		case 'inline': return (
			<Field id="layout-inline" label="Email" layout="inline">
				<Field.Input name="layout-inline" />
			</Field>
		)
		case 'keypad': return (
			<Field id="layout-keypad" label="Seven" layout="keypad">
				<Field.Choice name="layout-keypad" value="7" />
			</Field>
		)
		default: return (
			<Field caption="Unlimited sessions" id="layout-default" label="Pro plan" layout="default">
				<Field.Choice name="layout-default" value="pro" />
			</Field>
		)
	}
}

// Single place for the repeated template: a Field around one control. The id
// doubles as the control's `name` so side-by-side groups never collide.
const fieldTemplate = (
	args: DefaultLayoutArgs,
	control: ReactNode = <Field.Input name={ args.id } placeholder="you@example.com" />,
) => (
	<Field { ...args }>{ control }</Field>
)

const fieldDefaults = getDefaultProps<Field.Props>('Field')

const meta: Meta<FieldStoryProps> = {
	component: Field,
	title: 'Form/Field',
	argTypes: {
		id: {
			control: 'text',
			description: 'Required. Kebab-cased and used as the root of the generated ids: the control gets `<id>-control` (what the `<label for>` points at) and the error message gets `<id>-error` (what `aria-describedby` points at).',
		},
		label: {
			control: 'text',
			description: 'Renders a `<label>` tied to the control by `for`. Omitted entirely when not set. With `labelPosition="last"` it follows the control. A `required` Field appends an `aria-hidden` asterisk. In the `button` layout the label is rendered inside the clickable choice card instead, with no asterisk.',
		},
		caption: {
			control: 'text',
			description: 'Helper text rendered under the control (inside the label card in the `button` layout, and above the control in the `inline` layout unless `labelPosition="last"`). It sits in an element with id `<id>-info`, which is added to the control\'s `aria-describedby` (before the error, when both are set). Forbidden by the type in the `keypad` layout. See the `Caption` story.',
		},
		error: {
			control: 'text',
			description: 'Shows the message in a `<span id="<id>-error">` (after a visually hidden `Error: ` prefix, and wrapped in a `<p>` when it is plain text), sets `aria-invalid` and `aria-describedby` on the control and `data-invalid` on the root. A whitespace-only string counts as no error. Not rendered in the `button` layout. See the `Errors` story.',
		},
		disabled: {
			control: 'boolean',
			description: 'Disables the control (through context) and sets `data-disabled` on the root. Controls cannot take `disabled` themselves; it is set on the Field only. See the `Disabled` story.',
		},
		required: {
			control: 'boolean',
			description: 'Registered default `false`. Sets `required` and `aria-required` on the control and appends an `aria-hidden` asterisk to the label. A `readonly` Field is never required, so it gets neither. Controls cannot take `required` themselves. See the `Required` story.',
		},
		loading: {
			control: 'boolean',
			description: 'Sets `data-loading` on the root and `aria-busy` on the control, and shows a spinner beside the control. Controls cannot take `loading` themselves. See the `Loading` story.',
		},
		size: {
			control: 'select',
			options: SIZE_OPTIONS,
			description: 'Registered default `\'md\'`. Sets `--field-padding-block`, `--field-padding-inline` and `--field-icon-size` on the root and is shared with the control through context (a control\'s own `size` wins). Forbidden by the type in the `button` layout. See the `Sizes` story.',
		},
		layout: {
			control: 'select',
			options: LAYOUT_OPTIONS,
			description: '`default` puts the label and control in the usual stacked (or, for choices, inline) arrangement. `button` turns a choice into a clickable card: the control is hidden visually (still keyboard reachable), the label and caption live in the card, and the error message and asterisk are not rendered. `inline` floats the label inside the control and moves the caption and error into a row beside it (a TextInput\'s type icon is hidden). `keypad` hides the label visually (it stays accessible to assistive tech) and forbids `caption`. Every non-default layout adds the literal `inkq-field--<layout>` class. See the `Layouts` story.',
		},
		labelPosition: {
			control: 'select',
			options: LABEL_POSITION_OPTIONS,
			description: 'Whether the label is rendered before (`first`, the default) or after (`last`) the control. Forbidden by the type in the `button` and `keypad` layouts. With `inline` it moves the caption and error row instead (after the control for `last`). See the `LabelPositions` story.',
		},
		type: {
			control: 'select',
			options: [...CHOICE_TYPE_OPTIONS, ...INPUT_TYPE_OPTIONS],
			description: 'Shared with the control through context; a control\'s own `type` wins. See the `TypeFromField` story.',
		},
		unstyled: {
			control: 'boolean',
			description: 'Drops the Field\'s hashed module class and its `--field-*` tokens, and is shared with the control, which drops its own styling too. See the `Unstyled` story.',
		},
		children: {
			control: false,
			description: 'Exactly one of `Field.Input`, `Field.Number`, `Field.Textarea` or `Field.Choice`. Anything else is dropped with a console warning, and so is every control after the first. See the `ChildFiltering` story.',
		},
	},
	args: {
		...fieldDefaults,
		id: 'email',
		label: 'Email',
	},
	render: args => fieldTemplate(asDefault(args)),
}

export default meta

export const Default: Story = {
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			input = canvas.getByRole('textbox')

		// the label finds the control, and the id is derived from the Field's
		await expect(canvas.getByLabelText('Email')).toBe(input)
		await expect(input).toHaveAttribute('id', 'email-control')
		await expect(input).toBeEnabled()
		await expect(input).not.toBeRequired()
		await expect(input).not.toHaveAttribute('aria-invalid')
		await expect(input).not.toHaveAttribute('aria-busy')

		await expect(rootOf(input)).not.toHaveAttribute('data-disabled')
		await expect(rootOf(input)).not.toHaveAttribute('data-invalid')
		await expect(rootOf(input)).not.toHaveAttribute('data-loading')
	},
}

export const Sizes: Story = {
	parameters: { controls: { exclude: ['size'] } },
	render: args => (
		<Row>
			{ SIZE_OPTIONS.map(size => (
				<Group key={ size } label={ size }>
					{ fieldTemplate({ ...asDefault(args), id: `size-${size}`, size }) }
				</Group>
			)) }
		</Row>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			inputs = canvas.getAllByRole('textbox')

		expect(inputs).toHaveLength(SIZE_OPTIONS.length)

		// `SIZE_OPTIONS` is `['sm', 'md', 'lg']`, mapped in order.
		for (const [index, size] of SIZE_OPTIONS.entries()) {
			const root = rootOf(inputs[index])

			await expect(read(root, '--field-padding-block')).toBe(`var(--inkq-field-padding-${size})`)
			await expect(read(root, '--field-icon-size')).toBe(`calc(var(--inkq-icon-${size}) - .125rem)`)

			// the control picks the same size up through context
			await expect(read(inputs[index], '--form-control-padding')).toContain(`var(--inkq-field-padding-${size})`)
		}
	},
}

// Each group spells out its own minimal props (see `layoutExample`): the
// `button` branch forbids `size` and `labelPosition`, `inline` forbids
// `iconPosition`, and `keypad` additionally forbids `caption`. `inline` floats
// the label inside the input and shows the caption and error above it; `keypad`
// hides the label visually (it stays accessible) for a compact choice.
export const Layouts: Story = {
	parameters: {
		layout: 'padded',
		controls: { exclude: ['layout'] },
	},
	render: () => (
		<Row>
			{ LAYOUT_OPTIONS.map(layout => (
				<Group key={ layout } label={ layout }>
					{ layoutExample(layout) }
				</Group>
			)) }
		</Row>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)

		// `LAYOUT_OPTIONS` is `['default', 'button', 'inline', 'keypad']`. Only the
		// matching modifier class is present on each Field root; `default` has none.
		for (const layout of LAYOUT_OPTIONS) {
			const control = canvasElement.querySelector(`#layout-${layout}-control`) as HTMLElement

			await expect(control).toBeInTheDocument()

			for (const modifier of MODIFIER_LAYOUTS)
				await expect(hasLayoutClass(control, modifier)).toBe(modifier === layout)
		}

		// the control stays reachable by its label in every layout, and the
		// caption renders in the two layouts that allow one here
		await expect(canvas.getAllByText('Unlimited sessions')).toHaveLength(2)
		await expect(canvas.getAllByRole('radio', { name: /Pro plan/ })).toHaveLength(2)
		await expect(canvas.getByRole('textbox', { name: 'Email' })).toBeInTheDocument()
		await expect(canvas.getByRole('radio', { name: 'Seven' })).toBeInTheDocument()
	},
}

export const LabelPositions: Story = {
	parameters: { controls: { exclude: ['labelPosition'] } },
	render: args => (
		<Row>
			{ LABEL_POSITION_OPTIONS.map(labelPosition => (
				<Group key={ labelPosition } label={ labelPosition }>
					{ fieldTemplate({ ...asDefault(args), id: `position-${labelPosition}`, labelPosition }) }
				</Group>
			)) }
		</Row>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			inputs = canvas.getAllByRole('textbox')

		expect(inputs).toHaveLength(LABEL_POSITION_OPTIONS.length)

		// `LABEL_POSITION_OPTIONS` is `['first', 'last']`, mapped in order.
		const [first, last] = inputs

		await expect(first.compareDocumentPosition(labelOf(first)) & Node.DOCUMENT_POSITION_PRECEDING).toBeTruthy()
		await expect(last.compareDocumentPosition(labelOf(last)) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
	},
}

export const Required: Story = {
	parameters: { controls: { exclude: ['required'] } },
	render: args => (
		<Row>
			{ BOOLEAN_OPTIONS.map(required => (
				<Group key={ String(required) } label={ String(required) }>
					{ fieldTemplate({ ...asDefault(args), id: `required-${required}`, required }) }
				</Group>
			)) }
		</Row>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			inputs = canvas.getAllByRole('textbox')

		expect(inputs).toHaveLength(2)

		// `BOOLEAN_OPTIONS` is `[true, false]`, mapped in order.
		const [yes, no] = inputs

		await expect(yes).toBeRequired()
		await expect(yes).toHaveAttribute('aria-required', 'true')

		// the asterisk is decoration only, hidden from assistive tech
		const asterisk = labelOf(yes).querySelector('[aria-hidden="true"]') as HTMLElement
		await expect(asterisk).toHaveTextContent('*')

		await expect(no).not.toBeRequired()
		await expect(no).not.toHaveAttribute('aria-required')
		await expect(labelOf(no).querySelector('[aria-hidden="true"]')).toBeNull()
	},
}

export const Disabled: Story = {
	parameters: { controls: { exclude: ['disabled'] } },
	render: args => (
		<Row>
			{ BOOLEAN_OPTIONS.map(disabled => (
				<Group key={ String(disabled) } label={ String(disabled) }>
					{ fieldTemplate({ ...asDefault(args), id: `disabled-${disabled}`, disabled }) }
				</Group>
			)) }
		</Row>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			inputs = canvas.getAllByRole('textbox')

		expect(inputs).toHaveLength(2)

		const [off, on] = inputs

		await expect(off).toBeDisabled()
		await expect(rootOf(off)).toHaveAttribute('data-disabled')

		await expect(on).toBeEnabled()
		await expect(rootOf(on)).not.toHaveAttribute('data-disabled')

		// disabled controls take no input
		await userEvent.type(off, 'x')
		await expect(off).toHaveValue('')
		await userEvent.type(on, 'x')
		await expect(on).toHaveValue('x')
	},
}

// The spinner is an `svg` beside the control, inside the control wrapper. A plain
// `text` input has no type icon, so the wrapper holds an `svg` only while loading.
export const Loading: Story = {
	parameters: { controls: { exclude: ['loading'] } },
	render: args => (
		<Row>
			{ BOOLEAN_OPTIONS.map(loading => (
				<Group key={ String(loading) } label={ String(loading) }>
					{ fieldTemplate({ ...asDefault(args), id: `loading-${loading}`, loading }) }
				</Group>
			)) }
		</Row>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			inputs = canvas.getAllByRole('textbox')

		expect(inputs).toHaveLength(2)

		const [loading, idle] = inputs

		await expect(rootOf(loading)).toHaveAttribute('data-loading')
		await expect(loading).toHaveAttribute('aria-busy', 'true')
		await expect(loading.parentElement?.querySelectorAll('svg')).toHaveLength(1)

		await expect(rootOf(idle)).not.toHaveAttribute('data-loading')
		await expect(idle).not.toHaveAttribute('aria-busy')
		await expect(idle.parentElement?.querySelectorAll('svg')).toHaveLength(0)
	},
}

// `error` is wired to the control with `aria-describedby` (so is `caption`, see
// the `Caption` story). A whitespace-only error is trimmed away and treated as
// no error.
export const Errors: Story = {
	parameters: { controls: { exclude: ['error'] } },
	render: args => (
		<Row>
			<Group label="error">
				{ fieldTemplate({ ...asDefault(args), id: 'error-message', error: 'Enter a valid email' }) }
			</Group>
			<Group label="undefined">
				{ fieldTemplate({ ...asDefault(args), id: 'error-none', error: undefined }) }
			</Group>
			<Group label="whitespace only">
				{ fieldTemplate({ ...asDefault(args), id: 'error-blank', error: '   ' }) }
			</Group>
		</Row>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			inputs = canvas.getAllByRole('textbox')

		expect(inputs).toHaveLength(3)

		const [withError, none, blank] = inputs

		// the id sits on the outer `<span>`; the text itself is wrapped in a `<p>`
		// inside it, after a visually hidden `Error: ` prefix
		const message = canvasElement.querySelector('#error-message-error') as HTMLElement

		await expect(message).toContainElement(canvas.getByText('Enter a valid email'))
		await expect(withError).toHaveAttribute('aria-invalid', 'true')
		await expect(withError).toHaveAttribute('aria-describedby', message.id)
		await expect(withError).toHaveAccessibleDescription('Error: Enter a valid email')
		await expect(rootOf(withError)).toHaveAttribute('data-invalid')

		for (const input of [none, blank]) {
			await expect(input).not.toHaveAttribute('aria-invalid')
			await expect(input).not.toHaveAttribute('aria-describedby')
			await expect(rootOf(input)).not.toHaveAttribute('data-invalid')
		}

		await expect(canvasElement.querySelector('#error-blank-error')).toBeNull()
	},
}

export const Caption: Story = {
	parameters: { controls: { exclude: ['caption'] } },
	render: args => (
		<Row>
			<Group label="caption">
				{ fieldTemplate({ ...asDefault(args), id: 'caption-set', caption: 'We never share your email.' }) }
			</Group>
			<Group label="undefined">
				{ fieldTemplate({ ...asDefault(args), id: 'caption-none', caption: undefined }) }
			</Group>
		</Row>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			[withCaption, without] = canvas.getAllByRole('textbox')

		const caption = canvas.getByText('We never share your email.')

		await expect(caption).toBeInTheDocument()
		await expect(rootOf(withCaption)).toContainElement(caption)
		await expect(rootOf(without)).not.toContainElement(caption)

		// the caption is linked to the control: `<id>-info` is its `aria-describedby`
		await expect(withCaption).toHaveAttribute('aria-describedby', 'caption-set-info')
		await expect(caption.closest('#caption-set-info')).toBeInTheDocument()
		await expect(withCaption).toHaveAccessibleDescription('We never share your email.')
		await expect(without).not.toHaveAttribute('aria-describedby')
	},
}

// A control without its own `type` takes the Field's; its own `type` wins. The
// input's `type` attribute is what carries the result. (The type ICON is only
// chosen from the control's own `type` prop, so an inherited type shows none.)
export const TypeFromField: Story = {
	parameters: { controls: { exclude: ['type'] } },
	render: () => (
		<Row>
			<Group label="Field type=email">
				<Field id="type-inherited" label="Inherited" type="email">
					<Field.Input name="type-inherited" />
				</Field>
			</Group>
			<Group label="Field type=email, Input type=tel">
				<Field id="type-own" label="Own" type="email">
					<Field.Input name="type-own" type="tel" />
				</Field>
			</Group>
			<Group label="Field type=checkbox">
				<Field id="type-choice" label="Choice" type="checkbox">
					<Field.Choice name="type-choice" value="yes" />
				</Field>
			</Group>
		</Row>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)

		await expect(canvas.getByLabelText('Inherited')).toHaveAttribute('type', 'email')
		await expect(canvas.getByLabelText('Own')).toHaveAttribute('type', 'tel')
		await expect(canvas.getByRole('checkbox', { name: 'Choice' })).toBeInTheDocument()
		await expect(canvas.queryByRole('radio')).not.toBeInTheDocument()
	},
}

// `unstyled` strips the Field's own tokens and is passed to the control, which
// strips its tokens too.
export const Unstyled: Story = {
	parameters: { controls: { exclude: ['unstyled'] } },
	render: args => (
		<Row>
			{ BOOLEAN_OPTIONS.map(unstyled => (
				<Group key={ String(unstyled) } label={ String(unstyled) }>
					{ fieldTemplate({ ...asDefault(args), id: `unstyled-${unstyled}`, unstyled }) }
				</Group>
			)) }
		</Row>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			inputs = canvas.getAllByRole('textbox')

		expect(inputs).toHaveLength(2)

		// `BOOLEAN_OPTIONS` is `[true, false]`, mapped in order.
		const [unstyled, styled] = inputs

		await expect(read(rootOf(styled), '--field-padding-block')).toBe('var(--inkq-field-padding-md)')
		await expect(read(styled, '--form-control-padding')).not.toBe('')

		await expect(read(rootOf(unstyled), '--field-padding-block')).toBe('')
		await expect(read(unstyled, '--form-control-padding')).toBe('')
	},
}

// The root is polymorphic. `as` is a registered default (`'div'`).
export const As: Story = {
	parameters: { controls: { exclude: ['as'] } },
	render: () => (
		<Row>
			<Group label="div">
				<Field as="div" id="as-div" label="Div">
					<Field.Input name="as-div" />
				</Field>
			</Group>
			<Group label="section">
				<Field as="section" id="as-section" label="Section">
					<Field.Input name="as-section" />
				</Field>
			</Group>
		</Row>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)

		await expect(rootOf(canvas.getByLabelText('Div')).tagName).toBe('DIV')
		await expect(rootOf(canvas.getByLabelText('Section')).tagName).toBe('SECTION')
	},
}

// Clicking a label moves focus to its control (the `for`/`id` pair).
export const LabelClick: Story = {
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)

		await userEvent.click(canvas.getByText('Email'))
		await expect(canvas.getByRole('textbox')).toHaveFocus()
	},
}

// A Field wraps exactly one control. Anything else is dropped (with a console
// warning), and so is every control after the first.
export const ChildFiltering: Story = {
	parameters: { controls: { exclude: ['children'] } },
	render: () => (
		<Field id="filtering" label="First control wins">
			<Field.Input name="filtering-first" />
			<Field.Textarea name="filtering-second" />
			<div>stray element</div>
		</Field>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)

		await expect(canvas.getAllByRole('textbox')).toHaveLength(1)
		await expect(canvasElement.querySelector('input')).toBeInTheDocument()
		await expect(canvasElement.querySelector('textarea')).toBeNull()
		await expect(canvas.queryByText('stray element')).not.toBeInTheDocument()
	},
}

// Tab walks the fields in DOM order and skips the disabled one.
export const KeyboardFocus: Story = {
	parameters: { layout: 'padded' },
	render: () => (
		<div style={ { display: 'flex', flexDirection: 'column', gap: 16, minWidth: 320 } }>
			<Field id="focus-name" label="Name">
				<Field.Input name="focus-name" />
			</Field>
			<Field disabled id="focus-skipped" label="Skipped">
				<Field.Input name="focus-skipped" />
			</Field>
			<Field id="focus-bio" label="Bio">
				<Field.Textarea name="focus-bio" />
			</Field>
			<Field id="focus-terms" label="Accept terms" type="checkbox">
				<Field.Choice name="focus-terms" value="yes" />
			</Field>
		</div>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)

		await userEvent.tab()
		await expect(canvas.getByLabelText('Name')).toHaveFocus()

		await userEvent.tab()
		await expect(canvas.getByLabelText('Skipped')).not.toHaveFocus()
		await expect(canvas.getByLabelText('Bio')).toHaveFocus()

		await userEvent.tab()
		await expect(canvas.getByLabelText('Accept terms')).toHaveFocus()
	},
}
