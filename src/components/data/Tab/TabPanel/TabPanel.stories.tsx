import { Component } from 'react'
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

interface ErrorBoundaryState { message?: string }

// Stories-file-only: lets the misuse cases render their thrown error without
// crashing the rest of the canvas.
class RenderErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
	state: ErrorBoundaryState = {}

	static getDerivedStateFromError(error: Error): ErrorBoundaryState {
		return { message: error.message }
	}

	render() {
		if (this.state.message)
			return <span data-testid="tab-panel-error">{ this.state.message }</span>
		return this.props.children
	}
}

// `Parameters<typeof Tab.Panel>[0]` reads the real accepted prop type
// (including `unstyled`/`attributes`) off the component. `isCompound: true`
// makes `as` resolve to `never`, so it is also excluded from the controls.
type TabPanelStoryProps = Parameters<typeof Tab.Panel>[0]
type Story = StoryObj<TabPanelStoryProps>

const groupsOf = (canvasElement: HTMLElement) =>
	[...canvasElement.querySelectorAll<HTMLElement>('[data-story-group]')]

// A panel only works as a DIRECT child of `Tab.Group`, which numbers it and
// tells it whether it is active. The panel under test is always the first.
const renderPanel = (
	panel: ReactNode,
	{ extra = [], ...groupProps }: Tab.Group.Props & { extra?: string[] } = {},
) => (
	<Tab.Group { ...groupProps }>
		<Tab.List>
			<Tab>One</Tab>
			{ extra.map(label => <Tab key={ label }>{ label }</Tab>) }
		</Tab.List>
		{ panel }
		{ extra.map(label => <Tab.Panel key={ label }>{ `${ label } panel` }</Tab.Panel>) }
	</Tab.Group>
)

const meta: Meta<TabPanelStoryProps> = {
	component: Tab.Panel,
	title: 'Data/Tab/Tab.Panel',
	parameters: { layout: 'padded' },
	argTypes: {
		children: {
			control: 'text',
			description: 'The panel content. Text-only content is wrapped in a `<p>`; block-level content is left as is. See the `Content` story.',
		},
	},
	args: {
		...getDefaultProps<Tab.Panel.Props>('Tab.Panel'),
		children: 'Panel content',
	},
	render: args => renderPanel(<Tab.Panel { ...args } />, { id: 'panel-default' }),
}

export default meta

export const Default: Story = {
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			panel = canvas.getByRole('tabpanel')

		await expect(panel.tagName).toBe('DIV')
		await expect(panel).toHaveTextContent('Panel content')
		await expect(panel).toHaveAttribute('id', 'tab-panel-default-0-panel')
		await expect(panel).toHaveAttribute('aria-labelledby', 'tab-panel-default-0')
		await expect(panel).toHaveAttribute('aria-hidden', 'false')
		await expect(panel).not.toHaveAttribute('hidden')
		await expect(canvas.getByRole('tab')).toHaveAttribute('aria-controls', panel.id)
	},
}

// Visibility is driven by the group (`defaultActive` vs the panel's position
// among the group's panels). An inactive panel stays mounted but gets
// `hidden` and `aria-hidden`, and is not exposed as a `tabpanel`.
export const Visibility: Story = {
	parameters: { controls: { exclude: ['children'] } },
	render: () => (
		<Row>
			{ [0, 1].map(defaultActive => (
				<Group key={ defaultActive } label={ `defaultActive: ${ defaultActive }` }>
					<Tab.Group defaultActive={ defaultActive }>
						<Tab.List>
							<Tab>One</Tab>
							<Tab>Two</Tab>
						</Tab.List>
						<Tab.Panel>First body</Tab.Panel>
						<Tab.Panel>Second body</Tab.Panel>
					</Tab.Group>
				</Group>
			)) }
		</Row>
	),
	play: async ({ canvasElement }) => {
		const groups = groupsOf(canvasElement)
		expect(groups).toHaveLength(2)

		for (const [defaultActive, group] of groups.entries()) {
			const canvas = within(group),
				panels = canvas.getAllByRole('tabpanel', { hidden: true })

			expect(panels).toHaveLength(2)
			await expect(canvas.getAllByRole('tabpanel')).toHaveLength(1)

			for (const [i, panel] of panels.entries()) {
				const isActive = i === defaultActive

				await expect(panel).toHaveAttribute('aria-hidden', String(!isActive))
				if (isActive) await expect(panel).not.toHaveAttribute('hidden')
				else await expect(panel).toHaveAttribute('hidden')
			}

			// Hidden content is still mounted, just not visible.
			const [inactive, active] = defaultActive === 0
				? [canvas.getByText('Second body'), canvas.getByText('First body')]
				: [canvas.getByText('First body'), canvas.getByText('Second body')]
			await expect(inactive).toBeInTheDocument()
			await expect(inactive).not.toBeVisible()
			await expect(active).toBeVisible()
		}
	},
}

