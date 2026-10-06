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

// The `User` entry is the most useful dropdown fixture for interaction tests:
// it has a `menu` but NO `route`, so `MenuLabel` renders a plain `<span>`
// rather than a focusable `<a>` — which makes the dropdown trigger `<button>`
// the FIRST (and only) tabbable node in the canvas.
const USER_ITEM = itemsFor('User')

// `toKebabCase('User')` → `user`; `MenuItem` derives both ids from that.
const USER_TRIGGER_ID = 'user-dropdown-trigger',
	USER_MENU_ID = 'user-menu-list'

// Derived from the live fixture rather than hardcoded, so these don't rot if
// `NAVIGATION_DATA` gains/loses entries. `MenuLabel` (`MenuItem.tsx`) sets
// `role="menuitem"` UNCONDITIONALLY on its `sharedProps` — both the `route`
// branch (`<a>`) and the no-`route` branch (`<span>`) get it — so every
// top-level entry, including the route-less `User`, is reachable via
// `getByRole('menuitem')`.
const TOP_LEVEL_COUNT = NAVIGATION_DATA.length
const DROPDOWN_TRIGGER_COUNT = NAVIGATION_DATA.filter(item => item.menu?.length).length
const FLATTENED_LEAF_COUNT = NAVIGATION_DATA.reduce(
	(sum, item) => sum + (item.menu?.length || 1), 0
)

// `Menu.Props` (the `declare namespace` export) is just the raw `MenuProps`
// interface — it doesn't include `as`/`unstyled`/`attributes`/etc., which only
// exist on the actual accepted prop type, `PolymorphicProps<MenuProps, C>`.
// `Parameters<typeof Menu>[0]` reads that real, wrapped type straight off the
// component itself — the generic call signature's default `C` resolves to
// `'ul'` here, since `MenuSpecs`'s `defaults.as` is `'ul'`.
type MenuStoryProps = Parameters<typeof Menu>[0]
type Story = StoryObj<MenuStoryProps>

const meta: Meta<MenuStoryProps> = {
	component: Menu,
	title: 'Navigation/Menu',
	argTypes: {
		as: {
			control: false,
			description: 'Part of `PolymorphicProps`, but `Menu` ignores it: `Menu.tsx` hardcodes `as={ TAG }` (`TAG = \'ul\'`) on its root `<Box>` instead of forwarding the destructured `as` from props, so this control has NO effect on the rendered tag — unlike `Subnav`, which does honour it.',
		},
		hasDropdowns: {
			control: 'boolean',
			description: 'Forwarded to every `MenuItem`. When `true`, an item that has its own `menu` renders a trigger `<button>` plus a nested `Menu` (opened on hover/click). When `false`, such an item renders NO trigger and NO label of its own — `MenuItem` returns a flat ARRAY of its children\'s `<li>`s instead (see the `FlattenedItems` story).',
		},
		active: {
			control: 'text',
			description: 'A `NavRoute` to mark active (exact match against each item\'s own `route`); `null` to explicitly mark NO item active; or `undefined` to fall back to `usePathname()`. `Menu.tsx` resolves this itself, BEFORE forwarding: `const currentRoute = typeof active === \'string\' || active === null ? active : (pathname as NavigationItem[\'route\'])` — so a route string or `null` is passed down to every top-level `MenuItem` (and, one level further, into any dropdown\'s own nested `Menu`) AS-IS, while `undefined` is replaced with the real pathname first. `null` and `undefined` are NOT equivalent: only `undefined` triggers the pathname fallback. See the `ActiveItem` and `ActiveFromPathname` stories.',
		},
		items: {
			control: 'object',
			description: 'The `NavigationItem[]` to render (typed as `NavigationItem[\'menu\']`). Optional at the type level, so `undefined`/`[]` are both valid and produce an empty `role="menubar"`.',
		},
		orientation: {
			control: 'select',
			options: ORIENTATION_OPTIONS,
			description: 'Drives a `module`-config class on the root `<ul>`, computed as `{ [orientation]: depth === 0 && !!orientation }` — so it ONLY takes effect at the top level (`depth === 0`); a nested `Menu` (opened from a dropdown) always gets `depth > 0` and ignores this entirely. `\'vertical\'` has a real SCSS rule (`&--vertical`, switches to `flex-direction: column`), so it carries a real CSS-module hash when styled; `\'horizontal\'` has no matching SCSS rule at all, so `inkq-menu--horizontal` is a permanently unhashed literal class. See the `Orientation` story.',
		},
		unstyled: {
			control: 'boolean',
			description: 'Part of `PolymorphicProps` (via the shared `SpecsContract`), not `Menu`\'s own `MenuProps`. The semantic base class (`inkq-menu`) is ALWAYS emitted regardless of this prop — `unstyled` only suppresses the CSS-module-hashed class normally appended alongside it. See the `Unstyled` story.',
		},
	},
	args: {
		...getDefaultProps<Menu.Props>('Menu'),
		items: NAVIGATION_DATA,
	},
}

