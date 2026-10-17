import { useState } from 'react'
import { expect, fn, spyOn, userEvent, waitFor, within } from 'storybook/test'
import { getDefaultProps } from '@/hooks/useProps'
import { rem } from '@/lib/general'
import { Sidebar } from './Sidebar'
import type { ReactNode } from 'react'
import type { Route } from 'next'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import moduleClasses from './Sidebar.module.scss'

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

// `Sidebar`'s own root class (`inkq-sidebar`) is the stable selector for the
// polymorphic root. `.inkq-sidebar` now has declarations of its own in
// `Sidebar.module.scss` (the `--sidebar-*` custom properties), so the root
// carries a CSS-module hash when styled; see the `Unstyled` story.
const ROOT_SELECTOR = '.inkq-sidebar'
const HIGHLIGHT_SELECTOR = '.inkq-sidebar__highlight'
const ITEM_SELECTOR = '.inkq-sidebar__item'
const LABEL_SELECTOR = '.inkq-sidebar__label'

// A handful of representative `Sidebar.Item.Link`s / `Sidebar.Item.Action`s —
// `Sidebar.Props['items']` has no upper bound, these are just realistic
// examples, same precedent as `Grid`'s `COLUMN_VALUES`/`Section`'s
// `LAYOUT_OPTIONS`.
const linkItem = (id: string, label: string, url: string): Sidebar.Item.Link => ({
	id, label, url: url as Route<string>,
})

const LINK_ITEMS: Sidebar.Item.Link[] = [
	linkItem('overview', 'Overview', '/dashboard/overview'),
	linkItem('settings', 'Settings', '/dashboard/settings'),
	linkItem('billing', 'Billing', '/dashboard/billing'),
]

// Links to sections of one page (`/guide`), used with a mocked pathname.
const ANCHOR_ITEMS: Sidebar.Item.Link[] = [
	linkItem('intro', 'Introduction', '/guide#intro'),
	linkItem('usage', 'Usage', '/guide#usage'),
]

const ACTION_ITEMS: Sidebar.Item.Action[] = [
	{ id: 'overview', label: 'Overview' },
	{ id: 'settings', label: 'Settings' },
	{ id: 'billing', label: 'Billing' },
]

// Where `Sidebar.tsx`'s `measure()` puts the highlight for the row at `index`:
// the list's offset plus the row's offset, in rem. Computed from the live DOM
// with the SAME `rem()` utility the component calls.
const highlightTop = (list: HTMLElement, index: number) =>
	rem(list.offsetTop + (list.children[index] as HTMLElement).offsetTop)

// A stateful action-branch sidebar, so a story can click an item and watch
// `active` (and with it the highlight) move.
const StatefulActions = () => {
	const [active, setActive] = useState('overview')

	return <Sidebar active={ active } items={ ACTION_ITEMS } onChange={ setActive } />
}

// `Sidebar.Props` (the `declare namespace` export) is the raw, discriminated-
// union `SidebarProps` — it doesn't include `as`/`unstyled`/`attributes`/etc.,
// which only exist on the actual accepted prop type, `PolymorphicProps<
// SidebarProps, C>`. `Parameters<typeof Sidebar>[0]` reads that real, wrapped
// type straight off the component itself. It fills `C` with its constraint
// (`ElementType`), not the default `'aside'` (`Sidebar.tsx`'s local `TAG`
// constant), so `as` is any `ElementType` here.
type SidebarStoryProps = Parameters<typeof Sidebar>[0]

// `SidebarProps` is `BaseSidebarProps & (ActionSidebarProps | DisplaySidebarProps
// | LinkedSidebarProps) & MaybeAnimationProps`, so `Extract`/`Exclude` can't
// reliably isolate a branch (same caveat as `SectionProps`, see
// `Section.stories.tsx`). `Omit` away every key that differs between the three
// branches (`active`, `items`, `onChange`, `scroll`, `shallow`) and let each
// story supply the branch-specific props explicitly in JSX. The registered
// defaults (`scroll`/`shallow`) still reach the component at runtime via the
// spread, since `Omit` only narrows the TypeScript view of `args`.
type OmitKeys<T, K extends PropertyKey> = { [P in keyof T as P extends K ? never : P]: T[P] }

type SidebarBaseArgs = OmitKeys<SidebarStoryProps, 'active' | 'items' | 'onChange' | 'scroll' | 'shallow'>

type Story = StoryObj<SidebarStoryProps>

