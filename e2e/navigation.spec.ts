import { expect, test } from '@playwright/test'

// src/app/layout.tsx (the root layout) renders only <ScriptInjector/> + <AppProvider/> for
// every route in the app - no header, no footer. The <Header/>+<Footer/> pair is mounted by
// four segment layouts instead:
//   - src/app/(company)/layout.tsx, for /about, /careers, /faqs, /press, /support
//   - src/app/discover/layout.tsx, for /discover/artists and /discover/style
//   - src/app/marketplace/layout.tsx, for /marketplace
//   - src/app/community/layout.tsx, for the six /community/* pages
// The (legal) and (user) layouts and the root '/' page render no chrome. /discover and
// /community are redirects (to /discover/artists and /community/feed), so they are not
// listed here - discover.spec.ts and community.spec.ts assert each redirect. Enumerate
// `find src/app -name layout.tsx` again if this list ever looks wrong - it has changed before.
const CHROME_ROUTES = [
	'/about',
	'/careers',
	'/faqs',
	'/press',
	'/support',
	'/discover/artists',
	'/discover/style',
	'/marketplace',
	'/community/events',
	'/community/events/lineup',
	'/community/feed',
	'/community/feed/circle',
	'/community/spotlights',
] as const

const NO_CHROME_ROUTES = [
	'/',
	'/cookies',
	'/privacy-policy',
	'/terms-conditions',
	'/login',
	'/signup',
	'/profile',
	'/settings',
	'/messages',
] as const

test.describe('routes with a Header/Footer layout', () => {
	for (const route of CHROME_ROUTES) {
		test(`renders the banner, contentinfo, and primary nav landmarks on ${route}`, async ({ page }) => {
			await page.goto(route)

			await expect(page.getByRole('banner')).toBeVisible()
			await expect(page.getByRole('contentinfo')).toBeVisible()

			// Scoped to the banner: /faqs also mounts a second, unlabeled <nav> via
			// Sidebar.tsx (used internally by FaqBrowser, at Sidebar.tsx:124), so an
			// unscoped page.getByRole('navigation') is a strict-mode violation there.
			await expect(page.getByRole('banner').getByRole('navigation')).toBeVisible()
		})
	}
})

test.describe('every other route has no page chrome', () => {
	for (const route of NO_CHROME_ROUTES) {
		test(`renders no banner or contentinfo landmark on ${route}`, async ({ page }) => {
			await page.goto(route)

			// toHaveCount(0), not .not.toBeVisible() - the latter would also pass if a
			// second banner/contentinfo element appeared and merely failed a strict-mode
			// check, silently hiding a regression instead of catching it.
			await expect(page.getByRole('banner')).toHaveCount(0)
			await expect(page.getByRole('contentinfo')).toHaveCount(0)
		})
	}
})

test.describe('primary nav (Navbar) and secondary nav (Subnav)', () => {
	// Exactly one real click-through, so coverage of MenuItem's role="menuitem" link path
	// (MenuItem.tsx's MenuLabel() renders nav links as next/link <a> elements but explicitly
	// sets role="menuitem" in sharedProps, overriding the anchor's implicit "link" role -
	// verified in MenuItem.tsx, not assumed) is not lost now that most routes have no nav to
	// click through at all.
	test('banner menuitem navigates to /discover/artists, and the /about Subnav renders its own items', async ({ page }) => {
		await page.goto('/about')

		// (company)/layout.tsx's Subnav (category: 'Company', routes: ['/about', '/faqs',
		// '/careers', '/press', '/support']) renders About/Careers/FAQs/Press/Support as flat
		// menuitems - disjoint from the Navbar's Discover/Marketplace/Community - so this is
		// unambiguous without scoping further or indexing into either <ul role="menubar">.
		await expect(page.getByRole('banner').getByRole('menuitem', { name: 'FAQs' })).toBeVisible()

		await page.getByRole('banner').getByRole('menuitem', { name: 'Discover' }).click()

		await expect(page).toHaveURL('/discover/artists')
		await expect(page.getByRole('heading', { level: 1, name: 'Discover Artists', exact: true })).toBeVisible()
	})
})
