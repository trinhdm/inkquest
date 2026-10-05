import { expect, test } from '@playwright/test'

// Route -> <h1> text map, verified against each page.tsx under src/app/community/. None of
// these routes mount a Header/Footer layout (navigation.spec.ts asserts and guards that
// absence directly, across every non-chrome route in the app), so this suite only needs to
// confirm each route renders its own content when navigated to directly.
const COMMUNITY_PAGES = {
	'/community': 'Community',
	'/community/events': 'Community Events',
	'/community/events/lineup': 'YourLineup',
	'/community/feed': 'CommunityFeed',
	'/community/feed/circle': 'YourCircle',
	'/community/spotlights': 'Community Spotlights',
} as const

test.describe('community routes', () => {
	for (const [route, heading] of Object.entries(COMMUNITY_PAGES)) {
		test(`renders the "${heading}" heading at ${route}`, async ({ page }) => {
			await page.goto(route)

			await expect(page.getByRole('heading', { level: 1, name: heading })).toBeVisible()
		})
	}
})
