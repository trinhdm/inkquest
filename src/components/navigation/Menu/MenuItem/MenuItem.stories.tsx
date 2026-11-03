import { expect, userEvent, waitFor, within } from 'storybook/test'
import { getDefaultProps } from '@/hooks/useProps'
import { MenuItem } from './MenuItem'
import { NavRoutes, NAVIGATION_DATA } from '@/utils/navigation'
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

// Dropdown fixtures read from `NAVIGATION_DATA`, so they can't drift from the app's tree.
// `Company` has a `menu` but NO `route`, so its label is a plain `<span>` rather than a link
// (a link inside the trigger button would navigate on click). `Legal` is a second routeless
// parent, for stories that need two dropdowns with distinct ids. `User` HAS a `route`.
// Every dropdown label is a single word, because `toKebabCase` keeps spaces in the id.
const findItem = (label: string) => NAVIGATION_DATA.find(item => item.label === label)!

const COMPANY_MENU = findItem('Company').menu!,
	LEGAL_MENU = findItem('Legal').menu!,
	USER_ITEM = findItem('User')

// With no `id`, `MenuItem` passes `dropdown-${ toKebabCase(label) }` to `Menu.Dropdown` (`id ??
// ...`), which builds the trigger and submenu ids from it. `toKebabCase('Company')` →
// `company`. An explicit `id` replaces the derived one (see the `Id` story).
const COMPANY_DROPDOWN_ID = 'dropdown-company',
	COMPANY_TRIGGER_ID = `${ COMPANY_DROPDOWN_ID }-trigger`,
	COMPANY_MENU_ID = `${ COMPANY_DROPDOWN_ID }-menu`

// `MenuItem.Props` (the `declare namespace` export) is just the raw
// `MenuItemProps` interface — it doesn't include `as`/`unstyled`/`attributes`/
// etc., which only exist on the actual accepted prop type,
// `PolymorphicProps<MenuItemProps, C>`. `Parameters<typeof MenuItem>[0]` reads
// that real, wrapped type straight off the component itself. It fills `C` with
// its constraint (`ElementType`), not the default `'li'`, so `as` is any
// `ElementType` here.
type MenuItemStoryProps = Parameters<typeof MenuItem>[0]
type Story = StoryObj<MenuItemStoryProps>