// Selecting a tab swaps which panel is exposed.
export const Clickable: Story = {
	render: args => renderPanel(<Tab.Panel { ...args }>First body</Tab.Panel>, { extra: ['Two'] }),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			tabs = canvas.getAllByRole('tab')

		await expect(canvas.getByRole('tabpanel')).toHaveTextContent('First body')

		await userEvent.click(tabs[1])
		await expect(canvas.getAllByRole('tabpanel')).toHaveLength(1)
		await expect(canvas.getByRole('tabpanel')).toHaveTextContent('Two panel')
		await expect(canvas.getByText('First body')).not.toBeVisible()

		await userEvent.click(tabs[0])
		await expect(canvas.getByRole('tabpanel')).toHaveTextContent('First body')
	},
}

// Text-only content is wrapped in a paragraph; block-level content (here a
// `<section>`) is left unwrapped.
export const Content: Story = {
	parameters: { controls: { exclude: ['children'] } },
	render: () => (
		<Row>
			<Group label="text only">
				<Tab.Group>
					<Tab.List><Tab>One</Tab></Tab.List>
					<Tab.Panel>Just words</Tab.Panel>
				</Tab.Group>
			</Group>
			<Group label="block content">
				<Tab.Group>
					<Tab.List><Tab>One</Tab></Tab.List>
					<Tab.Panel><section>Block</section></Tab.Panel>
				</Tab.Group>
			</Group>
		</Row>
	),
	play: async ({ canvasElement }) => {
		const [text, block] = groupsOf(canvasElement)

		await expect(within(text).getByText('Just words').tagName).toBe('P')

		await expect(within(block).getByText('Block').tagName).toBe('SECTION')
		await expect(within(block).getByText('Block').closest('p')).toBeNull()
	},
}

// Each tab points at its panel with `aria-controls`, and the panel points back
// with `aria-labelledby`. Split from `Default` because the back-reference needs
// the tab itself to carry that id; it is asserted here as the intended
// behavior, so this story fails while `Tab` leaves its `id` off the element.
export const LabelledByTab: Story = {
	render: args => renderPanel(<Tab.Panel { ...args } />, { id: 'panel-labelled' }),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			tab = canvas.getByRole('tab'),
			panel = canvas.getByRole('tabpanel'),
			labelledBy = panel.getAttribute('aria-labelledby') as string

		await expect(tab).toHaveAttribute('aria-controls', panel.id)
		await expect(canvasElement.querySelector(`[id="${ labelledBy }"]`)).toBe(tab)
		await expect(canvas.getByRole('tabpanel', { name: 'One' })).toBe(panel)
	},
}

// `useTabPanelCtx` is the required reader. The group only provides it to
// panels that are its DIRECT children, so a panel standalone, or wrapped in
// another element inside the group, throws.
export const RequiresTabGroup: Story = {
	render: args => (
		<Row>
			<Group label="direct child of Tab.Group (valid)">
				{ renderPanel(<Tab.Panel { ...args } />) }
			</Group>
			<Group label="standalone (throws)">
				<RenderErrorBoundary>
					<Tab.Panel { ...args } />
				</RenderErrorBoundary>
			</Group>
			<Group label="wrapped in a div (throws)">
				<RenderErrorBoundary>
					<Tab.Group>
						<Tab.List><Tab>One</Tab></Tab.List>
						<div><Tab.Panel { ...args } /></div>
					</Tab.Group>
				</RenderErrorBoundary>
			</Group>
		</Row>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)

		await expect(canvas.getAllByRole('tabpanel')).toHaveLength(1)

		const errors = await canvas.findAllByTestId('tab-panel-error')
		await expect(errors).toHaveLength(2)
		for (const error of errors)
			await expect(error).toHaveTextContent('Tab.Group: <Tab.Panel /> must be a direct child of <Tab.Group>')
	},
}
