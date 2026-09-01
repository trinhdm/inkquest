import {
	BOOLEAN_OPTIONS, ORIENTATION_OPTIONS,
	SIZE_OPTIONS, VARIANT_OPTIONS,
} from '../options.story'
import { expect, userEvent, within } from 'storybook/test'
import { Button } from '../Button'
import { getDefaultProps } from '@/lib/registries'
import type { ReactNode } from 'react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const Row = ({ children }: { children: ReactNode }) => (
	<div style={ { display: 'flex', gap: 24, flexWrap: 'wrap' } }>{ children }</div>
)

const Group = ({ label, children }: { label: string, children: ReactNode }) => (
	<div style={ { display: 'flex', flexDirection: 'column', gap: 8 } }>
		<span style={ { font: 'var(--inkq-font-control)', letterSpacing: '.15em', textTransform: 'uppercase', opacity: 0.6 } }>
			{ label }
		</span>
		{ children }
	</div>
)

// `Button.Group.Props` (the `declare namespace` export) is just the raw
// `ButtonGroupProps` interface — it doesn't include `unstyled`/`attributes`/
// etc., which only exist on the actual accepted prop type,
// `PolymorphicProps<ButtonGroupProps, C>`. `Parameters<typeof
// Button.Group>[0]` reads that real, wrapped type straight off the component
// itself — `ButtonGroupSpecs`'s `specIs: { compound: true }` makes `as`
// resolve to `never` (compound components don't take a tag override), so
// this also correctly excludes `as` from the story's own controls.
//
// `variant`/`size` aren't `ButtonGroup` props — they're story-only controls
// that feed the `Button` children rendered inside the group.
type ButtonGroupStoryArgs = Parameters<typeof Button.Group>[0] & {
	variant: Button.Variant
	size: Button.Size
}

// templatized repeated `children` instead of re-declaring the same JSX block
const renderGroup = ({ variant, size }: ButtonGroupStoryArgs) => {
	const buttonProps = { variant, size }
	return (
		<>
			<Button { ...buttonProps }>Save</Button>
			<Button { ...buttonProps }>Edit</Button>
			<Button { ...buttonProps }>Delete</Button>
		</>
	)
}

// `hasPriority`/`orientation` are real `ButtonGroup` defaults; `variant`/`size`
// are Button's own defaults, since those two fields only ever feed the
// `Button` children here — pulled separately rather than spreading both
// registries together, since they'd otherwise collide on the shared `as` key.
const buttonGroupDefaults = getDefaultProps<Button.Group.Props>('ButtonGroup')
const buttonDefaults = getDefaultProps<Button.Props>('Button')

const meta: Meta<ButtonGroupStoryArgs> = {
	component: Button.Group,
	title: 'Core/Button/Button.Group',
	argTypes: {
		variant: {
			control: 'select',
			options: VARIANT_OPTIONS,
		},
		size: {
			control: 'select',
			options: SIZE_OPTIONS,
		},
		orientation: {
			control: 'select',
			options: ORIENTATION_OPTIONS,
		},
		disabled: { control: 'boolean' },
		hasPriority: { control: 'boolean' },
		loading: { control: 'boolean' },
		fullWidth: {
			control: 'boolean',
			description: 'Stretches the group to fill its container\'s width (adds `data-block`/`aria-orientation` alongside it via `attributes`). See the `FullWidth` story.',
		},
		justify: {
			control: 'text',
			description: 'NOT destructured anywhere in `ButtonGroup`\'s render, so it falls through `...rest` and is spread onto the root `Box` as a literal `justify="..."` DOM attribute — it has no effect on actual layout/justification despite the name. See the `Justify` story.',
		},
		unstyled: {
			control: 'boolean',
			description: 'Part of `PolymorphicProps` (via the shared `SpecsContract`), not `ButtonGroup`\'s own `ButtonGroupProps`. When true, the `styles(\'root\')` call `ButtonGroup` makes returns an empty class name instead of its `inkq-button-group` base class on the group\'s root element — see the `Unstyled` story. It also cascades to the child `Button`s (`childrenWithProps` forwards `disabled`/`loading`/`unstyled` — any boolean value in that shared set — onto each cloned `Button` child, alongside `priority` when `hasPriority` is set).',
		},
	},
	args: {
		hasPriority: buttonGroupDefaults.hasPriority,
		orientation: buttonGroupDefaults.orientation,
		variant: buttonDefaults.variant,
		size: buttonDefaults.size,
	},
	render: ({ size, variant, ...args }) => (
		<Button.Group { ...args }>
			{ renderGroup({ size, variant }) }
		</Button.Group>
	),
}

export default meta
type Story = StoryObj<ButtonGroupStoryArgs>

export const Default: Story = {}

export const Orientations: Story = {
	render: ({ size, variant, ...args }) => (
		<Row>
			{ ORIENTATION_OPTIONS.map(orientation => (
				<Group key={ orientation } label={ orientation }>
					<Button.Group { ...args } orientation={ orientation }>
						{ renderGroup({ size, variant }) }
					</Button.Group>
				</Group>
			)) }
		</Row>
	),
}