const meta: Meta<MenuItemStoryProps> = {
	component: MenuItem,
	title: 'Navigation/Menu/Menu.Item',
	decorators: [(Story) => <MenubarWrapper><Story /></MenubarWrapper>],
	argTypes: {
		as: {
			control: 'select',
			options: ['li', 'div'],
			description: 'Part of `PolymorphicProps`. `MenuItem.tsx` destructures `as` and applies it to the root of every branch (leaf, flattened) and hands it to `Menu.Dropdown` for the dropdown branch; the registered default is `li`. See the `AsElement` story.',
		},
		depth: {
			control: 'number',
			description: 'Optional (`depth?: number` in `MenuItemProps`) with NO registered default (`DEFAULT_PROPS` only sets `as`/`hasDropdowns`); these stories pass `0` explicitly. Handed to `Menu.Dropdown`, which gives its nested `Menu` `depth + 1` — and when `depth` is not a number, the nested `Menu` receives `undefined` and falls back to its own registered default of `0`. `Menu.tsx` (not `MenuItem` itself) reads its OWN `depth` prop to gate the orientation-driven module class to depth 0 only.',
		},
		hasDropdowns: {
			control: 'boolean',
			description: 'Selects between `MenuItem`\'s two dropdown render branches when `menu` is present: `true` (the registered default, so `undefined` behaves as `true`) renders a `Menu.Dropdown`, a trigger `<button>` holding the label plus an always-mounted nested `Menu`; `false` returns a flat ARRAY of the children\'s `<li>`s (the item\'s own label is dropped). Has no effect when `menu` is absent.',
		},
		active: {
			control: 'text',
			description: 'Typed `NavigationItem[\'route\'] | null`. `MenuItem.tsx`\'s own `isCurrentRoute` (`!!item.route && item.route === active`) treats `null` and `undefined` IDENTICALLY — neither can ever `===` a real route string, so both simply fail the match, same as any other non-matching string. The two are only distinguished one level up, in `Menu.tsx`: a route string or `null` is used AS-IS; `undefined` is replaced with `usePathname()` before ever reaching `MenuItem`. So from `MenuItem`\'s own perspective there is no pathname fallback to skip — that distinction belongs to `Menu.tsx`\'s `ActiveFromPathname` story, not here. Drives `data-current` on the wrapping `<li>` and `aria-current="page"` on the rendered label; on a dropdown, `data-current` lands on the dropdown\'s root `<li>`. The same value is handed to the dropdown\'s nested `Menu`. An item with no `route` can never match. See `ActiveItem`/`ActiveDropdown`/`ActiveItemFlattened`.',
		},
		id: {
			control: 'text',
			description: 'Only used by the dropdown branch, where it becomes the `Menu.Dropdown` `id` (`id ?? `dropdown-${ toKebabCase(label) }``); the trigger and nested submenu ids (`-trigger`, `-menu`) are built from it. An explicit `id` therefore overrides the derived one. Leaf and flattened items drop it. `Menu` sets it for each of its items as `${ id }-${ toKebabCase(item.label) }` when it has an `id` of its own. See the `Id` story.',
		},
		label: {
			control: 'text',
			description: 'Required. Rendered via a `<MenuLabel>` element (`MenuLabel/MenuLabel.tsx`) as either an `<a role="menuitem">` (when `route` is set) or a `<span role="menuitem" tabIndex={-1}>` (when it isn\'t) — `MenuLabel`\'s `sharedProps` sets `role: \'menuitem\'` unconditionally, before branching on `route`, so both forms are reachable via `getByRole(\'menuitem\')`. In a dropdown the label sits INSIDE the trigger button. The `<span>` form\'s `tabIndex={-1}` keeps it out of the natural Tab order. A `trigger` replaces it. For a dropdown, `label` also supplies the `id` (`dropdown-${ toKebabCase(label) }`). See also the `Leaf`/`DropdownTrigger` stories.',
		},
		menu: {
			control: 'object',
			description: 'A `NavigationItem[]`. When present, the item is a "dropdown" — which of the two dropdown branches renders is controlled by `hasDropdowns`.',
		},
		route: {
			control: 'select',
			options: [undefined, ...Object.values(NavRoutes)],
			description: 'When set, `MenuLabel` renders an `<a href>` (via `next/link`) instead of a `<span tabIndex={-1}>` that\'s excluded from the natural Tab order.',
		},
		trigger: {
			control: false,
			description: 'A `ReactNode` that replaces `label` as the content of the item\'s `MenuLabel` (`trigger ?? label`), in the leaf and dropdown branches. In the dropdown branch the caret is shown only when that content is a string (`hasCaret = typeof (trigger ?? label) === \'string\'`), so a non-string trigger drops it. It does not change the derived dropdown `id`, which still comes from `label`. The flattened branch ignores it. See the `Trigger` story.',
		},
		unstyled: {
			control: 'boolean',
			description: 'Comes from `FactoryContract` (via `_PolymorphicContract`), not `MenuItem`\'s own props. On `MenuItem`\'s own `styles(...)` calls it drops the CSS-module hash and config classes; and because `unstyled` reaches the root `<Box>` through `others`, the root also loses non-state `data-*` attributes — including the `data-current` marker `MenuItem` sets (`current` is not one of the state keys `buildAttributes.ts` keeps). The semantic base class (`inkq-menu-item`) is still emitted, unless an inherited semantic `className` replaces it (e.g. `inkq-navbar__menu-item` under `Navbar`).',
		},
	},
	args: {
		...getDefaultProps<MenuItem.Props>('Menu.Item'),
		depth: 0,
		label: 'Home',
		route: NavRoutes.HOME,
	},
}

export default meta

export const Default: Story = {
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			item = canvas.getByRole('menuitem')

		await expect(item.tagName).toBe('A')
		await expect(item).toHaveAttribute('href', NavRoutes.HOME)
		await expect(item.closest('li')).toHaveAttribute('role', 'none')
	},
}

