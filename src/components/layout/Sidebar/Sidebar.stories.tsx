import { expect, fn, spyOn, userEvent, within } from 'storybook/test'
import { getDefaultProps } from '@/hooks/useProps'
import { rem } from '@/lib/general'
import { Sidebar } from './Sidebar'
import type { ReactNode } from 'react'
import type { Route } from 'next'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import moduleClasses from './Sidebar.module.scss'

// `Sidebar.tsx`'s local `height` constant (used by the `tokens` function built with `defineTokens`) — not
// exported, so it's pinned here to compute the exact expected
// `--sidebar-rail-height`/`--sidebar-rail-position` values via the SAME `rem()`
// utility the component itself calls (`@/lib/general`), rather than a
// hand-typed px/rem string that could drift from whatever
// `document.documentElement`'s computed root font size actually is in the test
// environment.
const RAIL_HEIGHT_PX = 48

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
// polymorphic root — but, like `Container`'s `.inkq-container`, its own SCSS
// block (`Sidebar.module.scss`'s `.inkq-sidebar { $name: &; ... }`) has NO
// declarations of its own, only nested `&__*` rules, so CSS Modules compiles
// no hash for the root at all. Verified against the live stylesheet.
const ROOT_SELECTOR = '.inkq-sidebar'
const RAIL_SELECTOR = '.inkq-sidebar__rail'
const ITEM_SELECTOR = '.inkq-sidebar__item'

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

const ACTION_ITEMS: Sidebar.Item.Action[] = [
	{ id: 'overview', label: 'Overview' },
	{ id: 'settings', label: 'Settings' },
	{ id: 'billing', label: 'Billing' },
]

// `Sidebar.Props` (the `declare namespace` export) is the raw, discriminated-
// union `SidebarProps` — it doesn't include `as`/`unstyled`/`attributes`/etc.,
// which only exist on the actual accepted prop type, `PolymorphicProps<
// SidebarProps, C>`. `Parameters<typeof Sidebar>[0]` reads that real, wrapped
// type straight off the component itself. It fills `C` with its constraint
// (`ElementType`), not the default `'aside'` (`Sidebar.tsx`'s local `TAG`
// constant), so `as` is any `ElementType` here.
type SidebarStoryProps = Parameters<typeof Sidebar>[0]

