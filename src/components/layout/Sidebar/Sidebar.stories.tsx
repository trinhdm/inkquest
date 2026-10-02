import { expect, fn, spyOn, userEvent, within } from 'storybook/test'
import { rem } from '@/lib/general'
import { getDefaultProps } from '@/hooks/useProps'
import { Sidebar } from './Sidebar'
import type { ReactNode } from 'react'
import type { Route } from 'next'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import moduleClasses from './Sidebar.module.scss'

// `Sidebar.tsx`'s local `height` constant (`setThemeCSS`'s `tokens`) — not
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

// A handful of representative `Sidebar.LinkItem`s / `Sidebar.ActionItem`s —
// `Sidebar.Props['items']` has no upper bound, these are just realistic
// examples, same precedent as `Grid`'s `COLUMN_VALUES`/`Section`'s
// `LAYOUT_OPTIONS`.
const linkItem = (id: string, label: string, url: string): Sidebar.LinkItem => ({
	id, label, url: url as Route<string>,
})

const LINK_ITEMS: Sidebar.LinkItem[] = [
	linkItem('overview', 'Overview', '/dashboard/overview'),
	linkItem('settings', 'Settings', '/dashboard/settings'),
	linkItem('billing', 'Billing', '/dashboard/billing'),
]

const ACTION_ITEMS: Sidebar.ActionItem[] = [
	{ id: 'overview', label: 'Overview' },
	{ id: 'settings', label: 'Settings' },
	{ id: 'billing', label: 'Billing' },
]

// `Sidebar.Props` (the `declare namespace` export) is the raw, discriminated-
// union `SidebarProps` — it doesn't include `as`/`unstyled`/`attributes`/etc.,
// which only exist on the actual accepted prop type, `PolymorphicProps<
// SidebarProps, C>`. `Parameters<typeof Sidebar>[0]` reads that real, wrapped
// type straight off the component itself — the generic call signature's
// default `C` resolves to `'div'` here, since `SidebarSpecs`'s `defaults.as`
// is `'div'`.
type SidebarStoryProps = Parameters<typeof Sidebar>[0]

// `SidebarProps` is an INTERSECTION that CONTAINS a union
// (`BaseSidebarProps & (ActionSidebarProps | LinkedSidebarProps) &
// MaybeAnimationProps`), not a top-level union — same shape category as
// `SectionProps` (`Section.stories.tsx` documents this exact caveat there):
// `Extract`/`Exclude` can't distribute over a union nested inside an
// intersection, so `Exclude<SidebarStoryProps, { onItemChange: ... }>`
// silently returns the type UNCHANGED rather than isolating a branch.
// `Section.stories.tsx`'s own workaround applies here too: `Omit` away every
// key that actually DIFFERS in shape/requiredness between
// `ActionSidebarProps`/`LinkedSidebarProps` (`active`, `items`,
// `onItemChange`, `scroll`, `shallow`) — once those are gone, what's left is
// a single, unambiguous object type with no residual union to fight. Each
// story then supplies the omitted, branch-specific props explicitly in JSX
// (never spread), which both keeps the JSX call typechecking against the
// REAL narrow branch AND still forwards `args`' real registered defaults
// (`scroll`/`shallow`) at runtime via the spread, since `Omit` only narrows
// the TypeScript view of `args`, not its actual enumerable properties.
type SidebarBaseArgs = Omit<SidebarStoryProps, 'active' | 'items' | 'onItemChange' | 'scroll' | 'shallow'>

type Story = StoryObj<SidebarStoryProps>