/**
 * `MenuItem.tsx`'s non-dropdown branch (`!isDropdown`): a
 * single `<li role="none">` wrapping a `<MenuLabel>` element
 * (`MenuLabel/MenuLabel.tsx`), which renders `Link` when `route` is set and its
 * own `as` (default `span`) otherwise — so an item WITH a `route` is a
 * focusable `<a role="menuitem" href>`.
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
				<MenuItem { ...args } label="Home" route={ NavRoutes.HOME } />
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
		await expect(withRoute).toHaveAttribute('href', NavRoutes.HOME)

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
 * label (`Company`) is never rendered at all, and there's no trigger `<button>`.
 */
export const FlattenedDropdown: Story = {
	args: {
		hasDropdowns: false,
		label: 'Company',
		route: undefined,
		menu: COMPANY_MENU,
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			items = canvas.getAllByRole('menuitem')

		await expect(items.map(item => item.textContent)).toEqual(COMPANY_MENU.map(({ label }) => label))
		await expect(canvas.queryByRole('menuitem', { name: 'Company' })).not.toBeInTheDocument()
		await expect(canvas.queryByRole('button')).not.toBeInTheDocument()
	},
}

/**
 * `MenuItem.tsx`'s `isDropdown && hasDropdowns` branch, closed by default: it renders a
 * `Menu.Dropdown` with `id="dropdown-company"` (derived from `toKebabCase('Company')`
 * because no `id` is passed), the item's
 * own label (as a `MenuLabel` element) and a caret because the label is a string.
 *
 * The label sits INSIDE the `unstyled` `Button` trigger, which carries
 * `aria-controls`/`aria-expanded`/`aria-haspopup` and the `-trigger` id. The nested `Menu` is
 * ALWAYS mounted (`dropdown-company-menu`); it is hidden by CSS until `data-open` is set, so
 * its items are in the DOM but out of reach for role queries.
 *
 * Note: `Company`'s own label has no `route`, so — per the live `MenuLabel` source — it
 * renders via the no-`route` branch as a `<span>`. `sharedProps` sets `role: 'menuitem'`
 * unconditionally before that branch runs, though, so the `<span>` still carries
 * `role="menuitem"` and is reachable via `getByRole('menuitem', { name: 'Company' })`.
 *
 * The caret is `<Icon type="caret-down" />`; `Icon` registers `hidden: true`, so it is
 * `aria-hidden` and has no role to query it by.
 *
 * Opening, closing and keyboard behaviour belong to `Menu.Dropdown`; see its stories.
 */
export const DropdownTrigger: Story = {
	args: {
		hasDropdowns: true,
		label: 'Company',
		route: undefined,
		menu: COMPANY_MENU,
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			label = canvas.getByRole('menuitem', { name: 'Company' }),
			trigger = canvas.getByRole('button'),
			root = canvasElement.querySelector(`#${ COMPANY_DROPDOWN_ID }`),
			submenu = canvasElement.querySelector(`#${ COMPANY_MENU_ID }`)

		await expect(label.tagName).toBe('SPAN')
		await expect(trigger).toContainElement(label)

		await expect(root).not.toBeNull()
		await expect(root).toHaveAttribute('role', 'none')
		await expect(root?.tagName).toBe('LI')

		await expect(trigger).toHaveAttribute('id', COMPANY_TRIGGER_ID)
		await expect(trigger).toHaveAttribute('type', 'button')
		await expect(trigger).toHaveAttribute('aria-controls', COMPANY_MENU_ID)
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

		// Mounted but closed: present in the DOM (positive control), no `data-open`, and
		// its items are out of reach for role queries once CSS hides it.
		await expect(submenu).not.toBeNull()
		await expect(submenu).toHaveAttribute('aria-labelledby', COMPANY_TRIGGER_ID)
		await expect(submenu).not.toHaveAttribute('data-open')
		await expect(within(submenu as HTMLElement).getByText(COMPANY_MENU[0].label)).toBeInTheDocument()
		await waitFor(() => expect(canvas.queryByRole('menuitem', { name: COMPANY_MENU[0].label })).not.toBeInTheDocument())
	},
}

