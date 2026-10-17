import { Component } from 'react'
import { expect, fn, userEvent, within } from 'storybook/test'
import { getDefaultProps } from '@/hooks/useProps'
import { Tab } from './index'
import { BOOLEAN_OPTIONS } from './options.story'
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
			return <span data-testid="tab-error">{ this.state.message }</span>
		return this.props.children
	}
}

// `Parameters<typeof Tab>[0]` reads the real accepted prop type (including
// `as`, `unstyled`, `attributes`) straight off the component.
type TabStoryProps = Parameters<typeof Tab>[0]
type Story = StoryObj<TabStoryProps>

const LABELS = ['One', 'Two', 'Three'] as const

interface TabsTemplateOptions {
	// 0-based position of the tab that receives `tabProps`
	target?: number
	tabProps?: Partial<Tab.Props>
	groupId?: string
}

// Three tabs + three panels. Only the `target` tab gets `tabProps`; the rest
// are plain, so they keep the positional `index` the list hands them.
// Tab.Panel is a direct child of the group, which is what indexes it.
const renderTabs = ({ target = 0, tabProps = {}, groupId }: TabsTemplateOptions = {}) => {
	const { children, ...rest } = tabProps

	return (
		<Tab.Group id={ groupId }>
			<Tab.List>
				{ LABELS.map((label, i) => i === target
					? <Tab key={ label } { ...rest }>{ children ?? label }</Tab>
					: <Tab key={ label }>{ label }</Tab>
				) }
			</Tab.List>
			{ LABELS.map(label => <Tab.Panel key={ label }>{ `${ label } panel` }</Tab.Panel>) }
		</Tab.Group>
	)
}

const groupsOf = (canvasElement: HTMLElement) =>
	[...canvasElement.querySelectorAll<HTMLElement>('[data-story-group]')]

const meta: Meta<TabStoryProps> = {
	component: Tab,
	title: 'Data/Tab',
	parameters: { layout: 'padded' },
	argTypes: {
		active: {
			control: 'boolean',
			description: 'Not registered via `set` — `undefined` unless passed. Filled in from `Tab.List` through context (`active` is true for the tab at the group\'s current position); an own `active` prop always wins. Drives `aria-selected` and the `data-active` attribute only — it does NOT change which panel is shown (the group does). See the `Active` story.',
		},
		as: {
			control: 'select',
			options: ['button', 'div'],
			description: 'Registered default `\'button\'`. The tag the tab renders as; `role="tab"` is always set. A non-button tag loses native focus and Enter/Space activation. See the `As` story.',
		},
		children: {
			control: 'text',
			description: 'The tab label. Wrapped in a `<span>` so the label can be styled apart from the tab.',
		},
		disabled: {
			control: 'boolean',
			description: 'Inherited from `Tab.List` unless passed (own prop wins). Only guards selection: the click handler skips `onSelect`. `Tab` does not forward it to the element, so no `disabled`/`aria-disabled` attribute is rendered. See the `Disabled` story.',
		},
		index: {
			control: 'number',
			description: 'Registered default `0`; `Tab.List` fills in each tab\'s position when it is not passed (own prop wins). Builds `aria-controls` (`<group uid>-<index>-panel`) and is the value handed to `onSelect`. See the `Index` story.',
		},
		onSelect: {
			control: false,
			description: 'Inherited from `Tab.List` (the group\'s state setter) unless passed. An own `onSelect` REPLACES the group\'s handler: it is called with the tab\'s `index` and the group does not move. Not called when `disabled`. See the `OnSelect` story.',
		},
	},
	args: {
		...getDefaultProps<Tab.Props>('Tab'),
		children: 'One',
	},
	render: args => renderTabs({ tabProps: args }),
}

export default meta

