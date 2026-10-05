import { expect, test } from '@playwright/test'

// src/app/discover/page.tsx renders only an <h1>Discover</h1> inside a <Section>
// (its child-rendering slot is commented out: `{/* { children } */}`), and
// src/app/discover/style/page.tsx renders only an <h1>DiscoverStyleQuiz</h1>.
//
// src/app/discover/layout.tsx mounts its own <Header/> + <Footer/> around both of these
// routes - the only route outside the (company) group that does - so both pages render the
// global chrome (see navigation.spec.ts for the banner/contentinfo/nav landmark coverage).
//
// Header defaults its Navbar to HEADER_GLOBAL_NAV (src/utils/navigation.ts:219) -
// ['/discover', '/marketplace', '/community'] - via Header's own defaultProps, since
// discover/layout.tsx passes it no `navbar` prop. filterNavigation() (src/utils/navigation.ts)
// only keeps a child route if it also appears in that same routes array, so the Navbar's
// "Discover" menuitem still has no dropdown here - its "Your Style" child survives the
// filter with an empty menu, not a populated one.
//
// The Subnav tells a different story: discover/layout.tsx also passes Header no `subnav`
// prop, so Header falls back to listRoutesWithSlug(pathname), which returns
// ['/discover', '/discover/style'] on this route. Subnav's hasDropdowns={false} then
// flattens the "Discover" item down to its own child, so the single Subnav menuitem
// rendered here is "Your Style", linking to /discover/style. That makes this a real,
// working in-app drill-down today - verified both by reading the source above and by
// inspecting the rendered DOM. (An earlier version of this file claimed no such
// drill-down existed anywhere in the app; that was true before discover/layout.tsx
// existed and is stale now.)

test.describe('/discover', () => {
	test('renders the Discover landing heading', async ({ page }) => {
		await page.goto('/discover')

		await expect(page.getByRole('heading', { level: 1, name: 'Discover' })).toBeVisible()
	})

	test('Subnav "Your Style" menuitem drills down to /discover/style', async ({ page }) => {
		await page.goto('/discover')

		await page.getByRole('banner').getByRole('menuitem', { name: 'Your Style' }).click()

		await expect(page).toHaveURL('/discover/style')
		await expect(page.getByRole('heading', { level: 1, name: 'DiscoverStyleQuiz' })).toBeVisible()
	})

	test('renders the discover style quiz route directly as well', async ({ page }) => {
		await page.goto('/discover/style')

		await expect(page.getByRole('heading', { level: 1, name: 'DiscoverStyleQuiz' })).toBeVisible()
	})
})
