import { expect, within } from 'storybook/test'
import { getDefaultProps } from '@/hooks/useProps'
import { Navbar } from './Navbar'
import { HEADER_GLOBAL_NAV, NavRoutes, type NavRoute } from '@/utils/navigation'
import type { ReactNode } from 'react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import moduleClasses from './Navbar.module.scss'

const Row = ({ children }: { children: ReactNode }) => (
	<div style={ { display: 'flex', flexDirection: 'column', gap: 32 } }>
		{ children }
	</div>
)

const Group = ({ label, children }: { label: string, children: ReactNode }) => (
	<div style={ { display: 'flex', flexDirection: 'column', gap: 8 } }>
		<span style={ { font: 'var(--inkq-text-control)', letterSpacing: '.15em', textTransform: 'uppercase', opacity: 0.6 } }>
			{ label }
		</span>
		<div>{ children }</div>
	</div>
)

// Verified against the live `filterNavigation` (`src/utils/navigation.ts`): with NO
// `routes` at all, `Navbar.tsx`'s own `filterNavigation(routes)` call hits
// `filterNavigation`'s `isEmptyReturn = true` DEFAULT (Navbar never overrides it), so
// `!routes?.length` short-circuits to `[]` — an unfiltered, routeless `<Navbar>` renders
// NO menu items at all, not "the full tree" (see the dedicated `NoRoutes` story). A
// meaningful `Default` therefore needs an EXPLICIT, representative `routes` list.
// This one includes `Discover`'s and `Community`'s own children (unlike
// `FilteredRoutes`' narrower `HEADER_GLOBAL_NAV` list), so at least one dropdown trigger
// survives the filter.
const DEFAULT_ROUTES = [
	NavRoutes.DISCOVER, NavRoutes.DISCOVER_STYLE,
	NavRoutes.MARKETPLACE,
	NavRoutes.COMMUNITY, NavRoutes.COMMUNITY_EVENTS, NavRoutes.COMMUNITY_FEED, NavRoutes.COMMUNITY_SPOTLIGHTS,
]

// A route that appears NOWHERE in `NAVIGATION_DATA` — unlike every real `NavRoute`
// (all 22 of them are used somewhere in the tree, several only as a child of a
// route-less parent like `User`, which still surfaces via `filterNavigation`'s
// flattening branch; see the `NoMatchingRoutes` story below), this one guarantees a
// genuinely empty filtered result. Cast because `NavRoute` is a closed union of the
// real app routes.
const UNMATCHED_ROUTE = '/does-not-exist' as NavRoute

// `Navbar.Props` (the `declare namespace` export) is just the raw `NavbarProps`
// interface — it doesn't include `as`/`unstyled`/`attributes`/etc., which only
// exist on the actual accepted prop type, `PolymorphicProps<NavbarProps, C>`.
// `Parameters<typeof Navbar>[0]` reads that real, wrapped type straight off the
// component itself — the generic call signature's default `C` resolves to
// `'nav'` here, since `NavbarSpecs`'s `defaults.as` is `'nav'`.
type NavbarStoryProps = Parameters<typeof Navbar>[0]
type Story = StoryObj<NavbarStoryProps>