const meta: Meta<SidebarStoryProps> = {
	component: Sidebar,
	title: 'Layout/Sidebar',
	argTypes: {
		as: {
			control: 'text',
			description: 'Polymorphic escape hatch via the shared `Box` contract. `SidebarSpecs` declares `defaults: { as: \'aside\' }`, so `Sidebar` genuinely forwards it to the OUTER root element — the inner `<nav>` (and everything inside it) is always hardcoded regardless of `as`. See the `AsElement` story.',
		},
		active: {
			control: 'text',
			description: 'REQUIRED on the action branch (`ActionSidebarProps`), optional on the linked branch (`LinkedSidebarProps`), `never` on the display branch. Drives two independent things: (1) which row is current: its `<li>` gets the `inkq-sidebar__item--active` modifier class and its `Button` gets `aria-current` — literal `true` on the action branch; on the linked branch `true` when the item\'s `url` is a same-page anchor (a hash on the current pathname, see `isAnchorLink`) and `\'page\'` for any other URL; (2) where the highlight sits: `Sidebar.tsx` finds `activeIndex = items.findIndex(item => item.id === active)`, then measures that row. An `active` that matches NO item gives `-1`, so no row is measured, the highlight stays `visibility: hidden` and no position/scale is set. See the `Default`, `ActiveNoMatch`, `AnchorLinks`, `ActionBranch` and `ActiveChange` stories.',
		},
		items: {
			control: false,
			description: 'The nav item list — `SidebarActionItem[]` (`{ id, label, url?: never }`) on the action branch, `SidebarLinkItem[]` (`{ id, label, url: Route<string> }`) on the linked branch. Each entry renders as an `<li>` wrapping an unstyled `Button` that carries `data-keep={ label }`: with a `url`, a real anchor (`Button`\'s `href` branch, via `next/link`); without one, a native `<button>` with `onClick={() => onChange?.(id)}`. The items render inside `nav.wrapper > ul.inner`, preceded by a `span.highlight`. See the `Default` (linked) and `ActionBranch` (action) stories.',
		},
		onChange: {
			action: 'itemChanged',
			description: 'REQUIRED on the action branch (`(id: string) => void`, called from each item\'s `onClick` with the clicked item\'s `id`). OPTIONAL on the linked branch, where each item\'s `Button.onNavigate` calls it with the item\'s `id` after the (optional) shallow URL push. `never` on the display branch. See the `ActionBranch`, `KeyboardActivation` and `ActiveChange` stories.',
		},
		scroll: {
			control: 'boolean',
			description: '`?: never` on the action and display branches; on the linked branch, forwarded VERBATIM to each item\'s underlying `Button`\'s own `scroll` prop (`Button.Props[\'scroll\']`, itself `Pick<next/link LinkProps, \'scroll\'>`) — a `next/link`-internal scroll-restoration flag, not reflected as any DOM attribute or class. Registered default is `false`. Not independently assertable beyond confirming both values render without error — see the `Scroll` story.',
		},
		shallow: {
			control: 'boolean',
			description: '`?: never` on the action and display branches; on the linked branch, controls whether a navigation is intercepted. Each item\'s `Button` always gets an `onNavigate` handler: when `shallow` is true it first calls `event.preventDefault()` then `window.history.pushState(null, \'\', url)` (`replaceUrl`), and either way it then calls `onChange?.(id)`. Registered default is `true`. `next/link`\'s own `onNavigate` timing/whether it fires during a simulated click is framework-internal, not something this story tree asserts directly on — see the `Shallow` story\'s doc note.',
		},
		label: {
			control: 'text',
			description: 'Optional heading text (`BaseSidebarProps.label`), rendered as a `<span class="inkq-sidebar__label">` BEFORE the nav/wrapper, in both the items and the display branches. When falsy no label element renders. It is a visual label only: it is not wired to the `<nav>` as an accessible name. See the `Label` story.',
		},
		children: {
			control: 'text',
			description: 'Optional (`BaseSidebarProps.children?: ReactNode`), and only rendered when `items` is NOT passed: then `Sidebar.tsx` renders `children` inside a `div` `wrapper` > `div` `inner` pair with no `<nav>`. The same plain version renders for `items: []` (`hasItems` is `!!items?.length`) — see the `EmptyItems` story. When `items` is passed, only the `<nav>` item list renders and `children` is silently dropped, even though the types allow it. See the `DisplayBranch` (children render) and `DroppedChildren` (children dropped) stories.',
		},
		sticky: {
			control: 'boolean',
			description: 'Registered default is `true`. Adds a `sticky` selector modifier to the root via `styles(\'root\', { selector: { nav: hasItems, sticky } })`, i.e. an `inkq-sidebar--sticky` class (`Sidebar.module.scss` has a real `&--sticky` rule, so the token in the DOM is the CSS-module hash, which still contains `inkq-sidebar--sticky`). When `false` the class is absent. See the `Sticky` story. The sibling `nav` modifier (`inkq-sidebar--nav`, also hashed) is added only when there are items; see `Default` (present) and `DisplayBranch`/`EmptyItems` (absent).',
		},
		unstyled: {
			control: 'boolean',
			description: 'Part of the factory\'s `FactoryContract` (`_PolymorphicContract.unstyled`), not `Sidebar`\'s own `SidebarProps`. The semantic base class (`inkq-sidebar`) is emitted regardless of this prop (it is `namespace ?? baseName`, so only an inherited semantic `className` would replace it). When `unstyled` is true, `useStyles` drops: (1) the CSS-module hash on every selector — `.inkq-sidebar` now has declarations of its own (the `--sidebar-*` custom properties), so the root carries a hash when styled just like `wrapper`, `inner`, `highlight`, `item` and `button`; (2) config-derived classes, i.e. the `inkq-sidebar__item--active` modifier and the root `inkq-sidebar--nav`/`inkq-sidebar--sticky` modifiers (`getConfigClasses` returns early). `Sidebar` destructures `unstyled`, passes it to the root `Box` explicitly and publishes it to the items through the sidebar context. Separately, each item\'s `Button` is ALWAYS rendered with a hardcoded `unstyled: true` (`SidebarItem.tsx`\'s `innerProps`), independent of `Sidebar`\'s own `unstyled` prop. See the `Unstyled` story.',
		},
		animated: {
			control: false,
			description: '**Accepted by the type, never consumed**: part of `SidebarProps` via `MaybeAnimationProps` (same union `Group`/`Section` use), but `Sidebar.tsx` never destructures `animated` (or `duration`/`stagger`/`amount`/`once`/`lead`/`margin`/`withinView`/`index`) out of `props` and calls no animation hook (`useReveal`/`useReplayInView`) — unlike `Group`/`Section`. All of those names are in `RESERVED_PROPS` (`src/hooks/useProps/helpers.ts`), so `extractOthers(rest)` strips them: they are silently ignored and do NOT land on the DOM. No story exercises this beyond this doc note.',
		},
		duration: { control: false, description: 'See `animated`\'s doc note — not consumed by `Sidebar.tsx` at all.' },
		stagger: { control: false, description: 'See `animated`\'s doc note — not consumed by `Sidebar.tsx` at all.' },
	},
	args: {
		...getDefaultProps<Sidebar.Props>('Sidebar'),
	},
}

