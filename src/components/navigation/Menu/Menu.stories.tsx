import { expect, userEvent, waitFor, within } from 'storybook/test'
import { getDefaultProps } from '@/hooks/useProps'
import { Menu } from './Menu'
import { NavRoutes, NAVIGATION_DATA, type NavigationItem } from '@/utils/navigation'
import type { ReactNode } from 'react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import moduleClasses from './Menu.module.scss'

// `Menu`'s only enumerable prop is the boolean `hasDropdowns` (`items` is
// data, not an enum), so — same as `Badge`/`Container` — this stays local
// instead of living in a shared `options.story.ts`.
const BOOLEAN_OPTIONS = [true, false] as const

// `Menu`'s only other enumerable prop, alongside `hasDropdowns` — a plain 2-value
// literal pair, so it stays local rather than living in a shared `options.story.ts`.
const ORIENTATION_OPTIONS = ['horizontal', 'vertical'] as const

// Nesting levels exercised by the `Depth` story; `0` is the registered default.
const DEPTH_OPTIONS = [0, 1] as const

// Root tags exercised by the `AsElement` story. `ul` is the registered default.
const AS_OPTIONS = ['ul', 'ol', 'div'] as const

const Row = ({ children }: { children: ReactNode }) => (
	<div style={ { display: 'flex', gap: 48, flexWrap: 'wrap', alignItems: 'flex-start' } }>
		{ children }
	</div>
)

const Group = ({ label, children }: { label: string, children: ReactNode }) => (
	<div style={ { display: 'flex', flexDirection: 'column', gap: 8 } }>
		<span style={ { font: 'var(--inkq-text-control)', letterSpacing: '.15em', textTransform: 'uppercase', opacity: 0.6 } }>
			{ label }
		</span>
		<div style={ { display: 'flex', gap: 8, alignItems: 'flex-start', flexWrap: 'wrap' } }>
			{ children }
		</div>
	</div>
)

// Real navigation data, pulled straight from `NAVIGATION_DATA` rather than
// re-declared here, so these stories can't drift from the app's own nav tree.
const itemsFor = (...labels: string[]): NavigationItem[] =>
	NAVIGATION_DATA.filter(item => labels.includes(item.label))

// The `Company` entry is the simple dropdown fixture: it has a `menu` but NO `route`, so its
// label renders as a plain `<span>` rather than a link, and none of its children is itself
// a dropdown.
const COMPANY_ITEM = itemsFor('Company')

// With no `id` on `Menu`, `MenuItem` falls back to `dropdown-${ toSlug(label) }` for the
// top-level dropdown's `id` (`id ?? ...`), and `Menu.Dropdown` builds the caret button and
// submenu ids from it. Nested dropdowns are prefixed by the submenu they sit in (see the
// `Id` story).
const COMPANY_DROPDOWN_ID = 'dropdown-company',
	COMPANY_TRIGGER_ID = `${ COMPANY_DROPDOWN_ID }-trigger`,
	COMPANY_MENU_ID = `${ COMPANY_DROPDOWN_ID }-menu`

// The caret button gets a `--hidden` modifier (a hashed CSS-module class, hence the substring
// match) when its caret is hidden. In a real browser the CSS visually hides it on hover
// devices unless it has keyboard focus; it stays in the accessibility tree and keeps working.
const hasHiddenCaret = (button: Element) =>
	Array.from(button.classList).some(c => c.includes('trigger--hidden'))

// Derived from the live fixture rather than hardcoded, so these don't rot if
// `NAVIGATION_DATA` gains/loses entries. `MenuLabel` (`MenuLabel/MenuLabel.tsx`) sets
// `role="menuitem"` UNCONDITIONALLY on its `sharedProps` — both the `route`
// branch (`<a>`) and the no-`route` branch (`<span>`) get it — so every
// top-level entry, including a route-less one, is reachable via
// `getByRole('menuitem')`.
const TOP_LEVEL_COUNT = NAVIGATION_DATA.length
const DROPDOWN_TRIGGER_COUNT = NAVIGATION_DATA.filter(item => item.menu?.length).length
const FLATTENED_LEAF_COUNT = NAVIGATION_DATA.reduce(
	(sum, item) => sum + (item.menu?.length || 1), 0
)

// `Menu.Dropdown` always mounts its nested `Menu`; `Menu.module.scss` hides a closed one with
// `visibility: hidden` (`.inkq-menu-dropdown:not([data-open]) > .inkq-menu`), and Testing
// Library leaves such elements out of role queries. So role counts below (`menubar`,
// `menuitem`, `button`) only see the top level while every dropdown is closed. Closing delays
// the `visibility` change by the transition, so "now hidden" assertions use `waitFor`.

// `Menu.Props` (the `declare namespace` export) is just the raw `MenuProps`
// interface — it doesn't include `as`/`unstyled`/`attributes`/etc., which only
// exist on the actual accepted prop type, `PolymorphicProps<MenuProps, C>`.
// `Parameters<typeof Menu>[0]` reads that real, wrapped type straight off the
// component itself. It fills `C` with its constraint (`ElementType`), not the
// default `'ul'`, so `as` is any `ElementType` here.
type MenuStoryProps = Parameters<typeof Menu>[0]
type Story = StoryObj<MenuStoryProps>