export const HasPriority: Story = {
	parameters: { controls: { exclude: ['hasPriority'] } },
	render: ({ size, variant, ...args }) => (
		<Row>
			{ BOOLEAN_OPTIONS.map(hasPriority => (
				<Group key={ String(hasPriority) } label={ String(hasPriority) }>
					<Button.Group { ...args } hasPriority={ hasPriority }>
						{ renderGroup({ size, variant }) }
					</Button.Group>
				</Group>
			)) }
		</Row>
	),
}

export const Loading: Story = {
	parameters: { controls: { exclude: ['loading'] } },
	render: ({ size, variant, ...args }) => (
		<Row>
			{ BOOLEAN_OPTIONS.map(loading => (
				<Group key={ String(loading) } label={ String(loading) }>
					<Button.Group { ...args } loading={ loading }>
						{ renderGroup({ size, variant }) }
					</Button.Group>
				</Group>
			)) }
		</Row>
	),
}

export const Disabled: Story = {
	parameters: { controls: { exclude: ['disabled'] } },
	render: ({ size, variant, ...args }) => (
		<Row>
			{ BOOLEAN_OPTIONS.map(disabled => (
				<Group key={ String(disabled) } label={ String(disabled) }>
					<Button.Group { ...args } disabled={ disabled }>
						{ renderGroup({ size, variant }) }
					</Button.Group>
				</Group>
			)) }
		</Row>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)
		const buttons = canvas.getAllByRole('button')

		expect(buttons).toHaveLength(6)

		const [disabledGroup, enabledGroup] = [buttons.slice(0, 3), buttons.slice(3)]

		for (const button of disabledGroup) {
			await expect(button).toHaveAttribute('disabled')
		}
		for (const button of enabledGroup) {
			await expect(button).not.toHaveAttribute('disabled')
		}

		// native `disabled` buttons drop out of the tab sequence entirely,
		// so tabbing from a blurred state should skip the whole disabled
		// group and land directly on the first enabled-group button
		await userEvent.tab()
		for (const button of disabledGroup)
			await expect(button).not.toHaveFocus()
		await expect(enabledGroup[0]).toHaveFocus()
	},
}

export const FullWidth: Story = {
	parameters: {
		layout: 'padded',
		controls: { exclude: ['fullWidth'] },
	},
	render: ({ size, variant, ...args }) => (
		<div style={ { display: 'flex', flexDirection: 'column', gap: 24 } }>
			{ BOOLEAN_OPTIONS.map(fullWidth => (
				<Group key={ String(fullWidth) } label={ String(fullWidth) }>
					<Button.Group { ...args } fullWidth={ fullWidth }>
						{ renderGroup({ size, variant }) }
					</Button.Group>
				</Group>
			)) }
		</div>
	),
}

// `unstyled` strips the base `inkq-button-group` class `useStyles`/
// `getClassName.tsx` applies to the group's root element (rendered with
// `role="group"`) — verified against `ButtonGroup.tsx`'s own render, which
// only ever calls `styles('root')` (no other selector). It ALSO cascades to
// the child `Button`s: `childrenWithProps` forwards any boolean value from
// `{ disabled, loading, unstyled }` onto each cloned `Button` child, so
// passing `unstyled` to `ButtonGroup` strips each child `Button`'s own
// `inkq-button` class too.
export const Unstyled: Story = {
	parameters: { controls: { exclude: ['unstyled'] } },
	render: ({ size, variant, ...args }) => (
		<Row>
			{ BOOLEAN_OPTIONS.map(unstyled => (
				<Group key={ String(unstyled) } label={ String(unstyled) }>
					<Button.Group { ...args } unstyled={ unstyled }>
						{ renderGroup({ size, variant }) }
					</Button.Group>
				</Group>
			)) }
		</Row>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			groups = canvas.getAllByRole('group')

		expect(groups).toHaveLength(2)

		const [isUnstyled, isStyled] = groups

		await expect(isStyled).toHaveClass('inkq-button-group')
		await expect(isUnstyled).not.toHaveClass('inkq-button-group')

		// Cascades to child `Button`s too.
		const [unstyledButton] = within(isUnstyled).getAllByRole('button'),
			[styledButton] = within(isStyled).getAllByRole('button')

		await expect(styledButton).toHaveClass('inkq-button')
		await expect(unstyledButton).not.toHaveClass('inkq-button')
	},
}

// `justify` is declared on `ButtonGroupProps` but is NOT destructured
// anywhere in `ButtonGroup`'s own render — it falls through `...rest` and is
// spread onto the root `Box` as a literal DOM attribute, with no actual
// effect on layout/justification.
export const Justify: Story = {
	render: ({ size, variant, ...args }) => (
		<Button.Group { ...args } justify="center">
			{ renderGroup({ size, variant }) }
		</Button.Group>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			group = canvas.getByRole('group')

		await expect(group).toHaveAttribute('justify', 'center')
		await expect(group).not.toHaveStyle({ justifyContent: 'center' })
	},
}
