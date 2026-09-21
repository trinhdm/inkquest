import { expect, within } from 'storybook/test'
import { getDefaultProps } from '@/hooks/useProps'
import { Navbar } from './Navbar'
import { NAV_ROUTES } from '@/utils/navigation'
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
			options: Object.values(NAV_ROUTES),
			description: 'Allow-list handed to `filterNavigation(routes, NAVIGATION_DATA)`. Omitted/empty means "no filtering" — the full nav tree renders. Filtering is shallow-first: an item is kept only if its OWN `route` is in the list (so the route-less `User` item is always dropped), and its children are then filtered by the same list.',
		},
		as: {
			control: false,
			description: '`Navbar` forwards `as` to its root `<Box>` via `extractOtherProps`, so the rendered tag genuinely changes — see `AsElement`. Note `Navbar` also hardcodes `role="navigation"` on that same root `<Box>`, independent of `as` — that\'s the only reason `getAllByRole(\'navigation\')` still resolves the `as="div"`/`as="section"` cases in `AsElement`, which otherwise carry no implicit navigation landmark role.',
		},
		unstyled: {
			control: 'boolean',
			description: 'Part of `PolymorphicProps` (via the shared `SpecsContract`), not `Navbar`\'s own `NavbarProps`. The semantic base class (`inkq-navbar`, `inkq-navbar__wrapper`, `inkq-navbar__inner`, `inkq-navbar__col`, `inkq-navbar__menu`) is ALWAYS emitted regardless — `unstyled` only suppresses the CSS-module-hashed class normally appended alongside it, and only where `Navbar.module.scss` actually declares a hash to suppress. The render tree is root → wrapper (`styles(\'wrapper\', true)`, which ALSO unconditionally emits a global `inkq-wrapper` class) → inner → col ×3 → menu (`styles(\'menu\')`, no config). `Navbar.module.scss` declares only `.inkq-navbar`, `&__inner`, and `&__col` — `&__wrapper`/`&__menu` have no SCSS rule at all, so those two never carry a module hash, styled or unstyled. See the `Unstyled` story.',
		},
	},
	args: {
		...getDefaultProps<Navbar.Props>('Navbar'),
	},
}

export default meta

/**
 * No `routes`, so `filterNavigation` short-circuits and the entire
 * `NAVIGATION_DATA` tree renders: 7 top-level entries, 3 of which
 * (`Discover`, `Community`, `User`) get a dropdown trigger `<button>`.
 *
 * Note: `Navbar` passes `{ ...styles('menu') }` (a `className`/`style` pair)
 * to `<Menu>`. `Menu.tsx` destructures `className` out of its own props
 * BEFORE spreading `...rest` onto its root `<ul>` — so that className never
 * lands on the `<ul>` itself at all. Instead it's forwarded as the `className`
 * prop of every top-level `MenuItem`, which `getClassName.tsx`'s
 * `inheritClasses` logic then uses to rename each item's own root class from
 * `inkq-menu-item` to `inkq-navbar__menu-item` (since `'menu-item'.startsWith('menu')`).
 * Assertions below stick to roles/ARIA rather than literal class names for
 * that reason.
 */
export const Default: Story = {
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			nav = canvas.getByRole('navigation')

		await expect(nav.tagName).toBe('NAV')

		const menubar = within(nav).getByRole('menubar')
		await expect(within(menubar).getAllByRole('menuitem')).toHaveLength(7)

		// The two `Button.Group` auth buttons. `Button.tsx` only sets an
		// `aria-label` when `showLabel && ariaLabel.length` (`aria = { label:
		// !!(showLabel && ariaLabel.length) ? ariaLabel : undefined }`), and
		// `Navbar` renders these with no `showLabel` at all — so NO `aria-label`
		// is emitted here. The `getByRole('button', { name })` queries below
		// still pass because Testing Library's accessible-name computation
		// falls back to the button's own text content when there's no explicit
		// `aria-label`.
		await expect(canvas.getByRole('button', { name: 'Log in' })).toBeInTheDocument()
		await expect(canvas.getByRole('button', { name: 'Sign up' })).toBeInTheDocument()
		await expect(canvas.getAllByRole('button')).toHaveLength(5)
	},
}

