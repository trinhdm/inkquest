import { expect, userEvent, within } from 'storybook/test'
import { getDefaultProps } from '@/hooks/useProps'
import { Field } from '../Field'
import {
	BOOLEAN_OPTIONS, CHOICE_TYPE_OPTIONS, INPUT_TYPE_OPTIONS,
	LABEL_POSITION_OPTIONS, LAYOUT_OPTIONS,
} from '../options.story'
import type { ReactNode } from 'react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

// Local, not in `options.story.ts`: only this file uses them. `columns` is a
// free-form number, so these are just representative values.
const COLUMNS_OPTIONS = [2, 3] as const

const ORIENTATION_OPTIONS: readonly NonNullable<Field.Group.Props['orientation']>[] = [
	'horizontal', 'vertical',
]

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

// `Field.Group.Props` is only the raw props interface; the real accepted type
// (with `unstyled`, `attributes`, ...) is read off the component. The group is
// compound, so `as` resolves to `never` and is not a control.
type GroupStoryProps = Parameters<typeof Field.Group>[0]

// `layout` is a union (`labelPosition` is `never` in `button` and `keypad`), but
// the polymorphic wrapper flattens `Parameters<typeof Field.Group>[0]` into ONE
// object type whose `layout` is the whole union. It is not a union, so
// `Extract`/`Exclude` can't pick a branch (`Extract` gives `never`); intersecting
// with `{ layout?: 'default' }` narrows `layout` instead. The `Layouts` story
// spells out its own minimal props for every other branch.
type DefaultLayoutArgs = GroupStoryProps & { layout?: 'default' }

type Story = StoryObj<GroupStoryProps>

const asDefault = (args: GroupStoryProps) => args as DefaultLayoutArgs

const read = (el: Element, token: string) =>
	(el as HTMLElement).style.getPropertyValue(token)

const rootOf = (control: Element) => control.parentElement?.parentElement as HTMLElement

const labelOf = (control: Element) => (control as HTMLInputElement).labels?.[0] as HTMLElement

// Every non-default layout adds `inkq-field--<layout>` to the Field root. The
// root is not always the control's grandparent (`inline` adds a container), so
// walk up from the control.
const hasLayoutClass = (el: Element, layout: string) => {
	for (let node: Element | null = el; node; node = node.parentElement)
		if ([...node.classList].some(name => name.endsWith(`--${layout}`))) return true
	return false
}

const hasButtonClass = (el: Element) => hasLayoutClass(el, 'button')

const MODIFIER_LAYOUTS = LAYOUT_OPTIONS.filter(layout => layout !== 'default')

// Captionless choices (the `keypad` layout forbids captions). The layout itself
// comes from the surrounding group.
const keypadFields = (prefix: string) => (
	<>
		<Field id={ `${prefix}-one` } label="One">
			<Field.Choice name={ `${prefix}-digit` } value="1" />
		</Field>
		<Field id={ `${prefix}-two` } label="Two">
			<Field.Choice name={ `${prefix}-digit` } value="2" />
		</Field>
	</>
)

const fieldsets = (canvasElement: HTMLElement) =>
	canvasElement.querySelectorAll<HTMLFieldSetElement>('fieldset')

// `Field.Group` keeps only `Field` children (it looks inside Fragments). Every
// id and `name` is built from `prefix` so side-by-side groups never collide.
const contactFields = (prefix: string) => (
	<>
		<Field id={ `${prefix}-first` } label="First name">
			<Field.Input name={ `${prefix}-first` } />
		</Field>
		<Field id={ `${prefix}-last` } label="Last name">
			<Field.Input name={ `${prefix}-last` } />
		</Field>
	</>
)

// One shared `name` per group, so the radios form a single selection.
const planFields = (prefix: string) => (
	<>
		<Field id={ `${prefix}-free` } label="Free" caption="For trying things out">
			<Field.Choice name={ `${prefix}-plan` } value="free" />
		</Field>
		<Field id={ `${prefix}-pro` } label="Pro" caption="For working artists">
			<Field.Choice name={ `${prefix}-plan` } value="pro" />
		</Field>
		<Field id={ `${prefix}-team` } label="Team" caption="For studios">
			<Field.Choice name={ `${prefix}-plan` } value="team" />
		</Field>
	</>
)