export default meta

// The full app nav tree. `NAVIGATION_DATA` has `TOP_LEVEL_COUNT` top-level
// entries, `DROPDOWN_TRIGGER_COUNT` of which (`Discover`, `Community`, `User`)
// carry their own `menu` and therefore render a dropdown trigger.
//
// `MenuLabel` sets `role="menuitem"` unconditionally on both its `route`
// branch (`<a>`) and its no-`route` branch (`<span>`) — so all top-level
// entries, including the route-less `User`, are reachable via
// `getByRole('menuitem')`.
export const Default: Story = {
	parameters: { layout: 'padded' },
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			menubar = canvas.getByRole('menubar')

		await expect(menubar.tagName).toBe('UL')

		// Only top-level labels are in the DOM while every dropdown is closed.
		await expect(within(menubar).getAllByRole('menuitem')).toHaveLength(TOP_LEVEL_COUNT)
		await expect(within(menubar).getByRole('menuitem', { name: 'User' })).toBeInTheDocument()
		await expect(within(menubar).getAllByRole('button')).toHaveLength(DROPDOWN_TRIGGER_COUNT)
	},
}

// Both values rendered side by side. With `hasDropdowns: false`, `MenuItem`
// replaces each parent item with its children (`Discover` → `Your Style`,
// `Community` → `Events`/`Feed`/`Spotlights`, `User` → `Profile`/`Settings`),
// so the `TOP_LEVEL_COUNT` top-level entries flatten into `FLATTENED_LEAF_COUNT`
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
		// and no-`route` branches, so all `TOP_LEVEL_COUNT` entries — including
		// the route-less `User` — are reachable via `getByRole`.
		await expect(within(withDropdowns).getAllByRole('menuitem')).toHaveLength(TOP_LEVEL_COUNT)
		await expect(within(withDropdowns).getByRole('menuitem', { name: 'User' })).toBeInTheDocument()
		await expect(within(withDropdowns).getAllByRole('button')).toHaveLength(DROPDOWN_TRIGGER_COUNT)

		await expect(within(flattened).getAllByRole('menuitem')).toHaveLength(FLATTENED_LEAF_COUNT)
		await expect(within(flattened).queryAllByRole('button')).toHaveLength(0)

		// The flattened branch drops the parent's own label entirely.
		await expect(within(flattened).queryByRole('menuitem', { name: 'User' })).not.toBeInTheDocument()
		await expect(within(flattened).getByRole('menuitem', { name: 'Profile' })).toBeInTheDocument()
	},
}

/**
 * `MenuItem.tsx` branch 1 (`if (!isDropdown)`): an item with no
 * `menu` renders a single `<li role="none">` wrapping `MenuLabel`, which is
 * `as={ route ? Link : 'span' }` — so an item WITH a `route` is
 * an `<a role="menuitem" href>`.
 *
 * `MenuLabel`'s `sharedProps` sets `role: 'menuitem'` UNCONDITIONALLY, before
 * branching on `route` — so the no-`route` branch's `<span>` also carries
 * `role="menuitem"`, and all 3 of these items (2 real fixture entries + 1
 * synthetic route-less one) are reachable via `getAllByRole('menuitem')`.
 *
 * Note `MenuLabel` is invoked as a plain function (`MenuLabel({ label, route })`)
 * with its `styles('label')` call commented out, so the `inkq-menu-item__label`
 * class is absent from the DOM — nothing here asserts on it.
 */
