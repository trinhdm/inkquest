import { expect, test } from '@playwright/test'

// IMPORTANT FINDING: src/app/(user)/login/page.tsx and src/app/(user)/signup/page.tsx
// (routes /login and /signup) currently render nothing but a bare `<main><h1>Login</h1></main>`
// / `<main><h1>Signup</h1></main>` - there is no <form>, no inputs, no labels, and no
// validation logic anywhere in either file. Per the anti-hallucination rules this spec
// does not invent a form, fields, or validation behavior that doesn't exist in source.
// It asserts only what is actually rendered today, and the absence of testable
// form/validation behavior is called out in the Maintenance Note as a blocking gap for
// the "render/state only" auth-pages coverage this suite was scoped to deliver.
//
// /profile and /settings (src/app/(user)/profile/page.tsx, settings/page.tsx) are the same
// bare `<main><h1>...</h1></main>` shape. /messages (src/app/(user)/messages/page.tsx) wraps
// its <h1>Messages</h1> in a <Container>, but is otherwise identical - no form, no inputs.
// None of the (user) routes render a Header/Footer layout (confirmed directly, and guarded
// by navigation.spec.ts's no-chrome sweep), so there is no banner/nav to assert here either.

test.describe('/login', () => {
	test('renders the Login placeholder heading', async ({ page }) => {
		await page.goto('/login')

		await expect(page.getByRole('heading', { level: 1, name: 'Login', exact: true })).toBeVisible()
	})

	test('has no form to submit or validate yet', async ({ page }) => {
		await page.goto('/login')

		await expect(page.getByRole('form')).toHaveCount(0)
		await expect(page.getByRole('textbox')).toHaveCount(0)
	})
})

test.describe('/signup', () => {
	test('renders the Signup placeholder heading', async ({ page }) => {
		await page.goto('/signup')

		await expect(page.getByRole('heading', { level: 1, name: 'Signup', exact: true })).toBeVisible()
	})

	test('has no form to submit or validate yet', async ({ page }) => {
		await page.goto('/signup')

		await expect(page.getByRole('form')).toHaveCount(0)
		await expect(page.getByRole('textbox')).toHaveCount(0)
	})
})

test.describe('/profile', () => {
	test('renders the Profile placeholder heading', async ({ page }) => {
		await page.goto('/profile')

		await expect(page.getByRole('heading', { level: 1, name: 'Profile', exact: true })).toBeVisible()
	})

	test('has no form to submit or validate yet', async ({ page }) => {
		await page.goto('/profile')

		await expect(page.getByRole('form')).toHaveCount(0)
		await expect(page.getByRole('textbox')).toHaveCount(0)
	})
})

test.describe('/settings', () => {
	test('renders the Settings placeholder heading', async ({ page }) => {
		await page.goto('/settings')

		await expect(page.getByRole('heading', { level: 1, name: 'Settings', exact: true })).toBeVisible()
	})

	test('has no form to submit or validate yet', async ({ page }) => {
		await page.goto('/settings')

		await expect(page.getByRole('form')).toHaveCount(0)
		await expect(page.getByRole('textbox')).toHaveCount(0)
	})
})

test.describe('/messages', () => {
	test('renders the Messages placeholder heading', async ({ page }) => {
		await page.goto('/messages')

		await expect(page.getByRole('heading', { level: 1, name: 'Messages', exact: true })).toBeVisible()
	})

	test('has no form to submit or validate yet', async ({ page }) => {
		await page.goto('/messages')

		await expect(page.getByRole('form')).toHaveCount(0)
		await expect(page.getByRole('textbox')).toHaveCount(0)
	})
})