export default meta

/**
 * The linked branch (`url`-carrying items, real `next/link` anchors), with
 * `active` matching the second item. Covers: the `nav.wrapper > ul.inner`
 * structure with one `<li>` per item, `aria-current="page"` on the active link
 * only (the URLs are other pages, not same-page anchors), `data-keep` carrying
 * each label, the `inkq-sidebar__item--active` modifier class, and the
 * highlight's measured `--sidebar-highlight-position` for the matched row.
 */
export const Default: Story = {
	parameters: { layout: 'padded' },
	render: (args) => (
		<Sidebar { ...args as SidebarBaseArgs } active="settings" items={ LINK_ITEMS } />
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			links = canvas.getAllByRole('link')

		await expect(links).toHaveLength(3)

		const [overview, settings, billing] = links

		await expect(settings).toHaveAttribute('aria-current', 'page')
		await expect(overview).not.toHaveAttribute('aria-current')
		await expect(billing).not.toHaveAttribute('aria-current')

		// Each item's `Button` carries its label in `data-keep`.
		await expect(overview).toHaveAttribute('data-keep', 'Overview')
		await expect(settings).toHaveAttribute('data-keep', 'Settings')
		await expect(billing).toHaveAttribute('data-keep', 'Billing')

		const activeItem = settings.closest(ITEM_SELECTOR) as HTMLElement,
			overviewItem = overview.closest(ITEM_SELECTOR) as HTMLElement

		await expect(activeItem.tagName).toBe('LI')
		await expect(activeItem.className).toMatch('inkq-sidebar__item--active')
		await expect(overviewItem.className).not.toMatch('inkq-sidebar__item--active')

		const nav = canvas.getByRole('navigation'),
			root = nav.closest(ROOT_SELECTOR) as HTMLElement,
			list = within(nav).getByRole('list'),
			highlight = root.querySelector(HIGHLIGHT_SELECTOR) as HTMLElement

		// The items version is `nav.wrapper > ul.inner`, and the root carries
		// the `--nav` modifier.
		await expect(nav).toHaveClass('inkq-sidebar__wrapper')
		await expect(list.tagName).toBe('UL')
		await expect(list).toHaveClass('inkq-sidebar__inner')
		await expect(within(list).getAllByRole('listitem')).toHaveLength(3)
		await expect(root.className).toMatch('inkq-sidebar--nav')

		// The highlight is measured in a layout effect and positioned by inline
		// tokens: `settings` is index 1.
		await waitFor(() => expect(
			highlight.style.getPropertyValue('--sidebar-highlight-position')
		).toBe(highlightTop(list, 1)))
		expect(Number(highlight.style.getPropertyValue('--sidebar-highlight-scale'))).toBeGreaterThan(0)
		await expect(highlight.style.visibility).not.toBe('hidden')
	},
}