/**
 * The exact `routes` allow-list used by the app shell (`src/app/layout.tsx`).
 * Every child route is excluded, so no kept item retains a non-empty `menu` —
 * no dropdown triggers survive. `filterNavigation` computes each kept item's
 * `menu` as `item.menu && filterNavigation(routes, item.menu)`: `Discover`
 * and `Community` both HAD a `menu` array, so they get filtered down to `[]`
 * (all their children's routes are excluded); `Marketplace` had no `menu` at
 * all, so it alone gets `undefined`. Either way `MenuItem.tsx` gates its
 * dropdown trigger on `isDropdown = !!menu?.length`, so both `[]` and
 * `undefined` render as a plain link — the assertions below hold regardless.
 */
export const FilteredRoutes: Story = {
	args: {
		routes: [
			NAV_ROUTES.DISCOVER,
			NAV_ROUTES.MARKETPLACE,
			NAV_ROUTES.COMMUNITY,
		],
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			menubar = canvas.getByRole('menubar'),
			items = within(menubar).getAllByRole('menuitem')

		await expect(items.map(item => item.textContent)).toEqual([
			'Discover', 'Marketplace', 'Community',
		])

		// `Discover`'s only child (`/discover/style`) isn't in the allow-list, so
		// the item is flattened to a plain link — no trigger anywhere.
		await expect(within(menubar).queryAllByRole('button')).toHaveLength(0)
		await expect(canvas.getAllByRole('button')).toHaveLength(2)
	},
}

export const SingleRoute: Story = {
	args: { routes: [NAV_ROUTES.MARKETPLACE] },
}

/**
 * Edge case: `routes` that match nothing. `filterNavigation` returns `[]`, and
 * `Navbar` guards the menu with `!!navItems.length`, so the `<Menu>` is not
 * rendered at all — only the logo column and the auth buttons remain.
 *
 * `/settings` is a deliberate choice: it exists in `NAV_ROUTES`, but only as a
 * child of the route-less `User` item, which `filterNavigation` drops outright
 * (it keys off `item.route` before ever recursing into `item.menu`).
 */
export const NoMatchingRoutes: Story = {
	args: { routes: [NAV_ROUTES.SETTINGS] },
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)

		await expect(canvas.getByRole('navigation')).toBeInTheDocument()
		await expect(canvas.queryByRole('menubar')).not.toBeInTheDocument()
		await expect(canvas.queryAllByRole('menuitem')).toHaveLength(0)

		await expect(canvas.getAllByRole('button')).toHaveLength(2)
		await expect(canvas.getByText('logo')).toBeInTheDocument()
	},
}

/**
 * `Navbar` forwards `as` to its root `<Box>` (via `extractOtherProps`), so the
 * rendered tag genuinely changes. `Navbar` also hardcodes `role="navigation"`
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
 * `inkq-navbar__wrapper`, `inkq-navbar__inner`, `inkq-navbar__col`) — it only
 * suppresses the CSS-module hash normally appended alongside them, and only
 * where `Navbar.module.scss` actually declares a rule to hash. Render tree:
 * root → wrapper (`styles('wrapper', true)`) → inner → col ×3. The wrapper's
 * `&__wrapper` selector has no SCSS declaration at all, so it never carries a
 * module hash, styled or unstyled alike — but the boolean `styles('wrapper',
 * true)` config ALSO unconditionally emits a literal, unhashed global
 * `inkq-wrapper` class (identical mechanism to `Container`/`Footer`'s own
 * wrapper), present regardless of `unstyled`. `&__inner`/`&__col` DO have
 * their own SCSS declarations, so they behave as expected: a real
 * CSS-module hash is appended when styled and suppressed when `unstyled`.
 */
export const Unstyled: Story = {
	parameters: { controls: { exclude: ['unstyled'] } },
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
		// The boolean-config global `inkq-wrapper` class is unconditional.
		await expect(unstyledWrapper).toHaveClass('inkq-navbar__wrapper', 'inkq-wrapper')
		await expect(styledWrapper).toHaveClass('inkq-navbar__wrapper', 'inkq-wrapper')
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
	},
}