const groupTemplate = (args: DefaultLayoutArgs, children: ReactNode) => (
	<Field.Group { ...args }>{ children }</Field.Group>
)

// `Field.Group` registers no defaults of its own (`set({ displayName })` only).
const groupDefaults = getDefaultProps<Field.Group.Props>('Field.Group')

const meta: Meta<GroupStoryProps> = {
	component: Field.Group,
	title: 'Form/Field/Field.Group',
	argTypes: {
		legend: {
			control: 'text',
			description: 'Required. Rendered as the `<legend>`, which names the `<fieldset>`.',
		},
		required: {
			control: 'boolean',
			description: 'Appends an `aria-hidden` asterisk to the legend and is shared with every Field (and so every control) inside, which makes them `required`. The Fields themselves show no asterisk; only the legend does. See the `Required` story.',
		},
		disabled: {
			control: 'boolean',
			description: 'Shared with every Field through context; a Field\'s own `disabled` (even `false`) wins. The `<fieldset>` itself does not get a `disabled` attribute. See the `Disabled` and `DisabledOverride` stories.',
		},
		labelPosition: {
			control: 'select',
			options: LABEL_POSITION_OPTIONS,
			description: 'Shared with every Field; a Field\'s own value wins. Forbidden by the type in the `button` layout. See the `LabelPositions` story.',
		},
		layout: {
			control: 'select',
			options: LAYOUT_OPTIONS,
			description: 'Shared with every Field; a Field\'s own value wins. `button` turns each choice into a card; `inline` floats each label inside its control; `keypad` hides each label visually and forbids captions. See the `Layouts` and `LayoutOverride` stories.',
		},
		type: {
			control: 'select',
			options: [...CHOICE_TYPE_OPTIONS, ...INPUT_TYPE_OPTIONS],
			description: 'Shared with every Field, which hands it to a control that sets no `type` of its own. See the `Type` story.',
		},
		columns: {
			control: 'number',
			description: 'Fed to the inner `Group`, which emits it as `--group-item-count` on the `<fieldset>`. See the `Columns` story.',
		},
		divider: {
			control: 'boolean',
			description: 'Sets `data-divide` on the `<fieldset>` (present only when truthy). See the `Divider` story.',
		},
		fullWidth: {
			control: 'boolean',
			description: 'Sets `data-block` on the `<fieldset>` (present only when truthy). See the `FullWidth` story.',
		},
		justify: {
			control: 'text',
			description: 'Emitted as `--group-justify` on the `<fieldset>`; not a DOM attribute. See the `Justify` story.',
		},
		orientation: {
			control: 'select',
			options: ORIENTATION_OPTIONS,
			description: 'Sets `aria-orientation` on the `<fieldset>`; the layout switch lives in the stylesheet. See the `Orientation` story.',
		},
		unstyled: {
			control: 'boolean',
			description: 'Shared with every Field (which passes it on to its control), dropping their styling. It is also forwarded to the inner `Group`, which drops its own `--group-item-count` / `--group-justify` tokens. See the `Unstyled` story.',
		},
		children: {
			control: false,
			description: 'Only `Field` elements are kept; anything else is dropped with a console warning. See the `NonFieldChildren` story.',
		},
	},
	args: {
		...groupDefaults,
		legend: 'Contact details',
	},
	render: args => groupTemplate(asDefault(args), contactFields('contact')),
}

export default meta

// A `Field.Group` renders a `<fieldset>`. `Group`'s `GROUP_TAGS` includes
// `fieldset`, so it gets no explicit `role="group"` (the implicit role comes
// from the tag), hence the tag and `<legend>` are asserted directly.
export const Default: Story = {
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			[group] = fieldsets(canvasElement)

		expect(fieldsets(canvasElement)).toHaveLength(1)
		await expect(group.tagName).toBe('FIELDSET')
		await expect(group).not.toHaveAttribute('role')

		const legend = group.querySelector('legend') as HTMLElement
		await expect(legend).toHaveTextContent('Contact details')
		await expect(legend.parentElement).toBe(group)

		// every Field is kept, and each is still labelled on its own
		await expect(within(group).getAllByRole('textbox')).toHaveLength(2)
		await expect(canvas.getByLabelText('First name')).toBeInTheDocument()
		await expect(canvas.getByLabelText('Last name')).toBeInTheDocument()
	},
}

