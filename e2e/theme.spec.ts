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

const SCHEME_ATTR = 'data-inkq-scheme'
const SCHEME_STORAGE_KEY = 'inkq-scheme'
const JS_ANIMATE_ATTR = 'data-js-animate'

test.describe('color scheme persistence', () => {
	test('defaults to the dark color scheme when nothing is stored yet', async ({ page }) => {
		await page.goto('/')

		await expect(page.locator('html')).toHaveAttribute(SCHEME_ATTR, 'dark')
	})

	test('stamps data-js-animate on the document element once the injected script has run', async ({ page }) => {
		await page.goto('/')

		await expect(page.locator('html')).toHaveAttribute(JS_ANIMATE_ATTR, '')
	})

	test('persists a selected color scheme across client-side navigation and a full reload', async ({ page }) => {
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

		// Client-side navigation via the primary nav (role="menuitem" per MenuItem.tsx -
		// see navigation.spec.ts for why "link" is not the correct role here).
		await page.getByRole('navigation').getByRole('menuitem', { name: 'Discover' }).click()
		await expect(page).toHaveURL('/discover')
		await expect(page.locator('html')).toHaveAttribute(SCHEME_ATTR, 'light')

		// Full reload re-runs the injected ScriptInjector script from scratch; the
		// attribute should be re-derived from localStorage, not lost.
		await page.reload()
		await expect(page.locator('html')).toHaveAttribute(SCHEME_ATTR, 'light')
	})
})
