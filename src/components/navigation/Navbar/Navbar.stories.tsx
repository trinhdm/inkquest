import { expect, within } from 'storybook/test'
import { getDefaultProps } from '@/lib/registries'
import { Navbar } from './Navbar'
import { NAV_ROUTES } from '@/utils/navigation'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

// `Navbar.Props` (the `declare namespace` export) is just the raw `NavbarProps`
// interface — it doesn't include `as`/`unstyled`/`attributes`/etc., which only
// exist on the actual accepted prop type, `PolymorphicProps<NavbarProps, C>`.
// `Parameters<typeof Navbar>[0]` reads that real, wrapped type straight off the
// component itself — the generic call signature's default `C` resolves to
// `'nav'` here, since `NavbarSpecs`'s `default.component` is `'nav'`.
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
			description: 'Allow-list handed to `filterNavigation(NAVIGATION_DATA, routes)`. Omitted/empty means "no filtering" — the full nav tree renders. Filtering is shallow-first: an item is kept only if its OWN `route` is in the list (so the route-less `User` item is always dropped), and its children are then filtered by the same list.',
		},
		as: {
			control: false,
			description: '`Navbar` destructures `as` out of its props but renders a hardcoded `as="nav"`, so this prop has NO effect — hence there is no `AsElement` story here (unlike `Subnav`, which does honour `as`).',
		},
		unstyled: {
			control: 'boolean',
			description: 'Part of `PolymorphicProps` (via the shared `SpecsContract`), not `Navbar`\'s own `NavbarProps`. The semantic base class (`inkq-navbar`, `inkq-navbar__inner`, …) is ALWAYS emitted regardless — `unstyled` only suppresses the CSS-module-hashed class normally appended alongside it.',
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
 * Note the nav `<ul>` here is NOT `.inkq-menu`: `Navbar` passes
 * `{ ...styles('menu') }` to `<Menu>`, and `Menu` spreads `{ ...rest }` AFTER
 * its own `{ ...styles('root') }`, so the parent's `classNames` replaces
 * `Menu`'s own base class rather than merging with it. Assertions below stick
 * to roles/ARIA for that reason.
 */
export const Default: Story = {
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			nav = canvas.getByRole('navigation')

		await expect(nav.tagName).toBe('NAV')

		const menubar = within(nav).getByRole('menubar')
		await expect(within(menubar).getAllByRole('menuitem')).toHaveLength(7)

		// The two `Button.Group` auth buttons. `Button` derives its `aria-label`
		// from its text children, so they're addressable by name — unlike the 3
		// dropdown triggers, which have no accessible name at all.
		await expect(canvas.getByRole('button', { name: 'Log in' })).toBeInTheDocument()
		await expect(canvas.getByRole('button', { name: 'Sign up' })).toBeInTheDocument()
		await expect(canvas.getAllByRole('button')).toHaveLength(5)
	},
}

/**
 * The exact `routes` allow-list used by the app shell (`src/app/layout.tsx`).
 * Every child route is excluded, so `filterNavigation` sets each kept item's
 * `menu` to `undefined` — no dropdown triggers survive.
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