/**
 * `active` set to an id that matches NO item — `items.findIndex(...)` returns
 * `-1`, so no row is measured. No item gets `aria-current`/the `--active`
 * modifier class, and the highlight stays hidden with no position or scale
 * token set.
 */
export const ActiveNoMatch: Story = {
	parameters: { layout: 'padded' },
	render: (args) => (
		<Sidebar { ...args as SidebarBaseArgs } active="does-not-exist" items={ LINK_ITEMS } />
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			links = canvas.getAllByRole('link')

		await expect(links).toHaveLength(3)

		for (const link of links) {
			await expect(link).not.toHaveAttribute('aria-current')
			const item = link.closest(ITEM_SELECTOR) as HTMLElement
			await expect(item.className).not.toMatch('inkq-sidebar__item--active')
		}

		const root = canvas.getByRole('navigation').closest(ROOT_SELECTOR) as HTMLElement,
			highlight = root.querySelector(HIGHLIGHT_SELECTOR) as HTMLElement

		await expect(highlight.style.visibility).toBe('hidden')
		await expect(highlight.style.getPropertyValue('--sidebar-highlight-position')).toBe('')
		await expect(highlight.style.getPropertyValue('--sidebar-highlight-scale')).toBe('')
	},
}

/**
 * Links to sections of the SAME page versus links to other pages, under a
 * mocked pathname of `/guide`. `SidebarItem` marks the active link
 * `aria-current="true"` ("the current item in the list") when its `url` is a
 * hash on the current pathname, and `"page"` ("the current page") otherwise.
 * `parameters.nextjs.appDirectory` is set here only, because the router
 * decorator mounts a real pathname context only when it is truthy.
 */
export const AnchorLinks: Story = {
	parameters: {
		layout: 'padded',
		nextjs: { appDirectory: true, navigation: { pathname: '/guide' } },
	},
	render: (args) => (
		<Row>
			<Group label="same-page anchors">
				<Sidebar { ...args as SidebarBaseArgs } active="usage" items={ ANCHOR_ITEMS } />
			</Group>
			<Group label="other pages">
				<Sidebar { ...args as SidebarBaseArgs } active="settings" items={ LINK_ITEMS } />
			</Group>
		</Row>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			[anchorNav, pageNav] = canvas.getAllByRole('navigation')

		const anchorLinks = within(anchorNav).getAllByRole('link'),
			pageLinks = within(pageNav).getAllByRole('link')

		await expect(anchorLinks).toHaveLength(2)
		await expect(pageLinks).toHaveLength(3)

		await expect(within(anchorNav).getByRole('link', { name: 'Usage' })).toHaveAttribute('aria-current', 'true')
		await expect(within(anchorNav).getByRole('link', { name: 'Introduction' })).not.toHaveAttribute('aria-current')

		await expect(within(pageNav).getByRole('link', { name: 'Settings' })).toHaveAttribute('aria-current', 'page')
		await expect(within(pageNav).getByRole('link', { name: 'Overview' })).not.toHaveAttribute('aria-current')
	},
}

