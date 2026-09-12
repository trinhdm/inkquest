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
		<span style={ { font: 'var(--inkq-text-control)', letterSpacing: '.15em', textTransform: 'uppercase', opacity: 0.6 } }>
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
			description: 'Part of `PolymorphicProps` (via the shared `SpecsContract`), not `ButtonGroup`\'s own `ButtonGroupProps`. The semantic base class (`inkq-button-group`) on the group\'s root element is ALWAYS emitted regardless of this prop — `unstyled` only suppresses the CSS-module-hashed class normally appended alongside it, via the `styles(\'root\')` call `ButtonGroup` makes — see the `Unstyled` story. It also cascades to the child `Button`s: `ButtonGroup` flattens its children (`filterChildren` — recursing into `Fragment`s, dropping any element whose `displayName` isn\'t `\'Button\'`) and wraps EACH surviving child in its own `ButtonGroupProvider`, publishing `{ disabled, loading, priority, unstyled }`. Each `Button` reads that context via `useButtonGroupProps`, which fills a key on the Button\'s own raw props ONLY when that key is entirely absent there (checked with `Object.hasOwn` on the raw, pre-merge props, and skipping any `undefined` context value) — so a child `Button`\'s own prop, including an explicit `disabled={false}` inside a disabled group, always wins over the group\'s context value.',
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
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			groups = canvas.getAllByRole('group'),
			[rowGroup, columnGroup] = groups

		await expect(rowGroup).toHaveAttribute('aria-orientation')
		await expect(columnGroup).toHaveAttribute('data-orientation', 'vertical')
	},
}

// `size` is a real `ButtonGroup` prop (`ButtonGroupProps['size']`), published
// through `ButtonGroupProvider` to every surviving child `Button`, which
// fills its own `size` from context via `useButtonGroupProps` ONLY when
// `size` is entirely absent from that child's own raw props — same
// own-prop-wins precedence as `disabled`/`loading`/`priority`/`unstyled`.
// Children here are rendered WITHOUT their own `size` (only `variant`, for
// visual consistency), so what's asserted is purely the group's own cascade
// — not an own-prop short-circuiting it, as `renderGroup`'s children would.
export const Sizes: Story = {
	render: ({ variant, ...args }) => (
		<Row>
			{ SIZE_OPTIONS.map(size => (
				<Group key={ size } label={ size }>
					<Button.Group { ...args } size={ size }>
						<Button variant={ variant }>Save</Button>
						<Button variant={ variant }>Edit</Button>
						<Button variant={ variant }>Delete</Button>
					</Button.Group>
				</Group>
			)) }
		</Row>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			groups = canvas.getAllByRole('group')

		expect(groups).toHaveLength(SIZE_OPTIONS.length)

		for (const [index, group] of groups.entries()) {
			const buttons = within(group).getAllByRole('button')
			for (const button of buttons)
				await expect(button).toHaveAttribute('data-size', SIZE_OPTIONS[index])
		}
	},
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
			<Group label="clamped (4 buttons — derivePriority maxes out at tertiary)">
				<Button.Group { ...args } hasPriority>
					<Button { ...{ variant, size } }>First</Button>
					<Button { ...{ variant, size } }>Second</Button>
					<Button { ...{ variant, size } }>Third</Button>
					<Button { ...{ variant, size } }>Fourth</Button>
				</Button.Group>
			</Group>
		</Row>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			groups = canvas.getAllByRole('group')

		expect(groups).toHaveLength(3)

		const [withPriority, withoutPriority, clamped] = groups,
			withPriorityButtons = within(withPriority).getAllByRole('button'),
			withoutPriorityButtons = within(withoutPriority).getAllByRole('button'),
			clampedButtons = within(clamped).getAllByRole('button')

		const expectedPriorities: Button.Priority[] = ['primary', 'secondary', 'tertiary']
		for (const [index, button] of withPriorityButtons.entries())
			await expect(button).toHaveAttribute('data-priority', expectedPriorities[index])

		for (const button of withoutPriorityButtons)
			await expect(button).not.toHaveAttribute('data-priority')

		// `derivePriority` clamps any index at/beyond `PRIORITY_ROLES.length`
		// (3) to the last role, `tertiary` — the 4th button gets the same
		// `tertiary` as the 3rd, not a new/undefined role.
		expect(clampedButtons).toHaveLength(4)
		await expect(clampedButtons[0]).toHaveAttribute('data-priority', 'primary')
		await expect(clampedButtons[1]).toHaveAttribute('data-priority', 'secondary')
		await expect(clampedButtons[2]).toHaveAttribute('data-priority', 'tertiary')
		await expect(clampedButtons[3]).toHaveAttribute('data-priority', 'tertiary')
	},
}

