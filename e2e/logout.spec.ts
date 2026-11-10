import { expect, test, type BrowserContext, type Page } from '@playwright/test'

// /logout (src/app/(auth)/logout/page.tsx) picks one of two screens on the server:
//   - `confirm` while a session exists: the account card and a "Log out" button that runs `logout`
//   - `finish` after logging out: the remembered account, "Continue as ___" and "Use a different account"
// With neither a session nor a remembered account, it redirects to /login.
//
// Two cookies carry the account between pages (src/lib/auth/account.ts):
//   - inkq_last_account, written by `logout`, read by the `finish` screen
//   - inkq_login_hint, written only by "Continue as", read by /login to fill in the email
//
// The session is a mock: the inkq_session cookie holds the account itself
// (src/lib/auth/session.ts), so tests sign in by setting it directly. Next URI-decodes cookie
// values, so the JSON is encoded the same way.

const OUTCOME = { timeout: 15_000 }

const ACCOUNT = { email: 'ada@example.com', name: 'Ada Lovelace' }

const signIn = (context: BrowserContext, baseURL = 'http://localhost:3000') =>
	context.addCookies([{
		name: 'inkq_session',
		value: encodeURIComponent(JSON.stringify(ACCOUNT)),
		url: baseURL,
		httpOnly: true,
		sameSite: 'Lax',
	}])

const cookieNames = async (context: BrowserContext) =>
	(await context.cookies()).map(({ name }) => name)

const heading = (page: Page, name: string) =>
	page.getByRole('heading', { level: 2, name, exact: true })

const email = (page: Page) => page.getByRole('textbox', { name: 'Email' })

// the navbar's avatar trigger has no accessible name, so it is found by its id's ending
const userMenu = (page: Page) => page.locator('[id$="-user-trigger"]')

const logOutFromConfirm = async (page: Page) => {
	await page.goto('/logout')
	await page.getByRole('button', { name: 'Log out', exact: true }).click()
	await expect(heading(page, `You're signed out.`)).toBeVisible(OUTCOME)
}

test.describe('/logout while still logged in', () => {
	test.beforeEach(async ({ context, baseURL }) => signIn(context, baseURL))

	test('asks to confirm instead of claiming the visitor is logged out', async ({ page }) => {
		await page.goto('/logout')

		await expect(heading(page, 'Log out of Inkquest?')).toBeVisible()
		await expect(heading(page, `You're signed out.`)).toHaveCount(0)
		await expect(page.getByText(ACCOUNT.email)).toBeVisible()
		await expect(userMenu(page)).toHaveCount(1)
	})

	test('"Log out" ends the session and shows the remembered account', async ({ context, page }) => {
		await logOutFromConfirm(page)

		await expect(page).toHaveURL('/logout')
		await expect(userMenu(page)).toHaveCount(0)
		await expect(page.getByRole('button', { name: 'Continue as Ada' })).toBeVisible()
		expect(await cookieNames(context)).toEqual(['inkq_last_account'])
	})
})

test.describe('/logout after logging out', () => {
	test.beforeEach(async ({ context, baseURL, page }) => {
		await signIn(context, baseURL)
		await logOutFromConfirm(page)
	})

	test('"Continue as" opens /login with the email filled in', async ({ context, page }) => {
		await page.getByRole('button', { name: 'Continue as Ada' }).click()

		await expect(page).toHaveURL('/login', OUTCOME)
		await expect(email(page)).toHaveValue(ACCOUNT.email)
		expect(await cookieNames(context)).toEqual(['inkq_login_hint'])
	})

	test('"Use a different account" opens /login with a blank email and no cookies left', async ({ context, page }) => {
		await page.getByRole('button', { name: 'Use a different account' }).click()

		await expect(page).toHaveURL('/login', OUTCOME)
		await expect(email(page)).toHaveValue('')
		expect(await cookieNames(context)).toEqual([])
	})

	test('a reload still shows the remembered account', async ({ page }) => {
		await page.reload()

		await expect(page.getByRole('button', { name: 'Continue as Ada' })).toBeVisible()
	})
})

test.describe('/logout with nothing to show', () => {
	test('redirects to a blank /login', async ({ context, page }) => {
		await page.goto('/logout')

		await expect(page).toHaveURL('/login')
		await expect(email(page)).toHaveValue('')
		expect(await cookieNames(context)).toEqual([])
	})
})

test.describe('/login without "Continue as"', () => {
	test('is blank after logging out', async ({ context, baseURL, page }) => {
		await signIn(context, baseURL)
		await logOutFromConfirm(page)
		await page.goto('/login')

		await expect(email(page)).toHaveValue('')
	})
})
