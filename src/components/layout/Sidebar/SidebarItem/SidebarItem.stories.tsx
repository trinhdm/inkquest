import { Component } from 'react'
import { expect, fn, userEvent, within } from 'storybook/test'
import { Sidebar } from '../Sidebar'
import type { ReactNode } from 'react'
import type { Route } from 'next'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

// `Sidebar.Item` is attached in `Sidebar.tsx` (`Item: SidebarItem`), so this file
// only imports `Sidebar`.
//
// `Sidebar.Item` reads a required `Sidebar` context, and that context is only
// provided on `Sidebar`'s `items` branch, where `Sidebar` renders one item per entry.
// Items passed as `children` (the display branch, which has no `items`) are rendered
// WITHOUT the context and throw, so every story here renders its item through
// `<Sidebar items={ ... } />`. See the `OutsideSidebar` story.
//
// The item has no enum or boolean props, so there is no shared `options.story.ts`.
// It also has no registered defaults (`.set({ displayName })` only), so `meta.args`
// has nothing to read back with `getDefaultProps`.

const BRANCHES = ['action', 'link'] as const

const BOOLEAN_OPTIONS = [true, false] as const

const route = (url: string) => url as Route<string>

// Sibling rows around the item under test. Their `id`s differ from the item's.
const ACTION_SIBLINGS: Sidebar.Item.Action[] = [
	{ id: 'settings', label: 'Settings' },
	{ id: 'billing', label: 'Billing' },
]

const LINK_SIBLINGS: Sidebar.Item.Link[] = [
	{ id: 'settings', label: 'Settings', url: route('/dashboard/settings') },
	{ id: 'billing', label: 'Billing', url: route('/dashboard/billing') },
]

const Row = ({ children }: { children: ReactNode }) => (
	<div style={ { display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'flex-start' } }>
		{ children }
	</div>
)

const Group = ({ label, children }: { label: string, children: ReactNode }) => (
	<div style={ { display: 'flex', flexDirection: 'column', gap: 8, minWidth: 220 } }>
		<span style={ { font: 'var(--inkq-text-control)', letterSpacing: '.15em', textTransform: 'uppercase', opacity: 0.6 } }>
			{ label }
		</span>
		{ children }
	</div>
)

// Catches the "no Sidebar context" error so the story can show and assert it.
class ErrorBoundary extends Component<{ children: ReactNode }, { message: string | null }> {
	state = { message: null as string | null }

	static getDerivedStateFromError(error: Error) {
		return { message: error.message }
	}

	render() {
		return this.state.message === null
			? this.props.children
			: <p role="alert">{ this.state.message }</p>
	}
}

// Module-level spy for the interaction stories (Storybook resets it between
// stories; each play also clears it first).
const onChange = fn()

// `Parameters<typeof Sidebar.Item>[0]` reads the real, wrapped prop type off the
// component itself: the action/link union plus the shared polymorphic props. The
// item is a compound part, so there is no `as`.
type SidebarItemStoryProps = Parameters<typeof Sidebar.Item>[0]
type Story = StoryObj<SidebarItemStoryProps>

interface SidebarOptions {
	/** id of the current row; defaults to the item's own id (use a miss to mark none) */
	active?: string
	onChange?: (id: string) => void
}

// A loose view of the item's props (the real type is a union that a story cannot
// build by choosing the branch at runtime). Both branches are assignable to it.
interface ItemSpec {
	id: string
	label: string
	url?: string
}

// The one template every story shares: the item under test as the first row of a
// `Sidebar`, followed by sibling rows. A `url` selects the link branch, its absence
// the action branch (which requires `active` and `onChange` on the `Sidebar`).
const itemSidebar = (
	{ id, label, url }: ItemSpec,
	{ active = id, onChange: handleChange }: SidebarOptions = {}
) => url
	? <Sidebar active={ active } items={ [{ id, label, url: route(url) }, ...LINK_SIBLINGS] } onChange={ handleChange } />
	: <Sidebar active={ active } items={ [{ id, label }, ...ACTION_SIBLINGS] } onChange={ handleChange ?? (() => {}) } />