const meta: Meta<NavbarStoryProps> = {
	component: Navbar,
	title: 'Navigation/Navbar',
	// Full-bleed bar: centering it in the canvas misrepresents the layout, so
	// every story overrides the global `layout: 'centered'` default.
	parameters: { layout: 'padded' },
	argTypes: {
		routes: {
			control: 'multi-select',
			options: Object.values(NavRoutes),
			description: 'Allow-list handed to `filterNavigation(routes)`. `Navbar` passes only `routes` — leaving `layout` at `\'dropdown\'`, `isEmptyReturn` at `true` and `navitems` at `NAVIGATION_DATA` — so omitted/empty means NO items render at all (see `NoRoutes`), not "the full tree". A route-less parent (`User`) is never itself kept, but its OWN matching children still surface, FLATTENED to the top level, if any of ITS children match (see `NoMatchingRoutes`).',
		},
		as: {
			control: false,
			description: '`Navbar.tsx` destructures `as` and passes it to its root `<Box>` (`as={ as }`), so the rendered tag genuinely changes — see `AsElement`. Note `Navbar` also hardcodes `role="navigation"` on that same root `<Box>`, independent of `as` — that\'s the only reason `getAllByRole(\'navigation\')` still resolves the `as="div"`/`as="section"` cases in `AsElement`, which otherwise carry no implicit navigation landmark role.',
		},
		unstyled: {
			control: 'boolean',
			description: 'Comes from `FactoryContract` (via `_PolymorphicContract`), not `Navbar`\'s own `NavbarProps`. The semantic classes (`inkq-navbar`, `inkq-navbar__wrapper`, `inkq-navbar__inner`, `inkq-navbar__col`, `inkq-navbar__menu`, `inkq-navbar__buttons`) are still emitted regardless; `unstyled` also reaches the root `<Box>` through `others`, where it would drop non-state `data-*` attributes (`Navbar` sets none). `Navbar` defines no tokens, so there are none to drop. `Navbar.tsx` does not forward `unstyled` to the nested `Menu`/`Button.Group`, so those keep their own styling. The render tree is root → wrapper (`styles(\'wrapper\', true)`) → inner → col ×3, with `menu` (`styles(\'menu\')`, no config) applied to the `<Menu>` inside the 2nd col and `buttons` (`styles(\'buttons\')`, no config) applied to the auth `Button.Group` inside the 3rd col — both land on the nested component\'s own root, not the `col` div wrapping it. `styles(\'wrapper\', true)` is the BOOLEAN-shorthand config form — `getConfigClasses` now checks `check.isUnstyled` FIRST, before the boolean-shorthand branch, so the global `inkq-wrapper` class it emits is suppressed entirely when `unstyled`, same as any object-config class. For the other plain `styles(selector)` calls (no config) the effect is dropping the CSS-module hash normally appended alongside, and only where `Navbar.module.scss` actually declares a rule to hash — `&__inner`/`&__col`/`&__buttons` do; `&__wrapper`/`&__menu` have no SCSS rule at all, so those two never carry a hash, styled or unstyled. See the `Unstyled` story.',
		},
	},
	args: {
		...getDefaultProps<Navbar.Props>('Navbar'),
	},
}

export default meta

/**
 * `DEFAULT_ROUTES` includes `Discover`'s and `Community`'s own children, so both
 * survive `filterNavigation` WITH a non-empty `menu` and render a dropdown trigger;
 * `Marketplace` has no children at all and stays a plain link. 3 top-level entries,
 * 2 dropdown triggers (`Discover`, `Community`).
 *
 * Note: `Navbar` passes `{ ...styles('menu') }` (a `className`/`style` pair)
 * to `<Menu>`. `Menu.tsx` destructures `className` out of its own props, so it is
 * not spread onto the root through `others` — but it hands its full props to
 * `useStyles`, so the root `<ul>`'s own `inkq-menu` class is replaced by
 * `inkq-navbar__menu`. `className` is also forwarded as the `className` prop of
 * every top-level `MenuItem`, which `getClassName.tsx`'s `inheritClasses` logic
 * then uses to rename each item's own root class from `inkq-menu-item` to
 * `inkq-navbar__menu-item` (since `'menu-item'.startsWith('menu')`).
 * Assertions below stick to roles/ARIA rather than literal class names.
 */
export const Default: Story = {
	args: { routes: DEFAULT_ROUTES },
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			nav = canvas.getByRole('navigation')

		await expect(nav.tagName).toBe('NAV')

		const menubar = within(nav).getByRole('menubar')
		await expect(within(menubar).getAllByRole('menuitem')).toHaveLength(3)
		await expect(within(menubar).getAllByRole('button')).toHaveLength(2)

		// The two `Button.Group` auth buttons. `Navbar.tsx` now renders both
		// with an `href` (`<Button href="/login" variant="text">Log in</Button>`,
		// `<Button href="/signup">Sign up</Button>`), so `Button.tsx` takes its
		// link branch and renders an `<a>` via `next/link` — whose implicit
		// ARIA role is `link`, not `button`. `Button.tsx` only sets an
		// `aria-label` when `showLabel && ariaLabel.length` (`aria = { label:
		// !!(showLabel && ariaLabel.length) ? ariaLabel : undefined }`), and
		// `Navbar` renders these with no `showLabel` at all — so NO `aria-label`
		// is emitted here. The `getByRole('link', { name })` queries below
		// still pass because Testing Library's accessible-name computation
		// falls back to the link's own text content when there's no explicit
		// `aria-label`. With both auth buttons now links, the only remaining
		// `button`-role elements on the bar are the 2 dropdown triggers
		// asserted just above.
		await expect(canvas.getByRole('link', { name: 'Log in' })).toBeInTheDocument()
		await expect(canvas.getByRole('link', { name: 'Sign up' })).toBeInTheDocument()
		await expect(canvas.getAllByRole('button')).toHaveLength(2)
	},
}

