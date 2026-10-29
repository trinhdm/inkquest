import { Component } from 'react'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import { getDefaultProps } from '@/hooks/useProps'
import { Tab } from '../index'
import { BOOLEAN_OPTIONS } from '../options.story'
import type { ReactNode } from 'react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const Row = ({ children }: { children: ReactNode }) => (
	<div style={ { display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'flex-start' } }>
		{ children }
	</div>
)

// `data-story-group` lets a play function find each labelled group without
// depending on any component class name.
const Group = ({ label, children }: { label: string, children: ReactNode }) => (
	<div data-story-group={ label } style={ { display: 'flex', flexDirection: 'column', gap: 8, width: 360 } }>
		<span style={ { font: 'var(--inkq-text-control)', letterSpacing: '.15em', textTransform: 'uppercase', opacity: 0.6 } }>
			{ label }
		</span>
		{ children }
	</div>
)

interface ErrorBoundaryState { message?: string }

// Stories-file-only: lets the "outside a Tab.Group" misuse render its thrown
// error without crashing the rest of the canvas.
class RenderErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
	state: ErrorBoundaryState = {}

	static getDerivedStateFromError(error: Error): ErrorBoundaryState {
		return { message: error.message }
	}

	render() {
		if (this.state.message)
			return <span data-testid="tab-list-error">{ this.state.message }</span>
		return this.props.children
	}
}

// `Parameters<typeof Tab.List>[0]` reads the real accepted prop type
// (including `unstyled`/`attributes`) off the component. `isCompound: true`
// makes `as` resolve to `never`, so it is also excluded from the controls.
type TabListStoryProps = Parameters<typeof Tab.List>[0]
type Story = StoryObj<TabListStoryProps>

const LABELS = ['One', 'Two', 'Three'] as const

const panels = LABELS.map(label => <Tab.Panel key={ label }>{ `${ label } panel` }</Tab.Panel>)

// `Tab.List` always lives inside a `Tab.Group`. Panels are direct children of
// the group, as the group requires.
const renderList = (props: Tab.List.Props = {}, groupProps: Tab.Group.Props = {}) => (
	<Tab.Group { ...groupProps }>
		<Tab.List { ...props }>
			{ LABELS.map(label => <Tab key={ label }>{ label }</Tab>) }
		</Tab.List>
		{ panels }
	</Tab.Group>
)

const groupsOf = (canvasElement: HTMLElement) =>
	[...canvasElement.querySelectorAll<HTMLElement>('[data-story-group]')]

const railOf = (container: HTMLElement) =>
	container.querySelector<HTMLElement>('[style*="--tab-rail"]')

const meta: Meta<TabListStoryProps> = {
	component: Tab.List,
	title: 'Data/Tab/Tab.List',
	parameters: { layout: 'padded' },
	argTypes: {
		disabled: {
			control: 'boolean',
			description: 'Not registered via `set` — `undefined` unless passed. Cascades to every child `Tab` through context (own `disabled` on a tab wins, including an explicit `false`). It guards selection: a disabled tab ignores clicks and Enter/Space, and renders `aria-disabled="true"` and `data-disabled` (not the native `disabled` attribute). See the `Disabled` and `ContextOverrides` stories.',
		},
	},
	args: {
		...getDefaultProps<Tab.List.Props>('Tab.List'),
	},
	render: args => renderList(args),
}

export default meta

export const Default: Story = {
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			list = canvas.getByRole('tablist'),
			tabs = canvas.getAllByRole('tab')

		await expect(list).toHaveAttribute('data-group')
		expect(tabs).toHaveLength(3)
		for (const tab of tabs)
			await expect(list).toContainElement(tab)

		// `Tab.List` hands each tab its position, in the order written.
		await expect(tabs.map(tab => tab.textContent)).toEqual([...LABELS])
		await expect(tabs[0]).toHaveAttribute('aria-selected', 'true')
		await expect(tabs[1]).toHaveAttribute('aria-selected', 'false')
		await expect(tabs[2]).toHaveAttribute('aria-selected', 'false')
	},
}

