import { expect, userEvent, waitFor, within } from 'storybook/test'
import { getDefaultProps } from '@/lib/registries'
import { Menu } from './Menu'
import {
	NAV_ROUTES,
	NAVIGATION_DATA,
	type NavigationItem,
} from '@/utils/navigation'
import type { ReactNode } from 'react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

// `Menu`'s only enumerable prop is the boolean `hasDropdowns` (`menu`/`routes`
// are data, not enums), so — same as `Badge`/`Container` — this stays local
// instead of living in a shared `options.story.ts`.
const BOOLEAN_OPTIONS = [true, false] as const

const Row = ({ children }: { children: ReactNode }) => (
	<div style={ { display: 'flex', gap: 48, flexWrap: 'wrap', alignItems: 'flex-start' } }>
		{ children }
	</div>
)

const Group = ({ label, children }: { label: string, children: ReactNode }) => (
	<div style={ { display: 'flex', flexDirection: 'column', gap: 8 } }>
		<span style={ { font: 'var(--inkq-font-control)', letterSpacing: '.15em', textTransform: 'uppercase', opacity: 0.6 } }>
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

// `Menu.Props` (the `declare namespace` export) is just the raw `MenuProps`
// interface — it doesn't include `as`/`unstyled`/`attributes`/etc., which only
// exist on the actual accepted prop type, `PolymorphicProps<MenuProps, C>`.
// `Parameters<typeof Menu>[0]` reads that real, wrapped type straight off the
// component itself — the generic call signature's default `C` resolves to
// `'ul'` here, since `MenuSpecs`'s `default.component` is `'ul'`.
type MenuStoryProps = Parameters<typeof Menu>[0]
type Story = StoryObj<MenuStoryProps>

const meta: Meta<MenuStoryProps> = {
	component: Menu,
	title: 'Layout/Menu',
	argTypes: {
		hasDropdowns: {
			control: 'boolean',
			description: 'Forwarded to every `MenuItem`. When `true`, an item that has its own `menu` renders a trigger `<button>` plus a nested `Menu` (opened on hover/click). When `false`, such an item renders NO trigger and NO label of its own — `MenuItem` returns a flat ARRAY of its children\'s `<li>`s instead (see the `FlattenedItems` story).',
		},
		menu: {
			control: 'object',
			description: 'The `NavigationItem[]` to render. Optional at the type level (`NavigationItem[\'menu\']`), so `undefined`/`[]` are both valid and produce an empty `role="menubar"`.',
		},
		routes: {
			control: 'multi-select',
			options: Object.values(NAV_ROUTES),
			description: 'Accepted and destructured, but `Menu` does NOT forward it to `MenuItem` — so it never reaches the recursive nested `Menu` either, and no filtering happens at this level. Filtering is done by the callers (`Navbar`/`Subnav`) via `filterNavigation` before `menu` is handed over.',
		},
		unstyled: {
			control: 'boolean',
			description: 'Part of `PolymorphicProps` (via the shared `SpecsContract`), not `Menu`\'s own `MenuProps`. The semantic base class (`inkq-menu`) is ALWAYS emitted regardless of this prop — `unstyled` only suppresses the CSS-module-hashed class normally appended alongside it. See the `Unstyled` story.',
		},
	},
	args: {
		...getDefaultProps<Menu.Props>('Menu'),
		menu: NAVIGATION_DATA,
	},
}

export default meta

// The full app nav tree. `NAVIGATION_DATA` has 7 top-level entries, 3 of which
// (`Discover`, `Community`, `User`) carry their own `menu` and therefore render
// a dropdown trigger.
export const Default: Story = {
	parameters: { layout: 'padded' },
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			menubar = canvas.getByRole('menubar')

		await expect(menubar.tagName).toBe('UL')

		// Only top-level labels are in the DOM while every dropdown is closed.
		await expect(within(menubar).getAllByRole('menuitem')).toHaveLength(7)
		await expect(within(menubar).getAllByRole('button')).toHaveLength(3)
	},
}

