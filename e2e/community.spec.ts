import { expect, test } from '@playwright/test'

// Route -> <h1> text map, verified against each page.tsx under src/app/community/.
// src/app/community/layout.tsx mounts the Header/Footer chrome around every route here
// (navigation.spec.ts guards that directly), so this suite only confirms that each route
// renders its own heading when navigated to directly.
//
// /community itself is a redirect (src/app/community/page.tsx -> /community/feed), so it is
// tested separately below rather than listed in the map.
// Headings are matched with exact: true - Playwright's default name match is a
// case-insensitive substring, which would let "Your Circle" satisfy a "Your" check.
const COMMUNITY_PAGES = {
	'/community/events': 'Upcoming Events',
	'/community/events/lineup': 'Your Lineup',
	'/community/feed': 'Fresh ink today.',
	'/community/feed/circle': 'Your Circle',
	'/community/spotlights': 'Spotlights',
} as const

test.describe('community routes', () => {
	test('/community redirects to /community/feed', async ({ page }) => {
		await page.goto('/community')

		await expect(page).toHaveURL('/community/feed')
		await expect(page.getByRole('heading', { level: 1, name: 'Fresh ink today.', exact: true })).toBeVisible()
	})

	for (const [route, heading] of Object.entries(COMMUNITY_PAGES)) {
		test(`renders the "${heading}" heading at ${route}`, async ({ page }) => {
			await page.goto(route)

			await expect(page.getByRole('heading', { level: 1, name: heading, exact: true })).toBeVisible()
		})
	}
})
