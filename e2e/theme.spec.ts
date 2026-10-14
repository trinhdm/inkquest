import { expect, test } from '@playwright/test'

// Verified from source:
// - src/utils/constants.ts: PREFIX_CSS_SELECTOR = 'inkq'
// - src/components/document/constants.ts: SCHEME_STORAGE_KEY = `${PREFIX_CSS_SELECTOR}-scheme` = 'inkq-scheme',
//   DEFAULT_COLOR_SCHEME = 'dark', and JS_ANIMATE_KEY = 'js-animate'
// - src/components/document/ScriptInjector/schemeControls.ts: applyScheme() sets
//   `document.documentElement.setAttribute('data-inkq-scheme', scheme)` and
//   persistScheme() writes `localStorage.setItem('inkq-scheme', scheme)`.
// - src/components/document/ScriptInjector/buildScript.ts: the inline <script> injected
//   into <head> (src/components/document/ScriptInjector/ScriptInjector.tsx) reads
//   localStorage['inkq-scheme'] on every page load and re-applies the `data-inkq-scheme`
//   attribute before hydration - this is the mechanism that makes the scheme survive a
//   full reload, and it only runs in a real browser (jsdom never executes injected
//   <script> tags), which is why this flow belongs in Playwright, not Jest.
// - src/app/page.tsx: the only page with the scheme toggle UI is the home page ('/'),
//   via a <Button.Group id="theme-selection"> with a "dark" button calling
//   setColorScheme('dark') and a "light" button calling setColorScheme('light')
//   (src/hooks/useColorScheme.tsx wires those calls to applyScheme + persistScheme).
//
// '/' itself renders no internal links at all today (only external vercel.com/nextjs.org
// anchors - confirmed by reading src/app/page.tsx), so no client-side navigation is
// reachable from the toggle's own page. The three tests below split what used to be one
// "persists across navigation and a full reload" test into the three distinct mechanisms
// that actually keep the scheme attribute correct, each exercised from wherever it is
// actually reachable.

const SCHEME_ATTR = 'data-inkq-scheme'
const SCHEME_STORAGE_KEY = 'inkq-scheme'
const JS_ANIMATE_ATTR = 'data-js-animate'

test.describe('color scheme persistence', () => {
	// TEST BUG FIX, verified against the live `buildScript.ts`: the injected
	// script does NOT hardcode `DEFAULT_COLOR_SCHEME` ('dark') when nothing is
	// stored — it falls back to `window.matchMedia('(prefers-color-scheme:
	// dark)')`. Playwright's default browser context emulates a `light`
	// system preference (Chromium's own default), so against an unstored
	// scheme this assertion previously observed `data-inkq-scheme="light"`,
	// not `"dark"` — a wrong assumption in the test, not a product bug.
	// `test.use({ colorScheme: 'dark' })` makes the scenario this test name
	// actually describes ("nothing stored, OS prefers dark") deterministic.
	test.describe('with the OS/browser color-scheme preference set to dark', () => {
		test.use({ colorScheme: 'dark' })

		test('follows the system dark preference when nothing is stored yet', async ({ page }) => {
			await page.goto('/')

			await expect(page.locator('html')).toHaveAttribute(SCHEME_ATTR, 'dark')
		})
	})

	test.describe('with the OS/browser color-scheme preference set to light', () => {
		test.use({ colorScheme: 'light' })

		test('follows the system light preference when nothing is stored yet', async ({ page }) => {
			await page.goto('/')

			await expect(page.locator('html')).toHaveAttribute(SCHEME_ATTR, 'light')
		})
	})

	test('stamps data-js-animate on the document element once the injected script has run', async ({ page }) => {
		await page.goto('/')

		await expect(page.locator('html')).toHaveAttribute(JS_ANIMATE_ATTR, '')
	})

	test('persists a selected color scheme across a full reload', async ({ page }) => {
		await page.goto('/')

		// SELECTOR NOTE: src/app/page.tsx also renders an unrelated
		// <Button variant="light">light</Button> demo button further down the page (part
		// of a variant showcase, not the scheme toggle), so a bare
		// getByRole('button', { name: 'light' }) would match two elements. Scoping to the
		// toggle's own <Button.Group id="theme-selection"> (an explicit, authored id -
		// not a generated/hashed class) disambiguates them.
		const themeToggle = page.locator('#theme-selection')
		await themeToggle.getByRole('button', { name: 'light' }).click()

		await expect(page.locator('html')).toHaveAttribute(SCHEME_ATTR, 'light')
		await expect
			.poll(() => page.evaluate(key => localStorage.getItem(key), SCHEME_STORAGE_KEY))
			.toBe('light')

		// A full reload re-runs the injected ScriptInjector script from scratch; the
		// attribute should be re-derived from localStorage, not lost.
		await page.reload()
		await expect(page.locator('html')).toHaveAttribute(SCHEME_ATTR, 'light')
	})

	test('re-applies on a cold load of another route', async ({ page }) => {
		await page.goto('/')

		const themeToggle = page.locator('#theme-selection')
		await themeToggle.getByRole('button', { name: 'light' }).click()
		await expect(page.locator('html')).toHaveAttribute(SCHEME_ATTR, 'light')

		// page.goto (not a click-through) - a genuinely cold load of a different route,
		// so the only thing that can be re-applying the attribute here is the injected
		// <script> reading localStorage before hydration. jsdom never executes injected
		// <script> tags, so this is the one persistence path Jest structurally cannot
		// cover, and the one that actually matters for a real user refreshing or
		// deep-linking into the app with a scheme already chosen.
		await page.goto('/discover/artists')
		await expect(page.locator('html')).toHaveAttribute(SCHEME_ATTR, 'light')
	})

	test('survives a soft client-side navigation', async ({ page }) => {
		await page.goto('/')

		const themeToggle = page.locator('#theme-selection')
		await themeToggle.getByRole('button', { name: 'light' }).click()
		await expect(page.locator('html')).toHaveAttribute(SCHEME_ATTR, 'light')

		// '/' has no in-app links to soft-navigate from, so this reaches a page that
		// renders a real next/link menuitem via a full load first. That full load is
		// coupled to a Header-equipped layout - today four segment layouts
		// mount one ((company), discover, marketplace, community - see navigation.spec.ts);
		// /about is used here as the representative case.
		await page.goto('/about')
		await expect(page.locator('html')).toHaveAttribute(SCHEME_ATTR, 'light')

		// This click is the actual soft navigation under test: a client-side Link
		// transition does not unmount <html> or re-run the injected script, so the
		// attribute must simply survive because the DOM node it lives on never goes away.
		// (role="menuitem" per MenuItem.tsx - see navigation.spec.ts for why "link" is not
		// the correct role here.)
		await page.getByRole('banner').getByRole('menuitem', { name: 'FAQs' }).click()
		await expect(page).toHaveURL('/faqs')
		await expect(page.locator('html')).toHaveAttribute(SCHEME_ATTR, 'light')
	})
})