// Both values rendered side by side. With `hasDropdowns: false`, `MenuItem`
// replaces each parent item with its children (`Discover` → `Your Style`,
// `Community` → `Events`/`Feed`/`Spotlights`, `User` → `Profile`/`Settings`),
// so the 7 top-level entries flatten into 10 leaf entries and no trigger
// buttons at all.
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

		await expect(within(withDropdowns).getAllByRole('menuitem')).toHaveLength(7)
		await expect(within(withDropdowns).getAllByRole('button')).toHaveLength(3)

		await expect(within(flattened).getAllByRole('menuitem')).toHaveLength(10)
		await expect(within(flattened).queryAllByRole('button')).toHaveLength(0)

		// The flattened branch drops the parent's own label entirely.
		await expect(within(flattened).queryByText('User')).not.toBeInTheDocument()
		await expect(within(flattened).getByRole('menuitem', { name: 'Profile' })).toBeInTheDocument()
	},
}

/**
 * `MenuItem.tsx` branch 1 (`if (!isDropdown)`, lines 94–106): an item with no
 * `menu` renders a single `<li role="none">` wrapping `MenuLabel`, which is
 * `as={ route ? Link : 'span' }` (lines 27–36) — so an item WITH a `route` is
 * an `<a role="menuitem" href>` and an item WITHOUT one is a non-focusable
 * `<span role="menuitem">`.
 *
 * Note `MenuLabel` is invoked as a plain function (`MenuLabel({ label, route })`)
 * with its `styles('label')` call commented out, so the `inkq-menu-item__label`
 * class is absent from the DOM — nothing here asserts on it.
 */
