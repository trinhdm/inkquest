import { expect, userEvent, waitFor, within } from 'storybook/test'
import { getDefaultProps } from '@/lib/registries'
import { MenuItem } from './MenuItem'
import {
	NAV_ROUTES,
	NAVIGATION_DATA,
	type NavigationItem,
} from '@/utils/navigation'
import type { ReactNode } from 'react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

// `MenuItem`'s only enumerable prop is the boolean `hasDropdowns`, so — same
// as `Menu`/`Badge`/`Container` — this stays local instead of living in a
// shared `options.story.ts`.
const BOOLEAN_OPTIONS = [true, false] as const

const Row = ({ children }: { children: ReactNode }) => (
	<div style={ { display: 'flex', gap: 48, flexWrap: 'wrap', alignItems: 'flex-start' } }>
		{ children }
	</div>
)

// A plain wrapper, NOT its own `<ul>` — the single `role="menubar"` list every
// story renders inside comes from the meta-level `MenubarWrapper` decorator
// below; nesting a second `<ul>` per group would produce invalid `ul > ul`
// structure with no `<li>` in between.
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

// `MenuItem` always renders `<li role="none">` (or an array of them), which
// is only valid semantics inside a real `role="menubar"` list — every story
// in this file is mounted inside exactly one, via this meta-level decorator.
const MenubarWrapper = ({ children }: { children: ReactNode }) => (
	<ul role="menubar" style={ { display: 'flex', gap: 24, flexWrap: 'wrap', listStyle: 'none', margin: 0, padding: 0 } }>
		{ children }
	</ul>
)

// The `User` entry is the most useful dropdown fixture: it has a `menu` but
// NO `route`, so `MenuLabel` renders a plain `<span>` rather than a focusable
// `<a>` — which makes the dropdown trigger `<button>` the FIRST (and only)
// tabbable node in the canvas, giving deterministic focus assertions.
const USER_ITEM = NAVIGATION_DATA.find((item): item is NavigationItem => item.label === 'User')!

// `toKebabCase('User')` → `user`; `MenuItem` derives both ids from that.
const USER_TRIGGER_ID = 'user-dropdown-trigger',
	USER_MENU_ID = 'user-menu-list'

// `MenuItem.Props` (the `declare namespace` export) is just the raw
// `MenuItemProps` interface — it doesn't include `as`/`unstyled`/`attributes`/
// etc., which only exist on the actual accepted prop type,
// `PolymorphicProps<MenuItemProps, C>`. `Parameters<typeof MenuItem>[0]` reads
// that real, wrapped type straight off the component itself — the generic
// call signature's default `C` resolves to `'li'` here, since
// `MenuItemSpecs`'s `defaults.as` is `'li'`.
type MenuItemStoryProps = Parameters<typeof MenuItem>[0]
type Story = StoryObj<MenuItemStoryProps>