// The item's `<li>` and its row modifier. `inkq-sidebar__item--active` is a hashed
// CSS-module class that keeps the name as a substring, so match it as one.
const ACTIVE_MODIFIER = 'inkq-sidebar__item--active'

const meta: Meta<SidebarItemStoryProps> = {
	component: Sidebar.Item,
	title: 'Layout/Sidebar/Sidebar.Item',
	argTypes: {
		id: {
			control: 'text',
			description: 'Required. Never rendered. `Sidebar` compares it with its `active` prop to decide whether the row is current, and passes it to `onChange` when the row is chosen.',
		},
		label: {
			control: 'text',
			description: 'Required. The row\'s text, and also its `data-keep` attribute.',
		},
		url: {
			control: 'text',
			description: 'Selects the branch. Set: the row\'s `Button` is a link (`next/link`) whose `aria-current` is `true` for a same-page anchor and `\'page\'` otherwise. Unset: a native `<button>` that calls `onChange(id)` when clicked (typed `never` on the action branch). See the `Branches` and `AnchorLinks` stories.',
		},
		as: {
			control: false,
			description: 'Not an accepted prop: a compound part (`isCompound: true`) forces `as?: never`. The row is always an `<li>`, with an unstyled `Button` inside.',
		},
		unstyled: {
			control: false,
			description: 'Part of the factory\'s `FactoryContract`. `Sidebar` hands its own `unstyled` to the item through context, and the inner `Button` is always unstyled; see `Sidebar.stories.tsx`\'s `Unstyled` story.',
		},
	},
	args: {
		id: 'overview',
		label: 'Overview',
	},
	parameters: { layout: 'padded' },
	render: (args) => itemSidebar(args),
}

export default meta

/**
 * The action branch (no `url`): each row is an `<li>` wrapping one native
 * `<button>` carrying `data-keep={ label }`. The active row's button has
 * `aria-current="true"` and its `<li>` has the active modifier class; its
 * siblings have neither.
 */
export const Default: Story = {
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			rows = canvas.getAllByRole('listitem'),
			[overview, settings] = canvas.getAllByRole('button')

		await expect(rows).toHaveLength(3)
		for (const row of rows)
			await expect(within(row).getAllByRole('button')).toHaveLength(1)

		await expect(overview).toHaveTextContent('Overview')
		await expect(overview).toHaveAttribute('data-keep', 'Overview')
		await expect(overview).toHaveAttribute('aria-current', 'true')
		await expect(overview.closest('li')?.className).toMatch(ACTIVE_MODIFIER)

		await expect(settings).toHaveAttribute('data-keep', 'Settings')
		await expect(settings).not.toHaveAttribute('aria-current')
		await expect(settings.closest('li')?.className).not.toMatch(ACTIVE_MODIFIER)
	},
}

/**
 * Both branches side by side. A `url` makes the row a real link (`next/link`) with
 * the `href`; without one it is a `<button>`, with no `href`. Both carry
 * `data-keep={ label }` and sit in an `<li>`.
 */
export const Branches: Story = {
	parameters: { controls: { exclude: ['url'] } },
	render: (args) => (
		<Row>
			<Group label="url: undefined">
				{ itemSidebar({ ...args, url: undefined }) }
			</Group>
			<Group label="url: set">
				{ itemSidebar({ ...args, url: route('/dashboard/overview') }) }
			</Group>
		</Row>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			[actionNav, linkNav] = canvas.getAllByRole('navigation')

		const button = within(actionNav).getByRole('button', { name: 'Overview' }),
			link = within(linkNav).getByRole('link', { name: 'Overview' })

		await expect(within(actionNav).queryByRole('link')).not.toBeInTheDocument()
		await expect(button.tagName).toBe('BUTTON')
		await expect(button).not.toHaveAttribute('href')
		await expect(button.closest('li')).toBeInTheDocument()

		await expect(within(linkNav).queryByRole('button')).not.toBeInTheDocument()
		await expect(link.tagName).toBe('A')
		await expect(link).toHaveAttribute('href', '/dashboard/overview')
		await expect(link).toHaveAttribute('data-keep', 'Overview')
		await expect(link.closest('li')).toBeInTheDocument()
	},
}