/**
 * `hasDropdowns` rendered both ways side by side, for a direct visual/DOM
 * comparison of the two dropdown branches. The `true` group's submenu is mounted but closed,
 * so its items are out of reach for role queries and the child items found by role are the
 * flattened ones from the `false` group.
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
						label="Company"
						route={ undefined }
						menu={ COMPANY_MENU }
					/>
				</Group>
			)) }
		</Row>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			childNames = COMPANY_MENU.map(({ label }) => label)

		// `hasDropdowns: true` → label + trigger button. `Company`'s label has no
		// `route`, so (per the live `MenuLabel` source, see the `DropdownTrigger` story) it
		// renders as a `<span role="menuitem">` — still reachable via `getByRole('menuitem')`,
		// since that role is set unconditionally.
		await expect(canvas.getByRole('menuitem', { name: 'Company' })).toBeInTheDocument()
		await expect(canvas.getByRole('button')).toBeInTheDocument()

		// `hasDropdowns: false` → flattened children, no trigger, no `Company` label.
		await waitFor(() => expect(canvas.getAllByRole('menuitem')).toHaveLength(childNames.length + 1))
		for (const name of childNames)
			await expect(canvas.getByRole('menuitem', { name })).toBeInTheDocument()
	},
}

/**
 * `trigger` replaces the content of the item's `MenuLabel` (`trigger ?? label`) in the leaf
 * and dropdown branches. In the dropdown branch the caret depends on what the content is:
 * a string keeps it, anything else drops it. The derived dropdown `id` still comes from `label`.
 *
 * Three groups: a leaf with a node trigger, a dropdown with a node trigger (no caret) and a
 * dropdown with a string trigger (caret). The two dropdowns use different labels so their
 * ids don't collide.
 */
export const Trigger: Story = {
	parameters: { controls: { exclude: ['label', 'menu', 'route', 'trigger'] } },
	render: (args) => (
		<Row>
			<Group label="leaf, trigger: node">
				<MenuItem
					{ ...args }
					label="Home"
					menu={ undefined }
					route={ NavRoutes.HOME }
					trigger={ <span>Leaf trigger</span> }
				/>
			</Group>
			<Group label="dropdown, trigger: node">
				<MenuItem
					{ ...args }
					label="Company"
					menu={ COMPANY_MENU }
					route={ undefined }
					trigger={ <span>Node trigger</span> }
				/>
			</Group>
			<Group label="dropdown, trigger: string">
				<MenuItem
					{ ...args }
					label="Legal"
					menu={ LEGAL_MENU }
					route={ undefined }
					trigger="String trigger"
				/>
			</Group>
		</Row>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)

		// Leaf: the label is replaced, the route is kept.
		const leaf = canvas.getByRole('menuitem', { name: 'Leaf trigger' })
		await expect(leaf.tagName).toBe('A')
		await expect(leaf).toHaveAttribute('href', NavRoutes.HOME)
		await expect(canvas.queryByRole('menuitem', { name: 'Home' })).not.toBeInTheDocument()

		// Dropdown with a node trigger: label replaced, no caret, id still from `label`.
		const nodeTrigger = canvas.getByRole('menuitem', { name: 'Node trigger' }).closest('button')
		await expect(nodeTrigger).not.toBeNull()
		await expect(nodeTrigger).toHaveAttribute('id', 'dropdown-company-trigger')
		await expect(nodeTrigger?.querySelector('svg')).toBeNull()
		await expect(canvas.queryByRole('menuitem', { name: 'Company' })).not.toBeInTheDocument()

		// Dropdown with a string trigger: label replaced, caret kept.
		const stringTrigger = canvas.getByRole('menuitem', { name: 'String trigger' }).closest('button')
		await expect(stringTrigger).not.toBeNull()
		await expect(stringTrigger).toHaveAttribute('id', 'dropdown-legal-trigger')
		await expect(stringTrigger?.querySelector('svg')).not.toBeNull()
		await expect(canvas.queryByRole('menuitem', { name: 'Legal' })).not.toBeInTheDocument()
	},
}

/**
 * An explicit `id` overrides the derived `dropdown-${ toKebabCase(label) }` in the dropdown
 * branch: the root, trigger and submenu ids are built from it (`custom`, `custom-trigger`,
 * `custom-menu`), and nothing is left with the derived `dropdown-company` id. A leaf item
 * drops the `id` entirely.
 */