const meta: Meta<MenuItemStoryProps> = {
	component: MenuItem,
	title: 'Navigation/Menu/Menu.Item',
	decorators: [(Story) => <MenubarWrapper><Story /></MenubarWrapper>],
	argTypes: {
		hasDropdowns: {
			control: 'boolean',
			description: 'Selects between `MenuItem`\'s three render branches when `menu` is present: `undefined`/`false` returns a flat ARRAY of the children\'s `<li>`s (the item\'s own label is dropped); `true` renders the label plus a trigger `<button>` and a nested `Menu`. Has no effect when `menu` is absent.',
		},
		label: {
			control: 'text',
			description: 'Required. Rendered via `MenuLabel` as either an `<a role="menuitem">` (when `route` is set) or a `<span role="menuitem" tabIndex={-1}>` (when it isn\'t) — `MenuLabel`\'s `sharedProps` sets `role: \'menuitem\'` unconditionally, before branching on `route`, so both forms are reachable via `getByRole(\'menuitem\')`. The `<span>` form\'s `tabIndex={-1}` keeps it out of the natural Tab order (only programmatically focusable), so it\'s still not itself a real Tab stop — but it IS reachable via `ArrowDown`/`ArrowUp` cycling when it\'s a submenu item (see `KeyboardFocusRouteless`). See also the `Leaf`/`DropdownTrigger` stories.',
		},
		menu: {
			control: 'object',
			description: 'A `NavigationItem[]`. When present, the item is a "dropdown" — which of the two dropdown branches renders is controlled by `hasDropdowns`.',
		},
		route: {
			control: 'select',
			options: [undefined, ...Object.values(NAV_ROUTES)],
			description: 'When set, `MenuLabel` renders an `<a href>` (via `next/link`) instead of a `<span tabIndex={-1}>` that\'s excluded from the natural Tab order.',
		},
		unstyled: {
			control: 'boolean',
			description: 'Part of `PolymorphicProps` (via the shared `SpecsContract`), not `MenuItem`\'s own props. The semantic base class (`inkq-menu-item`) is ALWAYS emitted regardless of this prop — `unstyled` only suppresses the CSS-module-hashed class normally appended alongside it.',
		},
	},
	args: {
		...getDefaultProps<MenuItem.Props>('MenuItem'),
		label: 'Home',
		route: NAV_ROUTES.HOME,
	},
}

export default meta

export const Default: Story = {
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			item = canvas.getByRole('menuitem')

		await expect(item.tagName).toBe('A')
		await expect(item).toHaveAttribute('href', NAV_ROUTES.HOME)
		await expect(item.closest('li')).toHaveAttribute('role', 'none')
	},
}

/**
 * `MenuItem.tsx`'s non-dropdown branch (`!isDropdown`): a
 * single `<li role="none">` wrapping `MenuLabel`, which is `as={ route ? Link
 * : 'span' }` — so an item WITH a `route` is a focusable `<a role="menuitem"
 * href>`.
 *
 * `MenuLabel`'s `sharedProps` sets `role: 'menuitem'` unconditionally, so the
 * no-`route` branch's `<span>` ALSO carries `role="menuitem"` — reachable via
 * `getByRole('menuitem', ...)` just like the `<a>` — but it's `tabIndex={-1}`
 * (programmatically focusable, but excluded from the natural Tab order), so
 * it's still not a real TAB stop.
 */
export const Leaf: Story = {
	parameters: { controls: { exclude: ['route'] } },
	render: (args) => (
		<Row>
			<Group label="route: set">
				<MenuItem { ...args } label="Home" route={ NAV_ROUTES.HOME } />
			</Group>
			<Group label="route: undefined">
				<MenuItem { ...args } label="No route" route={ undefined } />
			</Group>
		</Row>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			withRoute = canvas.getByRole('menuitem', { name: 'Home' }),
			withoutRoute = canvas.getByRole('menuitem', { name: 'No route' })

		await expect(withRoute.tagName).toBe('A')
		await expect(withRoute).toHaveAttribute('href', NAV_ROUTES.HOME)

		await expect(withoutRoute.tagName).toBe('SPAN')
		await expect(withoutRoute).not.toHaveAttribute('href')

		// Only the `<a>` is a real Tab stop — the `<span>` is `tabIndex={-1}`
		// (programmatically focusable, not in the natural Tab order).
		await userEvent.tab()
		await expect(withRoute).toHaveFocus()
	},
}

/**
 * `MenuItem.tsx`'s `isDropdown && !hasDropdowns` branch:
 * returns an ARRAY of the children's own `<li>`s — the parent item's own
 * label (`User`) is never rendered at all, and there's no trigger `<button>`.
 */
export const FlattenedDropdown: Story = {
	args: {
		hasDropdowns: false,
		label: 'User',
		route: undefined,
		menu: USER_ITEM.menu,
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			items = canvas.getAllByRole('menuitem')

		await expect(items.map(item => item.textContent)).toEqual(['Profile', 'Settings'])
		await expect(canvas.queryByRole('menuitem', { name: 'User' })).not.toBeInTheDocument()
		await expect(canvas.queryByRole('button')).not.toBeInTheDocument()
	},
}

