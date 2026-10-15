import { expect, test } from '@playwright/test'

// Route -> <h1> text map, verified against each page.tsx under src/app/(legal)/.
// The privacy-policy and terms titles were once swapped; matching each route
// against its own title with exact: true locks that fix in. (Playwright's default name
// match is a case-insensitive substring, so it must be exact.)
//
// src/app/(legal)/layout.tsx is a pass-through, so these routes render no Header/Footer -
// navigation.spec.ts's no-chrome sweep already guards that.
const LEGAL_PAGES = {
	'/cookies': 'Cookies',
	'/privacy-policy': 'Privacy Policy',
	'/terms': 'Terms & Conditions',
} as const

test.describe('legal routes', () => {
	for (const [route, heading] of Object.entries(LEGAL_PAGES)) {
		test(`renders the "${heading}" heading at ${route}`, async ({ page }) => {
			await page.goto(route)

			await expect(page.getByRole('heading', { level: 1, name: heading, exact: true })).toBeVisible()
		})
	}
})