const meta: Meta<MenuStoryProps> = {
	component: Menu,
	title: 'Navigation/Menu',
	argTypes: {
		as: {
			control: 'select',
			options: AS_OPTIONS,
			description: 'Part of `PolymorphicProps`. `Menu.tsx` destructures `as` from props and forwards it to its root `<Box>` (`as={ as }`), so it sets the rendered root tag; the registered default is `ul`. The root always carries `role="menubar"` regardless of the tag. See the `AsElement` story.',
		},
		className: {
			control: 'text',
			description: 'Destructured out of `Menu`\'s props in `Menu.tsx` and forwarded to EVERY `MenuItem` (`className={ className }`), so it lands on each item rather than being spread onto the root through `others`. The full props, `className` included, are also what `Menu` hands to `useStyles` for its root selector; no story here asserts on that path.',
		},
		depth: {
			control: 'number',
			description: 'Nesting level, registered default `0`. `Menu.tsx` uses it only to gate the `orientation` module class (`depth === 0 && !!orientation`), and forwards it to every `MenuItem`, which hands it to `Menu.Dropdown`, which gives the nested `Menu` it contains `depth + 1` (when `depth` is a number). Normally set by that chain, not by callers. See the `Depth` story.',
		},
		hasDropdowns: {
			control: 'boolean',
			description: 'Forwarded to every `MenuItem`. When `true`, an item that has its own `menu` renders a `Menu.Dropdown`: the label (a link, or a `span` without a `route`), a separate caret `<button>` beside it, and a nested `Menu` that is always mounted and opens on hover or caret click (`data-open` on the dropdown\'s `li`). When `false`, such an item renders NO trigger and NO label of its own — `MenuItem` returns a flat ARRAY of its children\'s `<li>`s instead (see the `FlattenedItems` story).',
		},
		active: {
			control: 'text',
			description: 'A `NavRoute` to mark active (exact match against each item\'s own `route`); `null` to explicitly mark NO item active; or `undefined` to fall back to `usePathname()`. `Menu.tsx` resolves this itself, BEFORE forwarding: `const currentRoute = typeof active === \'string\' || active === null ? active : (pathname as NavigationItem[\'route\'])` — so a route string or `null` is passed down to every top-level `MenuItem` (and, one level further, into any dropdown\'s own nested `Menu`) AS-IS, while `undefined` is replaced with the real pathname first. `null` and `undefined` are NOT equivalent: only `undefined` triggers the pathname fallback. See the `ActiveItem` and `ActiveFromPathname` stories.',
		},
		id: {
			control: 'text',
			description: 'Applied to the root `<ul>`, and used as a prefix for every item: each item gets `id={ id && `${ id }-${ toSlug(item.label) }` }`, so no `id` means no item ids. `toSlug` lowercases and turns runs of other characters into one `-` (`Browse Work` → `browse-work`, `FAQs` → `faqs`). A leaf or flattened item renders no id; a dropdown item uses it as the dropdown\'s `id` (otherwise `dropdown-${ toSlug(label) }`), from which the caret button (`-trigger`) and the nested submenu (`-menu`) ids are built. That submenu is itself a `Menu` with `id` `${ id }-menu`, so dropdowns nested inside it are prefixed again. See the `Id` story.',
		},
		items: {
			control: 'object',
			description: 'The `NavigationItem[]` to render (typed as `NavigationItem[\'menu\']`). Optional at the type level, so `undefined`/`[]` are both valid and produce an empty `role="menubar"`.',
		},
		orientation: {
			control: 'select',
			options: ORIENTATION_OPTIONS,
			description: 'Drives a `module`-config class on the root `<ul>`, computed as `{ [orientation]: depth === 0 && !!orientation }` — so it ONLY takes effect at the top level (`depth === 0`); a nested `Menu` (the one inside a dropdown) always gets `depth > 0` and ignores this entirely. `\'vertical\'` has a real SCSS rule (`&--vertical`, switches to `flex-direction: column`), so it carries a real CSS-module hash when styled; `\'horizontal\'` has no matching SCSS rule at all, so `inkq-menu--horizontal` is a permanently unhashed literal class. See the `Orientation` story.',
		},
		triggers: {
			control: false,
			description: '`Partial<Record<NavRoute, ReactNode>>`: replaces the content of an item whose `route` is a key (for example an avatar for `/profile`). Every other item keeps its label. The replaced item stays a link to its `route`, and its accessible name stays its `label`; a dropdown with a trigger hides its caret visually (the caret button is still there and works). Only top-level items of this `Menu` are looked up, and an item without a `route` can never match. See the `Triggers` story.',
		},
		unstyled: {
			control: 'boolean',
			description: 'Comes from `FactoryContract` (via `_PolymorphicContract`), not `Menu`\'s own `MenuProps`. On the root `<ul>` it drops the CSS-module hash and the config classes (the `orientation` modifier), and — via `others` on the root `<Box>` — non-state `data-*` attributes. The semantic base class (`inkq-menu`) is still emitted unless an inherited semantic `className` replaces it (e.g. `inkq-navbar__menu` when `Navbar` renders it). `Menu` does not forward `unstyled` to its `MenuItem`s. See the `Unstyled` story.',
		},
	},
	args: {
		...getDefaultProps<Menu.Props>('Menu'),
		items: NAVIGATION_DATA,
	},
}

export default meta