/**
 * Whether a row is current, on each branch. A current action row has
 * `aria-current="true"`; a current link row (to another page) has
 * `aria-current="page"`; neither attribute is set when the row is not current.
 * The active modifier class on the `<li>` follows the same rule.
 */
export const IsActive: Story = {
	parameters: { controls: { exclude: ['url'] } },
	render: (args) => (
		<Row>
			{ BRANCHES.map(branch => BOOLEAN_OPTIONS.map(isActive => (
				<Group key={ `${branch}-${isActive}` } label={ `${branch}, active: ${isActive}` }>
					{ itemSidebar(
						{ ...args, url: branch === 'link' ? route('/dashboard/overview') : undefined },
						{ active: isActive ? args.id : 'no-such-row' }
					) }
				</Group>
			))) }
		</Row>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			[actionOn, actionOff, linkOn, linkOff] = canvas.getAllByRole('navigation')

		const rowOf = (nav: HTMLElement, role: 'button' | 'link') =>
			within(nav).getByRole(role, { name: 'Overview' })

		await expect(rowOf(actionOn, 'button')).toHaveAttribute('aria-current', 'true')
		await expect(rowOf(actionOn, 'button').closest('li')?.className).toMatch(ACTIVE_MODIFIER)
		await expect(rowOf(actionOff, 'button')).not.toHaveAttribute('aria-current')
		await expect(rowOf(actionOff, 'button').closest('li')?.className).not.toMatch(ACTIVE_MODIFIER)

		await expect(rowOf(linkOn, 'link')).toHaveAttribute('aria-current', 'page')
		await expect(rowOf(linkOn, 'link').closest('li')?.className).toMatch(ACTIVE_MODIFIER)
		await expect(rowOf(linkOff, 'link')).not.toHaveAttribute('aria-current')
		await expect(rowOf(linkOff, 'link').closest('li')?.className).not.toMatch(ACTIVE_MODIFIER)
	},
}

/**
 * The current link's `aria-current` depends on where it points, under a mocked
 * pathname of `/guide`: a hash on the current page is the current item in the list
 * (`true`); anything else, including the same path with no hash, is the current page
 * (`'page'`). `parameters.nextjs.appDirectory` is set so the router decorator mounts
 * a real pathname.
 */
export const AnchorLinks: Story = {
	parameters: {
		controls: { exclude: ['id', 'label', 'url'] },
		nextjs: { appDirectory: true, navigation: { pathname: '/guide' } },
	},
	render: (args) => (
		<Row>
			<Group label="same-page anchor">
				{ itemSidebar({ ...args, id: 'intro', label: 'Anchor', url: route('/guide#intro') }) }
			</Group>
			<Group label="same path, no hash">
				{ itemSidebar({ ...args, id: 'plain', label: 'Plain', url: route('/guide') }) }
			</Group>
			<Group label="other page">
				{ itemSidebar({ ...args, id: 'other', label: 'Other', url: route('/guide/other#intro') }) }
			</Group>
		</Row>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)

		await expect(canvas.getByRole('link', { name: 'Anchor' })).toHaveAttribute('aria-current', 'true')
		await expect(canvas.getByRole('link', { name: 'Plain' })).toHaveAttribute('aria-current', 'page')
		await expect(canvas.getByRole('link', { name: 'Other' })).toHaveAttribute('aria-current', 'page')
	},
}

/**
 * Mouse behaviour on the action branch: each click calls `onChange` once with that
 * row's `id`. The `Sidebar` owns `active`, so a click alone does not move
 * `aria-current`.
 */