export const Disabled: Story = {
	parameters: { controls: { exclude: ['disabled'] } },
	render: args => (
		<Row>
			{ BOOLEAN_OPTIONS.map(disabled => (
				<Group key={ String(disabled) } label={ String(disabled) }>
					{ groupTemplate({ ...asDefault(args), disabled }, contactFields(`disabled-${disabled}`)) }
				</Group>
			)) }
		</Row>
	),
	play: async ({ canvasElement }) => {
		const [disabledGroup, enabledGroup] = fieldsets(canvasElement)

		// `BOOLEAN_OPTIONS` is `[true, false]`, mapped in order.
		for (const input of within(disabledGroup).getAllByRole('textbox')) {
			await expect(input).toBeDisabled()
			await expect(rootOf(input)).toHaveAttribute('data-disabled')
		}

		for (const input of within(enabledGroup).getAllByRole('textbox')) {
			await expect(input).toBeEnabled()
			await expect(rootOf(input)).not.toHaveAttribute('data-disabled')
		}

		const [first] = within(disabledGroup).getAllByRole('textbox')
		await userEvent.type(first, 'x')
		await expect(first).toHaveValue('')
	},
}

// A Field's own `disabled` always wins over the group's, even `false`.
export const DisabledOverride: Story = {
	parameters: { controls: { exclude: ['disabled'] } },
	render: args => groupTemplate(
		{ ...asDefault(args), disabled: true },
		<>
			<Field disabled={ false } id="override-open" label="Opted out">
				<Field.Input name="override-open" />
			</Field>
			<Field id="override-inherits" label="Inherits">
				<Field.Input name="override-inherits" />
			</Field>
		</>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)

		await expect(canvas.getByLabelText('Opted out')).toBeEnabled()
		await expect(canvas.getByLabelText('Inherits')).toBeDisabled()
	},
}

// `required` shows the asterisk on the legend and is shared with every Field,
// so each control inside is required. The Fields show no asterisk of their own.
export const Required: Story = {
	parameters: { controls: { exclude: ['required'] } },
	render: args => (
		<Row>
			{ BOOLEAN_OPTIONS.map(required => (
				<Group key={ String(required) } label={ String(required) }>
					{ groupTemplate({ ...asDefault(args), required }, contactFields(`required-${required}`)) }
				</Group>
			)) }
		</Row>
	),
	play: async ({ canvasElement }) => {
		const [requiredGroup, optionalGroup] = fieldsets(canvasElement)

		// `BOOLEAN_OPTIONS` is `[true, false]`, mapped in order.
		const asterisk = requiredGroup.querySelector('legend [aria-hidden="true"]') as HTMLElement
		await expect(asterisk).toHaveTextContent('*')

		await expect(optionalGroup.querySelector('legend [aria-hidden="true"]')).toBeNull()

		// the group's `required` reaches each control, but not the Fields' labels
		for (const input of within(requiredGroup).getAllByRole('textbox')) {
			await expect(input).toBeRequired()
			await expect(input).toHaveAttribute('aria-required', 'true')
		}

		for (const input of within(optionalGroup).getAllByRole('textbox'))
			await expect(input).not.toBeRequired()

		await expect(requiredGroup.querySelector('label [aria-hidden="true"]')).toBeNull()
	},
}