// The full app nav tree. `NAVIGATION_DATA` has `TOP_LEVEL_COUNT` top-level
// entries, `DROPDOWN_TRIGGER_COUNT` of which (every entry with a non-empty
// `menu`: `Discover`, `Marketplace`, `Community`, `User`, `Company` and `Legal`) carry their
// own `menu` and therefore render a dropdown trigger.
//
// `MenuLabel` sets `role="menuitem"` unconditionally on both its `route`
// branch (`<a>`) and its no-`route` branch (`<span>`) — so all top-level
// entries are reachable via `getByRole('menuitem')`. The dropdowns' nested items are
// mounted but hidden while closed, so they are not counted.
export const Default: Story = {
	parameters: { layout: 'padded' },
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			menubar = canvas.getByRole('menubar')

		await expect(menubar.tagName).toBe('UL')

		await expect(within(menubar).getAllByRole('menuitem')).toHaveLength(TOP_LEVEL_COUNT)
		await expect(within(menubar).getByRole('menuitem', { name: 'User' })).toBeInTheDocument()
		await expect(within(menubar).getAllByRole('button')).toHaveLength(DROPDOWN_TRIGGER_COUNT)
	},
}

// Both values rendered side by side. With `hasDropdowns: false`, `MenuItem`
// replaces each parent item (every entry with a `menu`: `Discover`, `Marketplace`,
// `Community`, `User`, `Company`, `Legal`) with its children (e.g. `Community` →
// `Events`/`Feed`/`Spotlights`, `User` → `Notifications`/`Messages`/…), so the
// `TOP_LEVEL_COUNT` top-level entries flatten into `FLATTENED_LEAF_COUNT`
// leaf entries and no trigger buttons at all.
export const HasDropdowns: Story = {
	parameters: {
		layout: 'padded',
		controls: { exclude: ['hasDropdowns'] },
	},
	render: (args) => (
		<Row>
			{ BOOLEAN_OPTIONS.map(hasDropdowns => (
				<Group key={ String(hasDropdowns) } label={ String(hasDropdowns) }>
					<Menu { ...args } hasDropdowns={ hasDropdowns } />
				</Group>
			)) }
		</Row>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			[withDropdowns, flattened] = canvas.getAllByRole('menubar')

		// `MenuLabel` sets `role="menuitem"` unconditionally on both its `route`
		// and no-`route` branches, so all `TOP_LEVEL_COUNT` entries are reachable
		// via `getByRole`.
		await expect(within(withDropdowns).getAllByRole('menuitem')).toHaveLength(TOP_LEVEL_COUNT)
		await expect(within(withDropdowns).getByRole('menuitem', { name: 'User' })).toBeInTheDocument()
		await expect(within(withDropdowns).getAllByRole('button')).toHaveLength(DROPDOWN_TRIGGER_COUNT)

		await expect(within(flattened).getAllByRole('menuitem')).toHaveLength(FLATTENED_LEAF_COUNT)
		await expect(within(flattened).queryAllByRole('button')).toHaveLength(0)

		// The flattened branch drops the parent's own label entirely.
		await expect(within(flattened).queryByRole('menuitem', { name: 'User' })).not.toBeInTheDocument()
		await expect(within(flattened).getByRole('menuitem', { name: 'Notifications' })).toBeInTheDocument()
	},
}

/**
 * `MenuItem.tsx` branch 1 (`if (!isDropdown)`): an item with no
 * `menu` renders a single `<li role="none">` wrapping a `<MenuLabel>` element
 * (`MenuLabel/MenuLabel.tsx`). `MenuLabel` renders `Link` (with `href`,
 * `scroll` and `shallow`) when the item has a `route`, and otherwise its own
 * `as` (registered default `span`) — so an item WITH a `route` is an
 * `<a role="menuitem" href>`.
 *
 * `MenuLabel`'s `sharedProps` sets `role: 'menuitem'` UNCONDITIONALLY, so the
 * no-`route` branch's `<span tabIndex={-1}>` also carries `role="menuitem"`,
 * and all 3 of these items (2 real fixture entries + 1 synthetic route-less
 * one) are reachable via `getAllByRole('menuitem')`.
 *
 * `scroll`/`shallow` are next/link routing options, not DOM attributes, so
 * nothing here can assert on them.
 */
export const LeafItems: Story = {
	parameters: { layout: 'padded' },
	args: {
		items: [
			...itemsFor('Home', 'Sign up'),
			{ label: 'No route (span)' },
		],
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			menubar = canvas.getByRole('menubar'),
			items = within(menubar).getAllByRole('menuitem')

		await expect(items).toHaveLength(3)
		await expect(within(menubar).queryAllByRole('button')).toHaveLength(0)

		// Every leaf is wrapped in its own `<li role="none">` — 3 total, matching
		// the 3 reachable via `role="menuitem"`.
		const listItems = menubar.querySelectorAll(':scope > li')
		await expect(listItems).toHaveLength(3)
		listItems.forEach(li => expect(li).toHaveAttribute('role', 'none'))

		const home = within(menubar).getByRole('menuitem', { name: 'Home' }),
			signUp = within(menubar).getByRole('menuitem', { name: 'Sign up' }),
			noRoute = within(menubar).getByRole('menuitem', { name: 'No route (span)' })

		await expect(home.tagName).toBe('A')
		await expect(home).toHaveAttribute('href', NavRoutes.HOME)
		await expect(signUp).toHaveAttribute('href', NavRoutes.AUTH_SIGNUP)

		await expect(noRoute.tagName).toBe('SPAN')
		await expect(noRoute).not.toHaveAttribute('href')
	},
}