/**
 * `items: []` — an empty list is a valid, non-crashing state. `Sidebar.tsx`
 * branches on `hasItems` (`!!items?.length`), not on `items` being truthy, so
 * an empty list renders the plain `<aside>` version (the same
 * `div` `wrapper` > `div` `inner` pair as the display branch), NOT an empty
 * `<nav>`: no `nav`/`list`/highlight and no `--nav` modifier.
 */
export const EmptyItems: Story = {
	render: (args) => (
		<Sidebar { ...args as SidebarBaseArgs } active="anything" items={ [] } />
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			root = canvasElement.querySelector(ROOT_SELECTOR) as HTMLElement

		await expect(root).toBeInTheDocument()
		await expect(root.tagName).toBe('ASIDE')

		await expect(canvas.queryByRole('navigation')).not.toBeInTheDocument()
		await expect(canvas.queryByRole('list')).not.toBeInTheDocument()
		await expect(canvas.queryByRole('link')).not.toBeInTheDocument()
		await expect(canvas.queryByRole('button')).not.toBeInTheDocument()
		await expect(root.querySelector(HIGHLIGHT_SELECTOR)).toBeNull()
		await expect(root.className).not.toMatch('inkq-sidebar--nav')

		const wrapper = root.querySelector('.inkq-sidebar__wrapper') as HTMLElement
		await expect(wrapper.tagName).toBe('DIV')
		await expect(wrapper.firstElementChild?.tagName).toBe('DIV')
		await expect(wrapper.firstElementChild).toHaveClass('inkq-sidebar__inner')
	},
}

/**
 * The action branch (`onChange`, no `url` on any item) — each item
 * renders as a native `<button>` with `onClick={() => onChange?.(id)}`.
 * Clicking exercises exact call counts AND the exact `id` argument per click,
 * not just "was called".
 */
export const ActionBranch: Story = {
	args: { onChange: fn() },
	parameters: { layout: 'padded' },
	render: (args) => (
		<Sidebar
			{ ...args as SidebarBaseArgs }
			active="overview"
			items={ ACTION_ITEMS }
			onChange={ args.onChange as (id: string) => void }
		/>
	),
	play: async ({ args, canvasElement }) => {
		const canvas = within(canvasElement),
			buttons = canvas.getAllByRole('button')

		await expect(buttons).toHaveLength(3)

		const [overview, settings, billing] = buttons

		// Action branch: `aria-current` is literal `true`, not `'page'` — a
		// different expression than the linked branch's (`SidebarItem.tsx`'s
		// two separate `aria.current` computations per branch).
		await expect(overview).toHaveAttribute('aria-current', 'true')
		await expect(settings).not.toHaveAttribute('aria-current')
		await expect(billing).not.toHaveAttribute('aria-current')

		await userEvent.click(settings)
		await expect(args.onChange).toHaveBeenCalledTimes(1)
		await expect(args.onChange).toHaveBeenLastCalledWith('settings')

		await userEvent.click(billing)
		await expect(args.onChange).toHaveBeenCalledTimes(2)
		await expect(args.onChange).toHaveBeenLastCalledWith('billing')

		await userEvent.click(overview)
		await expect(args.onChange).toHaveBeenCalledTimes(3)
		await expect(args.onChange).toHaveBeenLastCalledWith('overview')
	},
}

/**
 * A stateful action-branch sidebar: clicking an item updates `active`, which
 * moves `aria-current`, the `--active` modifier and — after the layout effect
 * re-measures the new row — the highlight's `--sidebar-highlight-position`.
 */
export const ActiveChange: Story = {
	parameters: { layout: 'padded', controls: { exclude: /.*/ } },
	render: () => <StatefulActions />,
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			nav = canvas.getByRole('navigation'),
			list = within(nav).getByRole('list'),
			highlight = nav.querySelector(HIGHLIGHT_SELECTOR) as HTMLElement,
			[overview, , billing] = canvas.getAllByRole('button')

		const position = () => highlight.style.getPropertyValue('--sidebar-highlight-position')

		await waitFor(() => expect(position()).toBe(highlightTop(list, 0)))
		await expect(overview).toHaveAttribute('aria-current', 'true')

		await userEvent.click(billing)

		await expect(billing).toHaveAttribute('aria-current', 'true')
		await expect(overview).not.toHaveAttribute('aria-current')
		await expect(billing.closest(ITEM_SELECTOR)?.className).toMatch('inkq-sidebar__item--active')
		await waitFor(() => expect(position()).toBe(highlightTop(list, 2)))
		await expect(highlightTop(list, 2)).not.toBe(highlightTop(list, 0))
	},
}