export const LabelPositions: Story = {
	parameters: { controls: { exclude: ['labelPosition'] } },
	render: args => (
		<Row>
			{ LABEL_POSITION_OPTIONS.map(labelPosition => (
				<Group key={ labelPosition } label={ labelPosition }>
					{ groupTemplate({ ...asDefault(args), labelPosition }, contactFields(`position-${labelPosition}`)) }
				</Group>
			)) }
		</Row>
	),
	play: async ({ canvasElement }) => {
		const [firstGroup, lastGroup] = fieldsets(canvasElement)

		// `LABEL_POSITION_OPTIONS` is `['first', 'last']`, mapped in order.
		for (const input of within(firstGroup).getAllByRole('textbox'))
			await expect(input.compareDocumentPosition(labelOf(input)) & Node.DOCUMENT_POSITION_PRECEDING).toBeTruthy()

		for (const input of within(lastGroup).getAllByRole('textbox'))
			await expect(input.compareDocumentPosition(labelOf(input)) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
	},
}

// The union forbids different props per branch (`labelPosition` is `never` in
// `button` and `keypad`), so each branch spells out its own minimal props
// instead of spreading `args`.
export const Layouts: Story = {
	parameters: {
		layout: 'padded',
		controls: { exclude: ['layout'] },
	},
	render: () => (
		<Row>
			{ LAYOUT_OPTIONS.map(layout => (
				<Group key={ layout } label={ layout }>
					{ layout === 'button' && (
						<Field.Group layout="button" legend="Plan">{ planFields('layout-button') }</Field.Group>
					) }
					{ layout === 'inline' && (
						<Field.Group layout="inline" legend="Contact details">{ contactFields('layout-inline') }</Field.Group>
					) }
					{ layout === 'keypad' && (
						<Field.Group layout="keypad" legend="Digit">{ keypadFields('layout-keypad') }</Field.Group>
					) }
					{ layout === 'default' && (
						<Field.Group layout="default" legend="Plan">{ planFields('layout-default') }</Field.Group>
					) }
				</Group>
			)) }
		</Row>
	),
	play: async ({ canvasElement }) => {
		const groups = fieldsets(canvasElement)

		expect(groups).toHaveLength(LAYOUT_OPTIONS.length)

		// `LAYOUT_OPTIONS` is `['default', 'button', 'inline', 'keypad']`, mapped
		// in order. Inside each group only the matching modifier class is present
		// on the Fields; `default` has none.
		for (const [index, layout] of LAYOUT_OPTIONS.entries()) {
			const controls = Array.from(groups[index].querySelectorAll<HTMLElement>('input'))

			expect(controls.length).toBeGreaterThan(0)

			for (const control of controls)
				for (const modifier of MODIFIER_LAYOUTS)
					await expect(hasLayoutClass(control, modifier)).toBe(modifier === layout)
		}
	},
}

// A Field's own `layout` wins over the group's.
export const LayoutOverride: Story = {
	parameters: {
		layout: 'padded',
		controls: { exclude: ['layout'] },
	},
	render: () => (
		<Field.Group layout="button" legend="Plan">
			<Field id="layout-override-free" label="Free" layout="default">
				<Field.Choice name="layout-override" value="free" />
			</Field>
			<Field id="layout-override-pro" label="Pro">
				<Field.Choice name="layout-override" value="pro" />
			</Field>
		</Field.Group>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)

		await expect(hasButtonClass(rootOf(canvas.getByRole('radio', { name: /Free/ })))).toBe(false)
		await expect(hasButtonClass(rootOf(canvas.getByRole('radio', { name: /Pro/ })))).toBe(true)
	},
}

// A control with no `type` of its own gets the group's, via its Field.
export const Type: Story = {
	parameters: { controls: { exclude: ['type'] } },
	render: args => (
		<Row>
			{ CHOICE_TYPE_OPTIONS.map(type => (
				<Group key={ type } label={ type }>
					{ groupTemplate({ ...asDefault(args), type }, planFields(`type-${type}`)) }
				</Group>
			)) }
		</Row>
	),
	play: async ({ canvasElement }) => {
		const groups = fieldsets(canvasElement)

		expect(groups).toHaveLength(CHOICE_TYPE_OPTIONS.length)

		// `CHOICE_TYPE_OPTIONS` is `['radio', 'checkbox']`, mapped in order.
		for (const [index, type] of CHOICE_TYPE_OPTIONS.entries()) {
			await expect(within(groups[index]).getAllByRole(type)).toHaveLength(3)

			const other = type === 'radio' ? 'checkbox' : 'radio'
			await expect(within(groups[index]).queryByRole(other)).not.toBeInTheDocument()
		}
	},
}