/**
 * `MenuItem.tsx`'s final branch (reached when `isDropdown && hasDropdowns`,
 * after the `!isDropdown` and `!hasDropdowns` early returns): an item that has
 * a `menu` renders a `Menu.Dropdown`: the label (a `MenuLabel`), then a SEPARATE caret
 * `Button` beside it (nothing interactive sits inside the button), then a nested `Menu`.
 * The button carries `aria-controls` / `aria-expanded` / `aria-haspopup`, the accessible
 * name `Company submenu` and an `aria-hidden` `caret-down` `Icon`; the submenu is labelled
 * by the button.
 *
 * That nested `Menu` is ALWAYS mounted: it is hidden by CSS until `data-open` is set on the
 * dropdown's `li`. So the closed state is "present in the DOM but out of reach for role
 * queries", not "absent".
 *
 * With no `id` on the `Menu`, the ids fall back to the label: `toSlug('Company')` →
 * `company`, giving `dropdown-company`, `dropdown-company-trigger` and
 * `dropdown-company-menu`. A `Menu` `id` changes this (see the `Id` story).
 *
 * `Company` has no `route`, so its label renders via `MenuLabel`'s no-`route` branch as a
 * `<span role="menuitem">` — reachable via `getByRole('menuitem', { name: 'Company' })`.
 *
 * How the dropdown opens and closes (click, hover, keyboard) is covered by the
 * `Menu.Dropdown` stories, not here.
 */
export const DropdownItems: Story = {
	parameters: { layout: 'padded' },
	args: {
		hasDropdowns: true,
		items: COMPANY_ITEM,
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			trigger = canvas.getByRole('button', { name: 'Company submenu' }),
			root = canvasElement.querySelector(`#${ COMPANY_DROPDOWN_ID }`)

		const label = canvas.getByRole('menuitem', { name: 'Company' })
		await expect(label.tagName).toBe('SPAN')
		await expect(root).not.toBeNull()
		await expect(root).toContainElement(label)
		await expect(trigger).not.toContainElement(label)
		await expect(root).not.toHaveAttribute('data-open')

		await expect(trigger).toHaveAttribute('id', COMPANY_TRIGGER_ID)
		await expect(trigger).toHaveAttribute('type', 'button')
		await expect(trigger).toHaveAttribute('aria-controls', COMPANY_MENU_ID)
		await expect(trigger).toHaveAttribute('aria-haspopup', 'true')
		await expect(trigger).toHaveAttribute('aria-expanded', 'false')
		await expect(hasHiddenCaret(trigger)).toBe(false)

		// A CSS selector, not a role query, because `aria-hidden="true"` removes the
		// icon from the accessibility tree — there's no role to query it by. Assert
		// non-null explicitly first: `toBeInTheDocument()` throws an unhelpful,
		// message-less error when handed `null` outright, rather than failing with a
		// readable diff.
		const icon = trigger.querySelector('[aria-hidden="true"]')
		await expect(icon).not.toBeNull()
		await expect(icon).toBeInTheDocument()

		// The nested menu is mounted and wired to the trigger, but not open.
		const submenu = canvasElement.querySelector(`#${ COMPANY_MENU_ID }`)
		await expect(submenu).not.toBeNull()
		await expect(submenu).toHaveAttribute('aria-labelledby', COMPANY_TRIGGER_ID)
		await expect(submenu).not.toHaveAttribute('data-open')
		await expect(within(submenu as HTMLElement).getByText('About')).toBeInTheDocument()

		// Hidden by CSS, so out of reach for role queries.
		await waitFor(() => expect(canvas.queryByRole('menuitem', { name: 'About' })).not.toBeInTheDocument())
		await expect(canvas.getAllByRole('menubar')).toHaveLength(1)
	},
}

/**
 * `MenuItem.tsx` branch 3 (the final `return menu?.map(...)`):
 * with `hasDropdowns: false`, an item that has a `menu` returns an ARRAY of
 * `<li role="none">`s — one per child — and its OWN label is never rendered.
 *
 * Note this branch renders one `<MenuLabel { ...child } />` per child, so it
 * does not recurse:
 * `Events`/`Feed` are rendered but their own children (`Your Lineup`,
 * `Your Circle`) are dropped.
 */
export const FlattenedItems: Story = {
	parameters: { layout: 'padded' },
	args: {
		hasDropdowns: false,
		items: itemsFor('Community'),
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			menubar = canvas.getByRole('menubar'),
			items = within(menubar).getAllByRole('menuitem')

		await expect(items.map(item => item.textContent)).toEqual([
			'Events', 'Feed', 'Spotlights',
		])

		// The parent's own label is dropped, and so is the third level.
		await expect(canvas.queryByText('Community')).not.toBeInTheDocument()
		await expect(canvas.queryByText('Your Lineup')).not.toBeInTheDocument()
		await expect(within(menubar).queryAllByRole('button')).toHaveLength(0)
	},
}

/**
 * `Community` is two levels deep, so opening it reveals a nested `Menu` whose
 * own `Events`/`Feed` items are themselves dropdowns (the nested `Menu` gets no
 * `hasDropdowns` prop, so it falls back to the registered default, `true`).
 *
 * `Menu`/`MenuItem` have no `routes` prop of their own — they only ever render
 * whatever `items` they're handed, at every depth. Filtering (via the
 * recursive `filterNavigation`) happens upstream, in `Navbar`/`Subnav`, before
 * `items` ever reaches `Menu`. Quirk: every nested list is `role="menubar"`
 * (hardcoded in `Menu.tsx`), not `role="menu"`.
 *
 * Only the pointer is used here to open the levels; the keyboard is covered by
 * `KeyboardNestedLabels` and `KeyboardNestedOpenClose`.
 */
