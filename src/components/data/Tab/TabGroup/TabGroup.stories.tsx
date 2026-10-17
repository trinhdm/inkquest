import { expect, userEvent, within } from 'storybook/test'
import { getDefaultProps } from '@/hooks/useProps'
import { Tab } from '../index'
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

// `Parameters<typeof Tab.Group>[0]` reads the real accepted prop type
// (including `unstyled`/`attributes`) off the component. `isCompound: true`
// makes `as` resolve to `never`, so it is also excluded from the controls.
type TabGroupStoryProps = Parameters<typeof Tab.Group>[0]
type Story = StoryObj<TabGroupStoryProps>

const LABELS = ['One', 'Two', 'Three'] as const

// Three tabs + three panels inside the given group. `Tab.Panel`s must stay
// direct children of the group: that is how it numbers them.
const renderGroup = (props: Tab.Group.Props = {}) => (
	<Tab.Group { ...props }>
		<Tab.List>
			{ LABELS.map(label => <Tab key={ label }>{ label }</Tab>) }
		</Tab.List>
		{ LABELS.map(label => <Tab.Panel key={ label }>{ `${ label } panel` }</Tab.Panel>) }
	</Tab.Group>
)

const groupsOf = (canvasElement: HTMLElement) =>
	[...canvasElement.querySelectorAll<HTMLElement>('[data-story-group]')]

const meta: Meta<TabGroupStoryProps> = {
	component: Tab.Group,
	title: 'Data/Tab/Tab.Group',
	parameters: { layout: 'padded' },
	argTypes: {
		defaultActive: {
			control: 'number',
			description: 'Registered default `0`. The index of the tab selected on first render; it only seeds state, so changing it later does not move the selection. An index with no matching tab (e.g. `5` with three tabs) leaves every tab unselected and every panel hidden. See the `DefaultActive` and `DefaultActiveOutOfRange` stories.',
		},
		id: {
			control: 'text',
			description: 'Not registered via `set`. Seeds the ids that link tabs and panels: `tab-<id>-<index>` for the tab and `tab-<id>-<index>-panel` for the panel (kebab-cased). Without it an id is generated with `useId`. It is not set on the group\'s own element. See the `Id` story.',
		},
	},
	args: {
		...getDefaultProps<Tab.Group.Props>('Tab.Group'),
	},
	// `key` remounts the group when the control changes, because
	// `defaultActive` only seeds initial state.
	render: args => <div key={ args.defaultActive }>{ renderGroup(args) }</div>,
}

export default meta

export const Default: Story = {
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)

		const list = canvas.getByRole('tablist')
		await expect(list).toBeInTheDocument()
		await expect(canvas.getAllByRole('tab')).toHaveLength(3)

		// Registered default `defaultActive: 0`: only the first panel is exposed.
		const visible = canvas.getByRole('tabpanel')
		await expect(visible).toHaveTextContent('One panel')

		const [first, second, third] = canvas.getAllByRole('tabpanel', { hidden: true })
		await expect(first).not.toHaveAttribute('hidden')
		await expect(first).toHaveAttribute('aria-hidden', 'false')
		await expect(second).toHaveAttribute('hidden')
		await expect(second).toHaveAttribute('aria-hidden', 'true')
		await expect(third).toHaveAttribute('hidden')
	},
}

export const DefaultActive: Story = {
	parameters: { controls: { exclude: ['defaultActive'] } },
	render: args => (
		<Row>
			{ [0, 1, 2].map(defaultActive => (
				<Group key={ defaultActive } label={ String(defaultActive) }>
					{ renderGroup({ ...args, defaultActive }) }
				</Group>
			)) }
		</Row>
	),
	play: async ({ canvasElement }) => {
		const groups = groupsOf(canvasElement)
		expect(groups).toHaveLength(3)

		for (const [index, group] of groups.entries()) {
			const canvas = within(group),
				tabs = canvas.getAllByRole('tab')

			for (const [i, tab] of tabs.entries())
				await expect(tab).toHaveAttribute('aria-selected', String(i === index))

			await expect(canvas.getByRole('tabpanel')).toHaveTextContent(`${ LABELS[index] } panel`)
		}
	},
}

// An index with no tab behind it is not clamped: nothing is selected and every
// panel is hidden. A click still recovers.
export const DefaultActiveOutOfRange: Story = {
	args: { defaultActive: 5 },
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			tabs = canvas.getAllByRole('tab')

		for (const tab of tabs)
			await expect(tab).toHaveAttribute('aria-selected', 'false')
		await expect(canvas.queryByRole('tabpanel')).not.toBeInTheDocument()
		await expect(canvas.getAllByRole('tabpanel', { hidden: true })).toHaveLength(3)

		await userEvent.click(tabs[0])
		await expect(tabs[0]).toHaveAttribute('aria-selected', 'true')
		await expect(canvas.getByRole('tabpanel')).toHaveTextContent('One panel')
	},
}