/**
 * `MenuItem.tsx`'s `isDropdown && hasDropdowns` branch,
 * closed by default: the item's own label PLUS an `unstyled` `Button` trigger
 * carrying `aria-controls`/`aria-expanded`/`aria-haspopup`, and an
 * `aria-hidden` caret `Icon`. The nested `Menu` is only mounted while open
 * (`{ isOpen && ... }`), so it's entirely absent from the DOM here. IDs are
 * derived from `toKebabCase('User')` → `user`.
 *
 * Note: `User`'s own label has no `route`, so — per the live `MenuLabel`
 * source — it renders via the no-`route` branch as a `<span>`. `sharedProps`
 * sets `role: 'menuitem'` unconditionally before that branch runs, though, so
 * the `<span>` still carries `role="menuitem"` and is reachable via
 * `getByRole('menuitem', { name: 'User' })`.
 */
export const DropdownTrigger: Story = {
	args: {
		hasDropdowns: true,
		label: 'User',
		route: undefined,
		menu: USER_ITEM.menu,
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			label = canvas.getByRole('menuitem', { name: 'User' }),
			trigger = canvas.getByRole('button')

		await expect(label.tagName).toBe('SPAN')

		await expect(trigger).toHaveAttribute('id', USER_TRIGGER_ID)
		await expect(trigger).toHaveAttribute('type', 'button')
		await expect(trigger).toHaveAttribute('aria-controls', USER_MENU_ID)
		await expect(trigger).toHaveAttribute('aria-haspopup', 'true')
		await expect(trigger).toHaveAttribute('aria-expanded', 'false')
		await expect(trigger.querySelector('[aria-hidden="true"]')).toBeInTheDocument()

		// NOT `canvas.queryByRole('menubar')` — the meta-level `MenubarWrapper`
		// decorator's OWN `<ul role="menubar">` always satisfies that query
		// regardless of whether the nested dropdown `Menu` is mounted, so a bare
		// role query can't tell "no nested menu" apart from "just the decorator's
		// wrapper". Scope to the nested menu's own id instead.
		await expect(canvasElement.querySelector(`#${ USER_MENU_ID }`)).not.toBeInTheDocument()
		await expect(canvas.queryByText('Profile')).not.toBeInTheDocument()
	},
}

/**
 * `hasDropdowns` rendered both ways side by side, for a direct visual/DOM
 * comparison of the two dropdown branches.
 */
export const HasDropdowns: Story = {
	parameters: { controls: { exclude: ['hasDropdowns'] } },
	render: (args) => (
		<Row>
			{ BOOLEAN_OPTIONS.map(hasDropdowns => (
				<Group key={ String(hasDropdowns) } label={ String(hasDropdowns) }>
					<MenuItem
						{ ...args }
						hasDropdowns={ hasDropdowns }
						label="User"
						route={ undefined }
						menu={ USER_ITEM.menu }
					/>
				</Group>
			)) }
		</Row>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)

		// `hasDropdowns: true` → label + trigger button, no flattened children yet.
		// `User`'s label has no `route`, so (per the live `MenuLabel` source, see
		// the `DropdownTrigger` story) it renders as a `<span role="menuitem">` —
		// still reachable via `getByRole('menuitem')`, since that role is set
		// unconditionally.
		await expect(canvas.getByRole('menuitem', { name: 'User' })).toBeInTheDocument()
		await expect(canvas.getByRole('button')).toBeInTheDocument()

		// `hasDropdowns: false` → flattened children, no trigger, no `User` label.
		await expect(canvas.getByRole('menuitem', { name: 'Profile' })).toBeInTheDocument()
		await expect(canvas.getByRole('menuitem', { name: 'Settings' })).toBeInTheDocument()
	},
}

/**
 * `data-current` (`&:where([data-current])` in `Menu.module.scss`, bolding
 * the label) is never SET by `MenuItem` itself — the active-page detection is
 * commented out (`Menu.tsx`'s `// const isActive = pathname === route`, and
 * `MenuItem.tsx`'s dead `usePathname` import and its own "add behavior for
 * aria-current" TODO comments). It's only reachable by passing it through the
 * escape-hatch `attributes` prop.
 */