export const NestedDropdowns: Story = {
	parameters: { layout: 'padded' },
	args: {
		hasDropdowns: true,
		items: itemsFor('Community'),
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			user = userEvent.setup(),
			trigger = canvas.getByRole('button', { name: 'Community submenu' })

		// Opened by hover rather than click: a pointer click is always preceded by the
		// `mouseenter` that already opens the dropdown, so the click would only toggle it
		// back shut (see the `ClickToOpen` story of `Menu.Dropdown`).
		await user.hover(trigger)

		// Level 2 is revealed as a second visible `menubar`.
		await canvas.findByRole('menuitem', { name: 'Events' })
		await expect(canvas.getAllByRole('menubar')).toHaveLength(2)

		// The nested dropdown's id is prefixed by the submenu it sits in: `Community`'s
		// submenu is `dropdown-community-menu`, so `Events` is `dropdown-community-menu-events`.
		const eventsTrigger = canvas.getByRole('button', { name: 'Events submenu' })
		await expect(eventsTrigger).toHaveAttribute('id', 'dropdown-community-menu-events-trigger')

		// Still inside the `Community` <li>, so its mouse-leave timer never starts.
		await user.hover(eventsTrigger)

		// Level 3.
		await canvas.findByRole('menuitem', { name: 'Your Lineup' })
		await expect(canvas.getAllByRole('menubar')).toHaveLength(3)
	},
}

/**
 * Keyboard reaching the labels of NESTED dropdowns. `Community`'s link is the first Tab stop.
 * `ArrowDown` on it opens the dropdown and focuses its first item, the `Events` label (itself
 * a dropdown); `ArrowDown`/`ArrowUp` then cycle through `Events`, `Feed` and `Spotlights`,
 * wrapping at both ends. The nested dropdowns' own items are not part of this cycle.
 */
export const KeyboardNestedLabels: Story = {
	parameters: { layout: 'padded' },
	args: {
		hasDropdowns: true,
		items: itemsFor('Community'),
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			communityTrigger = canvas.getByRole('button', { name: 'Community submenu' })

		const community = canvas.getByRole('menuitem', { name: 'Community' })

		await userEvent.tab()
		await expect(community).toHaveFocus()

		await userEvent.keyboard('{ArrowDown}')
		await waitFor(() => expect(communityTrigger).toHaveAttribute('aria-expanded', 'true'))

		const events = await canvas.findByRole('menuitem', { name: 'Events' }),
			feed = canvas.getByRole('menuitem', { name: 'Feed' }),
			spotlights = canvas.getByRole('menuitem', { name: 'Spotlights' })

		await waitFor(() => expect(events).toHaveFocus())

		await userEvent.keyboard('{ArrowDown}')
		await waitFor(() => expect(feed).toHaveFocus())

		await userEvent.keyboard('{ArrowDown}')
		await waitFor(() => expect(spotlights).toHaveFocus())

		// Wraps forward to the first label, then backward to the last.
		await userEvent.keyboard('{ArrowDown}')
		await waitFor(() => expect(events).toHaveFocus())

		await userEvent.keyboard('{ArrowUp}')
		await waitFor(() => expect(spotlights).toHaveFocus())
	},
}

/**
 * Opening and closing a NESTED dropdown from the keyboard. Inside a submenu a dropdown is
 * "nested", so `ArrowRight` (not `ArrowDown`) opens it and focuses its first item, and
 * `ArrowLeft` (as well as `Escape`) closes it and focuses its own label again. The parent
 * stays open throughout.
 */
export const KeyboardNestedOpenClose: Story = {
	parameters: { layout: 'padded' },
	args: {
		hasDropdowns: true,
		items: itemsFor('Community'),
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			communityTrigger = canvas.getByRole('button', { name: 'Community submenu' })

		await userEvent.tab()
		await userEvent.keyboard('{ArrowDown}')
		await waitFor(() => expect(communityTrigger).toHaveAttribute('aria-expanded', 'true'))

		const events = await canvas.findByRole('menuitem', { name: 'Events' }),
			eventsTrigger = canvas.getByRole('button', { name: 'Events submenu' })

		await waitFor(() => expect(events).toHaveFocus())
		await expect(eventsTrigger).toHaveAttribute('aria-expanded', 'false')

		// `ArrowDown` does not open a nested dropdown; it moves on to the next label.
		await userEvent.keyboard('{ArrowDown}')
		await waitFor(() => expect(canvas.getByRole('menuitem', { name: 'Feed' })).toHaveFocus())
		await expect(eventsTrigger).toHaveAttribute('aria-expanded', 'false')

		await userEvent.keyboard('{ArrowUp}')
		await waitFor(() => expect(events).toHaveFocus())

		await userEvent.keyboard('{ArrowRight}')
		await waitFor(() => expect(eventsTrigger).toHaveAttribute('aria-expanded', 'true'))

		const lineup = await canvas.findByRole('menuitem', { name: 'Your Lineup' })
		await waitFor(() => expect(lineup).toHaveFocus())

		await userEvent.keyboard('{ArrowLeft}')
		await waitFor(() => expect(eventsTrigger).toHaveAttribute('aria-expanded', 'false'))
		await waitFor(() => expect(events).toHaveFocus())

		// The parent is still open.
		await expect(communityTrigger).toHaveAttribute('aria-expanded', 'true')
	},
}