const meta: Meta<SidebarStoryProps> = {
	component: Sidebar,
	title: 'Layout/Sidebar',
	argTypes: {
		as: {
			control: 'text',
			description: 'Polymorphic escape hatch via the shared `Box` contract. `SidebarSpecs` declares `defaults: { as: \'div\' }`, so `Sidebar` genuinely forwards it to the OUTER root element — the inner `<nav>` (and everything inside it) is always hardcoded regardless of `as`. See the `AsElement` story.',
		},
		active: {
			control: 'text',
			description: 'REQUIRED on the action branch (`ActionSidebarProps`), optional on the linked branch (`LinkedSidebarProps`, where `onItemChange`/`items[].url` differ). Drives two independent things: (1) which item gets `aria-current` (`\'page\'` on the linked/`url` branch, literal `true` on the action branch — `Sidebar.tsx`\'s two separate `attributes.aria.current` expressions differ per branch) and the `inkq-sidebar__item--active` modifier class; (2) the themed `--sidebar-rail-position` offset, computed from `items.findIndex(item => active === item.id)` — an `active` that matches NO item resolves to `-1`, NOT `0`. See the `Default`, `ActiveNoMatch`, and `ActionBranch` stories.',
		},
		items: {
			control: false,
			description: 'The nav item list — `SidebarActionItem[]` (`{ id, label, url?: never }`) on the action branch, `SidebarLinkItem[]` (`{ id, label, url: Route<string> }`) on the linked branch. Each entry renders as an `<li>` wrapping a `Button`: with a `url`, a real anchor (`Button`\'s `href` branch, via `next/link`); without one, a native `<button>` with `onClick={() => onItemChange?.(id)}`. See the `Default` (linked) and `ActionBranch` (action) stories.',
		},
		onItemChange: {
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
			description: 'Optional (`BaseSidebarProps.children?: ReactNode`), rendered AFTER the `<nav>` (item list), not inside it — `Sidebar.tsx`\'s render ends with `<nav>...</nav>{ children }` inside the root `<Box>`. See the `AdditionalChildren` story.',
		},
		unstyled: {
			control: 'boolean',
			description: 'Part of `PolymorphicProps` (via the shared `SpecsContract`), not `Sidebar`\'s own `SidebarProps`. The semantic base class (`inkq-sidebar`) is ALWAYS emitted regardless of this prop. **Verified against the live `Sidebar.module.scss`**: `.inkq-sidebar`\'s own selector has no declarations of its own (only nested `&__*` rules), so the ROOT never carries a CSS-module hash either way — `unstyled` only suppresses the hash on the `inner`/`wrapper`/`rail`/`item`/`button` selectors, which DO have their own rules. Separately, each item\'s `Button` is ALWAYS rendered with a hardcoded `unstyled: true` (`Sidebar.tsx`\'s `itemProps`), independent of `Sidebar`\'s own `unstyled` prop — `Button`\'s own CSS-module classes never appear inside a `Sidebar`, styled or not. See the `Unstyled` story.',
		},
		animated: {
			control: false,
			description: '**Probable source gap, verified against the live `Sidebar.tsx`**: part of `SidebarProps` via `MaybeAnimationProps` (same discriminated union `Group`/`Section` use), but `Sidebar.tsx` never destructures `animated` (or `duration`/`stagger`/`amount`/`once`/`lead`/`margin`/`withinView`/`index`) out of `rest`, and calls no animation hook (`useReveal`/`useReplayInView`) at all — unlike `Group`/`Section`. `extractOthers` doesn\'t reserve any of these names either, so passing `animated`/`duration`/etc. lands the raw prop straight onto the root `<Box>` as a lowercase DOM attribute (same silent-passthrough class of bug as `Group`\'s documented `justify`/`lead`). No story exercises this beyond this doc note.',
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

		const root = canvas.getByRole('navigation').closest(ROOT_SELECTOR) as HTMLElement,
			rail = root.querySelector(RAIL_SELECTOR) as HTMLElement

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
 * `items: []` — an empty list is a valid, non-crashing state.
 * `[].findIndex(...)` is also `-1`, same rail-offset behavior as
 * `ActiveNoMatch`, but exercised here via genuinely zero items rather than an
 * unmatched `active` against a populated list.
 */
export const EmptyItems: Story = {
	render: (args) => (
		<Sidebar { ...args as SidebarBaseArgs } active="anything" items={ [] } />
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			nav = canvas.getByRole('navigation')

		await expect(canvas.queryByRole('link')).not.toBeInTheDocument()
		await expect(canvas.queryByRole('button')).not.toBeInTheDocument()

		const menu = within(nav).getByRole('menu')
		await expect(menu).toBeEmptyDOMElement()

		const root = nav.closest(ROOT_SELECTOR) as HTMLElement,
			rail = root.querySelector(RAIL_SELECTOR) as HTMLElement

		expect(rail.style.getPropertyValue('--sidebar-rail-position')).toBe(rem(RAIL_HEIGHT_PX * -1))
	},
}

/**
 * The action branch (`onItemChange`, no `url` on any item) — each item
 * renders as a native `<button>` with `onClick={() => onItemChange?.(id)}`.
 * Clicking exercises exact call counts AND the exact `id` argument per click,
 * not just "was called".
 */
export const ActionBranch: Story = {
	args: { onItemChange: fn() },
	parameters: { layout: 'padded' },
	render: (args) => (
		<Sidebar
			{ ...args as SidebarBaseArgs }
			active="overview"
			items={ ACTION_ITEMS }
			onItemChange={ args.onItemChange as (id: string) => void }
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
		await expect(args.onItemChange).toHaveBeenCalledTimes(1)
		await expect(args.onItemChange).toHaveBeenLastCalledWith('settings')

		await userEvent.click(billing)
		await expect(args.onItemChange).toHaveBeenCalledTimes(2)
		await expect(args.onItemChange).toHaveBeenLastCalledWith('billing')

		await userEvent.click(overview)
		await expect(args.onItemChange).toHaveBeenCalledTimes(3)
		await expect(args.onItemChange).toHaveBeenLastCalledWith('overview')
	},
}

/**
 * Keyboard activation on the action branch — `Tab` reaches each native
 * `<button>` in order, and BOTH `Enter` and `Space` trigger the same
 * `onClick={() => onItemChange?.(id)}` a native `<button>` gets for free.
 */
export const KeyboardActivation: Story = {
	args: { onItemChange: fn() },
	parameters: { layout: 'padded' },
	render: (args) => (
		<Sidebar
			{ ...args as SidebarBaseArgs }
			active="overview"
			items={ ACTION_ITEMS }
			onItemChange={ args.onItemChange as (id: string) => void }
		/>
	),
	play: async ({ args, canvasElement }) => {
		const canvas = within(canvasElement),
			[overview] = canvas.getAllByRole('button')

		await expect(overview).not.toHaveFocus()

		await userEvent.tab()
		await expect(overview).toHaveFocus()

		await userEvent.keyboard('{Enter}')
		await expect(args.onItemChange).toHaveBeenCalledTimes(1)
		await expect(args.onItemChange).toHaveBeenLastCalledWith('overview')

		await userEvent.keyboard(' ')
		await expect(args.onItemChange).toHaveBeenCalledTimes(2)
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
 */
export const Shallow: Story = {
	parameters: {
		layout: 'padded',
		controls: { exclude: ['shallow'] },
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
		const pushState = spyOn(window.history, 'pushState')
		const canvas = within(canvasElement),
			links = canvas.getAllByRole('link')

		await expect(links).toHaveLength(6)
		for (const link of links)
			await expect(link).toHaveAttribute('href')

		await expect(pushState).not.toHaveBeenCalled()
	},
}

/**
 * `SidebarSpecs` declares `defaults: { as: 'div' }` — `Sidebar` genuinely IS
 * polymorphic on its OUTER root element; the inner `<nav>` (and everything
 * inside it) is always hardcoded regardless of `as`.
 */
export const AsElement: Story = {
	parameters: {
		layout: 'padded',
		controls: { exclude: ['as'] },
	},
	render: (args) => (
		<Row>
			<Group label='as="div" (default)'>
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
 * `children` renders AFTER the `<nav>` item list, inside the same root — not
 * merged into it.
 */
export const AdditionalChildren: Story = {
	parameters: { layout: 'padded' },
	render: (args) => (
		<Sidebar { ...args as SidebarBaseArgs } active="overview" items={ LINK_ITEMS }>
			<div style={ { paddingBlockStart: 16 } }>Extra footer content</div>
		</Sidebar>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			nav = canvas.getByRole('navigation'),
			footer = canvas.getByText('Extra footer content')

		await expect(footer).toBeInTheDocument()

		// `children` sits alongside `<nav>` inside the same root `<Box>`, not
		// nested inside it.
		await expect(within(nav).queryByText('Extra footer content')).not.toBeInTheDocument()
		await expect(footer.closest(ROOT_SELECTOR)).toBe(nav.closest(ROOT_SELECTOR))
	},
}

/**
 * `unstyled` does NOT remove `Sidebar`'s semantic base classes — they're
 * always emitted. **Re-verified against the live `Sidebar.module.scss`**: the
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
