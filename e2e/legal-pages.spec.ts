import { expect, test } from '@playwright/test'

// Route -> <h1> text map, verified against each page.tsx under src/app/(legal)/.
// The privacy-policy and terms titles were once swapped; matching each route
// against its own title with exact: true locks that fix in. (Playwright's default name
// match is a case-insensitive substring, so it must be exact.)
//
// src/app/(legal)/layout.tsx mounts the Header (with a Legal subnav) and Footer around every
// route here - navigation.spec.ts's chrome sweep already guards that.
//
// /terms (renamed from /terms-conditions, which now 404s) takes its <h1> from
// `hero.heading` in terms.data.ts rather than the page `title`.
const LEGAL_PAGES = {
	'/cookies': 'Cookie Policy',
	'/privacy-policy': 'Privacy Policy',
	'/terms': 'Terms of Service',
} as const

test.describe('legal routes', () => {
	for (const [route, heading] of Object.entries(LEGAL_PAGES)) {
		test(`renders the "${heading}" heading at ${route}`, async ({ page }) => {
			await page.goto(route)

			await expect(page.getByRole('heading', { level: 1, name: heading, exact: true })).toBeVisible()
		})
	}
})

// The Legal subnav (src/app/(legal)/layout.tsx: category 'Legal', routes ['/privacy-policy',
// '/terms', '/cookies']) lives in the banner. Each of its items is a menuitem (MenuLabel sets
// role="menuitem" on its anchors). Scoped to the banner because the footer repeats these links.
// Subnav item labels, read from the rendered banner (they are shorter than the page headings).
const SUBNAV_LABELS = {
	'/cookies': 'Cookies',
	'/privacy-policy': 'Privacy',
	'/terms': 'Terms',
} as const

test.describe('Legal subnav', () => {
	test('lists Privacy, Terms and Cookies under a "Legal" label in the banner', async ({ page }) => {
		await page.goto('/cookies')

		const banner = page.getByRole('banner')

		await expect(banner.getByText('Legal', { exact: true })).toBeVisible()
		for (const label of Object.values(SUBNAV_LABELS))
			await expect(banner.getByRole('menuitem', { name: label, exact: true })).toBeVisible()
	})

	for (const [from, fromHeading] of Object.entries(LEGAL_PAGES)) {
		for (const [to, toHeading] of Object.entries(LEGAL_PAGES)) {
			if (from === to) continue

			test(`navigates from ${from} to ${to}`, async ({ page }) => {
				await page.goto(from)

				const banner = page.getByRole('banner')

				// positive control: we really start on the page we think we do
				await expect(page.getByRole('heading', { level: 1, name: fromHeading, exact: true })).toBeVisible()

				await banner.getByRole('menuitem', { name: SUBNAV_LABELS[to as keyof typeof SUBNAV_LABELS], exact: true }).click()

				await expect(page).toHaveURL(to)
				await expect(page.getByRole('heading', { level: 1, name: toHeading, exact: true })).toBeVisible()
			})
		}
	}
})