/**
 * `triggers` swaps the content of items whose `route` is a key; everything else keeps its
 * label. Here `/profile` gets an avatar-like node while `Home` and `Company` are untouched.
 *
 * The replaced item is still the `User` link to `/profile` and keeps `User` as its accessible
 * name (a routed label with a non-text trigger gets `aria-label={ label }`), although the
 * visible text is the trigger. Its caret is hidden because it has a trigger (the caret button
 * is still rendered and named `User submenu`), while `Company`'s caret stays shown. `Company`
 * has no `route`, so it can never match a key.
 */
export const Triggers: Story = {
	parameters: {
		layout: 'padded',
		controls: { exclude: ['items', 'triggers'] },
	},
	args: {
		items: itemsFor('Home', 'User', 'Company'),
		triggers: { [NavRoutes.USER_PROFILE]: <span>DT</span> },
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)

		const user = canvas.getByRole('menuitem', { name: 'User' })
		await expect(user.tagName).toBe('A')
		await expect(user).toHaveAttribute('href', NavRoutes.USER_PROFILE)
		await expect(user).toHaveTextContent('DT')
		await expect(user).toHaveAttribute('aria-label', 'User')
		await expect(canvas.queryByText('User')).not.toBeInTheDocument()

		await expect(hasHiddenCaret(canvas.getByRole('button', { name: 'User submenu' }))).toBe(true)

		// The other items keep their labels (and their caret).
		await expect(canvas.getByRole('menuitem', { name: 'Home' })).toHaveTextContent('Home')
		await expect(canvas.getByRole('menuitem', { name: 'Company' })).toHaveTextContent('Company')
		await expect(hasHiddenCaret(canvas.getByRole('button', { name: 'Company submenu' }))).toBe(false)
	},
}

/**
 * `id` goes on the root `<ul>` and prefixes every item: an item gets
 * `${ id }-${ toSlug(label) }`, so the multi-word `Browse Work` becomes `main-browse-work`.
 * Leaf items render no id. A dropdown uses it as its own `id`, and `Menu.Dropdown` derives
 * `-trigger` (the caret button) and `-menu` from that; the `-menu` list is itself a `Menu`
 * with that `id`, so a dropdown nested inside it is prefixed again. Hence with `id="main"`:
 * `main`, `main-company`, `main-company-trigger`, `main-company-menu`, and for the nested
 * `Prints` dropdown `main-gallery-menu-prints`, `…-prints-trigger` and `…-prints-menu`.
 *
 * The dropdowns are routeless, and nothing is clicked. All the ids are in the DOM while closed
 * (submenus are mounted, only hidden), so no interaction is needed.
 */
export const Id: Story = {
	parameters: {
		layout: 'padded',
		controls: { exclude: ['id', 'items'] },
	},
	args: {
		id: 'main',
		items: [
			...COMPANY_ITEM,
			{
				label: 'Gallery',
				menu: [
					{
						label: 'Prints',
						menu: [{ label: 'Originals', route: NavRoutes.MARKETPLACE }],
					},
					{ label: 'Zines', route: NavRoutes.COMMUNITY_FEED },
				],
			},
			{
				label: 'Browse Work',
				menu: [{ label: 'FAQs', route: NavRoutes.COMPANY_FAQS }],
			},
		],
	},
	play: async ({ canvasElement }) => {
		const doc = canvasElement.ownerDocument,
			root = canvasElement.querySelector('#main')

		await expect(root).not.toBeNull()
		await expect(root?.tagName).toBe('UL')
		await expect(root).toHaveAttribute('role', 'menubar')

		const expectedIds = [
			'main',
			'main-company', 'main-company-trigger', 'main-company-menu',
			'main-gallery', 'main-gallery-trigger', 'main-gallery-menu',
			'main-gallery-menu-prints', 'main-gallery-menu-prints-trigger', 'main-gallery-menu-prints-menu',
			'main-browse-work', 'main-browse-work-trigger', 'main-browse-work-menu',
		]

		const allIds = Array.from(canvasElement.querySelectorAll('[id]')).map(el => el.id)

		// No id repeats anywhere in the canvas.
		await expect(new Set(allIds).size).toBe(allIds.length)

		// Exactly the expected ids under the `main` prefix: nothing missing, and no leaf
		// item (`Zines`, `Originals`, `FAQs`, the `Company` children) carries one.
		await expect(allIds.filter(id => id.startsWith('main')).sort()).toEqual([...expectedIds].sort())

		// Items carry the prefixed id on their `li`.
		for (const id of ['main-company', 'main-gallery', 'main-gallery-menu-prints', 'main-browse-work']) {
			const item = canvasElement.querySelector(`#${ id }`)
			await expect(item?.tagName).toBe('LI')
			await expect(item).toHaveAttribute('role', 'none')
		}

		// Every trigger points at a list, and that list points back at the trigger.
		const triggers = Array.from(canvasElement.querySelectorAll<HTMLElement>('button[aria-controls]'))
		await expect(triggers.map(trigger => trigger.id).sort()).toEqual([
			'main-browse-work-trigger', 'main-company-trigger',
			'main-gallery-menu-prints-trigger', 'main-gallery-trigger',
		].sort())

		for (const trigger of triggers) {
			const list = doc.getElementById(trigger.getAttribute('aria-controls')!)

			await expect(list).not.toBeNull()
			await expect(list?.tagName).toBe('UL')
			await expect(list).toHaveAttribute('aria-labelledby', trigger.id)
		}
	},
}