// `SidebarProps` is an INTERSECTION that CONTAINS a union
// (`BaseSidebarProps & (ActionSidebarProps | DisplaySidebarProps |
// LinkedSidebarProps) & MaybeAnimationProps`), not a top-level union — same shape category as
// `SectionProps` (`Section.stories.tsx` documents this exact caveat there):
// `Extract`/`Exclude` can't distribute over a union nested inside an
// intersection, so `Exclude<SidebarStoryProps, { onChange: ... }>`
// silently returns the type UNCHANGED rather than isolating a branch.
// `Section.stories.tsx`'s own workaround applies here too: `Omit` away every
// key that actually DIFFERS in shape/requiredness between
// `ActionSidebarProps`/`DisplaySidebarProps`/`LinkedSidebarProps` (`active`, `items`,
// `onChange`, `scroll`, `shallow`) — once those are gone, what's left is
// a single, unambiguous object type with no residual union to fight. Each
// story then supplies the omitted, branch-specific props explicitly in JSX
// (never spread), which both keeps the JSX call typechecking against the
// REAL narrow branch AND still forwards `args`' real registered defaults
// (`scroll`/`shallow`) at runtime via the spread, since `Omit` only narrows
// the TypeScript view of `args`, not its actual enumerable properties.
type SidebarBaseArgs = Omit<SidebarStoryProps, 'active' | 'items' | 'onChange' | 'scroll' | 'shallow'>

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
			description: 'REQUIRED on the action branch (`ActionSidebarProps`), optional on the linked branch (`LinkedSidebarProps`, where `onChange`/`items[].url` differ). Drives two independent things: (1) which item gets `aria-current` (`\'page\'` on the linked/`url` branch, literal `true` on the action branch — `Sidebar.tsx`\'s two separate `attributes.aria.current` expressions differ per branch) and the `inkq-sidebar__item--active` modifier class; (2) the themed `--sidebar-rail-position` offset, computed from `items.findIndex(item => active === item.id)` — an `active` that matches NO item resolves to `-1`, NOT `0`. See the `Default`, `ActiveNoMatch`, and `ActionBranch` stories.',
		},
		items: {
			control: false,
			description: 'The nav item list — `SidebarActionItem[]` (`{ id, label, url?: never }`) on the action branch, `SidebarLinkItem[]` (`{ id, label, url: Route<string> }`) on the linked branch. Each entry renders as an `<li>` wrapping a `Button`: with a `url`, a real anchor (`Button`\'s `href` branch, via `next/link`); without one, a native `<button>` with `onClick={() => onChange?.(id)}`. See the `Default` (linked) and `ActionBranch` (action) stories.',
		},
		onChange: {
			action: 'itemChanged',
			description: 'REQUIRED on the action branch (`(id: string) => void`, called with the clicked item\'s `id`); `?: never` on the linked branch, where routing is handled entirely by `Button`\'s own `href`/`next/link` plumbing instead. See the `ActionBranch` and `KeyboardActivation` stories.',
		},
		scroll: {
			control: 'boolean',
			description: '`?: never` on the action branch; on the linked branch, forwarded VERBATIM to each item\'s underlying `Button`\'s own `scroll` prop (`Button.Props[\'scroll\']`, itself `Pick<next/link LinkProps, \'scroll\'>`) — a `next/link`-internal scroll-restoration flag, not reflected as any DOM attribute or class. Registered default is `false`. Not independently assertable beyond confirming both values render without error — see the `Scroll` story.',
		},
		shallow: {
			control: 'boolean',
			description: '`?: never` on the action branch; on the linked branch, gates whether each item\'s `Button` receives an `onNavigate` handler at all — `onNavigate={ shallow ? replaceUrl(url) : undefined }`, where `replaceUrl` calls `event.preventDefault()` then `window.history.pushState(null, \'\', url)`. Registered default is `true`. `next/link`\'s own `onNavigate` timing/whether it fires during a simulated click is framework-internal, not something this story tree asserts directly on — see the `Shallow` story\'s doc note.',
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
			description: 'Part of the factory\'s `FactoryContract` (`_PolymorphicContract.unstyled`), not `Sidebar`\'s own `SidebarProps`. The semantic base class (`inkq-sidebar`) is emitted regardless of this prop (it is `namespace ?? baseName`, so only an inherited semantic `className` would replace it). When `unstyled` is true, `useStyles` drops: (1) the CSS-module hash on every selector — **verified against the live `Sidebar.module.scss`**: `.inkq-sidebar`\'s own selector has no declarations of its own (only nested `&__*` rules), so the ROOT never carries a hash either way, while `inner`/`wrapper`/`rail`/`item`/`button` DO have their own rules; (2) config-derived classes, i.e. the `inkq-sidebar__item--active` modifier and the root `inkq-sidebar--nav`/`inkq-sidebar--sticky` modifiers (`getConfigClasses` returns early); (3) the component tokens, i.e. the inline `--sidebar-rail-height`/`--sidebar-rail-position` custom properties (`getStyle` returns only inherited styles). `unstyled` is not destructured by `Sidebar`, so it reaches the root `Box` via `others`, which drops non-state `data-*` attributes (`Sidebar` sets none). Separately, each item\'s `Button` is ALWAYS rendered with a hardcoded `unstyled: true` (`Sidebar.tsx`\'s `itemProps`), independent of `Sidebar`\'s own `unstyled` prop — `Button`\'s own CSS-module classes never appear inside a `Sidebar`, styled or not. See the `Unstyled` story.',
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
 * `active` matching the second item. Covers: `aria-current="page"` on the
 * active link only, the `inkq-sidebar__item--active` modifier class, and the
 * themed rail offset (`--sidebar-rail-position`, computed from the matched
 * index via the SAME `rem()` utility `Sidebar.tsx` itself calls).
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

		const activeItem = settings.closest(ITEM_SELECTOR) as HTMLElement,
			overviewItem = overview.closest(ITEM_SELECTOR) as HTMLElement

		await expect(activeItem.className).toMatch('inkq-sidebar__item--active')
		await expect(overviewItem.className).not.toMatch('inkq-sidebar__item--active')

		const nav = canvas.getByRole('navigation'),
			root = nav.closest(ROOT_SELECTOR) as HTMLElement,
			rail = root.querySelector(RAIL_SELECTOR) as HTMLElement

		// The items version is `nav.wrapper > ul.inner`, and the root carries
		// the `--nav` modifier.
		await expect(nav).toHaveClass('inkq-sidebar__wrapper')
		await expect(within(nav).getByRole('menu')).toHaveClass('inkq-sidebar__inner')
		await expect(root.className).toMatch('inkq-sidebar--nav')

		// `settings` is index 1 — `--sidebar-rail-position` = `rem(48 * 1)`.
		expect(rail.style.getPropertyValue('--sidebar-rail-height')).toBe(rem(RAIL_HEIGHT_PX))
		expect(rail.style.getPropertyValue('--sidebar-rail-position')).toBe(rem(RAIL_HEIGHT_PX * 1))
	},
}