// `columns` is a free-form number, emitted as `--group-item-count`.
export const Columns: Story = {
	parameters: {
		layout: 'padded',
		controls: { exclude: ['columns'] },
	},
	render: args => (
		<div style={ { display: 'flex', flexDirection: 'column', gap: 24 } }>
			{ COLUMNS_OPTIONS.map(columns => (
				<Group key={ columns } label={ String(columns) }>
					{ groupTemplate({ ...asDefault(args), columns }, contactFields(`columns-${columns}`)) }
				</Group>
			)) }
		</div>
	),
	play: async ({ canvasElement }) => {
		const groups = fieldsets(canvasElement)

		expect(groups).toHaveLength(COLUMNS_OPTIONS.length)

		for (const [index, columns] of COLUMNS_OPTIONS.entries())
			await expect(read(groups[index], '--group-item-count')).toBe(String(columns))
	},
}

// `divider` only surfaces as the `data-divide` attribute.
export const Divider: Story = {
	parameters: { controls: { exclude: ['divider'] } },
	render: args => (
		<Row>
			{ BOOLEAN_OPTIONS.map(divider => (
				<Group key={ String(divider) } label={ String(divider) }>
					{ groupTemplate({ ...asDefault(args), divider }, contactFields(`divider-${divider}`)) }
				</Group>
			)) }
		</Row>
	),
	play: async ({ canvasElement }) => {
		const [withDivider, withoutDivider] = fieldsets(canvasElement)

		await expect(withDivider).toHaveAttribute('data-divide')
		await expect(withoutDivider).not.toHaveAttribute('data-divide')
	},
}

// `fullWidth` only surfaces as the `data-block` attribute.
export const FullWidth: Story = {
	parameters: {
		layout: 'padded',
		controls: { exclude: ['fullWidth'] },
	},
	render: args => (
		<div style={ { display: 'flex', flexDirection: 'column', gap: 24 } }>
			{ BOOLEAN_OPTIONS.map(fullWidth => (
				<Group key={ String(fullWidth) } label={ String(fullWidth) }>
					{ groupTemplate({ ...asDefault(args), fullWidth }, contactFields(`full-${fullWidth}`)) }
				</Group>
			)) }
		</div>
	),
	play: async ({ canvasElement }) => {
		const [full, notFull] = fieldsets(canvasElement)

		await expect(full).toHaveAttribute('data-block')
		await expect(notFull).not.toHaveAttribute('data-block')
	},
}

// `orientation` only surfaces as `aria-orientation`; unset leaves it off.
export const Orientation: Story = {
	parameters: {
		layout: 'padded',
		controls: { exclude: ['orientation'] },
	},
	render: args => (
		<div style={ { display: 'flex', flexDirection: 'column', gap: 24 } }>
			<Group label="undefined">
				{ groupTemplate(asDefault(args), contactFields('orientation-none')) }
			</Group>
			{ ORIENTATION_OPTIONS.map(orientation => (
				<Group key={ orientation } label={ orientation }>
					{ groupTemplate({ ...asDefault(args), orientation }, contactFields(`orientation-${orientation}`)) }
				</Group>
			)) }
		</div>
	),
	play: async ({ canvasElement }) => {
		const [none, horizontal, vertical] = fieldsets(canvasElement)

		await expect(none).not.toHaveAttribute('aria-orientation')
		await expect(horizontal).toHaveAttribute('aria-orientation', 'horizontal')
		await expect(vertical).toHaveAttribute('aria-orientation', 'vertical')
	},
}

// `justify` is emitted as the `--group-justify` token, not as an attribute.
export const Justify: Story = {
	parameters: { controls: { exclude: ['justify'] } },
	render: args => groupTemplate({ ...asDefault(args), justify: 'center' }, contactFields('justify')),
	play: async ({ canvasElement }) => {
		const [group] = fieldsets(canvasElement)

		await expect(read(group, '--group-justify')).toBe('center')
		await expect(group).not.toHaveAttribute('justify')
	},
}

