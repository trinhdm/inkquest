import { expect, test } from '@playwright/test'

// /login (src/app/(user)/login/page.tsx) renders a <Section layout="banner" title="Welcome back.">
// holding a form with required Email and Password fields. A banner Section's title is an <h2>
// (buildSection.tsx: only `hero*` layouts get an <h1>), so /login has no <h1> at all.
// There is no submit handler or validation logic in the page, so only the rendered form and the
// validation the browser itself enforces (required / type="email") are asserted - never a
// post-submit outcome. Button names are matched by suffix/prefix regex because each Icon leaks
// its type into the accessible name (e.g. "googleLog In with Google").
//
// /signup, /profile and /settings (src/app/(user)/*/page.tsx) are still a bare
// `<main><h1>...</h1></main>`; /messages wraps its <h1>Messages</h1> in a <Container>. None has a form.
// The (user) layout mounts Header + Footer around every one of them (guarded by navigation.spec.ts).

test.describe('/login', () => {
	test('renders the "Welcome back." banner heading', async ({ page }) => {
		await page.goto('/login')

		await expect(page.getByRole('heading', { level: 2, name: 'Welcome back.', exact: true })).toBeVisible()
	})

	test('has no h1 of its own, because a banner Section titles with an h2', async ({ page }) => {
		await page.goto('/login')

		await expect(page.getByRole('heading', { level: 2, name: 'Welcome back.', exact: true })).toBeVisible()
		await expect(page.getByRole('heading', { level: 1 })).toHaveCount(0)
	})

	test('offers required email and password fields', async ({ page }) => {
		await page.goto('/login')

		const email = page.getByLabel('Email'),
			password = page.getByLabel('Password')

		await expect(email).toBeVisible()
		await expect(email).toHaveAttribute('type', 'email')
		await expect(email).toHaveJSProperty('required', true)
		await expect(password).toBeVisible()
		await expect(password).toHaveAttribute('type', 'password')
		await expect(password).toHaveJSProperty('required', true)
	})

	test('lets the reader type into the fields', async ({ page }) => {
		await page.goto('/login')

		await page.getByLabel('Email').fill('ink@example.com')
		await page.getByLabel('Password').fill('s3cret-pass')

		await expect(page.getByLabel('Email')).toHaveValue('ink@example.com')
		await expect(page.getByLabel('Password')).toHaveValue('s3cret-pass')
	})

	test('offers Google and Apple log in buttons that do not submit the form', async ({ page }) => {
		await page.goto('/login')

		const google = page.getByRole('button', { name: /Log In with Google$/ }),
			apple = page.getByRole('button', { name: /Log In with Apple$/ })

		await expect(google).toBeVisible()
		await expect(google).toHaveAttribute('type', 'button')
		await expect(apple).toBeVisible()
		await expect(apple).toHaveAttribute('type', 'button')
	})

	test('clicking a social button with an empty form neither navigates nor triggers validation', async ({ page }) => {
		await page.goto('/login')

		await page.getByRole('button', { name: /Log In with Google$/ }).click()
		await expect(page).toHaveURL('/login')
		// submitting would move focus to the first invalid field (see the submit tests below)
		await expect(page.getByLabel('Email')).not.toBeFocused()

		await page.getByRole('button', { name: /Log In with Apple$/ }).click()
		await expect(page).toHaveURL('/login')
		await expect(page.getByLabel('Email')).not.toBeFocused()
	})

	test('shows the "Forgot password?" caption under the password field', async ({ page }) => {
		await page.goto('/login')

		// Today it is a plain <span> caption: no link or button role, no href.
		// (Reported to the user rather than pinned here, so fixing it won't break this test.)
		await expect(page.getByText('Forgot password?', { exact: true })).toBeVisible()
	})

	test('keeps the user on /login when submitting with empty required fields', async ({ page }) => {
		await page.goto('/login')

		const email = page.getByLabel('Email'),
			submit = page.getByRole('button', { name: /^Log In(?! with)/ })

		// positive control: this really is the submit button, not a social one
		await expect(submit).toHaveAttribute('type', 'submit')

		await submit.click()

		await expect(page).toHaveURL('/login')
		await expect(email).toHaveJSProperty('validity.valueMissing', true)
		await expect(email).toBeFocused()
	})

	test('keeps the user on /login when only the email is filled', async ({ page }) => {
		await page.goto('/login')

		await page.getByLabel('Email').fill('ink@example.com')
		await page.getByRole('button', { name: /^Log In(?! with)/ }).click()

		await expect(page).toHaveURL('/login')
		await expect(page.getByLabel('Password')).toHaveJSProperty('validity.valueMissing', true)
		await expect(page.getByLabel('Password')).toBeFocused()
	})

	test('rejects a malformed email address in the browser', async ({ page }) => {
		await page.goto('/login')

		const email = page.getByLabel('Email')

		await email.fill('not-an-email')
		await page.getByLabel('Password').fill('s3cret-pass')
		await page.getByRole('button', { name: /^Log In(?! with)/ }).click()

		await expect(page).toHaveURL('/login')
		await expect(email).toHaveJSProperty('validity.typeMismatch', true)
		await expect(email).toBeFocused()
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