export const LeafItems: Story = {
	parameters: { layout: 'padded' },
	args: {
		items: [
			...itemsFor('Home', 'Marketplace'),
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
			marketplace = within(menubar).getByRole('menuitem', { name: 'Marketplace' }),
			noRoute = within(menubar).getByRole('menuitem', { name: 'No route (span)' })

		await expect(home.tagName).toBe('A')
		await expect(home).toHaveAttribute('href', NavRoutes.HOME)
		await expect(marketplace).toHaveAttribute('href', NavRoutes.MARKETPLACE)

		await expect(noRoute.tagName).toBe('SPAN')
		await expect(noRoute).not.toHaveAttribute('href')
	},
}

/**
 * `MenuItem.tsx`'s final branch (reached when `isDropdown && hasDropdowns`,
 * after the `!isDropdown` and `!hasDropdowns` early returns): an item that has
 * a `menu` renders its own label PLUS an `unstyled` `Button` trigger carrying
 * `aria-controls` / `aria-expanded` / `aria-haspopup` and an `aria-hidden` caret
 * `Icon` (`caret-down` closed, `caret-up` open). The nested `Menu` is mounted
 * only while open (`{ isOpen && ... }`).
 *
 * The ids are derived from the label: `toKebabCase('User')` → `user`, giving
 * `user-dropdown-trigger` / `user-menu-list`.
 *
 * Quirk: `MenuItem` passes its `attributes` bag to `Button` AFTER `Button`
 * spreads its own (`{ ...rest }` wins in `Button.tsx`), so the trigger keeps
 * these aria attributes but loses `Button`'s own derived `aria-label` — the
 * trigger has no accessible name, hence the unfiltered `getByRole('button')`.
 *
 * `User`'s own label has no `route`, so its `<span>` renders via `MenuLabel`'s
 * no-`route` branch — but `sharedProps` sets `role: 'menuitem'`
 * unconditionally before that branch, so the `<span>` still carries
 * `role="menuitem"` and is reachable via `getByRole('menuitem', { name: 'User' })`.
 *
 * Verified against the live `Icon.tsx`: `buildIcon`'s LUCIDE branch (used for
 * `caret-down`/`caret-up`, as opposed to its separate social-brand SVG branch) sets NO
 * `attributes` literal of its own — its `sharedProps` is just `{ ...others,
 * ...styles('glyph') }`, and `attributes` isn't one of `extractOthers`'s stripped
 * keys, so it passes straight through in `others`. `MenuItem`'s own
 * `attributes={ { aria: { hidden: true } } }` therefore reaches the rendered icon
 * completely unmodified — the caret genuinely IS `aria-hidden="true"`. (The social
 * icon branch is different: it always sets its OWN `attributes: { aria: { label: type
 * } }`, overwriting anything a caller passes — not relevant here.)
 */
export const DropdownItems: Story = {
	parameters: { layout: 'padded' },
	args: {
		hasDropdowns: true,
		items: USER_ITEM,
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			trigger = canvas.getByRole('button')

		const userLabel = canvas.getByRole('menuitem', { name: 'User' })
		await expect(userLabel.tagName).toBe('SPAN')

		await expect(trigger).toHaveAttribute('id', USER_TRIGGER_ID)
		await expect(trigger).toHaveAttribute('type', 'button')
		await expect(trigger).toHaveAttribute('aria-controls', USER_MENU_ID)
		await expect(trigger).toHaveAttribute('aria-haspopup', 'true')
		await expect(trigger).toHaveAttribute('aria-expanded', 'false')

		// A CSS selector, not a role query, because `aria-hidden="true"` removes the
		// icon from the accessibility tree — there's no role to query it by. Assert
		// non-null explicitly first: `toBeInTheDocument()` throws an unhelpful,
		// message-less error when handed `null` outright, rather than failing with a
		// readable diff.
		const icon = trigger.querySelector('[aria-hidden="true"]')
		await expect(icon).not.toBeNull()
		await expect(icon).toBeInTheDocument()

		// Closed by default: the nested menu isn't mounted at all.
		await expect(canvas.getAllByRole('menubar')).toHaveLength(1)
		await expect(canvas.queryByRole('menuitem', { name: 'Profile' })).not.toBeInTheDocument()
	},
}

/**
 * `MenuItem.tsx` branch 3 (the final `return menu?.map(...)`):
 * with `hasDropdowns: false`, an item that has a `menu` returns an ARRAY of
 * `<li role="none">`s — one per child — and its OWN label is never rendered.
 *
 * Note this branch maps `MenuLabel(item)` directly, so it does not recurse:
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
 * `Community` is two levels deep, so opening it mounts a nested `Menu` whose
 * own `Events`/`Feed` items are themselves dropdowns (the nested `Menu` gets no
 * `hasDropdowns` prop, so it falls back to the registered default, `true`).
 *
 * `Menu`/`MenuItem` have no `routes` prop of their own — they only ever render
 * whatever `items` they're handed, at every depth. Filtering (via the
 * recursive `filterNavigation`) happens upstream, in `Navbar`/`Subnav`, before
 * `items` ever reaches `Menu`. Quirk: every nested list is `role="menubar"`
 * (hardcoded in `Menu.tsx`), not `role="menu"`.
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
			trigger = canvas.getByRole('button')

		// Opened by hover rather than click: a pointer click is always preceded
		// by the `mouseenter` that already opens the item, so the click would
		// only toggle it back shut (see the `ClickToOpen` story).
		await user.hover(trigger)

		// Level 2 is mounted as a second `menubar`.
		await canvas.findByRole('menuitem', { name: 'Events' })
		await expect(canvas.getAllByRole('menubar')).toHaveLength(2)

		const eventsTrigger = canvas.getAllByRole('button')
			.find(button => button.id === 'events-dropdown-trigger')!

		// Still inside the `Community` <li>, so its mouse-leave timer never starts.
		await user.hover(eventsTrigger)

		// Level 3.
		await canvas.findByRole('menuitem', { name: 'Your Lineup' })
		await expect(canvas.getAllByRole('menubar')).toHaveLength(3)
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
// `getClassName.tsx` the base class is now ALWAYS emitted
// (`classList = [baseClass]` unconditionally). It only suppresses the
// CSS-module-hashed class normally appended alongside it. `Menu` makes exactly
// one `styles(...)` call (`root`), so the root `<ul>` is the only element to
// check here; `MenuItem` resolves its own `unstyled` independently and is
// unaffected by this prop.
export const Unstyled: Story = {
	parameters: {
		layout: 'padded',
		controls: { exclude: ['unstyled'] },
	},
	args: { items: itemsFor('Home', 'Marketplace') },
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
	args: { items: itemsFor('Home', 'Marketplace') },
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
 * Pointer-driven toggling.
 *
 * IMPORTANT: the dropdown `<li>` also opens on `mouseenter` (`MenuItem.tsx`'s
 * `handleMouseEnter`), and any real pointer click is preceded by a pointer move onto
 * the element — so a click can never be observed from a closed state via the
 * mouse. `userEvent.setup()` is used here (rather than the per-call direct API)
 * precisely so pointer position PERSISTS between steps: the hover fires once,
 * and each subsequent click is a pure toggle instead of re-firing `mouseenter`.
 */
export const ClickToOpen: Story = {
	parameters: { layout: 'padded' },
	args: {
		hasDropdowns: true,
		items: USER_ITEM,
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			user = userEvent.setup(),
			trigger = canvas.getByRole('button')

		await expect(trigger).toHaveAttribute('aria-expanded', 'false')

		// Moving the pointer onto the item opens it before the click lands.
		await user.hover(trigger)
		await expect(trigger).toHaveAttribute('aria-expanded', 'true')

		const submenu = await canvas.findByRole('menuitem', { name: 'Profile' })
		await expect(submenu).toBeInTheDocument()
		await expect(submenu.closest('[role="menubar"]')).toHaveAttribute('id', USER_MENU_ID)
		await expect(submenu.closest('[role="menubar"]'))
			.toHaveAttribute('aria-labelledby', USER_TRIGGER_ID)

		// `handleToggle` inverts whatever the hover left behind.
		await user.click(trigger)
		await expect(trigger).toHaveAttribute('aria-expanded', 'false')
		await expect(canvas.queryByRole('menuitem', { name: 'Profile' })).not.toBeInTheDocument()

		await user.click(trigger)
		await expect(trigger).toHaveAttribute('aria-expanded', 'true')
		await expect(await canvas.findByRole('menuitem', { name: 'Settings' })).toBeInTheDocument()
	},
}

/**
 * Hover opens immediately; leaving closes only after a 300ms
 * `setTimeout` (`MenuItem.tsx`'s `handleMouseLeave`), which is why the post-`unhover`
 * assertion is wrapped in `waitFor` rather than asserted synchronously.
 * A single `userEvent.setup()` instance keeps pointer position coherent
 * between the hover and the unhover.
 */
export const HoverToOpen: Story = {
	parameters: { layout: 'padded' },
	args: {
		hasDropdowns: true,
		items: USER_ITEM,
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			user = userEvent.setup(),
			trigger = canvas.getByRole('button')

		await expect(trigger).toHaveAttribute('aria-expanded', 'false')

		await user.hover(trigger)
		await expect(trigger).toHaveAttribute('aria-expanded', 'true')
		await expect(await canvas.findByRole('menuitem', { name: 'Profile' })).toBeInTheDocument()

		await user.unhover(trigger)

		await waitFor(
			() => expect(trigger).toHaveAttribute('aria-expanded', 'false'),
			{ timeout: 2000 }
		)
		await expect(canvas.queryByRole('menuitem', { name: 'Profile' })).not.toBeInTheDocument()
	},
}

/**
 * `useOutsideClick` (subscribed on `document` for `mousedown`/`touchstart`)
 * calls `handleToggle` only while `hasDropdowns && isDropdown && isOpen`, so a
 * click anywhere outside the item closes it.
 *
 * Opened with the keyboard on purpose: opening by hover would leave the pointer
 * inside the item, and moving it out to the outside button would ALSO start the
 * 300ms mouse-leave timer, making it ambiguous which mechanism did the closing.
 */
export const OutsideClick: Story = {
	parameters: { layout: 'padded' },
	args: {
		hasDropdowns: true,
		items: USER_ITEM,
	},
	render: (args) => (
		<div style={ { display: 'flex', gap: 48, alignItems: 'flex-start' } }>
			<Menu { ...args } />
			<button type="button">Outside</button>
		</div>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			menubar = canvas.getByRole('menubar'),
			trigger = within(menubar).getByRole('button'),
			outside = canvas.getByRole('button', { name: 'Outside' })

		// Focus assertions first — a click would focus the trigger and make a
		// later `tab()` move focus away instead of onto it.
		await userEvent.tab()
		await expect(trigger).toHaveFocus()

		await userEvent.keyboard('{Enter}')
		await waitFor(() => expect(trigger).toHaveAttribute('aria-expanded', 'true'))
		await expect(await canvas.findByRole('menuitem', { name: 'Profile' })).toBeInTheDocument()

		await userEvent.click(outside)

		await waitFor(() => expect(trigger).toHaveAttribute('aria-expanded', 'false'))
		await expect(canvas.queryByRole('menuitem', { name: 'Profile' })).not.toBeInTheDocument()
	},
}

/**
 * The trigger is a real `<button>` (`Button` with `unstyled`), so both Enter
 * and Space activate it via the browser's own native button-activation
 * behavior. The `User` fixture has no `route`, so its label is a plain
 * `<span role="menuitem" tabIndex={-1}>` (see the `DropdownItems` story's
 * note) — excluded from the natural Tab order, so the trigger is the first
 * Tab stop in the canvas.
 *
 * IMPORTANT, verified against the live `MenuItem.tsx` `handleKeyDown`: Enter
 * is ALSO one of the keys the wrapping `<li>`'s own `onKeyDown` treats as an
 * "open" key while closed (alongside `ArrowDown`/Space), and opening via THAT
 * path moves focus to the first nested `[role="menuitem"]` a tick later
 * (`requestAnimationFrame`). So after pressing Enter, focus is no longer on
 * the trigger — it must be refocused explicitly before the follow-up Space.
 *
 * HARDENING NOTE: every `aria-expanded` check immediately following a
 * keyboard action below is wrapped in `waitFor` rather than asserted bare —
 * this story was observed to fail intermittently (pass on one run, fail the
 * next) when asserted synchronously, almost certainly racing the same
 * `requestAnimationFrame` focus shift (and/or React's commit timing) rather
 * than a real behavioral difference between runs.
 */
export const KeyboardActivation: Story = {
	parameters: { layout: 'padded' },
	args: {
		hasDropdowns: true,
		items: USER_ITEM,
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			trigger = canvas.getByRole('button')

		await expect(trigger).not.toHaveFocus()

		await userEvent.tab()
		await expect(trigger).toHaveFocus()

		await userEvent.keyboard('{Enter}')
		await waitFor(() => expect(trigger).toHaveAttribute('aria-expanded', 'true'))
		await expect(await canvas.findByRole('menuitem', { name: 'Profile' })).toBeInTheDocument()

		// Enter's `<li>`-level "open" handling shifted focus to `Profile` —
		// refocus the trigger explicitly rather than assuming it kept focus.
		trigger.focus()
		await expect(trigger).toHaveFocus()

		await userEvent.keyboard(' ')
		await waitFor(() => expect(trigger).toHaveAttribute('aria-expanded', 'false'))
		await expect(canvas.queryByRole('menuitem', { name: 'Profile' })).not.toBeInTheDocument()

		await userEvent.keyboard('{Enter}')
		await waitFor(() => expect(trigger).toHaveAttribute('aria-expanded', 'true'))

		// Explicit blur rather than tabbing away: where a further `tab()` lands
		// is browser/environment-dependent and not worth asserting on.
		trigger.blur()
		await expect(trigger).not.toHaveFocus()
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
		active: NavRoutes.MARKETPLACE,
		items: itemsFor('Home', 'Marketplace', 'Discover'),
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			marketplace = canvas.getByRole('menuitem', { name: 'Marketplace' }),
			home = canvas.getByRole('menuitem', { name: 'Home' })
		await expect(marketplace).toHaveAttribute('aria-current', 'page')
		await expect(marketplace.closest('li')).toHaveAttribute('data-current')
		await expect(home).not.toHaveAttribute('aria-current')
		await expect(home.closest('li')).not.toHaveAttribute('data-current')
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
		nextjs: { appDirectory: true, navigation: { pathname: NavRoutes.MARKETPLACE } },
	},
	render: (args) => (
		<Row>
			<Group label="active: undefined (falls back to pathname)">
				<Menu { ...args } active={ undefined } items={ itemsFor('Home', 'Marketplace') } />
			</Group>
			<Group label="active: null (explicitly no active item)">
				<Menu { ...args } active={ null } items={ itemsFor('Home', 'Marketplace') } />
			</Group>
		</Row>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			[fromPathname, explicitlyNone] = canvas.getAllByRole('menubar')

		// `undefined` falls back to the mocked pathname (`Marketplace`).
		await expect(within(fromPathname).getByRole('menuitem', { name: 'Marketplace' }))
			.toHaveAttribute('aria-current', 'page')
		await expect(within(fromPathname).getByRole('menuitem', { name: 'Home' }))
			.not.toHaveAttribute('aria-current')

		// `null` skips the fallback entirely — NEITHER item is marked active,
		// even though the same pathname is mocked for this group too.
		await expect(within(explicitlyNone).getByRole('menuitem', { name: 'Marketplace' }))
			.not.toHaveAttribute('aria-current')
		await expect(within(explicitlyNone).getByRole('menuitem', { name: 'Home' }))
			.not.toHaveAttribute('aria-current')
	},
}
