import { expect, test } from '@playwright/test'

// /marketplace (src/app/marketplace/page.tsx) is currently a single hero Section: an <h1>
// "Marketplace" plus the placeholder text "Marketplace". The Header/Footer chrome around it
// is owned by navigation.spec.ts. The banner holds two "Marketplace" menuitems (Navbar and
// Subnav), so every query here is scoped to <main>.

test.describe('/marketplace', () => {
	test('renders the Marketplace hero heading inside main', async ({ page }) => {
		await page.goto('/marketplace')

		const main = page.getByRole('main')

		await expect(main.getByRole('heading', { level: 1, name: 'Marketplace', exact: true })).toBeVisible()
	})

	test('has exactly one h1 on the page', async ({ page }) => {
		await page.goto('/marketplace')

		await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1)
	})
})