/**
 * Keyboard activation on the action branch — `Tab` reaches each native
 * `<button>` in order, and BOTH `Enter` and `Space` trigger the same
 * `onClick={() => onChange?.(id)}` a native `<button>` gets for free.
 */
export const KeyboardActivation: Story = {
	args: { onChange: fn() },
	parameters: { layout: 'padded' },
	render: (args) => (
		<Sidebar
			{ ...args as SidebarBaseArgs }
			active="overview"
			items={ ACTION_ITEMS }
			onChange={ args.onChange as (id: string) => void }
		/>
	),
	play: async ({ args, canvasElement }) => {
		const canvas = within(canvasElement),
			[overview] = canvas.getAllByRole('button')

		await expect(overview).not.toHaveFocus()

		await userEvent.tab()
		await expect(overview).toHaveFocus()

		await userEvent.keyboard('{Enter}')
		await expect(args.onChange).toHaveBeenCalledTimes(1)
		await expect(args.onChange).toHaveBeenLastCalledWith('overview')

		await userEvent.keyboard(' ')
		await expect(args.onChange).toHaveBeenCalledTimes(2)
	},
}

/**
 * `scroll` (linked branch only) forwarded verbatim to each item's `Button`
 * (`Button.Props['scroll']`, a `next/link`-internal scroll-restoration flag)
 * — it produces NO observable DOM attribute or class difference of its own,
 * so this story only confirms both values render successfully as real links,
 * per the doc note on `argTypes.scroll` above.
 */
export const Scroll: Story = {
	parameters: {
		layout: 'padded',
		controls: { exclude: ['scroll'] },
	},
	render: (args) => (
		<Row>
			{ ([true, false] as const).map(scroll => (
				<Group key={ String(scroll) } label={ String(scroll) }>
					<Sidebar
						{ ...args as SidebarBaseArgs }
						active="overview"
						items={ LINK_ITEMS }
						scroll={ scroll }
					/>
				</Group>
			)) }
		</Row>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			links = canvas.getAllByRole('link')

		await expect(links).toHaveLength(6)
		for (const link of links)
			await expect(link).toHaveAttribute('href')
	},
}

/**
 * `shallow` (linked branch only) decides whether an item's `onNavigate`
 * handler first intercepts the navigation with `window.history.pushState`
 * (`SidebarItem.tsx`'s `replaceUrl`) — a `next/link`-internal hook, not a DOM
 * attribute. This story sticks to confirming both values render successfully
 * as real links and that mounting either doesn't call
 * `window.history.pushState` on its own (only a real navigation attempt
 * would), rather than asserting on `next/link`'s own click-driven navigation
 * timing, which is framework-internal and outside what this story can
 * reliably observe. The spy is installed in the story's `beforeEach`, i.e.
 * BEFORE mount, so a mount-time `pushState` call would actually be recorded.
 */
export const Shallow: Story = {
	parameters: {
		layout: 'padded',
		controls: { exclude: ['shallow'] },
	},
	beforeEach: () => {
		spyOn(window.history, 'pushState')
	},
	render: (args) => (
		<Row>
			{ ([true, false] as const).map(shallow => (
				<Group key={ String(shallow) } label={ String(shallow) }>
					<Sidebar
						{ ...args as SidebarBaseArgs }
						active="overview"
						items={ LINK_ITEMS }
						shallow={ shallow }
					/>
				</Group>
			)) }
		</Row>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			links = canvas.getAllByRole('link')

		await expect(links).toHaveLength(6)
		for (const link of links)
			await expect(link).toHaveAttribute('href')

		await expect(window.history.pushState).not.toHaveBeenCalled()
	},
}

/**
 * `SidebarSpecs` declares `defaults: { as: 'aside' }` — `Sidebar` genuinely IS
 * polymorphic on its OUTER root element; the inner `<nav>` (and everything
 * inside it) is always hardcoded regardless of `as`. `as="div"` below is an
 * explicit override, not the default.
 */
