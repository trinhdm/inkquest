import { expect, test } from '@playwright/test'

// /discover is a redirect (src/app/discover/page.tsx -> /discover/artists). The real pages
// are /discover/artists (h1 "Discover Artists") and /discover/style (h1 "Discover Styles").
//
// src/app/discover/layout.tsx mounts Header + Footer around both (see navigation.spec.ts
// for the landmark coverage). On /discover/artists the Subnav renders nothing, so the
// banner has no "Your Style" link there. The only in-app route to /discover/style is the
// FOOTER's "Your Style" menuitem, which is what the drill-down test clicks.
//
// All heading checks use exact: true. Playwright's default name match is a
// case-insensitive substring, so "Discover" would also match "Discover Artists".

test.describe('/discover', () => {
	test('redirects to /discover/artists and renders its heading', async ({ page }) => {
		await page.goto('/discover')

		await expect(page).toHaveURL('/discover/artists')
		await expect(page.getByRole('heading', { level: 1, name: 'Discover Artists', exact: true })).toBeVisible()
	})

	test('footer "Your Style" menuitem drills down to /discover/style', async ({ page }) => {
		await page.goto('/discover/artists')

		await page.getByRole('contentinfo').getByRole('menuitem', { name: 'Your Style' }).click()

		await expect(page).toHaveURL('/discover/style')
		await expect(page.getByRole('heading', { level: 1, name: 'Discover Styles', exact: true })).toBeVisible()
	})

	test('renders the discover style route directly as well', async ({ page }) => {
		await page.goto('/discover/style')

		await expect(page.getByRole('heading', { level: 1, name: 'Discover Styles', exact: true })).toBeVisible()
	})
})