export const Default: Story = {
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)

		await expect(canvas.getByRole('tablist')).toBeInTheDocument()

		const tabs = canvas.getAllByRole('tab')
		expect(tabs).toHaveLength(3)

		for (const tab of tabs) {
			await expect(tab.tagName).toBe('BUTTON')
			await expect(tab).toHaveAttribute('data-tab')
			await expect(tab).toHaveAttribute('aria-controls')
		}

		// Registered default group `defaultActive: 0`.
		await expect(tabs[0]).toHaveAttribute('aria-selected', 'true')
		await expect(tabs[0]).toHaveAttribute('data-active')
		await expect(tabs[1]).toHaveAttribute('aria-selected', 'false')
		await expect(tabs[1]).not.toHaveAttribute('data-active')
		await expect(tabs[2]).toHaveAttribute('aria-selected', 'false')

		// The label sits in a span inside the tab.
		const label = within(tabs[0]).getByText('One')
		await expect(label.tagName).toBe('SPAN')

		// Only the active panel is exposed.
		await expect(canvas.getByRole('tabpanel')).toHaveTextContent('One panel')
	},
}

// `active` comes from `Tab.List` through context and an own prop wins. It only
// moves `aria-selected`/`data-active`; the visible panel still follows the
// group, which is why the `false` group keeps showing the first panel.
export const Active: Story = {
	parameters: { controls: { exclude: ['active'] } },
	render: () => (
		<Row>
			{ BOOLEAN_OPTIONS.map(active => (
				<Group key={ String(active) } label={ String(active) }>
					{ /* `true` on the 2nd tab; `false` on the 1st tab (the group's own current one). */ }
					{ renderTabs({ target: active ? 1 : 0, tabProps: { active } }) }
				</Group>
			)) }
		</Row>
	),
	play: async ({ canvasElement }) => {
		const groups = groupsOf(canvasElement)
		expect(groups).toHaveLength(2)

		// `BOOLEAN_OPTIONS` is `[true, false]`, mapped in order.
		const [activeGroup, inactiveGroup] = groups,
			activeTabs = within(activeGroup).getAllByRole('tab'),
			inactiveTabs = within(inactiveGroup).getAllByRole('tab')

		// Forced on: the 2nd tab is selected next to the group's own 1st.
		await expect(activeTabs[1]).toHaveAttribute('aria-selected', 'true')
		await expect(activeTabs[1]).toHaveAttribute('data-active')
		await expect(activeTabs[0]).toHaveAttribute('aria-selected', 'true')

		// Forced off: the group's current tab reports unselected.
		await expect(inactiveTabs[0]).toHaveAttribute('aria-selected', 'false')
		await expect(inactiveTabs[0]).not.toHaveAttribute('data-active')

		// `active` never touches the panels.
		await expect(within(inactiveGroup).getByRole('tabpanel')).toHaveTextContent('One panel')
	},
}

export const As: Story = {
	parameters: { controls: { exclude: ['as'] } },
	render: () => (
		<Row>
			<Group label="button">{ renderTabs() }</Group>
			<Group label="div">
				<Tab.Group>
					<Tab.List>
						<Tab as="div">One</Tab>
						<Tab as="div">Two</Tab>
					</Tab.List>
					<Tab.Panel>One panel</Tab.Panel>
					<Tab.Panel>Two panel</Tab.Panel>
				</Tab.Group>
			</Group>
		</Row>
	),
	play: async ({ canvasElement }) => {
		const [buttons, divs] = groupsOf(canvasElement)

		for (const tab of within(buttons).getAllByRole('tab'))
			await expect(tab.tagName).toBe('BUTTON')

		const divTabs = within(divs).getAllByRole('tab')
		expect(divTabs).toHaveLength(2)
		for (const tab of divTabs)
			await expect(tab.tagName).toBe('DIV')

		// Still a working tab: a click selects it and swaps the panel.
		await userEvent.click(divTabs[1])
		await expect(divTabs[1]).toHaveAttribute('aria-selected', 'true')
		await expect(within(divs).getByRole('tabpanel')).toHaveTextContent('Two panel')
	},
}