export const AsElement: Story = {
	parameters: {
		layout: 'padded',
		controls: { exclude: ['as'] },
	},
	render: (args) => (
		<Row>
			<Group label='as="div"'>
				<Sidebar { ...args as SidebarBaseArgs } active="overview" items={ LINK_ITEMS } as="div" />
			</Group>
			<Group label='as="section"'>
				<Sidebar { ...args as SidebarBaseArgs } active="overview" items={ LINK_ITEMS } as="section" />
			</Group>
		</Row>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			navs = canvas.getAllByRole('navigation')

		await expect(navs).toHaveLength(2)

		const [divRoot, sectionRoot] = navs.map(
			nav => nav.closest(ROOT_SELECTOR) as HTMLElement
		)

		await expect(divRoot.tagName).toBe('DIV')
		await expect(sectionRoot.tagName).toBe('SECTION')

		// The inner `<nav>` is unaffected by `as` either way.
		await expect(navs[0].tagName).toBe('NAV')
		await expect(navs[1].tagName).toBe('NAV')
	},
}

/**
 * The display branch (`DisplaySidebarProps`: no `items`, and `active`/
 * `onChange`/`scroll`/`shallow` are all `never`). `Sidebar.tsx` falls through
 * to its second `return`: an optional `label`, then a plain `<div>` `wrapper`
 * > `<div>` `inner` pair holding `children`, with NO `<nav>`, list,
 * highlight or `--nav` modifier (the default `sticky: true` modifier is still
 * present). `active` is typed `never` here (required, so it can't be written
 * in JSX at all) — the cast below hands the registered defaults through
 * untouched.
 */
export const DisplayBranch: Story = {
	parameters: { layout: 'padded' },
	render: (args) => (
		<Sidebar { ...args as SidebarStoryProps } label="Filters">
			<div>Free-form content</div>
		</Sidebar>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			content = canvas.getByText('Free-form content'),
			root = content.closest(ROOT_SELECTOR) as HTMLElement

		await expect(root).toBeInTheDocument()
		await expect(root.tagName).toBe('ASIDE')

		await expect(canvas.queryByRole('navigation')).not.toBeInTheDocument()
		await expect(canvas.queryByRole('list')).not.toBeInTheDocument()
		await expect(canvas.queryByRole('link')).not.toBeInTheDocument()
		await expect(canvas.queryByRole('button')).not.toBeInTheDocument()
		await expect(root.querySelector(HIGHLIGHT_SELECTOR)).toBeNull()

		await expect(root.className).not.toMatch('inkq-sidebar--nav')
		await expect(root.className).toMatch('inkq-sidebar--sticky')

		// `children` sit inside `div.inner`, itself inside `div.wrapper`, after
		// the label.
		const inner = content.closest('.inkq-sidebar__inner') as HTMLElement,
			label = root.querySelector(LABEL_SELECTOR) as HTMLElement

		await expect(inner.tagName).toBe('DIV')
		await expect(inner.parentElement).toHaveClass('inkq-sidebar__wrapper')
		await expect(inner.parentElement?.tagName).toBe('DIV')
		await expect(label).toHaveTextContent('Filters')
		await expect(label.nextElementSibling).toBe(inner.parentElement)
	},
}

/**
 * `label` renders a `<span>` before the nav, only when it is truthy. The
 * unlabeled group has no `.inkq-sidebar__label` element at all.
 */
export const Label: Story = {
	parameters: {
		layout: 'padded',
		controls: { exclude: ['label'] },
	},
	render: (args) => (
		<Row>
			<Group label="undefined">
				<Sidebar { ...args as SidebarBaseArgs } active="overview" items={ LINK_ITEMS } label={ undefined } />
			</Group>
			<Group label="On this page">
				<Sidebar { ...args as SidebarBaseArgs } active="overview" items={ LINK_ITEMS } label="On this page" />
			</Group>
		</Row>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			[unlabeledNav, labeledNav] = canvas.getAllByRole('navigation')

		const unlabeledRoot = unlabeledNav.closest(ROOT_SELECTOR) as HTMLElement,
			labeledRoot = labeledNav.closest(ROOT_SELECTOR) as HTMLElement

		await expect(unlabeledRoot.querySelector(LABEL_SELECTOR)).toBeNull()

		const label = labeledRoot.querySelector(LABEL_SELECTOR) as HTMLElement

		await expect(label).toHaveTextContent('On this page')
		await expect(label.nextElementSibling).toBe(labeledNav)
	},
}

/**
 * `sticky` (registered default `true`) toggles the root's `sticky` selector
 * modifier. `true` carries `inkq-sidebar--sticky` (hashed, but the hash keeps
 * the name as a substring); `false` does not. Both groups have items, so both
 * carry the `--nav` modifier — the two modifiers are independent.
 */