// `disabled` cascades to every tab through context. Guards clicks and
// Enter/Space; the 1st tab stays selected in the disabled group.
export const Disabled: Story = {
	parameters: { controls: { exclude: ['disabled'] } },
	render: args => (
		<Row>
			{ BOOLEAN_OPTIONS.map(disabled => (
				<Group key={ String(disabled) } label={ String(disabled) }>
					{ renderList({ ...args, disabled }) }
				</Group>
			)) }
		</Row>
	),
	play: async ({ canvasElement }) => {
		const groups = groupsOf(canvasElement)
		expect(groups).toHaveLength(2)

		// `BOOLEAN_OPTIONS` is `[true, false]`, mapped in order.
		const [disabledGroup, enabledGroup] = groups,
			disabledTabs = within(disabledGroup).getAllByRole('tab'),
			enabledTabs = within(enabledGroup).getAllByRole('tab')

		for (const tab of disabledTabs)
			await expect(tab).toHaveAttribute('aria-disabled', 'true')
		for (const tab of enabledTabs)
			await expect(tab).not.toHaveAttribute('aria-disabled')
		for (const tab of disabledTabs)
			await expect(tab).toHaveAttribute('data-disabled')

		await userEvent.click(disabledTabs[1])
		await expect(disabledTabs[0]).toHaveAttribute('aria-selected', 'true')
		await expect(disabledTabs[1]).toHaveAttribute('aria-selected', 'false')
		await expect(within(disabledGroup).getByRole('tabpanel')).toHaveTextContent('One panel')

		disabledTabs[2].focus()
		await userEvent.keyboard('{Enter}')
		await userEvent.keyboard(' ')
		await expect(disabledTabs[2]).toHaveAttribute('aria-selected', 'false')
		await expect(disabledTabs[0]).toHaveAttribute('aria-selected', 'true')

		await userEvent.click(enabledTabs[1])
		await expect(enabledTabs[1]).toHaveAttribute('aria-selected', 'true')
		await expect(within(enabledGroup).getByRole('tabpanel')).toHaveTextContent('Two panel')
	},
}

// A tab's own `disabled` wins over the list's, including an explicit `false`:
// the list is disabled, the 2nd tab opts back in, the 3rd inherits.
export const ContextOverrides: Story = {
	parameters: { controls: { exclude: ['disabled'] } },
	render: args => (
		<Tab.Group>
			<Tab.List { ...args } disabled>
				<Tab>One</Tab>
				<Tab disabled={ false }>Two (own disabled=false)</Tab>
				<Tab>Three</Tab>
			</Tab.List>
			{ panels }
		</Tab.Group>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			tabs = canvas.getAllByRole('tab')

		await expect(tabs[0]).toHaveAttribute('aria-disabled', 'true')
		await expect(tabs[1]).not.toHaveAttribute('aria-disabled')
		await expect(tabs[2]).toHaveAttribute('aria-disabled', 'true')

		await userEvent.click(tabs[2])
		await expect(tabs[0]).toHaveAttribute('aria-selected', 'true')
		await expect(tabs[2]).toHaveAttribute('aria-selected', 'false')

		await userEvent.click(tabs[1])
		await expect(tabs[1]).toHaveAttribute('aria-selected', 'true')
		await expect(canvas.getByRole('tabpanel')).toHaveTextContent('Two panel')
	},
}

// The highlight rail is a span measured in a layout effect: it spans the whole
// list and is moved/shrunk through two CSS variables, so it follows the
// selected tab without relayout.
export const Rail: Story = {
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			list = canvas.getByRole('tablist'),
			tabs = canvas.getAllByRole('tab')

		await waitFor(() => expect(railOf(list)).toBeInTheDocument())

		const rail = railOf(list) as HTMLElement,
			scale = () => Number(rail.style.getPropertyValue('--tab-rail-scale')),
			position = () => rail.style.getPropertyValue('--tab-rail-position')

		await expect(position()).not.toBe('')
		await expect(scale()).toBeGreaterThan(0)
		await expect(scale()).toBeLessThanOrEqual(1)

		const before = position()
		await userEvent.click(tabs[2])
		await waitFor(() => expect(position()).not.toBe(before))
		await expect(scale()).toBeGreaterThan(0)
	},
}

