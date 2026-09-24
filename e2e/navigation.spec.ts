import { expect, test } from '@playwright/test'

// Root layout (src/app/layout.tsx) renders <header><Navbar/><Subnav/></header>
// and <Footer/> unconditionally around every route's children, so the banner
// and contentinfo landmarks should be present everywhere.
const TOP_LEVEL_ROUTES = [
	'/',
	'/discover',
	'/marketplace',
	'/community',
	'/about',
	'/careers',
	'/faqs',
	'/press',
] as const

test.describe('global header and footer', () => {
	for (const route of TOP_LEVEL_ROUTES) {
		test(`renders the banner nav and footer landmarks on ${route}`, async ({ page }) => {
			await page.goto(route)

			await expect(page.getByRole('banner')).toBeVisible()
			await expect(page.getByRole('contentinfo')).toBeVisible()

			// Navbar.tsx sets an explicit role="navigation" on its <Box as="nav">.
			await expect(page.getByRole('navigation')).toBeVisible()
		})
	}
})

test.describe('primary nav (Navbar)', () => {
	// Navbar routes are filtered by layout.tsx to ['/discover', '/marketplace', '/community']
	// (src/app/layout.tsx). Because filterNavigation() only keeps children whose own
	// route also appears in that same routes array (src/utils/navigation.ts), the nested
	// "Your Style" / community sub-routes never survive the filter here, so these three
	// links render as plain, non-dropdown links (no disclosure trigger).
	//
	// SELECTOR NOTE: MenuItem.tsx's MenuLabel() renders these as `<Link>` but explicitly
	// sets `role: 'menuitem'` in sharedProps, which overrides the anchor's implicit
	// "link" role. The accessible role actually exposed to the page is "menuitem" (nested
	// under the <ul role="menubar"> from Menu.tsx / <li role="none"> from MenuItem.tsx),
	// so getByRole('menuitem', ...) is used here rather than getByRole('link', ...) -
	// verified by reading MenuItem.tsx, not assumed from the visual "this is a nav link" intent.
	test('Discover link in the primary nav navigates to /discover', async ({ page }) => {
		await page.goto('/')

		await page.getByRole('navigation').getByRole('menuitem', { name: 'Discover' }).click()

		await expect(page).toHaveURL('/discover')
		await expect(page.getByRole('heading', { level: 1, name: 'Discover' })).toBeVisible()
	})

	test('Marketplace link in the primary nav navigates to /marketplace', async ({ page }) => {
		await page.goto('/')

		await page.getByRole('navigation').getByRole('menuitem', { name: 'Marketplace' }).click()

		await expect(page).toHaveURL('/marketplace')
		await expect(page.getByRole('heading', { level: 1, name: 'Marketplace' })).toBeVisible()
	})

	test('Community link in the primary nav navigates to /community', async ({ page }) => {
		await page.goto('/')

		await page.getByRole('navigation').getByRole('menuitem', { name: 'Community' }).click()

		await expect(page).toHaveURL('/community')
		await expect(page.getByRole('heading', { level: 1, name: 'Community' })).toBeVisible()
	})

	// NOTE: src/components/navigation/Menu/MenuItem/MenuItem.tsx leaves active-link
	// marking as an unimplemented TODO ("add behavior for: aria-current=page"). There is
	// no aria-current, data-active, or equivalent attribute in the rendered DOM to assert
	// on today, so no active-link-state test is included here. See Maintenance Note.

	// NOTE: the Navbar's "Log in" / "Sign up" buttons (src/components/navigation/Navbar/Navbar.tsx)
	// are rendered via <Button> with no `href`, which src/components/core/Button/Button.tsx
	// compiles to a plain <button> with no onClick — they are inert, not links to
	// /login or /signup. Confirmed by reading Button.tsx's LinkButtonProps/NativeButtonProps
	// union. No click-through test is written for them; see auth-pages.spec.ts, which
	// reaches those routes via direct navigation instead.
})

test.describe('secondary nav (Subnav)', () => {
	// layout.tsx always mounts <Subnav routes={['/community', '/community/feed', '/community/events', '/community/spotlights']} />
	// regardless of the current route, so this bar (and its links) are present globally,
	// not scoped to the community section.
	// NOTE: Subnav.tsx renders a plain <div> with no role/landmark and no accessible
	// label of its own (its "Community" <span> label text duplicates the Navbar's
	// "Community" link name, so it cannot be targeted unambiguously by role/text -
	// asserting on that label is intentionally skipped rather than reaching for a
	// positional or class-based selector). The Events/Feed/Spotlights link names are
	// unique across the page, so they can still be asserted directly.
	test('Subnav renders Events, Feed, and Spotlights menu items on every page', async ({ page }) => {
		await page.goto('/')

		for (const label of ['Events', 'Feed', 'Spotlights']) {
			await expect(page.getByRole('menuitem', { name: label })).toBeVisible()
		}
	})
})
