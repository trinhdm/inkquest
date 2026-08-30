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

// `variant`/`size` aren't `ButtonGroup` props — they're story-only controls
// that feed the `Button` children rendered inside the group.
type ButtonGroupStoryArgs = Button.Group.Props & {
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
		unstyled: {
			control: 'boolean',
			description: 'Inherited from `BoxProps`. When true, the `styles(\'root\')` call `ButtonGroup` makes returns an empty class name instead of its `inkq-button-group` base class on the group\'s root element — see the `Unstyled` story. Does not cascade to the child `Button`s inside it (`unstyled` isn\'t among the props `childrenWithProps` forwards).',
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
// only ever calls `styles('root')` (no other selector). It has no effect on
// the child `Button`s' own styling, since `ButtonGroup` doesn't forward
// `unstyled` through `childrenWithProps`.
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
	},
}