// No tab sits at the group's active position, so there is nothing to measure
// and no rail is rendered.
export const RailOutOfRange: Story = {
	render: args => renderList(args, { defaultActive: 5 }),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			tabs = canvas.getAllByRole('tab')

		for (const tab of tabs)
			await expect(tab).toHaveAttribute('aria-selected', 'false')
		await expect(railOf(canvas.getByRole('tablist'))).not.toBeInTheDocument()

		await userEvent.click(tabs[1])
		await waitFor(() => expect(railOf(canvas.getByRole('tablist'))).toBeInTheDocument())
	},
}

// `Tab`s wrapped in a Fragment are found the same as direct ones and numbered
// across the boundary.
export const FragmentChildren: Story = {
	render: args => (
		<Tab.Group id="list-fragment">
			<Tab.List { ...args }>
				<>
					<Tab>One</Tab>
					<Tab>Two</Tab>
				</>
				<Tab>Three</Tab>
			</Tab.List>
			{ panels }
		</Tab.Group>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			tabs = canvas.getAllByRole('tab')

		expect(tabs).toHaveLength(3)
		await expect(tabs.map(tab => tab.getAttribute('aria-controls'))).toEqual([
			'tab-list-fragment-0-panel', 'tab-list-fragment-1-panel', 'tab-list-fragment-2-panel',
		])

		await userEvent.click(tabs[2])
		await expect(canvas.getByRole('tabpanel')).toHaveTextContent('Three panel')
	},
}

// Anything that is not a `Tab` is dropped (with a console warning) and does
// not take up a position.
export const UnrelatedChildren: Story = {
	render: args => (
		<Tab.Group>
			<Tab.List { ...args }>
				<Tab>One</Tab>
				<div>Stray div (never rendered)</div>
				Loose text (never rendered)
				<Tab>Two</Tab>
			</Tab.List>
			<Tab.Panel>One panel</Tab.Panel>
			<Tab.Panel>Two panel</Tab.Panel>
		</Tab.Group>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			tabs = canvas.getAllByRole('tab')

		expect(tabs).toHaveLength(2)
		await expect(canvas.queryByText('Stray div (never rendered)')).not.toBeInTheDocument()
		await expect(canvas.queryByText('Loose text (never rendered)')).not.toBeInTheDocument()

		await userEvent.click(tabs[1])
		await expect(canvas.getByRole('tabpanel')).toHaveTextContent('Two panel')
	},
}

// No tabs: an empty tablist, and with nothing to measure, no rail.
export const Empty: Story = {
	render: () => (
		<Tab.Group>
			<Tab.List />
		</Tab.Group>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)

		await expect(canvas.getByRole('tablist')).toBeInTheDocument()
		await expect(canvas.queryByRole('tab')).not.toBeInTheDocument()
		await expect(railOf(canvas.getByRole('tablist'))).not.toBeInTheDocument()
	},
}

// `useTabGroupCtx` is the required reader, so a `Tab.List` with no `Tab.Group`
// throws, naming the group (`Tab.Group`) in the message below.
export const RequiresTabGroup: Story = {
	render: args => (
		<Row>
			<Group label="inside a Tab.Group (valid)">{ renderList(args) }</Group>
			<Group label="standalone (throws)">
				<RenderErrorBoundary>
					<Tab.List />
				</RenderErrorBoundary>
			</Group>
		</Row>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)

		await expect(canvas.getAllByRole('tab')).toHaveLength(3)
		await expect(await canvas.findByTestId('tab-list-error'))
			.toHaveTextContent('Tab.Group: <Tab.List /> must be a direct child of <Tab.Group>')
	},
}
