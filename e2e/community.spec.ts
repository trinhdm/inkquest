import { expect, test } from '@playwright/test'

// Route -> heading map, verified against each page.tsx under src/app/community/.
const COMMUNITY_PAGES = {
	'/community': 'Community',
	'/community/events': 'Community Events',
	'/community/feed': 'CommunityFeed',
	'/community/spotlights': 'Community Spotlights',
} as const

test.describe('/community', () => {
	test('renders the Community landing heading', async ({ page }) => {
		await page.goto('/community')

		await expect(page.getByRole('heading', { level: 1, name: 'Community' })).toBeVisible()
	})

	// The Subnav (src/components/navigation/Subnav/Subnav.tsx, mounted globally by
	// src/app/layout.tsx) is the only wired UI path to these three nested community
	// routes. It renders "Events" / "Feed" / "Spotlights" as flat items - not "Community"
	// itself - because Subnav's <Menu hasDropdowns={false}> flattens any item that has
	// its own submenu down to that submenu's children (src/components/navigation/Menu/MenuItem/MenuItem.tsx).
	// SELECTOR NOTE: MenuItem.tsx's MenuLabel() explicitly sets role="menuitem" on these
	// <Link> elements, overriding the anchor's implicit "link" role, so getByRole('menuitem', ...)
	// is used (verified in MenuItem.tsx, not assumed).
	for (const [route, heading] of Object.entries(COMMUNITY_PAGES).slice(1)) {
		const label = heading.replace('Community', '').trim() || 'Community'

		test(`Subnav link navigates from /community to ${route}`, async ({ page }) => {
			await page.goto('/community')

			await page.getByRole('menuitem', { name: label }).click()

			await expect(page).toHaveURL(route)
			await expect(page.getByRole('heading', { level: 1, name: heading })).toBeVisible()
		})
	}
})

test.describe('nested community routes with no in-app entry point', () => {
	// filterNavigation() (src/utils/navigation.ts) only surfaces a NAVIGATION_DATA node
	// if its own route is present in the routes array a given nav bar was given. Neither
	// Navbar's nor Subnav's routes prop in src/app/layout.tsx includes
	// '/community/events/lineup' or '/community/feed/circle', so these two routes are
	// reachable only by direct URL today. Documented here rather than faking a click path.
	test('renders /community/events/lineup directly', async ({ page }) => {
		await page.goto('/community/events/lineup')

		await expect(page.getByRole('heading', { level: 1, name: 'YourLineup' })).toBeVisible()
	})

	test('renders /community/feed/circle directly', async ({ page }) => {
		await page.goto('/community/feed/circle')

		await expect(page.getByRole('heading', { level: 1, name: 'YourCircle' })).toBeVisible()
	})
})