export const Id: Story = {
	parameters: { controls: { exclude: ['id', 'label', 'menu', 'route'] } },
	render: (args) => (
		<Row>
			<Group label="dropdown, id: custom">
				<MenuItem { ...args } id="custom" label="Company" menu={ COMPANY_MENU } route={ undefined } />
			</Group>
			<Group label="leaf, id: ignored">
				<MenuItem { ...args } id="ignored" label="Home" menu={ undefined } route={ NavRoutes.HOME } />
			</Group>
		</Row>
	),
	play: async ({ canvasElement }) => {
		const trigger = canvasElement.querySelector('#custom-trigger')

		await expect(canvasElement.querySelector('#custom')?.tagName).toBe('LI')
		await expect(trigger).not.toBeNull()
		await expect(trigger).toHaveAttribute('aria-controls', 'custom-menu')
		await expect(canvasElement.querySelector('#custom-menu')).toHaveAttribute('aria-labelledby', 'custom-trigger')

		await expect(canvasElement.querySelector(`#${ COMPANY_DROPDOWN_ID }`)).toBeNull()

		await expect(canvasElement.querySelector('#ignored')).toBeNull()
	},
}

/**
 * `MenuItem` computes `data-current` itself from `active` (see `ActiveItem`),
 * but its `setAttributes` helper also preserves a caller-supplied
 * `attributes.data.current` (`isCurrent || attributes?.data?.current || null`).
 * So the escape-hatch `attributes` prop can force the hook on an item whose
 * `active` doesn't match — `active` is left unset here.
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
 * `active` matching an exact `route`: `data-current` on the wrapping `<li>`,
 * `aria-current="page"` on the rendered label.
 *
 * `null` and `undefined` are rendered alongside the match for contrast, but —
 * per `isCurrentRoute` (`!!item.route && item.route === active`) — they
 * behave IDENTICALLY to each other at this level: neither can ever `===` a
 * real route string, so both simply fail to match, same as any other
 * non-matching value. The asymmetry the two carry at the `Menu` level (`null`
 * = explicitly no active item; `undefined` = fall back to `usePathname()`) is
 * resolved one level up, in `Menu.tsx`, before `active` ever reaches
 * `MenuItem` — see `Menu.stories.tsx`'s `ActiveFromPathname` story for that
 * distinction in action.
 */
export const ActiveItem: Story = {
	parameters: { controls: { exclude: ['active'] } },
	render: (args) => (
		<Row>
			<Group label="active: route match">
				<MenuItem { ...args } active={ NavRoutes.HOME } label="Home" route={ NavRoutes.HOME } />
			</Group>
			<Group label="active: null">
				<MenuItem { ...args } active={ null } label="Home (null)" route={ NavRoutes.HOME } />
			</Group>
			<Group label="active: undefined">
				<MenuItem { ...args } active={ undefined } label="Home (undefined)" route={ NavRoutes.HOME } />
			</Group>
		</Row>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			match = canvas.getByRole('menuitem', { name: 'Home' }),
			withNull = canvas.getByRole('menuitem', { name: 'Home (null)' }),
			withUndefined = canvas.getByRole('menuitem', { name: 'Home (undefined)' })

		await expect(match).toHaveAttribute('aria-current', 'page')
		await expect(match.closest('li')).toHaveAttribute('data-current')

		await expect(withNull).not.toHaveAttribute('aria-current')
		await expect(withNull.closest('li')).not.toHaveAttribute('data-current')

		await expect(withUndefined).not.toHaveAttribute('aria-current')
		await expect(withUndefined.closest('li')).not.toHaveAttribute('data-current')
	},
}

/**
 * A dropdown whose own `route` is the active one: `MenuItem` hands its `attributes`
 * (carrying `data-current`) to `Menu.Dropdown`, which puts them on the dropdown's ROOT `<li>`,
 * while the label inside the trigger gets `aria-current="page"`. `User` is the fixture
 * because it is the dropdown with a `route` (`/profile`); nothing is clicked here.
 */