export const DataCurrentHook: Story = {
	args: {
		attributes: { data: { current: true } },
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			item = canvas.getByRole('menuitem').closest('li') as HTMLElement

		await expect(item).toHaveAttribute('data-current')
	},
}

/**
 * Pointer-driven toggling of the dropdown trigger.
 *
 * IMPORTANT: the item also opens on `mouseenter` (`MenuItem.tsx`'s
 * `handleMouseEnter`), and any real pointer click is preceded by a pointer
 * move onto the element — so a click can never be observed opening a closed
 * item via the mouse. `userEvent.setup()` is used here (rather than the
 * per-call direct API) precisely so pointer position PERSISTS between steps:
 * the hover fires once, and each subsequent click is a pure toggle.
 */
export const Clickable: Story = {
	args: {
		hasDropdowns: true,
		label: 'User',
		route: undefined,
		menu: USER_ITEM.menu,
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			user = userEvent.setup(),
			trigger = canvas.getByRole('button')

		await expect(trigger).toHaveAttribute('aria-expanded', 'false')

		await user.hover(trigger)
		await expect(trigger).toHaveAttribute('aria-expanded', 'true')
		await expect(await canvas.findByRole('menuitem', { name: 'Profile' })).toBeInTheDocument()

		// `handleToggle` inverts whatever the hover left behind.
		await user.click(trigger)
		await expect(trigger).toHaveAttribute('aria-expanded', 'false')
		await expect(canvas.queryByRole('menuitem', { name: 'Profile' })).not.toBeInTheDocument()

		await user.click(trigger)
		await expect(trigger).toHaveAttribute('aria-expanded', 'true')
		await expect(await canvas.findByRole('menuitem', { name: 'Settings' })).toBeInTheDocument()

		await user.click(trigger)
		await expect(trigger).toHaveAttribute('aria-expanded', 'false')
	},
}

/**
 * Hover opens immediately; leaving closes only after a 300ms `setTimeout`
 * (`MenuItem.tsx`'s `handleMouseLeave`), which is why the post-`unhover`
 * assertion is wrapped in `waitFor` rather than asserted synchronously.
 */