/**
 * `active` set to an id that matches NO item — `items.findIndex(...)` returns
 * `-1`, not `0`. No item gets `aria-current`/the `--active` modifier class,
 * and the rail is offset to a NEGATIVE position (`rem(48 * -1)`), not reset to
 * `0`.
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
			rail = root.querySelector(RAIL_SELECTOR) as HTMLElement

		expect(rail.style.getPropertyValue('--sidebar-rail-position')).toBe(rem(RAIL_HEIGHT_PX * -1))
	},
}

/**
 * `items: []` — an empty list is a valid, non-crashing state. `Sidebar.tsx`
 * branches on `hasItems` (`!!items?.length`), not on `items` being truthy, so
 * an empty list renders the plain `<aside>` version (the same
 * `div` `wrapper` > `div` `inner` pair as the display branch), NOT an empty
 * `<nav>`: no `nav`/`menu`/rail, no `--nav` modifier, and (since the `tokens`
 * function returns early for an empty list) no rail tokens.
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
		await expect(canvas.queryByRole('menu')).not.toBeInTheDocument()
		await expect(canvas.queryByRole('link')).not.toBeInTheDocument()
		await expect(canvas.queryByRole('button')).not.toBeInTheDocument()
		await expect(root.querySelector(RAIL_SELECTOR)).toBeNull()
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
		// different expression than the linked branch's (`Sidebar.tsx` has two
		// separate `attributes.aria.current` computations per branch).
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
 * `shallow` (linked branch only) gates whether each item's `Button` receives
 * an `onNavigate` handler at all (`onNavigate={ shallow ? replaceUrl(url) :
 * undefined }`) — a `next/link`-internal hook, not a DOM attribute. This
 * story sticks to confirming both values render successfully as real links
 * and that mounting either doesn't call `window.history.pushState` on its
 * own (only a real navigation attempt would), rather than asserting on
 * `next/link`'s own click-driven navigation timing, which is
 * framework-internal and outside what this story can reliably observe.
 * The spy is installed in the story's `beforeEach`, i.e. BEFORE mount, so a
 * mount-time `pushState` call would actually be recorded.
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
 * to its second `return`: a plain `<div>` `wrapper` > `<div>` `inner` pair
 * holding `children`, with NO `<nav>`, `menu`, rail or `--nav` modifier (the
 * default `sticky: true` modifier is still present). `active` is typed `never`
 * here (required, so it can't be written in JSX at all) — the cast below
 * hands the registered defaults through untouched.
 */
export const DisplayBranch: Story = {
	parameters: { layout: 'padded' },
	render: (args) => (
		<Sidebar { ...args as SidebarStoryProps }>
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
		await expect(canvas.queryByRole('menu')).not.toBeInTheDocument()
		await expect(canvas.queryByRole('link')).not.toBeInTheDocument()
		await expect(canvas.queryByRole('button')).not.toBeInTheDocument()
		await expect(root.querySelector(RAIL_SELECTOR)).toBeNull()

		await expect(root.className).not.toMatch('inkq-sidebar--nav')
		await expect(root.className).toMatch('inkq-sidebar--sticky')

		// `children` sit inside `div.inner`, itself inside `div.wrapper`.
		const inner = content.closest('.inkq-sidebar__inner') as HTMLElement
		await expect(inner.tagName).toBe('DIV')
		await expect(inner.parentElement).toHaveClass('inkq-sidebar__wrapper')
		await expect(inner.parentElement?.tagName).toBe('DIV')
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
 * rail tokens; this story asserts only the class/hash part. **Re-verified against the live `Sidebar.module.scss`**: the
 * ROOT selector (`.inkq-sidebar`) has no declarations of its own (only nested
 * `&__*` rules), so it never carries a CSS-module hash either way; the
 * `wrapper` selector (`&__wrapper`) DOES have its own declarations, so its
 * hash is genuinely suppressed when `unstyled` and present when styled.
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
		// The root has no compiled hash to find at all, styled or unstyled.
		expect(hasModuleClass(styledRoot, 'inkq-sidebar')).toBe(false)
		expect(hasModuleClass(unstyledRoot, 'inkq-sidebar')).toBe(false)

		const styledWrapper = styledRoot.querySelector('.inkq-sidebar__wrapper') as HTMLElement,
			unstyledWrapper = unstyledRoot.querySelector('.inkq-sidebar__wrapper') as HTMLElement

		await expect(styledWrapper).toHaveClass('inkq-sidebar__wrapper')
		await expect(unstyledWrapper).toHaveClass('inkq-sidebar__wrapper')
		expect(hasModuleClass(styledWrapper, 'inkq-sidebar__wrapper')).toBe(true)
		expect(hasModuleClass(unstyledWrapper, 'inkq-sidebar__wrapper')).toBe(false)
	},
}