/**
 * Edge case: NO `routes` at all. `filterNavigation`'s `isEmptyReturn` defaults to
 * `true`, and `Navbar.tsx` never overrides it, so `!routes?.length` short-circuits to
 * an EMPTY array — not "the full tree". `Navbar` guards its middle column with
 * `!!navitems.length`, so no `<Menu>` renders at all; only the logo column and the
 * auth buttons remain.
 */
export const NoRoutes: Story = {
	args: { routes: undefined },
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)

		await expect(canvas.getByRole('navigation')).toBeInTheDocument()
		await expect(canvas.queryByRole('menubar')).not.toBeInTheDocument()

		// The two auth buttons carry `href` (see `Default`'s play function),
		// so they render as `<a>`s with an implicit `link` role, not `button`
		// — with no menu rendered, there's no `button`-role element left on
		// the bar at all.
		await expect(canvas.queryAllByRole('button')).toHaveLength(0)
		await expect(canvas.getByRole('link', { name: 'Log in' })).toBeInTheDocument()
		await expect(canvas.getByRole('link', { name: 'Sign up' })).toBeInTheDocument()
	},
}

/**
 * The `HEADER_GLOBAL_NAV` allow-list (`@/utils/navigation`), which `Header` applies as
 * its default `navbar` routes. Every child route is excluded, so no kept item
 * retains a non-empty `menu` — no dropdown triggers survive. In its default
 * `'dropdown'` layout, `filterNavigation`'s inner `filterNavitems` computes each
 * item's `submenu` as `item.menu && filterNavitems(item.menu, routes)`: `Discover`
 * and `Community` both HAD a `menu` array, so they get filtered down to `[]`
 * (all their children's routes are excluded); `Marketplace` had no `menu` at
 * all, so it alone gets `undefined`. Either way `MenuItem.tsx` gates its
 * dropdown trigger on `isDropdown = !!menu?.length`, so both `[]` and
 * `undefined` render as a plain link — the assertions below hold regardless.
 */
export const FilteredRoutes: Story = {
	args: { routes: HEADER_GLOBAL_NAV },
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			menubar = canvas.getByRole('menubar'),
			items = within(menubar).getAllByRole('menuitem')

		await expect(items.map(item => item.textContent)).toEqual([
			'Discover', 'Marketplace', 'Community',
		])

		// `Discover`'s only child (`/discover/style`) isn't in the allow-list, so
		// the item is flattened to a plain link — no trigger anywhere. Combined
		// with the two auth buttons now carrying `href` (see `Default`'s play
		// function) and rendering as `<a>`s, there's no `button`-role element
		// left on the bar at all.
		await expect(within(menubar).queryAllByRole('button')).toHaveLength(0)
		await expect(canvas.queryAllByRole('button')).toHaveLength(0)
		await expect(canvas.getByRole('link', { name: 'Log in' })).toBeInTheDocument()
		await expect(canvas.getByRole('link', { name: 'Sign up' })).toBeInTheDocument()
	},
}

export const SingleRoute: Story = {
	args: { routes: [NavRoutes.MARKETPLACE] },
}