// `items` is optional at the type level (typed as `NavigationItem['menu']`),
// so an empty array still renders the root `<ul role="menubar">` — just with
// no children.
export const EmptyMenu: Story = {
	args: { items: [] },
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			menubar = canvas.getByRole('menubar')

		await expect(menubar).toBeInTheDocument()
		await expect(menubar).toBeEmptyDOMElement()
	},
}

// Same as `EmptyMenu`, but via `undefined` — `Menu` guards with `items?.map`.
// Passed through `render` rather than `args` so the value is unambiguously
// `undefined` at render time rather than merged away by the args system.
export const UndefinedMenu: Story = {
	render: (args) => <Menu { ...args } items={ undefined } />,
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			menubar = canvas.getByRole('menubar')

		await expect(menubar).toBeInTheDocument()
		await expect(within(menubar).queryAllByRole('menuitem')).toHaveLength(0)
	},
}

// `unstyled` does NOT remove `Menu`'s semantic base class (`inkq-menu`) — per
// `getClassName.tsx` the class list always starts with `namespace ?? baseName`
// (an inherited semantic `className` would replace it; none is passed here). It
// drops the CSS-module-hashed class normally appended alongside it, plus any
// config classes (the `orientation` modifier, not set in this story). `Menu`
// makes exactly one `styles(...)` call (`root`), so the root `<ul>` is the only
// element to check here; `Menu` does not forward `unstyled` to its `MenuItem`s, which
// resolve their own `unstyled` independently and are unaffected by this prop.
export const Unstyled: Story = {
	parameters: {
		layout: 'padded',
		controls: { exclude: ['unstyled'] },
	},
	args: { items: itemsFor('Home', 'Sign up') },
	render: (args) => (
		<Row>
			{ BOOLEAN_OPTIONS.map(unstyled => (
				<Group key={ String(unstyled) } label={ String(unstyled) }>
					<Menu { ...args } unstyled={ unstyled } />
				</Group>
			)) }
		</Row>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			[unstyledRoot, styledRoot] = canvas.getAllByRole('menubar')

		// The hashed CSS-module class is build-generated (e.g.
		// `_inkq-menu_1a2b3_1`), so assert on its presence/shape rather than a
		// literal hash: any class beyond the semantic base class means the
		// module class survived.
		const hasModuleClass = (el: Element, base: string) =>
			Array.from(el.classList).some(c => c !== base)

		await expect(styledRoot).toHaveClass('inkq-menu')
		await expect(unstyledRoot).toHaveClass('inkq-menu')
		expect(hasModuleClass(styledRoot, 'inkq-menu')).toBe(true)
		expect(hasModuleClass(unstyledRoot, 'inkq-menu')).toBe(false)
	},
}

/**
 * `orientation` only applies its module class at `depth === 0` (both stories here
 * render at the registered default `depth: 0`). `'vertical'` has a real SCSS rule
 * (`&--vertical`), so the modifier is emitted as a HASHED CSS-module class (e.g.
 * `_inkq-menu--vertical_gtzaz_6`), NOT the literal `inkq-menu--vertical` token —
 * `getConfigClass`'s `module` branch (`formatConfigClass`) returns the resolved hash
 * INSTEAD of the literal whenever one exists, it doesn't add both. `'horizontal'` has
 * no matching SCSS rule, so it has no hash to substitute and stays a literal class.
 * Because the hash token embeds the full literal name, a substring match is used for
 * the vertical case rather than pinning the compiled hash (which churns on every SCSS
 * edit).
 */
export const Orientation: Story = {
	parameters: {
		layout: 'padded',
		controls: { exclude: ['orientation'] },
	},
	args: { items: itemsFor('Home', 'Sign up') },
	render: (args) => (
		<Row>
			{ ORIENTATION_OPTIONS.map(orientation => (
				<Group key={ orientation } label={ orientation }>
					<Menu { ...args } orientation={ orientation } />
				</Group>
			)) }
		</Row>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			[horizontalRoot, verticalRoot] = canvas.getAllByRole('menubar')

		const hasModuleClass = (el: Element, base: string) => {
			const moduleClass = (moduleClasses as Record<string, string>)[base]
			return !!moduleClass && el.classList.contains(moduleClass)
		}

		const hasClassLike = (el: Element, substring: string) =>
			Array.from(el.classList).some(c => c.includes(substring))

		await expect(horizontalRoot).toHaveClass('inkq-menu--horizontal')
		expect(hasModuleClass(horizontalRoot, 'inkq-menu--horizontal')).toBe(false)

		expect(hasClassLike(verticalRoot, 'inkq-menu--vertical')).toBe(true)
		expect(hasModuleClass(verticalRoot, 'inkq-menu--vertical')).toBe(true)
	},
}

/**
 * `depth` gates the `orientation` module class (`depth === 0 && !!orientation` in
 * `Menu.tsx`), so the same orientation takes effect at `depth: 0` and is ignored at
 * `depth: 1`. Four groups: both orientations at each depth. `'horizontal'` has no SCSS
 * rule, so it is a literal class; `'vertical'` is a hashed class matched by substring
 * (see the `Orientation` story).
 */