export const HoverToOpen: Story = {
	args: {
		hasDropdowns: true,
		label: 'User',
		route: undefined,
		menu: USER_ITEM.menu,
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
 * calls `handleToggle` only while `hasDropdowns && isDropdown && isOpen`, so
 * a click anywhere outside the item closes it.
 *
 * Opened with the keyboard on purpose: opening by hover would leave the
 * pointer inside the item, and moving it out to the outside button would ALSO
 * start the 300ms mouse-leave timer, making it ambiguous which mechanism did
 * the closing.
 */
export const OutsideClick: Story = {
	args: {
		hasDropdowns: true,
		label: 'User',
		route: undefined,
		menu: USER_ITEM.menu,
	},
	// The meta-level decorator already wraps this story in a single
	// `<ul role="menubar">` — rather than nesting a second one (which would
	// also put the "outside" trigger inside a menubar context), the outside
	// trigger is rendered as a plain sibling `<li>` within that same list.
	render: (args) => (
		<>
			<MenuItem { ...args } />
			<li><button type="button">Outside</button></li>
		</>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			outside = canvas.getByRole('button', { name: 'Outside' }),
			// Two `role="button"` elements exist in THIS story (the trigger plus
			// the plain "Outside" sibling), so — unlike stories with only one
			// button — role alone is ambiguous here; the trigger has no
			// accessible name (see `Menu.stories.tsx`'s `DropdownItems` quirk
			// note), so it's the only match for an empty `name`.
			trigger = canvas.getByRole('button', { name: '' })

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
 * `<span role="menuitem">` (see the `DropdownTrigger` story's note) — it
 * carries the role but no `tabindex`, so it's not itself focusable, and the
 * trigger is the first tab stop in the canvas.
 *
 * IMPORTANT, verified against the live `handleKeyDown` implementation: Enter
 * is ALSO one of the keys the wrapping `<li>`'s own `onKeyDown` treats as an
 * "open" key while closed (alongside `ArrowDown`/Space) — and opening via
 * THAT path moves focus to the first nested `[role="menuitem"]` a tick later
 * (`requestAnimationFrame`), same as the `KeyboardFocus` story. So after
 * pressing Enter, focus is no longer on the trigger — the trigger must be
 * refocused explicitly before the follow-up Space (or querying/asserting
 * `toHaveFocus()` on it) makes sense.
 *
 * HARDENING NOTE: every `aria-expanded` check immediately following a
 * keyboard action below is wrapped in `waitFor` rather than asserted bare —
 * this story was observed to fail intermittently (pass on one run, fail the
 * next) when asserted synchronously, almost certainly racing the same
 * `requestAnimationFrame` focus shift (and/or React's commit timing) rather
 * than a real behavioral difference between runs.
 */
export const KeyboardActivation: Story = {
	args: {
		hasDropdowns: true,
		label: 'User',
		route: undefined,
		menu: USER_ITEM.menu,
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

		// Explicit blur rather than tabbing away: where a further `tab()` lands
		// is browser/environment-dependent and not worth asserting on.
		trigger.blur()
		await expect(trigger).not.toHaveFocus()
	},
}

/**
 * Pure focus mechanics inside an OPEN dropdown: `ArrowDown` (while closed)
 * both opens the dropdown AND moves focus straight to the first submenu item,
 * via a `getSubmenuItems()` helper scoped to `':scope > [role="none"] >
 * [role="menuitem"]'` inside the nested `[role="menubar"]` — direct children
 * only, so the item's OWN label is never part of its own cycle, and any
 * grandchild dropdowns aren't swept in either. Once open, `ArrowDown`/
 * `ArrowUp` cycle through that same list and correctly WRAP at both ends
 * (`(currentIndex + step + items.length) % items.length`). `Escape` closes
 * the dropdown and returns focus to the trigger (`':scope > button'`), and
 * `Tab` closes it without moving focus itself.
 */
export const KeyboardFocus: Story = {
	args: {
		hasDropdowns: true,
		label: 'User',
		route: undefined,
		menu: USER_ITEM.menu,
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			trigger = canvas.getByRole('button')

		await userEvent.tab()
		await expect(trigger).toHaveFocus()

		// `ArrowDown` on the closed trigger opens it AND focuses the first item.
		await userEvent.keyboard('{ArrowDown}')
		await waitFor(() => expect(trigger).toHaveAttribute('aria-expanded', 'true'))

		const profile = await canvas.findByRole('menuitem', { name: 'Profile' }),
			settings = canvas.getByRole('menuitem', { name: 'Settings' })

		await waitFor(() => expect(profile).toHaveFocus())

		await userEvent.keyboard('{ArrowDown}')
		await waitFor(() => expect(settings).toHaveFocus())

		// From the LAST item, `ArrowDown` wraps around to the FIRST.
		await userEvent.keyboard('{ArrowDown}')
		await waitFor(() => expect(profile).toHaveFocus())

		// From the FIRST item, `ArrowUp` wraps backward to the LAST.
		await userEvent.keyboard('{ArrowUp}')
		await waitFor(() => expect(settings).toHaveFocus())

		await userEvent.keyboard('{Escape}')
		await waitFor(() => expect(trigger).toHaveAttribute('aria-expanded', 'false'))
		await waitFor(() => expect(trigger).toHaveFocus())

		// `Tab` closes without moving focus (the browser handles the actual move).
		await userEvent.keyboard('{Enter}')
		await waitFor(() => expect(trigger).toHaveAttribute('aria-expanded', 'true'))
		await canvas.findByRole('menuitem', { name: 'Profile' })

		await userEvent.keyboard('{Tab}')
		await waitFor(() => expect(trigger).toHaveAttribute('aria-expanded', 'false'))
	},
}

/**
 * Route-less submenu items are excluded from the natural Tab order — their
 * `<span>` gets `tabIndex={-1}` rather than being a native tab stop — but
 * that same `tabIndex={-1}` is exactly what makes them PROGRAMMATICALLY
 * focusable: `getSubmenuItems()` matches them via `role="menuitem"`
 * regardless of tag, so `ArrowDown`/`ArrowUp` cycling reaches a route-less
 * item just like a real `<a>` one — something that wasn't possible before
 * `tabIndex={-1}` was added (a plain `<span>` with no `tabindex` can't
 * receive focus via `.focus()` in a real browser).
 */
export const KeyboardFocusRouteless: Story = {
	args: {
		hasDropdowns: true,
		label: 'User',
		route: undefined,
		menu: [
			{ label: 'No Route' },
			{ label: 'Settings', route: NAV_ROUTES.SETTINGS },
		],
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			trigger = canvas.getByRole('button')

		await userEvent.tab()
		await expect(trigger).toHaveFocus()

		await userEvent.keyboard('{ArrowDown}')
		await waitFor(() => expect(trigger).toHaveAttribute('aria-expanded', 'true'))

		const noRoute = await canvas.findByRole('menuitem', { name: 'No Route' }),
			settings = canvas.getByRole('menuitem', { name: 'Settings' })

		// Opening focuses the first submenu item — route-less or not.
		await waitFor(() => expect(noRoute).toHaveFocus())
		await expect(noRoute.tagName).toBe('SPAN')

		await userEvent.keyboard('{ArrowDown}')
		await waitFor(() => expect(settings).toHaveFocus())

		// Wraps back to the route-less item, same as any other submenu item.
		await userEvent.keyboard('{ArrowDown}')
		await waitFor(() => expect(noRoute).toHaveFocus())
	},
}

// `as` isn't destructured out by `MenuItem` — it lands in `others` and is
// forwarded straight to `Box`. `MenuItemSpecs`'s `defaults.as` is `'li'`.
export const AsElement: Story = {
	render: (args) => (
		<Row>
			<Group label='as="li" (default)'>
				<MenuItem { ...args } />
			</Group>
			<Group label='as="div"'>
				<MenuItem { ...args } as="div" />
			</Group>
		</Row>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			items = canvas.getAllByRole('menuitem', { name: 'Home' })

		await expect(items[0].closest('[role="none"]')?.tagName).toBe('LI')
		await expect(items[1].closest('[role="none"]')?.tagName).toBe('DIV')
	},
}

// `unstyled` does NOT remove `MenuItem`'s semantic base class
// (`inkq-menu-item`) — per `getClassName.tsx` the base class is now ALWAYS
// emitted. It only suppresses the CSS-module-hashed class normally appended
// alongside it.
export const Unstyled: Story = {
	parameters: { controls: { exclude: ['unstyled'] } },
	render: (args) => (
		<Row>
			{ BOOLEAN_OPTIONS.map(unstyled => (
				<Group key={ String(unstyled) } label={ String(unstyled) }>
					<MenuItem { ...args } unstyled={ unstyled } label={ `unstyled=${ unstyled }` } />
				</Group>
			)) }
		</Row>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			unstyledRoot = canvas.getByRole('menuitem', { name: 'unstyled=true' }).closest('li') as HTMLElement,
			styledRoot = canvas.getByRole('menuitem', { name: 'unstyled=false' }).closest('li') as HTMLElement

		const hasModuleClass = (el: Element, base: string) =>
			Array.from(el.classList).some(c => c !== base)

		await expect(styledRoot).toHaveClass('inkq-menu-item')
		await expect(unstyledRoot).toHaveClass('inkq-menu-item')
		expect(hasModuleClass(styledRoot, 'inkq-menu-item')).toBe(true)
		expect(hasModuleClass(unstyledRoot, 'inkq-menu-item')).toBe(false)
	},
}