export const Sticky: Story = {
	parameters: {
		layout: 'padded',
		controls: { exclude: ['sticky'] },
	},
	render: (args) => (
		<Row>
			{ ([true, false] as const).map(sticky => (
				<Group key={ String(sticky) } label={ String(sticky) }>
					<Sidebar
						{ ...args as SidebarBaseArgs }
						active="overview"
						items={ LINK_ITEMS }
						sticky={ sticky }
					/>
				</Group>
			)) }
		</Row>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			navs = canvas.getAllByRole('navigation')

		await expect(navs).toHaveLength(2)

		const [stickyRoot, staticRoot] = navs.map(
			nav => nav.closest(ROOT_SELECTOR) as HTMLElement
		)

		await expect(stickyRoot.className).toMatch('inkq-sidebar--sticky')
		await expect(staticRoot.className).not.toMatch('inkq-sidebar--sticky')

		await expect(stickyRoot.className).toMatch('inkq-sidebar--nav')
		await expect(staticRoot.className).toMatch('inkq-sidebar--nav')
	},
}

/**
 * When `items` is passed, `Sidebar.tsx`'s items branch never renders
 * `{children}` — extra content is silently dropped, even though
 * `BaseSidebarProps.children` allows it. Only the `<nav>` item list renders.
 */
export const DroppedChildren: Story = {
	parameters: { layout: 'padded' },
	render: (args) => (
		<Sidebar { ...args as SidebarBaseArgs } active="overview" items={ LINK_ITEMS }>
			<div style={ { paddingBlockStart: 16 } }>Extra footer content</div>
		</Sidebar>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)

		await expect(canvas.getByRole('navigation')).toBeInTheDocument()
		await expect(canvas.getAllByRole('link')).toHaveLength(3)
		await expect(canvas.queryByText('Extra footer content')).not.toBeInTheDocument()
	},
}

/**
 * `unstyled` does NOT remove `Sidebar`'s semantic base classes (`namespace ??
 * baseName` is not gated on it). It does drop the CSS-module hashes, the
 * config-derived classes (e.g. `inkq-sidebar__item--active`) and the inline
 * tokens; this story asserts only the class/hash part. `.inkq-sidebar` now
 * has declarations of its own in `Sidebar.module.scss` (the `--sidebar-*`
 * custom properties), so the ROOT carries a CSS-module hash when styled and
 * loses it when `unstyled`, the same as the `wrapper` selector.
 */
export const Unstyled: Story = {
	parameters: {
		layout: 'padded',
		controls: { exclude: ['unstyled'] },
	},
	render: (args) => (
		<Row>
			{ ([true, false] as const).map(unstyled => (
				<Group key={ String(unstyled) } label={ String(unstyled) }>
					<Sidebar
						{ ...args as SidebarBaseArgs }
						active="overview"
						items={ LINK_ITEMS }
						unstyled={ unstyled }
					/>
				</Group>
			)) }
		</Row>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			navs = canvas.getAllByRole('navigation')

		await expect(navs).toHaveLength(2)

		const [unstyledRoot, styledRoot] = navs.map(
			nav => nav.closest(ROOT_SELECTOR) as HTMLElement
		)

		const hasModuleClass = (el: Element, base: string) => {
			const moduleClass = (moduleClasses as Record<string, string>)[base]
			return !!moduleClass && el.classList.contains(moduleClass)
		}

		await expect(styledRoot).toHaveClass('inkq-sidebar')
		await expect(unstyledRoot).toHaveClass('inkq-sidebar')
		expect(hasModuleClass(styledRoot, 'inkq-sidebar')).toBe(true)
		expect(hasModuleClass(unstyledRoot, 'inkq-sidebar')).toBe(false)

		const styledWrapper = styledRoot.querySelector('.inkq-sidebar__wrapper') as HTMLElement,
			unstyledWrapper = unstyledRoot.querySelector('.inkq-sidebar__wrapper') as HTMLElement

		await expect(styledWrapper).toHaveClass('inkq-sidebar__wrapper')
		await expect(unstyledWrapper).toHaveClass('inkq-sidebar__wrapper')
		expect(hasModuleClass(styledWrapper, 'inkq-sidebar__wrapper')).toBe(true)
		expect(hasModuleClass(unstyledWrapper, 'inkq-sidebar__wrapper')).toBe(false)
	},
}