// Children here (via `renderGroup`) carry no own `loading` prop, so each
// button's `data-loading` comes purely from `ButtonGroup`'s own `loading`
// cascading through `ButtonGroupProvider` / `useButtonGroupProps` — the same
// own-prop-wins precedence exercised (from the opposite direction) by
// `ChildOverrides`.
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
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			groups = canvas.getAllByRole('group')

		expect(groups).toHaveLength(2)

		const [loadingGroup, notLoadingGroup] = groups,
			loadingButtons = within(loadingGroup).getAllByRole('button'),
			notLoadingButtons = within(notLoadingGroup).getAllByRole('button')

		for (const button of loadingButtons)
			await expect(button).toHaveAttribute('data-loading', 'true')

		for (const button of notLoadingButtons)
			await expect(button).not.toHaveAttribute('data-loading')
	},
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

// `unstyled` does NOT remove the base `inkq-button-group` class
// `useStyles`/`getClassName.tsx` applies to the group's root element
// (rendered with `role="group"`) — per `getClassName.tsx`, the base class is
// now ALWAYS emitted (`classList = [baseClass]` unconditionally). It only
// suppresses the CSS-module-hashed class normally appended alongside it —
// verified against `ButtonGroup.tsx`'s own render, which only ever calls
// `styles('root')` (no other selector). It ALSO cascades to the child
// `Button`s: each surviving child (after `filterChildren` drops non-`Button`
// elements and flattens `Fragment`s) is wrapped in its own
// `ButtonGroupProvider` publishing `{ disabled, loading, priority, unstyled }`,
// and each `Button` fills its own `unstyled` from that context via
// `useButtonGroupProps` ONLY because none of these children set `unstyled`
// themselves — so passing `unstyled` to `ButtonGroup` suppresses each child
// `Button`'s own hashed module class too (same "base always present, module
// class suppressed" contract, one level down).
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

		// The hashed CSS-module class is build-generated, so assert on its
		// presence/shape rather than a literal hash: any class beyond the
		// semantic base class means the module class survived.
		const hasModuleClass = (el: Element, base: string) =>
			Array.from(el.classList).some(c => c !== base)

		await expect(isStyled).toHaveClass('inkq-button-group')
		await expect(isUnstyled).toHaveClass('inkq-button-group')
		expect(hasModuleClass(isStyled, 'inkq-button-group')).toBe(true)
		expect(hasModuleClass(isUnstyled, 'inkq-button-group')).toBe(false)

		// Cascades to child `Button`s too.
		const [unstyledButton] = within(isUnstyled).getAllByRole('button'),
			[styledButton] = within(isStyled).getAllByRole('button')

		await expect(styledButton).toHaveClass('inkq-button')
		await expect(unstyledButton).toHaveClass('inkq-button')
		expect(hasModuleClass(styledButton, 'inkq-button')).toBe(true)
		expect(hasModuleClass(unstyledButton, 'inkq-button')).toBe(false)
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

// `filterChildren` (`ButtonGroup.tsx`) recurses into `Fragment`s (flattening
// their children into the same list) and drops any element whose
// `displayName` isn't `'Button'` — a raw `<span>` (or any other non-`Button`
// element) simply renders nothing; it's excluded before the
// `ButtonGroupProvider` wrap/map, not merely hidden.
export const NonButtonChildren: Story = {
	render: ({ size, variant, ...args }) => (
		<Button.Group { ...args }>
			<>
				<Button { ...{ variant, size } }>Fragment child A</Button>
				<Button { ...{ variant, size } }>Fragment child B</Button>
			</>
			<span>not a Button — dropped by filterChildren</span>
			<Button { ...{ variant, size } }>Trailing</Button>
		</Button.Group>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			group = canvas.getByRole('group'),
			buttons = canvas.getAllByRole('button')

		expect(buttons).toHaveLength(3)
		await expect(canvas.queryByText('not a Button — dropped by filterChildren')).not.toBeInTheDocument()
		expect(group.children).toHaveLength(3)
	},
}

// Own props on a child `Button` beat the group's `ButtonGroupProvider`
// context value, per `useButtonGroupProps`' `Object.hasOwn` guard on the
// child's raw props — even when the group publishes the opposite value.
export const ChildOverrides: Story = {
	render: ({ size, variant, ...args }) => (
		<Button.Group { ...args } disabled loading={ false }>
			<Button { ...{ variant, size } }>Inherits disabled</Button>
			<Button { ...{ variant, size } } disabled={ false }>Own disabled=false wins</Button>
			<Button { ...{ variant, size } } loading>Own loading=true wins</Button>
		</Button.Group>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			buttons = canvas.getAllByRole('button')

		expect(buttons).toHaveLength(3)

		const [inherited, ownDisabledFalse, ownLoadingTrue] = buttons

		await expect(inherited).toHaveAttribute('disabled')
		await expect(ownDisabledFalse).not.toHaveAttribute('disabled')

		// the group publishes `loading={false}`; this child's own `loading`
		// still wins over it
		await expect(ownLoadingTrue).toHaveAttribute('data-loading', 'true')
	},
}