// A tab's own `disabled` (or one inherited from `Tab.List`) only guards the
// click handler. Each group gets a spy as the 2nd tab's own `onSelect`, so the
// exact call count proves the guard; the spy replaces the group's handler,
// which is why selection is not asserted to move in the enabled group.
// The `aria-disabled` checks fail until the `aria-disabled` fix lands in `Tab.tsx`.
const disabledSpy = fn()

export const Disabled: Story = {
	parameters: { controls: { exclude: ['disabled'] } },
	render: () => (
		<Row>
			{ BOOLEAN_OPTIONS.map(disabled => (
				<Group key={ String(disabled) } label={ String(disabled) }>
					{ renderTabs({ target: 1, tabProps: { disabled, onSelect: disabledSpy } }) }
				</Group>
			)) }
		</Row>
	),
	play: async ({ canvasElement }) => {
		disabledSpy.mockClear()

		const groups = groupsOf(canvasElement)
		expect(groups).toHaveLength(2)

		// `BOOLEAN_OPTIONS` is `[true, false]`, mapped in order.
		const [disabledGroup, enabledGroup] = groups,
			disabledTab = within(disabledGroup).getAllByRole('tab')[1],
			enabledTab = within(enabledGroup).getAllByRole('tab')[1]

		await expect(disabledTab).toHaveAttribute('aria-disabled', 'true')
		await expect(enabledTab).not.toHaveAttribute('aria-disabled')

		await userEvent.click(disabledTab)
		await expect(disabledSpy).toHaveBeenCalledTimes(0)

		// Keyboard activation hits the same guard.
		disabledTab.focus()
		await userEvent.keyboard('{Enter}')
		await userEvent.keyboard(' ')
		await expect(disabledSpy).toHaveBeenCalledTimes(0)
		await expect(within(disabledGroup).getAllByRole('tab')[0]).toHaveAttribute('aria-selected', 'true')

		await userEvent.click(enabledTab)
		await expect(disabledSpy).toHaveBeenCalledTimes(1)
		await expect(disabledSpy).toHaveBeenCalledWith(1)
	},
}

// The tab's own `index` wins over the position `Tab.List` hands it. It builds
// `aria-controls` and is what `onSelect` receives, so clicking the first tab
// (own `index: 2`) selects the group's third position.
export const Index: Story = {
	parameters: { controls: { exclude: ['index'] } },
	render: () => renderTabs({ groupId: 'tab-index-story', tabProps: { index: 2 } }),
	play: async ({ canvasElement }) => {
		const tabs = within(canvasElement).getAllByRole('tab')

		await expect(tabs[0]).toHaveAttribute('aria-controls', 'tab-tab-index-story-2-panel')
		await expect(tabs[1]).toHaveAttribute('aria-controls', 'tab-tab-index-story-1-panel')

		await userEvent.click(tabs[0])
		await expect(tabs[2]).toHaveAttribute('aria-selected', 'true')
		await expect(tabs[0]).toHaveAttribute('aria-selected', 'false')
	},
}

// Own `onSelect` REPLACES the group's state setter: it runs once per click
// with the tab's index (including on the already-active tab) and the
// selection does not move. The other tabs still select normally.
const onSelectSpy = fn()

export const OnSelect: Story = {
	parameters: { controls: { exclude: ['onSelect'] } },
	render: () => renderTabs({ target: 1, tabProps: { onSelect: onSelectSpy } }),
	play: async ({ canvasElement }) => {
		onSelectSpy.mockClear()

		const canvas = within(canvasElement),
			tabs = canvas.getAllByRole('tab')

		await userEvent.click(tabs[1])
		await expect(onSelectSpy).toHaveBeenCalledTimes(1)
		await expect(onSelectSpy).toHaveBeenLastCalledWith(1)
		await expect(tabs[0]).toHaveAttribute('aria-selected', 'true')
		await expect(tabs[1]).toHaveAttribute('aria-selected', 'false')

		await userEvent.click(tabs[1])
		await expect(onSelectSpy).toHaveBeenCalledTimes(2)

		// A tab without its own handler uses the group's, and does not call the spy.
		await userEvent.click(tabs[2])
		await expect(tabs[2]).toHaveAttribute('aria-selected', 'true')
		await expect(onSelectSpy).toHaveBeenCalledTimes(2)
	},
}