export const ActiveDropdown: Story = {
	parameters: { controls: { exclude: ['active', 'label', 'menu', 'route'] } },
	args: {
		active: NavRoutes.USER_PROFILE,
		label: 'User',
		route: USER_ITEM.route,
		menu: USER_ITEM.menu,
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			label = canvas.getByRole('menuitem', { name: 'User' }),
			root = canvasElement.querySelector('#dropdown-user')

		await expect(label).toHaveAttribute('aria-current', 'page')
		await expect(root).not.toBeNull()
		await expect(root).toHaveAttribute('data-current')
		await expect(label.closest('li')).toBe(root)
	},
}

/**
 * The flattened branch ((b), `isDropdown && !hasDropdowns`) evaluates each
 * child independently — only `FAQs` matches here, not `About`, even
 * though both are rendered from the SAME `menu?.map(...)` call.
 */
export const ActiveItemFlattened: Story = {
	args: {
		active: NavRoutes.COMPANY_FAQS,
		hasDropdowns: false,
		label: 'Company',
		route: undefined,
		menu: COMPANY_MENU,
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			about = canvas.getByRole('menuitem', { name: 'About' }),
			faqs = canvas.getByRole('menuitem', { name: 'FAQs' })
		await expect(about.closest('li')).not.toHaveAttribute('data-current')
		await expect(faqs.closest('li')).toHaveAttribute('data-current')
		await expect(faqs).toHaveAttribute('aria-current', 'page')
	},
}

// `MenuItem` destructures `as` and puts it in the `sharedProps` that its leaf and
// flattened returns build on, and hands it to `Menu.Dropdown` for the dropdown return, so the
// root tag follows the prop in every branch: the leaf branch (`!isDropdown`), the flattened
// branch (`!hasDropdowns`, one root per child), and the dropdown branch. Each group below
// renders one branch with `as="li"` (the registered default) and `as="div"`.
const AS_OPTIONS = ['li', 'div'] as const

export const AsElement: Story = {
	parameters: { controls: { exclude: ['as'] } },
	render: (args) => (
		<Row>
			{ AS_OPTIONS.map(as => (
				<Group key={ `leaf-${ as }` } label={ `leaf, as="${ as }"` }>
					<MenuItem { ...args } as={ as } label={ `leaf-${ as }` } route={ NavRoutes.HOME } menu={ undefined } />
				</Group>
			)) }
			{ AS_OPTIONS.map(as => (
				<Group key={ `flattened-${ as }` } label={ `flattened (hasDropdowns: false), as="${ as }"` }>
					<MenuItem
						{ ...args }
						as={ as }
						hasDropdowns={ false }
						label="Parent"
						route={ undefined }
						menu={ [{ label: `flattened-${ as }`, route: NavRoutes.USER_SETTINGS }] }
					/>
				</Group>
			)) }
			{ AS_OPTIONS.map(as => (
				<Group key={ `dropdown-${ as }` } label={ `dropdown, as="${ as }"` }>
					<MenuItem
						{ ...args }
						as={ as }
						hasDropdowns
						label={ `dropdown-${ as }` }
						route={ undefined }
						menu={ COMPANY_MENU }
					/>
				</Group>
			)) }
		</Row>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			rootOf = (name: string) =>
				canvas.getByRole('menuitem', { name }).closest('[role="none"]')

		await expect(rootOf('leaf-li')?.tagName).toBe('LI')
		await expect(rootOf('leaf-div')?.tagName).toBe('DIV')

		await expect(rootOf('flattened-li')?.tagName).toBe('LI')
		await expect(rootOf('flattened-div')?.tagName).toBe('DIV')

		await expect(rootOf('dropdown-li')?.tagName).toBe('LI')
		await expect(rootOf('dropdown-div')?.tagName).toBe('DIV')
	},
}

// `unstyled` does NOT remove `MenuItem`'s semantic base class
// (`inkq-menu-item`) — per `getClassName.tsx` the class list always starts with
// `namespace ?? baseName` (an inherited semantic `className` would replace it;
// none is passed here). It drops the CSS-module-hashed class normally appended
// alongside it, plus any config classes (none here) and the root's non-state
// `data-*` attributes (e.g. `data-current`).
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
