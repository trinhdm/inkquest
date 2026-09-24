import { expect, test } from '@playwright/test'

// IMPORTANT FINDING: src/app/(user)/login/page.tsx and src/app/(user)/signup/page.tsx
// (routes /login and /signup) currently render nothing but a bare `<main><h1>Login</h1></main>`
// / `<main><h1>Signup</h1></main>` - there is no <form>, no inputs, no labels, and no
// validation logic anywhere in either file. Per the anti-hallucination rules this spec
// does not invent a form, fields, or validation behavior that doesn't exist in source.
// It asserts only what is actually rendered today, and the absence of testable
// form/validation behavior is called out in the Maintenance Note as a blocking gap for
// the "render/state only" auth-pages coverage this suite was scoped to deliver.

test.describe('/login', () => {
	test('renders the Login placeholder heading', async ({ page }) => {
		await page.goto('/login')

		await expect(page.getByRole('heading', { level: 1, name: 'Login' })).toBeVisible()
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

		await expect(page.getByRole('heading', { level: 1, name: 'Signup' })).toBeVisible()
	})

	test('has no form to submit or validate yet', async ({ page }) => {
		await page.goto('/signup')

		await expect(page.getByRole('form')).toHaveCount(0)
		await expect(page.getByRole('textbox')).toHaveCount(0)
	})
})