// Mouse: a click moves `aria-selected` and swaps the visible panel; clicking
// the active tab again keeps it selected.
export const Clickable: Story = {
	render: () => renderTabs(),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			tabs = canvas.getAllByRole('tab')

		await userEvent.click(tabs[1])
		await expect(tabs[1]).toHaveAttribute('aria-selected', 'true')
		await expect(tabs[1]).toHaveAttribute('data-active')
		await expect(tabs[0]).toHaveAttribute('aria-selected', 'false')
		await expect(tabs[0]).not.toHaveAttribute('data-active')
		await expect(canvas.getByRole('tabpanel')).toHaveTextContent('Two panel')
		await expect(canvas.getAllByRole('tabpanel', { hidden: true })).toHaveLength(3)

		await userEvent.click(tabs[1])
		await expect(tabs[1]).toHaveAttribute('aria-selected', 'true')
		await expect(canvas.getByRole('tabpanel')).toHaveTextContent('Two panel')

		await userEvent.click(tabs[2])
		await expect(tabs[2]).toHaveAttribute('aria-selected', 'true')
		await expect(tabs[1]).toHaveAttribute('aria-selected', 'false')
		await expect(canvas.getByRole('tabpanel')).toHaveTextContent('Three panel')
	},
}

// Pure focus mechanics. There is no roving tabindex or arrow-key handling in
// `Tab`, so every tab is its own Tab stop. Focus alone never selects.
export const KeyboardFocus: Story = {
	render: () => renderTabs(),
	play: async ({ canvasElement }) => {
		const tabs = within(canvasElement).getAllByRole('tab')

		await userEvent.tab()
		await expect(tabs[0]).toHaveFocus()

		await userEvent.tab()
		await expect(tabs[1]).toHaveFocus()

		await userEvent.tab()
		await expect(tabs[2]).toHaveFocus()

		await userEvent.tab({ shift: true })
		await expect(tabs[1]).toHaveFocus()

		await expect(tabs[0]).toHaveAttribute('aria-selected', 'true')
		await expect(tabs[1]).toHaveAttribute('aria-selected', 'false')
	},
}

// Enter and Space both activate the focused tab (native button behavior).
export const KeyboardActivation: Story = {
	render: () => renderTabs(),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			tabs = canvas.getAllByRole('tab')

		await userEvent.tab()
		await userEvent.tab()
		await expect(tabs[1]).toHaveFocus()
		await userEvent.keyboard('{Enter}')
		await expect(tabs[1]).toHaveAttribute('aria-selected', 'true')
		await expect(canvas.getByRole('tabpanel')).toHaveTextContent('Two panel')

		await userEvent.tab()
		await expect(tabs[2]).toHaveFocus()
		await userEvent.keyboard(' ')
		await expect(tabs[2]).toHaveAttribute('aria-selected', 'true')
		await expect(canvas.getByRole('tabpanel')).toHaveTextContent('Three panel')
		await expect(tabs[1]).toHaveAttribute('aria-selected', 'false')
	},
}

// `useTabGroupCtx` is the required reader, so a `Tab` with no `Tab.Group`
// throws. Needs the pending context-name fix in `TabGroup.context.tsx`
// (`'TabGroup'` -> `'Tab.Group'`) for the message below.
export const RequiresTabGroup: Story = {
	render: () => (
		<Row>
			<Group label="inside a Tab.Group (valid)">{ renderTabs() }</Group>
			<Group label="standalone (throws)">
				<RenderErrorBoundary>
					<Tab>One</Tab>
				</RenderErrorBoundary>
			</Group>
		</Row>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)

		await expect(canvas.getAllByRole('tab')).toHaveLength(3)
		await expect(await canvas.findByTestId('tab-error'))
			.toHaveTextContent('Tab.Group: <Tab /> must be a direct child of <Tab.Group>')
	},
}