// Anything that is not a `Field` is dropped (with a console warning).
export const NonFieldChildren: Story = {
	parameters: { controls: { exclude: ['children'] } },
	render: args => groupTemplate(
		asDefault(args),
		<>
			<Field id="kept-one" label="Kept">
				<Field.Input name="kept-one" />
			</Field>
			<p>stray paragraph</p>
			<Field id="kept-two" label="Also kept">
				<Field.Input name="kept-two" />
			</Field>
		</>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)

		await expect(canvas.getByLabelText('Kept')).toBeInTheDocument()
		await expect(canvas.getByLabelText('Also kept')).toBeInTheDocument()
		await expect(canvas.queryByText('stray paragraph')).not.toBeInTheDocument()
	},
}

// `unstyled` is shared with each Field (which passes it on to its control), so
// their `--field-*` / `--form-control-*` tokens go. The group drops `Group`'s own
// `--group-item-count` too (`columns` is set so there is one to drop):
// `FieldGroup.tsx` now passes `unstyled` to `<Group>` as well as in `values`.
export const Unstyled: Story = {
	parameters: { controls: { exclude: ['unstyled'] } },
	render: args => (
		<Row>
			{ BOOLEAN_OPTIONS.map(unstyled => (
				<Group key={ String(unstyled) } label={ String(unstyled) }>
					{ groupTemplate({ ...asDefault(args), columns: 2, unstyled }, contactFields(`unstyled-${unstyled}`)) }
				</Group>
			)) }
		</Row>
	),
	play: async ({ canvasElement }) => {
		const [unstyledGroup, styledGroup] = fieldsets(canvasElement)

		// `BOOLEAN_OPTIONS` is `[true, false]`, mapped in order.
		for (const input of within(styledGroup).getAllByRole('textbox')) {
			await expect(read(rootOf(input), '--field-padding-block')).not.toBe('')
			await expect(read(input, '--form-control-padding')).not.toBe('')
		}

		for (const input of within(unstyledGroup).getAllByRole('textbox')) {
			await expect(read(rootOf(input), '--field-padding-block')).toBe('')
			await expect(read(input, '--form-control-padding')).toBe('')
		}

		await expect(read(styledGroup, '--group-item-count')).toBe('2')

		// no Group tokens on an unstyled root
		await expect(read(unstyledGroup, '--group-item-count')).toBe('')
	},
}

// Radios sharing a `name` form one selection across the group's Fields.
export const RadioSelection: Story = {
	render: args => groupTemplate({ ...asDefault(args), legend: 'Plan' }, planFields('select')),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			free = canvas.getByRole('radio', { name: /Free/ }),
			pro = canvas.getByRole('radio', { name: /Pro/ })

		await userEvent.click(free)
		await expect(free).toBeChecked()

		await userEvent.click(pro)
		await expect(pro).toBeChecked()
		await expect(free).not.toBeChecked()
	},
}

// Arrow keys move the selection (and focus) through a radio group.
export const RadioKeyboard: Story = {
	render: args => groupTemplate({ ...asDefault(args), legend: 'Plan' }, planFields('arrows')),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			free = canvas.getByRole('radio', { name: /Free/ }),
			pro = canvas.getByRole('radio', { name: /Pro/ })

		free.focus()
		await expect(free).toHaveFocus()

		await userEvent.keyboard('{ArrowDown}')
		await expect(pro).toHaveFocus()
		await expect(pro).toBeChecked()
		await expect(free).not.toBeChecked()

		await userEvent.keyboard('{ArrowUp}')
		await expect(free).toHaveFocus()
		await expect(free).toBeChecked()
	},
}

// Tab walks the group's Fields in order and skips a disabled one.
export const KeyboardFocus: Story = {
	render: args => groupTemplate(
		asDefault(args),
		<>
			<Field id="focus-first" label="First">
				<Field.Input name="focus-first" />
			</Field>
			<Field disabled id="focus-skipped" label="Skipped">
				<Field.Input name="focus-skipped" />
			</Field>
			<Field id="focus-last" label="Last">
				<Field.Input name="focus-last" />
			</Field>
		</>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)

		await userEvent.tab()
		await expect(canvas.getByLabelText('First')).toHaveFocus()

		await userEvent.tab()
		await expect(canvas.getByLabelText('Skipped')).not.toHaveFocus()
		await expect(canvas.getByLabelText('Last')).toHaveFocus()
	},
}