export const Clickable: Story = {
	render: (args) => itemSidebar(args, { onChange }),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)
		onChange.mockClear()

		const overview = canvas.getByRole('button', { name: 'Overview' }),
			settings = canvas.getByRole('button', { name: 'Settings' })

		await userEvent.click(settings)
		await expect(onChange).toHaveBeenCalledTimes(1)
		await expect(onChange).toHaveBeenLastCalledWith('settings')

		await userEvent.click(overview)
		await expect(onChange).toHaveBeenCalledTimes(2)
		await expect(onChange).toHaveBeenLastCalledWith('overview')

		// Clicking the current row still reports it.
		await userEvent.click(overview)
		await expect(onChange).toHaveBeenCalledTimes(3)

		// `active` is controlled by the parent, which here never changes it.
		await expect(overview).toHaveAttribute('aria-current', 'true')
		await expect(settings).not.toHaveAttribute('aria-current')
	},
}

/**
 * Pure focus mechanics: each row is exactly one Tab stop (the `<li>` itself is not
 * focusable), in order, on both branches. The link group follows the action group.
 */
export const KeyboardFocus: Story = {
	parameters: { controls: { exclude: ['url'] } },
	render: (args) => (
		<Row>
			<Group label="url: undefined">
				{ itemSidebar({ ...args, url: undefined }) }
			</Group>
			<Group label="url: set">
				{ itemSidebar({ ...args, url: route('/dashboard/overview') }) }
			</Group>
		</Row>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			[actionNav, linkNav] = canvas.getAllByRole('navigation')

		const stops = [
			...within(actionNav).getAllByRole('button'),
			...within(linkNav).getAllByRole('link'),
		]

		await expect(stops).toHaveLength(6)
		await expect(stops[0]).not.toHaveFocus()

		for (const stop of stops) {
			await userEvent.tab()
			await expect(stop).toHaveFocus()
		}

		// Explicit blur rather than tabbing away: where a further `tab()` lands is
		// browser/environment-dependent.
		stops[stops.length - 1].blur()
		await expect(stops[stops.length - 1]).not.toHaveFocus()
	},
}

/**
 * Keyboard activation on the action branch: both Enter and Space on a focused row
 * call `onChange` once each, with that row's `id`.
 */
export const KeyboardActivation: Story = {
	render: (args) => itemSidebar(args, { onChange }),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)
		onChange.mockClear()

		await userEvent.tab()
		await expect(canvas.getByRole('button', { name: 'Overview' })).toHaveFocus()

		await userEvent.keyboard('{Enter}')
		await expect(onChange).toHaveBeenCalledTimes(1)
		await expect(onChange).toHaveBeenLastCalledWith('overview')

		await userEvent.keyboard(' ')
		await expect(onChange).toHaveBeenCalledTimes(2)
		await expect(onChange).toHaveBeenLastCalledWith('overview')

		await userEvent.tab()
		await expect(canvas.getByRole('button', { name: 'Settings' })).toHaveFocus()

		await userEvent.keyboard('{Enter}')
		await expect(onChange).toHaveBeenCalledTimes(3)
		await expect(onChange).toHaveBeenLastCalledWith('settings')
	},
}

/**
 * Edge case: `Sidebar.Item` throws without the `Sidebar` context. Two ways to lose
 * it: rendering it on its own, and passing it as `children` of a `Sidebar` that has
 * no `items` (the display branch renders `children` outside the context provider).
 *
 * The message names the component by its `NAME`, `'Sidebar.Item'`.
 */
export const OutsideSidebar: Story = {
	parameters: { controls: { exclude: ['id', 'label', 'url'] } },
	render: (args) => (
		<Row>
			<Group label="on its own">
				<ErrorBoundary>
					<Sidebar.Item { ...args } />
				</ErrorBoundary>
			</Group>
			<Group label="as children of a Sidebar without items">
				<ErrorBoundary>
					<Sidebar>
						<Sidebar.Item { ...args } />
					</Sidebar>
				</ErrorBoundary>
			</Group>
		</Row>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			alerts = canvas.getAllByRole('alert')

		await expect(alerts).toHaveLength(2)
		for (const alert of alerts) {
			await expect(alert).toHaveTextContent(
				'Sidebar: <Sidebar.Item /> must be a direct child of <Sidebar>; it can\'t be returned from another component'
			)
		}
		await expect(canvas.queryByRole('button')).not.toBeInTheDocument()
	},
}