export const Depth: Story = {
	parameters: {
		layout: 'padded',
		controls: { exclude: ['depth', 'orientation'] },
	},
	args: { items: itemsFor('Home', 'Sign up') },
	render: (args) => (
		<Row>
			{ DEPTH_OPTIONS.flatMap(depth => ORIENTATION_OPTIONS.map(orientation => (
				<Group key={ `${depth}-${orientation}` } label={ `depth: ${depth}, orientation: ${orientation}` }>
					<Menu { ...args } depth={ depth } orientation={ orientation } />
				</Group>
			))) }
		</Row>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			[topHorizontal, topVertical, nestedHorizontal, nestedVertical] = canvas.getAllByRole('menubar')

		const hasClassLike = (el: Element, substring: string) =>
			Array.from(el.classList).some(c => c.includes(substring))

		// depth 0: only its own orientation's class is present.
		await expect(topHorizontal).toHaveClass('inkq-menu--horizontal')
		expect(hasClassLike(topHorizontal, 'inkq-menu--vertical')).toBe(false)
		expect(hasClassLike(topVertical, 'inkq-menu--vertical')).toBe(true)
		expect(hasClassLike(topVertical, 'inkq-menu--horizontal')).toBe(false)

		// depth 1: neither orientation class is applied.
		for (const nested of [nestedHorizontal, nestedVertical]) {
			expect(hasClassLike(nested, 'inkq-menu--horizontal')).toBe(false)
			expect(hasClassLike(nested, 'inkq-menu--vertical')).toBe(false)
			await expect(nested).toHaveClass('inkq-menu')
		}
	},
}

/**
 * An explicit `active` prop marks exactly one item — its `route` must
 * match exactly, so `Discover` (whose own route is `/discover`, distinct from
 * its child `/discover/style`) stays unmarked here.
 */
export const ActiveItem: Story = {
	parameters: { layout: 'padded' },
	args: {
		active: NavRoutes.AUTH_SIGNUP,
		items: itemsFor('Home', 'Sign up', 'Discover'),
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			signUp = canvas.getByRole('menuitem', { name: 'Sign up' }),
			home = canvas.getByRole('menuitem', { name: 'Home' }),
			discover = canvas.getByRole('menuitem', { name: 'Discover' })
		await expect(signUp).toHaveAttribute('aria-current', 'page')
		await expect(signUp.closest('li')).toHaveAttribute('data-current')
		await expect(home).not.toHaveAttribute('aria-current')
		await expect(home.closest('li')).not.toHaveAttribute('data-current')
		await expect(discover).not.toHaveAttribute('aria-current')
		await expect(discover.closest('li')).not.toHaveAttribute('data-current')
	},
}

/**
 * `parameters.nextjs.appDirectory` is set HERE ONLY, never at the meta level
 * — the built `RouterDecorator` only mounts a real `PathnameContext` provider
 * when this flag is truthy, with a default fixture pathname of `'/'` if
 * `parameters.nextjs.navigation.pathname` is left unset. A meta-level default
 * would retroactively mark `Home` active in every OTHER story in this file.
 *
 * Renders `active: undefined` alongside `active: null` under the SAME
 * mocked pathname, to make `Menu.tsx`'s own resolution concrete:
 * `const currentRoute = typeof active === 'string' || active === null
 * ? active : (pathname as NavigationItem['route'])`. Only `undefined`
 * takes the `pathname` branch — `null` is passed straight through as "no
 * active item", explicitly SKIPPING the fallback, which is exactly how
 * `FooterArea` uses it (see `FooterArea.stories.tsx`).
 */
export const ActiveFromPathname: Story = {
	parameters: {
		layout: 'padded',
		nextjs: { appDirectory: true, navigation: { pathname: NavRoutes.AUTH_SIGNUP } },
	},
	render: (args) => (
		<Row>
			<Group label="active: undefined (falls back to pathname)">
				<Menu { ...args } active={ undefined } items={ itemsFor('Home', 'Sign up') } />
			</Group>
			<Group label="active: null (explicitly no active item)">
				<Menu { ...args } active={ null } items={ itemsFor('Home', 'Sign up') } />
			</Group>
		</Row>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			[fromPathname, explicitlyNone] = canvas.getAllByRole('menubar')

		// `undefined` falls back to the mocked pathname (`Sign up`).
		await expect(within(fromPathname).getByRole('menuitem', { name: 'Sign up' }))
			.toHaveAttribute('aria-current', 'page')
		await expect(within(fromPathname).getByRole('menuitem', { name: 'Home' }))
			.not.toHaveAttribute('aria-current')

		// `null` skips the fallback entirely — NEITHER item is marked active,
		// even though the same pathname is mocked for this group too.
		await expect(within(explicitlyNone).getByRole('menuitem', { name: 'Sign up' }))
			.not.toHaveAttribute('aria-current')
		await expect(within(explicitlyNone).getByRole('menuitem', { name: 'Home' }))
			.not.toHaveAttribute('aria-current')
	},
}

/**
 * `Menu.tsx` forwards its destructured `as` to the root `<Box>`, so the root
 * tag follows the prop. The `role="menubar"` is set unconditionally, so every
 * group is still found by that role whatever its tag.
 */
export const AsElement: Story = {
	parameters: {
		layout: 'padded',
		controls: { exclude: ['as'] },
	},
	args: { items: itemsFor('Home', 'Sign up') },
	render: (args) => (
		<Row>
			{ AS_OPTIONS.map(as => (
				<Group key={ as } label={ as }>
					<Menu { ...args } as={ as } />
				</Group>
			)) }
		</Row>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			menubars = canvas.getAllByRole('menubar')

		await expect(menubars).toHaveLength(AS_OPTIONS.length)
		await expect(menubars.map(menubar => menubar.tagName.toLowerCase())).toEqual([...AS_OPTIONS])

		for (const menubar of menubars)
			await expect(within(menubar).getAllByRole('menuitem')).toHaveLength(2)
	},
}
