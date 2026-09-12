import { expect, test } from '@playwright/test'

// src/app/discover/page.tsx renders only an <h1>Discover</h1> inside a <Container>
// (its child-rendering slot is commented out: `{/* { children } */}`), and
// src/app/discover/style/page.tsx renders only an <h1>DiscoverStyleQuiz</h1>.
//
// IMPORTANT FINDING: there is no accessible drill-down control anywhere in the app
// from /discover to /discover/style.
//   - The Navbar's "Discover" item does carry a submenu entry for "Your Style" in
//     src/utils/navigation.ts (NAVIGATION_DATA), but src/app/layout.tsx passes
//     Navbar routes={['/discover', '/marketplace', '/community']} — filterNavigation()
//     (src/utils/navigation.ts) only keeps a child route if it also appears in that
//     same top-level routes array, so the "Your Style" child is filtered out and the
//     Discover MenuItem renders with an empty menu (isDropdown === false, no trigger,
//     no submenu link is ever rendered for it).
//   - Subnav's routes prop never includes '/discover' or '/discover/style' either.
//   - /discover's own page body has no links at all.
// A true "click Discover, then click Your Style" drill-down test would therefore have
// to invent a control that does not exist in the DOM, which is forbidden. Instead this
// spec verifies both routes render correctly in isolation and documents the gap here
// and in the Maintenance Note for a human to decide whether to wire up the UI.

test.describe('/discover', () => {
	test('renders the Discover landing heading', async ({ page }) => {
		await page.goto('/discover')

		await expect(page.getByRole('heading', { level: 1, name: 'Discover' })).toBeVisible()
	})

	test('renders the discover style quiz route directly (no in-app link exists yet)', async ({ page }) => {
		await page.goto('/discover/style')

		await expect(page.getByRole('heading', { level: 1, name: 'DiscoverStyleQuiz' })).toBeVisible()
	})
})