// A passed `id` makes the ids predictable (kebab-cased with a `tab-` prefix);
// without one they come from `useId`, so two groups never collide.
export const Id: Story = {
	parameters: { controls: { exclude: ['id'] } },
	render: args => (
		<Row>
			<Group label="id: alpha">{ renderGroup({ ...args, id: 'alpha' }) }</Group>
			<Group label="id: beta">{ renderGroup({ ...args, id: 'beta' }) }</Group>
			<Group label="no id (generated)">{ renderGroup({ ...args, id: undefined }) }</Group>
		</Row>
	),
	play: async ({ canvasElement }) => {
		const [alpha, beta, generated] = groupsOf(canvasElement),
			panelsOf = (group: HTMLElement) => within(group).getAllByRole('tabpanel', { hidden: true })

		await expect(panelsOf(alpha).map(panel => panel.id)).toEqual([
			'tab-alpha-0-panel', 'tab-alpha-1-panel', 'tab-alpha-2-panel',
		])
		await expect(panelsOf(alpha).map(panel => panel.getAttribute('aria-labelledby'))).toEqual([
			'tab-alpha-0', 'tab-alpha-1', 'tab-alpha-2',
		])
		await expect(within(alpha).getAllByRole('tab').map(tab => tab.getAttribute('aria-controls')))
			.toEqual(panelsOf(alpha).map(panel => panel.id))

		await expect(panelsOf(beta)[0].id).toBe('tab-beta-0-panel')

		const generatedIds = panelsOf(generated).map(panel => panel.id)
		await expect(new Set(generatedIds).size).toBe(3)
		for (const id of generatedIds) {
			await expect(id.startsWith('tab-')).toBe(true)
			await expect(id.startsWith('tab-alpha')).toBe(false)
			await expect(id.startsWith('tab-beta')).toBe(false)
		}
	},
}

// Mouse: selection state lives in the group, and exactly one panel is exposed
// at a time.
export const Clickable: Story = {
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			tabs = canvas.getAllByRole('tab')

		await userEvent.click(tabs[2])
		await expect(canvas.getAllByRole('tabpanel')).toHaveLength(1)
		await expect(canvas.getByRole('tabpanel')).toHaveTextContent('Three panel')
		await expect(tabs[2]).toHaveAttribute('aria-selected', 'true')

		await userEvent.click(tabs[0])
		await expect(canvas.getAllByRole('tabpanel')).toHaveLength(1)
		await expect(canvas.getByRole('tabpanel')).toHaveTextContent('One panel')
		await expect(tabs[2]).toHaveAttribute('aria-selected', 'false')
	},
}

// Enter and Space on a focused tab both change the group's selection.
export const KeyboardActivation: Story = {
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			tabs = canvas.getAllByRole('tab')

		await userEvent.tab()
		await userEvent.tab()
		await expect(tabs[1]).toHaveFocus()
		await userEvent.keyboard('{Enter}')
		await expect(canvas.getByRole('tabpanel')).toHaveTextContent('Two panel')

		await userEvent.tab()
		await expect(tabs[2]).toHaveFocus()
		await userEvent.keyboard(' ')
		await expect(canvas.getByRole('tabpanel')).toHaveTextContent('Three panel')
	},
}

// Each group keeps its own selection state.
export const IndependentGroups: Story = {
	render: args => (
		<Row>
			<Group label="first group">{ renderGroup(args) }</Group>
			<Group label="second group">{ renderGroup(args) }</Group>
		</Row>
	),
	play: async ({ canvasElement }) => {
		const [first, second] = groupsOf(canvasElement)

		await userEvent.click(within(first).getAllByRole('tab')[2])
		await expect(within(first).getByRole('tabpanel')).toHaveTextContent('Three panel')
		await expect(within(second).getByRole('tabpanel')).toHaveTextContent('One panel')

		// Distinct ids even though neither group was given one.
		await expect(within(first).getAllByRole('tab')[0].getAttribute('aria-controls'))
			.not.toBe(within(second).getAllByRole('tab')[0].getAttribute('aria-controls'))
	},
}

// Panels are numbered by their order among the group's DIRECT panel children;
// other children (here a paragraph between them) are kept and do not count.
export const PanelIndexing: Story = {
	parameters: { controls: { exclude: ['id'] } },
	render: args => (
		<Tab.Group { ...args } id="indexing">
			<Tab.List>
				<Tab>One</Tab>
				<Tab>Two</Tab>
			</Tab.List>
			<p>Between panels</p>
			<Tab.Panel>One panel</Tab.Panel>
			<Tab.Panel>Two panel</Tab.Panel>
		</Tab.Group>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)

		await expect(canvas.getByText('Between panels')).toBeInTheDocument()
		await expect(canvas.getAllByRole('tabpanel', { hidden: true }).map(panel => panel.id)).toEqual([
			'tab-indexing-0-panel', 'tab-indexing-1-panel',
		])

		await userEvent.click(canvas.getAllByRole('tab')[1])
		await expect(canvas.getByRole('tabpanel')).toHaveTextContent('Two panel')
	},
}

// The group renders a plain `<div>` wrapper around the list and the panels.
export const Wrapper: Story = {
	render: args => <div data-testid="wrapper-host">{ renderGroup(args) }</div>,
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			group = canvas.getByTestId('wrapper-host').firstElementChild as HTMLElement

		await expect(group.tagName).toBe('DIV')
		await expect(group).toContainElement(canvas.getByRole('tablist'))
		await expect(group).toContainElement(canvas.getByRole('tabpanel'))
	},
}