/**
 * Edge case: `routes` that match NOTHING anywhere in `NAVIGATION_DATA`.
 * `filterNavigation` returns `[]`, and `Navbar` guards the menu with
 * `!!navitems.length`, so the `<Menu>` is not rendered at all — only the logo column
 * and the auth buttons remain.
 *
 * `NavRoutes.SETTINGS` (`/settings`) is deliberately NOT used here even though it
 * "matches nothing" at the TOP level: it's a real child of the route-less `User` item,
 * and `filterNavigation`'s recursive `filterNavitems` FLATTENS a route-less parent's
 * own matching children to the top level whenever `submenu` is non-empty (`else if
 * (submenu) list.push(...submenu)`) — so `routes: [SETTINGS]` actually renders ONE
 * menu item (`Settings`), not zero. Every real `NavRoute` is used somewhere in the
 * tree this same way, so a genuinely unmatched fixture needs a route that isn't a
 * `NavRoute` at all (`UNMATCHED_ROUTE`).
 */
export const NoMatchingRoutes: Story = {
	args: { routes: [UNMATCHED_ROUTE] },
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)

		await expect(canvas.getByRole('navigation')).toBeInTheDocument()
		await expect(canvas.queryByRole('menubar')).not.toBeInTheDocument()
		await expect(canvas.queryAllByRole('menuitem')).toHaveLength(0)

		// The two auth buttons carry `href` (see `Default`'s play function), so
		// they render as `<a>`s with an implicit `link` role, not `button` —
		// with no menu rendered, there's no `button`-role element left on the
		// bar at all.
		await expect(canvas.queryAllByRole('button')).toHaveLength(0)
		await expect(canvas.getByRole('link', { name: 'Log in' })).toBeInTheDocument()
		await expect(canvas.getByRole('link', { name: 'Sign up' })).toBeInTheDocument()
	},
}

/**
 * `Navbar.tsx` destructures `as` and passes it to its root `<Box>` (`as={ as }`),
 * so the rendered tag genuinely changes. `Navbar` also hardcodes `role="navigation"`
 * on that same root `<Box>`, independent of `as` — that's the ONLY reason
 * `getAllByRole('navigation')` resolves the `as="div"`/`as="section"` cases
 * below, since neither tag carries an implicit navigation landmark role.
 */
export const AsElement: Story = {
	render: (args) => (
		<Row>
			<Group label='as="nav" (default)'>
				<Navbar { ...args } />
			</Group>
			<Group label='as="div"'>
				<Navbar { ...args } as="div" />
			</Group>
			<Group label='as="section"'>
				<Navbar { ...args } as="section" />
			</Group>
		</Row>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			navs = canvas.getAllByRole('navigation')

		await expect(navs).toHaveLength(3)

		const [asNav, asDiv, asSection] = navs

		await expect(asNav.tagName).toBe('NAV')
		await expect(asDiv.tagName).toBe('DIV')
		await expect(asSection.tagName).toBe('SECTION')
	},
}

/**
 * `unstyled` never removes the semantic base classes (`inkq-navbar`,
 * `inkq-navbar__wrapper`, `inkq-navbar__inner`, `inkq-navbar__col`, `inkq-navbar__buttons`).
 * Render tree: root → wrapper (`styles('wrapper', true)`) → inner → col ×3, with
 * `buttons` (`styles('buttons')`) landing on the auth `Button.Group`'s own root inside
 * the 3rd col, not on that col div itself. `styles('wrapper', true)` is the
 * BOOLEAN-shorthand config form — `getConfigClasses` in `getClassName.tsx` now checks
 * `check.isUnstyled` FIRST, before the boolean-shorthand branch, so the literal global
 * `inkq-wrapper` class it emits is suppressed entirely when `unstyled` (identical
 * mechanism to `Container`/`Footer`'s own wrapper). The wrapper's `&__wrapper` selector
 * has no SCSS declaration at all, so it never carries a module hash either way.
 * `&__inner`/`&__col`/`&__buttons` DO have their own plain (config-less) SCSS
 * declarations, so THOSE behave as expected: a real CSS-module hash is appended when
 * styled and suppressed when `unstyled`, with the base class always present either way.
 */