export const LeafItems: Story = {
	parameters: { layout: 'padded' },
	args: {
		menu: [
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

		// Every leaf is wrapped in its own `<li role="none">`.
		const listItems = menubar.querySelectorAll(':scope > li')
		await expect(listItems).toHaveLength(3)
		listItems.forEach(li => expect(li).toHaveAttribute('role', 'none'))

		const [home, marketplace, noRoute] = items

		await expect(home.tagName).toBe('A')
		await expect(home).toHaveAttribute('href', NAV_ROUTES.HOME)
		await expect(marketplace).toHaveAttribute('href', NAV_ROUTES.MARKETPLACE)

		await expect(noRoute.tagName).toBe('SPAN')
		await expect(noRoute).not.toHaveAttribute('href')
	},
}

/**
 * `MenuItem.tsx` branch 2 (`if (hasDropdowns)`, lines 113–154): an item that has
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
 */
export const DropdownItems: Story = {
	parameters: { layout: 'padded' },
	args: {
		hasDropdowns: true,
		menu: USER_ITEM,
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			trigger = canvas.getByRole('button')

		await expect(canvas.getByRole('menuitem', { name: 'User' }).tagName).toBe('SPAN')

		await expect(trigger).toHaveAttribute('id', USER_TRIGGER_ID)
		await expect(trigger).toHaveAttribute('type', 'button')
		await expect(trigger).toHaveAttribute('aria-controls', USER_MENU_ID)
		await expect(trigger).toHaveAttribute('aria-haspopup', 'true')
		await expect(trigger).toHaveAttribute('aria-expanded', 'false')

		await expect(trigger.querySelector('[aria-hidden="true"]')).toBeInTheDocument()

		// Closed by default: the nested menu isn't mounted at all.
		await expect(canvas.getAllByRole('menubar')).toHaveLength(1)
		await expect(canvas.queryByRole('menuitem', { name: 'Profile' })).not.toBeInTheDocument()
	},
}

/**
 * `MenuItem.tsx` branch 3 (the final `return menu?.map(...)`, lines 158–169):
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
		menu: itemsFor('Community'),
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
 * Quirk: `Menu` never forwards `routes` to `MenuItem`, so `MenuItem` always
 * passes `routes: undefined` down to the nested `Menu` — nothing is filtered at
 * any depth. Quirk 2: every nested list is `role="menubar"` (hardcoded in
 * `Menu.tsx`), not `role="menu"`.
 */
export const NestedDropdowns: Story = {
	parameters: { layout: 'padded' },
	args: {
		hasDropdowns: true,
		menu: itemsFor('Community'),
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

// `menu` is optional at the type level, so an empty array still renders the
// root `<ul role="menubar">` — just with no children.
export const EmptyMenu: Story = {
	args: { menu: [] },
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			menubar = canvas.getByRole('menubar')

		await expect(menubar).toBeInTheDocument()
		await expect(menubar).toBeEmptyDOMElement()
	},
}

// Same as `EmptyMenu`, but via `undefined` — `Menu` guards with `menu?.map`.
// Passed through `render` rather than `args` so the value is unambiguously
// `undefined` at render time rather than merged away by the args system.
export const UndefinedMenu: Story = {
	render: (args) => <Menu { ...args } menu={ undefined } />,
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			menubar = canvas.getByRole('menubar')

		await expect(menubar).toBeInTheDocument()
		await expect(within(menubar).queryAllByRole('menuitem')).toHaveLength(0)
	},
}

export const LongLabels: Story = {
	parameters: { layout: 'padded' },
	args: {
		menu: [
			{ label: 'A navigation label that is unreasonably long for a horizontal menu bar', route: NAV_ROUTES.DISCOVER },
			{
				label: 'Another extremely long label, this one with a dropdown attached to it',
				route: NAV_ROUTES.COMMUNITY,
				menu: [
					{ label: 'A nested item whose label also refuses to wrap politely', route: NAV_ROUTES.COMMUNITY_FEED },
				],
			},
			{ label: 'Short', route: NAV_ROUTES.MARKETPLACE },
		],
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
	args: { menu: itemsFor('Home', 'Marketplace') },
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
 * Pointer-driven toggling.
 *
 * IMPORTANT: the dropdown `<li>` also opens on `mouseenter` (`MenuItem.tsx`
 * lines 58–61), and any real pointer click is preceded by a pointer move onto
 * the element — so a click can never be observed from a closed state via the
 * mouse. `userEvent.setup()` is used here (rather than the per-call direct API)
 * precisely so pointer position PERSISTS between steps: the hover fires once,
 * and each subsequent click is a pure toggle instead of re-firing `mouseenter`.
 */
export const ClickToOpen: Story = {
	parameters: { layout: 'padded' },
	args: {
		hasDropdowns: true,
		menu: USER_ITEM,
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
 * `setTimeout` (`MenuItem.tsx` lines 63–65), which is why the post-`unhover`
 * assertion is wrapped in `waitFor` rather than asserted synchronously.
 * A single `userEvent.setup()` instance keeps pointer position coherent
 * between the hover and the unhover.
 */
export const HoverToOpen: Story = {
	parameters: { layout: 'padded' },
	args: {
		hasDropdowns: true,
		menu: USER_ITEM,
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
		menu: USER_ITEM,
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
		await expect(trigger).toHaveAttribute('aria-expanded', 'true')
		await expect(await canvas.findByRole('menuitem', { name: 'Profile' })).toBeInTheDocument()

		await userEvent.click(outside)

		await waitFor(() => expect(trigger).toHaveAttribute('aria-expanded', 'false'))
		await expect(canvas.queryByRole('menuitem', { name: 'Profile' })).not.toBeInTheDocument()
	},
}

/**
 * The trigger is a real `<button>` (`Button` with `unstyled`), so both Enter and
 * Space activate it. The `User` fixture has no `route`, so its label is a
 * non-focusable `<span>` and the trigger is the first tab stop in the canvas.
 */
export const KeyboardActivation: Story = {
	parameters: { layout: 'padded' },
	args: {
		hasDropdowns: true,
		menu: USER_ITEM,
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			trigger = canvas.getByRole('button')

		await expect(trigger).not.toHaveFocus()

		await userEvent.tab()
		await expect(trigger).toHaveFocus()

		await userEvent.keyboard('{Enter}')
		await expect(trigger).toHaveAttribute('aria-expanded', 'true')
		await expect(await canvas.findByRole('menuitem', { name: 'Profile' })).toBeInTheDocument()

		await userEvent.keyboard(' ')
		await expect(trigger).toHaveAttribute('aria-expanded', 'false')
		await expect(canvas.queryByRole('menuitem', { name: 'Profile' })).not.toBeInTheDocument()

		await userEvent.keyboard('{Enter}')
		await expect(trigger).toHaveAttribute('aria-expanded', 'true')

		// Explicit blur rather than tabbing away: where a further `tab()` lands
		// is browser/environment-dependent and not worth asserting on.
		trigger.blur()
		await expect(trigger).not.toHaveFocus()
	},
}