export const Unstyled: Story = {
	parameters: { controls: { exclude: ['unstyled'] } },
	// Explicit `routes` needed so the middle (`Menu`) column actually renders — with
	// none, `filterNavigation` returns `[]` (see `NoRoutes`) and there'd only be 2
	// `.inkq-navbar__col`s per bar, not 3.
	args: { routes: DEFAULT_ROUTES },
	render: (args) => (
		<Row>
			<Group label="true">
				<Navbar { ...args } unstyled />
			</Group>
			<Group label="false">
				<Navbar { ...args } unstyled={ false } />
			</Group>
		</Row>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			[unstyledRoot, styledRoot] = canvas.getAllByRole('navigation')

		await expect(unstyledRoot).toBeInTheDocument()
		await expect(styledRoot).toBeInTheDocument()

		const hasModuleClass = (el: Element, base: string) => {
			const moduleClass = (moduleClasses as Record<string, string>)[base]
			return !!moduleClass && el.classList.contains(moduleClass)
		}

		// Root (`inkq-navbar`): base class always present; module hash only
		// when styled.
		await expect(unstyledRoot).toHaveClass('inkq-navbar')
		await expect(styledRoot).toHaveClass('inkq-navbar')
		expect(hasModuleClass(unstyledRoot, 'inkq-navbar')).toBe(false)
		expect(hasModuleClass(styledRoot, 'inkq-navbar')).toBe(true)

		const unstyledWrapper = unstyledRoot.querySelector('.inkq-navbar__wrapper') as HTMLElement,
			styledWrapper = styledRoot.querySelector('.inkq-navbar__wrapper') as HTMLElement

		// Wrapper (`inkq-navbar__wrapper`): base class always present; NO
		// module hash ever exists to suppress (`&__wrapper` has no SCSS rule).
		// The boolean-config global `inkq-wrapper` class is present ONLY WHEN STYLED —
		// `getConfigClasses` now checks `check.isUnstyled` FIRST, before the boolean-shorthand branch.
		//
		await expect(styledWrapper).toHaveClass('inkq-navbar__wrapper', 'inkq-wrapper')
		await expect(unstyledWrapper).toHaveClass('inkq-navbar__wrapper')
		await expect(unstyledWrapper).not.toHaveClass('inkq-wrapper')
		expect(hasModuleClass(unstyledWrapper, 'inkq-navbar__wrapper')).toBe(false)
		expect(hasModuleClass(styledWrapper, 'inkq-navbar__wrapper')).toBe(false)

		const unstyledInner = unstyledWrapper.querySelector('.inkq-navbar__inner') as HTMLElement,
			styledInner = styledWrapper.querySelector('.inkq-navbar__inner') as HTMLElement

		// Inner (`inkq-navbar__inner`): base class always present; module hash
		// only when styled.
		await expect(unstyledInner).toHaveClass('inkq-navbar__inner')
		await expect(styledInner).toHaveClass('inkq-navbar__inner')
		expect(hasModuleClass(unstyledInner, 'inkq-navbar__inner')).toBe(false)
		expect(hasModuleClass(styledInner, 'inkq-navbar__inner')).toBe(true)

		const unstyledCols = unstyledInner.querySelectorAll('.inkq-navbar__col'),
			styledCols = styledInner.querySelectorAll('.inkq-navbar__col')

		// Col (`inkq-navbar__col`): base class always present, 3 per bar;
		// module hash only when styled.
		await expect(unstyledCols).toHaveLength(3)
		await expect(styledCols).toHaveLength(3)
		expect(hasModuleClass(unstyledCols[0], 'inkq-navbar__col')).toBe(false)
		expect(hasModuleClass(styledCols[0], 'inkq-navbar__col')).toBe(true)

		// `buttons` (`inkq-navbar__buttons`) is NOT asserted here like
		// `inner`/`col` above: it lands on the auth `Button.Group`'s own root,
		// which independently carries its OWN `inkq-button-group` CSS-module
		// hash and `module` config classes (orientation/size) regardless of
		// THIS `Navbar`'s `unstyled` state (`Button.Group`'s own `unstyled` prop
		// is never set by `Navbar`) — so a simple "any extra class beyond the
		// base" check doesn't cleanly distinguish styled from unstyled here the
		// way it does for `inner`/`col`.
		const unstyledButtons = unstyledRoot.querySelector('.inkq-navbar__buttons') as HTMLElement,
			styledButtons = styledRoot.querySelector('.inkq-navbar__buttons') as HTMLElement

		await expect(unstyledButtons).toHaveClass('inkq-navbar__buttons')
		await expect(styledButtons).toHaveClass('inkq-navbar__buttons')
	},
}
