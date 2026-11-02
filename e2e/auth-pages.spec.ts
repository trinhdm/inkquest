import { expect, test, type Page } from '@playwright/test'

// /login and /signup (src/app/(auth)/{login,signup}/_form/*) are multi-screen flows rendered by one
// page each. Every screen is a `Section layout="content-form"`, whose title is an <h2>
// (buildSection.tsx: only `hero*` layouts get an <h1>), so neither page has an <h1>.
//
// Forms are `noValidate`: the browser never shows its own bubbles. Each Form runs a zod `validate`
// on submit (login/_utils/schema.ts, signup/_utils/schema.ts), blocks the submit, shows the message
// next to the field and moves focus to the first invalid control. Typing in an invalid field
// clears its message, except on /signup (`feedback="eager"`), where the message updates as the
// reader types. Server actions are MOCKS (login/_utils/actions.ts, lib/form/actions.ts):
// they wait ~800ms with `pause()` on the server, so outcome assertions use a longer timeout.
// The fixed failure branches are the password `wrong`, which login rejects, and the signup
// email fail@example.com and phone (000) 000-0000 (MOCK_DATA in lib/form/constants.ts).
//
// Countdowns (the 30s "Resend available in" timer) use Date.now and requestAnimationFrame, so
// those tests install `page.clock` BEFORE navigation and `fastForward` past the 30 seconds.
//
// Icons are `hidden` by default now, so button names are plain ("Log In", "Log In with Google").
// The password field is matched with /^Password/: a plain getByLabel('Password') would also
// match the "Show password" toggle. Email is found by role + name because on /signup the
// "Use email & password" button carries an "email icon" label that getByLabel('Email') also hits.
//
// Not covered on purpose (in-progress source, see the report): the signup verify code step
// (Verify and Resend are blocked by validation) and the signup resend action.
//
// /profile, /settings and /messages (src/app/(user)/*/page.tsx) are still placeholder
// `Section layout="hero"` pages with an <h1> and no form. /settings only adds the two theme
// buttons (covered in theme.spec.ts). The (user) layout mounts Header + Footer around every one
// of them (guarded by navigation.spec.ts).

const OUTCOME = { timeout: 15_000 }

const email = (page: Page) => page.getByRole('textbox', { name: 'Email' }),
	password = (page: Page) => page.getByLabel(/^Password/),
	submitLogin = (page: Page) => page.getByRole('button', { name: 'Log In', exact: true }),
	statusText = (page: Page, text: string) => page.getByRole('status').filter({ hasText: text })

// 30s timer text such as "Resend available in00:28"
const WAITING = /^Resend available in\s*\d\d:\d\d$/

test.describe('/login', () => {
	test('renders the "Welcome back." heading as an h2, with no h1', async ({ page }) => {
		await page.goto('/login')

		await expect(page.getByRole('heading', { level: 2, name: 'Welcome back.', exact: true })).toBeVisible()
		await expect(page.getByRole('heading', { level: 1 })).toHaveCount(0)
	})

	test('offers required email and password fields', async ({ page }) => {
		await page.goto('/login')

		await expect(email(page)).toBeVisible()
		await expect(email(page)).toHaveAttribute('type', 'email')
		await expect(email(page)).toHaveJSProperty('required', true)
		await expect(password(page)).toBeVisible()
		await expect(password(page)).toHaveAttribute('type', 'password')
		await expect(password(page)).toHaveJSProperty('required', true)
	})

	test('lets the reader type into the fields', async ({ page }) => {
		await page.goto('/login')

		await email(page).fill('ink@example.com')
		await password(page).fill('s3cret-pass')

		await expect(email(page)).toHaveValue('ink@example.com')
		await expect(password(page)).toHaveValue('s3cret-pass')
	})

	test('offers Google and Apple log in buttons that do not submit the form', async ({ page }) => {
		await page.goto('/login')

		for (const name of ['Log In with Google', 'Log In with Apple']) {
			const button = page.getByRole('button', { name, exact: true })

			await expect(button).toBeVisible()
			await expect(button).toHaveAttribute('type', 'button')
		}
	})

	test('logs straight in with Google or Apple, showing the success screen', async ({ page }) => {
		for (const name of ['Log In with Google', 'Log In with Apple']) {
			await page.goto('/login')
			await page.getByRole('button', { name, exact: true }).click()

			await expect(page).toHaveURL('/login')
			await expect(page.getByRole('heading', { level: 2, name: 'Logged in.', exact: true })).toBeVisible()
			await expect(page.getByRole('link', { name: 'Go to your feed' })).toHaveAttribute('href', '/community/feed')
			await expect(page.getByRole('heading', { level: 2, name: 'Welcome back.', exact: true })).toHaveCount(0)
		}
	})

	test('offers "Forgot password?" as a button, not a plain caption', async ({ page }) => {
		await page.goto('/login')

		await expect(page.getByRole('button', { name: 'Forgot password?', exact: true })).toBeVisible()
	})

	test.describe('validation', () => {
		test('shows a message for each empty field and focuses the email', async ({ page }) => {
			await page.goto('/login')
			await submitLogin(page).click()

			await expect(page).toHaveURL('/login')
			await expect(page.getByText('Enter a valid email address.', { exact: true })).toBeVisible()
			await expect(page.getByText('Enter your password.', { exact: true })).toBeVisible()
			await expect(email(page)).toHaveAttribute('aria-invalid', 'true')
			await expect(email(page)).toBeFocused()
		})

		test('keeps the user on /login and focuses the password when only the email is filled', async ({ page }) => {
			await page.goto('/login')
			await email(page).fill('ink@example.com')
			await submitLogin(page).click()

			await expect(page.getByText('Enter your password.', { exact: true })).toBeVisible()
			await expect(page.getByText('Enter a valid email address.', { exact: true })).toHaveCount(0)
			await expect(password(page)).toBeFocused()
		})

		test('rejects a malformed email address with our own message, not the browser bubble', async ({ page }) => {
			await page.goto('/login')
			await email(page).fill('not-an-email')
			await password(page).fill('s3cret-pass')
			await submitLogin(page).click()

			await expect(page).toHaveURL('/login')
			await expect(page.getByText('Invalid email address.', { exact: true })).toBeVisible()
			await expect(email(page)).toBeFocused()
		})

		test('clears a field message as soon as the reader fixes that field', async ({ page }) => {
			await page.goto('/login')
			await submitLogin(page).click()
			await expect(page.getByText('Enter a valid email address.', { exact: true })).toBeVisible()

			await email(page).fill('ink@example.com')

			await expect(page.getByText('Enter a valid email address.', { exact: true })).toHaveCount(0)
			// positive control: the untouched password field still shows its message
			await expect(page.getByText('Enter your password.', { exact: true })).toBeVisible()
		})

		test('the magic link button only checks the email, not the password', async ({ page }) => {
			await page.goto('/login')
			await page.getByRole('button', { name: 'Email me a magic link instead' }).click()

			await expect(page.getByText('Enter a valid email address.', { exact: true })).toBeVisible()
			await expect(page.getByText('Enter your password.', { exact: true })).toHaveCount(0)
			await expect(page.getByRole('heading', { level: 2, name: 'Check your inbox', exact: true })).toHaveCount(0)
		})
	})

	test.describe('password log in', () => {
		test('shows a form-level error and stays on the form after a wrong password', async ({ page }) => {
			await page.goto('/login')
			await email(page).fill('ink@example.com')
			await password(page).fill('wrong')
			await submitLogin(page).click()

			await expect(statusText(page, 'Email or password is incorrect.')).toBeVisible(OUTCOME)
			await expect(page.getByRole('heading', { level: 2, name: 'Welcome back.', exact: true })).toBeVisible()
			// the email the reader typed is kept so they only retype the password
			await expect(email(page)).toHaveValue('ink@example.com')
			await expect(page.getByRole('heading', { level: 2, name: 'Logged in.', exact: true })).toHaveCount(0)
		})

		test('a correct password reaches the success screen with the feed link', async ({ page }) => {
			await page.goto('/login')
			await email(page).fill('ink@example.com')
			await password(page).fill('s3cret-pass')
			await submitLogin(page).click()

			await expect(page.getByRole('heading', { level: 2, name: 'Logged in.', exact: true })).toBeVisible(OUTCOME)
			await expect(page.getByText('Welcome back — your feed is where you left it.')).toBeVisible()
			await expect(email(page)).toHaveValue('ink@example.com')
			await expect(email(page)).toHaveJSProperty('readOnly', true)
			await expect(page.getByRole('link', { name: 'Go to your feed' })).toHaveAttribute('href', '/community/feed')
		})
	})

	test.describe('magic link', () => {
		const openMagic = async (page: Page) => {
			await page.goto('/login')
			await email(page).fill('ink@example.com')
			await page.getByRole('button', { name: 'Email me a magic link instead' }).click()
			await expect(page.getByRole('heading', { level: 2, name: 'Check your inbox', exact: true })).toBeVisible(OUTCOME)
		}

		test('shows the inbox screen with the address and a disabled resend timer', async ({ page }) => {
			await page.clock.install()
			await openMagic(page)

			await expect(page.getByText('We emailed a sign-in link to ink@example.com. It expires in 15 minutes.')).toBeVisible()
			await expect(email(page)).toHaveValue('ink@example.com')
			await expect(email(page)).toHaveJSProperty('readOnly', true)

			const resend = page.getByRole('button', { name: WAITING })

			await expect(resend).toBeDisabled()
			await expect(page.getByRole('button', { name: 'Back', exact: true })).toBeVisible()
		})

		test('enables resend after the 30 second countdown and confirms a second link', async ({ page }) => {
			await page.clock.install()
			await openMagic(page)
			await expect(page.getByRole('button', { name: WAITING })).toBeDisabled()

			await page.clock.fastForward(31_000)

			const resend = page.getByRole('button', { name: 'Resend link', exact: true })

			await expect(resend).toBeEnabled()
			await expect(page.getByRole('button', { name: WAITING })).toHaveCount(0)

			await resend.click()

			await expect(statusText(page, 'We sent another link to ink@example.com.')).toBeVisible(OUTCOME)
			await expect(page.getByRole('button', { name: WAITING })).toBeDisabled()
		})

		test('Back returns to the log in form with the email kept', async ({ page }) => {
			await openMagic(page)
			await page.getByRole('button', { name: 'Back', exact: true }).click()

			await expect(page.getByRole('heading', { level: 2, name: 'Welcome back.', exact: true })).toBeVisible()
			await expect(email(page)).toHaveValue('ink@example.com')
		})
	})

	test.describe('forgot password', () => {
		test('"Forgot password?" opens the reset request form', async ({ page }) => {
			await page.goto('/login')
			await page.getByRole('button', { name: 'Forgot password?', exact: true }).click()

			await expect(page.getByRole('heading', { level: 2, name: 'Forgot your password?', exact: true })).toBeVisible()
			await expect(email(page)).toBeVisible()
			await expect(page.getByRole('button', { name: 'Send reset link', exact: true })).toBeVisible()
		})

		test('validates the email before sending', async ({ page }) => {
			await page.goto('/login')
			await page.getByRole('button', { name: 'Forgot password?', exact: true }).click()
			await page.getByRole('button', { name: 'Send reset link', exact: true }).click()

			await expect(page.getByText('Enter a valid email address.', { exact: true })).toBeVisible()
			await expect(email(page)).toBeFocused()

			await email(page).fill('not-an-email')
			await page.getByRole('button', { name: 'Send reset link', exact: true }).click()

			await expect(page.getByText('Invalid email address.', { exact: true })).toBeVisible()
			await expect(page.getByRole('heading', { level: 2, name: 'Reset link sent', exact: true })).toHaveCount(0)
		})

		test('Back returns to log in', async ({ page }) => {
			await page.goto('/login')
			await page.getByRole('button', { name: 'Forgot password?', exact: true }).click()
			await page.getByRole('button', { name: 'Back', exact: true }).click()

			await expect(page.getByRole('heading', { level: 2, name: 'Welcome back.', exact: true })).toBeVisible()
		})

		test('sending the link shows the reset screen with a resend countdown', async ({ page }) => {
			await page.clock.install()
			await page.goto('/login')
			await page.getByRole('button', { name: 'Forgot password?', exact: true }).click()
			await email(page).fill('ink@example.com')
			await page.getByRole('button', { name: 'Send reset link', exact: true }).click()

			await expect(page.getByRole('heading', { level: 2, name: 'Reset link sent', exact: true })).toBeVisible(OUTCOME)
			await expect(page.getByText('If an account exists for ink@example.com, a link to reset your password is on its way. It expires in 30 minutes.')).toBeVisible()
			await expect(page.getByRole('button', { name: WAITING })).toBeDisabled()

			await page.clock.fastForward(31_000)
			await page.getByRole('button', { name: 'Resend link', exact: true }).click()

			await expect(statusText(page, 'We sent another link to ink@example.com.')).toBeVisible(OUTCOME)
		})

		test('"Wrong email?" goes back to the request form with the address kept, and "Back to log in" leaves', async ({ page }) => {
			await page.goto('/login')
			await page.getByRole('button', { name: 'Forgot password?', exact: true }).click()
			await email(page).fill('ink@example.com')
			await page.getByRole('button', { name: 'Send reset link', exact: true }).click()
			await expect(page.getByRole('heading', { level: 2, name: 'Reset link sent', exact: true })).toBeVisible(OUTCOME)

			await page.getByRole('button', { name: 'Wrong email?', exact: true }).click()

			await expect(page.getByRole('heading', { level: 2, name: 'Forgot your password?', exact: true })).toBeVisible()
			await expect(email(page)).toHaveValue('ink@example.com')

			await page.getByRole('button', { name: 'Send reset link', exact: true }).click()
			await expect(page.getByRole('heading', { level: 2, name: 'Reset link sent', exact: true })).toBeVisible(OUTCOME)
			await page.getByRole('button', { name: 'Back to log in', exact: true }).click()

			await expect(page.getByRole('heading', { level: 2, name: 'Welcome back.', exact: true })).toBeVisible()
		})
	})
})

test.describe('/signup', () => {
	const rule = (page: Page, label: string) => page.getByRole('main').getByRole('listitem').filter({ hasText: label })

	const expectRules = async (page: Page, met: string[], unmet: string[]) => {
		for (const label of met) {
			await expect(rule(page, label)).toContainText(': has met')
			await expect(rule(page, label)).not.toContainText('has not met')
		}

		for (const label of unmet)
			await expect(rule(page, label)).toContainText('has not met')
	}

	const LENGTH = '6+ characters', SEQUENCE = 'No sequences', UPPER = 'One uppercase letter', LOWER = 'One lowercase letter', NUMBER = 'A number', SYMBOL = 'A symbol'

	test('renders the "Join Inkquest." heading as an h2, with no h1', async ({ page }) => {
		await page.goto('/signup')

		await expect(page.getByRole('heading', { level: 2, name: 'Join Inkquest.', exact: true })).toBeVisible()
		await expect(page.getByRole('heading', { level: 1 })).toHaveCount(0)
	})

	test('offers required email and password fields and a create account button', async ({ page }) => {
		await page.goto('/signup')

		await expect(email(page)).toHaveAttribute('type', 'email')
		await expect(email(page)).toHaveJSProperty('required', true)
		await expect(password(page)).toHaveAttribute('type', 'password')
		await expect(password(page)).toHaveJSProperty('required', true)
		await expect(page.getByRole('button', { name: 'Create account', exact: true })).toHaveAttribute('type', 'submit')
	})

	test('links to the Terms and the Privacy Policy', async ({ page }) => {
		await page.goto('/signup')

		await expect(page.getByRole('main').getByRole('link', { name: 'Terms', exact: true })).toHaveAttribute('href', '/terms')
		await expect(page.getByRole('main').getByRole('link', { name: 'Privacy Policy', exact: true })).toHaveAttribute('href', '/privacy-policy')
	})

	test('offers Google and Apple buttons that skip straight to the success screen', async ({ page }) => {
		for (const name of ['Continue with Google', 'Continue with Apple']) {
			await page.goto('/signup')

			const button = page.getByRole('button', { name, exact: true })

			await expect(button).toHaveAttribute('type', 'button')
			await button.click()

			await expect(page.getByRole('heading', { level: 2, name: 'Account created.', exact: true })).toBeVisible()
			await expect(page.getByRole('link', { name: 'Start setup' })).toHaveAttribute('href', '/community/feed')
			await expect(page.getByRole('heading', { level: 2, name: 'Join Inkquest.', exact: true })).toHaveCount(0)
		}
	})

	test.describe('password rules', () => {
		test('start unmet, and turn met one by one as the reader types', async ({ page }) => {
			await page.goto('/signup')

			await expect(page.getByRole('main').getByRole('listitem')).toHaveCount(6)
			await expectRules(page, [], [LENGTH, SEQUENCE, UPPER, LOWER, NUMBER, SYMBOL])

			await password(page).fill('hzq')
			await expectRules(page, [LOWER], [LENGTH, SEQUENCE, UPPER, NUMBER, SYMBOL])

			await password(page).fill('hzqmxw')
			await expectRules(page, [LENGTH, SEQUENCE, LOWER], [UPPER, NUMBER, SYMBOL])

			await password(page).fill('Hzqmxw')
			await expectRules(page, [LENGTH, SEQUENCE, UPPER, LOWER], [NUMBER, SYMBOL])

			await password(page).fill('Hzqmxw1')
			await expectRules(page, [LENGTH, SEQUENCE, UPPER, LOWER, NUMBER], [SYMBOL])

			await password(page).fill('Hzqmxw1!')
			await expectRules(page, [LENGTH, SEQUENCE, UPPER, LOWER, NUMBER, SYMBOL], [])
		})

		test('a rule goes back to unmet when the reader deletes what satisfied it', async ({ page }) => {
			await page.goto('/signup')

			await password(page).fill('Hzqmxw1!')
			await expectRules(page, [LENGTH, SEQUENCE, UPPER, LOWER, NUMBER, SYMBOL], [])

			await password(page).fill('Hzqmxw1')
			await expectRules(page, [LENGTH, SEQUENCE, UPPER, LOWER, NUMBER], [SYMBOL])
		})

		test('announces how many requirements are met', async ({ page }) => {
			await page.goto('/signup')

			await password(page).fill('Hzqmxw1')
			await expect(statusText(page, '5 of 6 password requirements met.')).toBeAttached()

			await password(page).fill('Hzqmxw1!')
			await expect(statusText(page, 'All password requirements met.')).toBeAttached()
		})

		test('the meter still follows the rules after switching away and back', async ({ page }) => {
			// the meter is aria-hidden, so its filled tiers can only be found by class
			const tiers = page.locator('.password__tier[data-met]')

			await page.goto('/signup')
			await password(page).fill('Hzqmxw1!')
			await expect(tiers).toHaveCount(6)

			await page.getByRole('button', { name: 'Use phone number', exact: true }).click()
			await page.getByRole('button', { name: 'Use email & password', exact: true }).click()
			await expect(tiers).toHaveCount(6)

			await password(page).fill('Hzqmxw1')
			await expect(tiers).toHaveCount(5)

			await password(page).fill('')
			await expect(tiers).toHaveCount(0)
		})
	})

	test.describe('validation', () => {
		test('shows a message for each empty field and focuses the email', async ({ page }) => {
			await page.goto('/signup')
			await page.getByRole('button', { name: 'Create account', exact: true }).click()

			await expect(page.getByText('Enter a valid email address.', { exact: true })).toBeVisible()
			await expect(page.getByText('Enter a password.', { exact: true })).toBeVisible()
			await expect(email(page)).toBeFocused()
		})

		test('names every password rule a weak password still misses', async ({ page }) => {
			await page.goto('/signup')
			await email(page).fill('ink@example.com')
			await password(page).fill('hzqm')
			await page.getByRole('button', { name: 'Create account', exact: true }).click()

			await expect(page.getByText('Password must contain at least 6 characters, a number, a symbol, and an uppercase letter.', { exact: true })).toBeVisible()
			await expect(page.getByText('Enter a valid email address.', { exact: true })).toHaveCount(0)
			await expect(password(page)).toBeFocused()
		})

		test('only lists the rules still missing', async ({ page }) => {
			await page.goto('/signup')
			await email(page).fill('ink@example.com')
			await password(page).fill('hzqmxw')
			await page.getByRole('button', { name: 'Create account', exact: true }).click()

			await expect(page.getByText('Password must contain a number, a symbol, and an uppercase letter.', { exact: true })).toBeVisible()
		})

		test('rejects a malformed email with our own message', async ({ page }) => {
			await page.goto('/signup')
			await email(page).fill('not-an-email')
			await password(page).fill('Hzqmxw1!')
			await page.getByRole('button', { name: 'Create account', exact: true }).click()

			await expect(page.getByText('Invalid email address.', { exact: true })).toBeVisible()
			await expect(email(page)).toBeFocused()
			await expect(page.getByRole('heading', { level: 2, name: 'Check your email', exact: true })).toHaveCount(0)
		})

		test('gives a general message for a very short password, without naming sequences', async ({ page }) => {
			await page.goto('/signup')
			await email(page).fill('ink@example.com')
			await password(page).fill('Xy')
			await page.getByRole('button', { name: 'Create account', exact: true }).click()

			await expect(page.getByText(`Password doesn't meet the requirements.`, { exact: true })).toBeVisible()
			await expect(password(page)).toBeFocused()
		})

		test('updates the password message as the reader types, until nothing is missing', async ({ page }) => {
			await page.goto('/signup')
			await email(page).fill('ink@example.com')
			await password(page).fill('hzqmxw')
			await page.getByRole('button', { name: 'Create account', exact: true }).click()
			await expect(page.getByText('Password must contain a number, a symbol, and an uppercase letter.', { exact: true })).toBeVisible()

			await password(page).fill('Hzqmxw1')
			await expect(page.getByText('Password must contain a symbol.', { exact: true })).toBeVisible()

			await password(page).fill('Hzqmxw1!')
			await expect(page.getByText(/^Password must contain/)).toHaveCount(0)
		})
	})

	test.describe('sign up method', () => {
		test('"Use phone number" swaps the email and password fields for a phone field', async ({ page }) => {
			await page.goto('/signup')
			await page.getByRole('button', { name: 'Use phone number', exact: true }).click()

			await expect(page.getByRole('textbox', { name: 'Phone number' })).toHaveAttribute('type', 'tel')
			await expect(email(page)).toHaveCount(0)
			await expect(password(page)).toHaveCount(0)
			await expect(page.getByRole('button', { name: 'Use phone number', exact: true })).toHaveCount(0)
			await expect(page.getByRole('button', { name: 'Use email & password', exact: true })).toBeVisible()

			await page.getByRole('button', { name: 'Use email & password', exact: true }).click()

			await expect(email(page)).toBeVisible()
			await expect(password(page)).toBeVisible()
		})

		test('"Email me a magic link" drops the password and relabels the button', async ({ page }) => {
			await page.goto('/signup')
			await page.getByRole('button', { name: 'Email me a magic link', exact: true }).click()

			await expect(password(page)).toHaveCount(0)
			await expect(page.getByRole('button', { name: 'Send magic link', exact: true })).toBeVisible()
			await expect(page.getByRole('button', { name: 'Create account', exact: true })).toHaveCount(0)
		})

		test('switching away and back keeps the email and its message in step', async ({ page }) => {
			const message = page.getByText('Invalid email address.', { exact: true })

			await page.goto('/signup')
			await email(page).fill('not-an-email')
			await password(page).fill('Tr!9xk')
			await page.getByRole('button', { name: 'Create account', exact: true }).click()
			await expect(message).toBeVisible()

			await page.getByRole('button', { name: 'Use phone number', exact: true }).click()
			await expect(message).toHaveCount(0)

			await page.getByRole('button', { name: 'Use email & password', exact: true }).click()
			await expect(email(page)).toHaveValue('not-an-email')
			await expect(message).toBeVisible()
		})

		test('switching away and back keeps the phone number and its message in step', async ({ page }) => {
			const message = page.getByText('Please enter a valid 10-digit phone number', { exact: true }),
				phone = page.getByRole('textbox', { name: 'Phone number' })

			await page.goto('/signup')
			await page.getByRole('button', { name: 'Use phone number', exact: true }).click()
			await phone.fill('555')
			await page.getByRole('button', { name: 'Send code', exact: true }).click()
			await expect(message).toBeVisible()

			await page.getByRole('button', { name: 'Use email & password', exact: true }).click()
			await expect(message).toHaveCount(0)

			await page.getByRole('button', { name: 'Use phone number', exact: true }).click()
			await expect(phone).toHaveValue('555')
			await expect(message).toBeVisible()
		})

		test('switching away and back keeps the password and its message in step', async ({ page }) => {
			const message = page.getByText('Password must contain a number, a symbol, and an uppercase letter.', { exact: true })

			await page.goto('/signup')
			await email(page).fill('ink@example.com')
			await password(page).fill('hunter')
			await page.getByRole('button', { name: 'Create account', exact: true }).click()
			await expect(message).toBeVisible()

			await page.getByRole('button', { name: 'Use phone number', exact: true }).click()
			await expect(message).toHaveCount(0)

			await page.getByRole('button', { name: 'Use email & password', exact: true }).click()
			await expect(password(page)).toHaveValue('hunter')
			await expect(message).toBeVisible()
		})
	})

	test.describe('server failure', () => {
		const failure = (page: Page) => page.getByText('Something went wrong. Try again.', { exact: true }).first()

		test('on an email sign up keeps the email and clears the password', async ({ page }) => {
			await page.goto('/signup')
			await email(page).fill('fail@example.com')
			await password(page).fill('Hzqmxw1!')
			await page.getByRole('button', { name: 'Create account', exact: true }).click()

			await expect(failure(page)).toBeVisible(OUTCOME)
			await expect(email(page)).toHaveValue('fail@example.com')
			await expect(password(page)).toHaveValue('')
			await expect(page.getByRole('heading', { level: 2, name: 'Join Inkquest.', exact: true })).toBeVisible()
		})

		test('on a phone sign up keeps the number and the email typed earlier', async ({ page }) => {
			const phone = page.getByRole('textbox', { name: 'Phone number' })

			await page.goto('/signup')
			await email(page).fill('ink@example.com')
			await page.getByRole('button', { name: 'Use phone number', exact: true }).click()
			await phone.fill('(000) 000-0000')
			await page.getByRole('button', { name: 'Send code', exact: true }).click()

			await expect(failure(page)).toBeVisible(OUTCOME)
			await expect(phone).toHaveValue('(000) 000-0000')

			await page.getByRole('button', { name: 'Use email & password', exact: true }).click()
			await expect(email(page)).toHaveValue('ink@example.com')
		})
	})

	test.describe('magic link', () => {
		const openMagic = async (page: Page) => {
			await page.goto('/signup')
			await page.getByRole('button', { name: 'Email me a magic link', exact: true }).click()
			await email(page).fill('ink@example.com')
			await page.getByRole('button', { name: 'Send magic link', exact: true }).click()
			await expect(page.getByRole('heading', { level: 2, name: 'Check your inbox', exact: true })).toBeVisible(OUTCOME)
		}

		test('only checks the email before sending', async ({ page }) => {
			await page.goto('/signup')
			await page.getByRole('button', { name: 'Email me a magic link', exact: true }).click()
			await email(page).fill('not-an-email')
			await page.getByRole('button', { name: 'Send magic link', exact: true }).click()

			await expect(page.getByText('Invalid email address.', { exact: true })).toBeVisible()
			await expect(page.getByRole('heading', { level: 2, name: 'Check your inbox', exact: true })).toHaveCount(0)
		})

		test('shows the inbox screen with the address and a disabled resend timer', async ({ page }) => {
			await page.clock.install()
			await openMagic(page)

			await expect(page.getByText('We emailed a sign-in link to ink@example.com. It expires in 15 minutes.')).toBeVisible()
			await expect(email(page)).toHaveValue('ink@example.com')
			await expect(page.getByRole('button', { name: WAITING })).toBeDisabled()
		})

		test('enables resend after the 30 second countdown and confirms a second link', async ({ page }) => {
			await page.clock.install()
			await openMagic(page)
			await expect(page.getByRole('button', { name: WAITING })).toBeDisabled()

			await page.clock.fastForward(31_000)

			const resend = page.getByRole('button', { name: 'Resend link', exact: true })

			await expect(resend).toBeEnabled()
			await resend.click()

			await expect(statusText(page, 'We sent another link to ink@example.com.')).toBeVisible(OUTCOME)
			await expect(page.getByRole('button', { name: WAITING })).toBeDisabled()
		})

		test('Back returns to the sign up form with the email kept', async ({ page }) => {
			await openMagic(page)
			await page.getByRole('button', { name: 'Back', exact: true }).click()

			await expect(page.getByRole('heading', { level: 2, name: 'Join Inkquest.', exact: true })).toBeVisible()
			await expect(email(page)).toHaveValue('ink@example.com')
		})
	})

	test.describe('verify screen', () => {
		const openVerify = async (page: Page) => {
			await page.goto('/signup')
			await email(page).fill('ink@example.com')
			await password(page).fill('Hzqmxw1!')
			await page.getByRole('button', { name: 'Create account', exact: true }).click()
			await expect(page.getByRole('heading', { level: 2, name: 'Check your email', exact: true })).toBeVisible(OUTCOME)
		}

		test('a valid sign up leads to the "Check your email" screen naming the address', async ({ page }) => {
			await openVerify(page)

			await expect(page.getByText('We sent a 6-digit code to ink@example.com. Enter it below.')).toBeVisible()
			await expect(page.getByRole('button', { name: 'Verify', exact: true })).toHaveAttribute('type', 'submit')
			await expect(page.getByRole('heading', { level: 2, name: 'Join Inkquest.', exact: true })).toHaveCount(0)
		})

		test('disables resend until the 30 second countdown ends', async ({ page }) => {
			await page.clock.install()
			await openVerify(page)

			await expect(page.getByRole('button', { name: WAITING })).toBeDisabled()

			await page.clock.fastForward(31_000)

			await expect(page.getByRole('button', { name: 'Resend code', exact: true })).toBeEnabled()
			await expect(page.getByRole('button', { name: WAITING })).toHaveCount(0)
		})

		test('Back and "Wrong email?" both return to the sign up form', async ({ page }) => {
			await openVerify(page)
			await page.getByRole('button', { name: 'Back', exact: true }).click()
			await expect(page.getByRole('heading', { level: 2, name: 'Join Inkquest.', exact: true })).toBeVisible()
			await expect(email(page)).toHaveValue('ink@example.com')
			await expect(password(page)).toHaveValue('')

			await password(page).fill('Hzqmxw1!')
			await page.getByRole('button', { name: 'Create account', exact: true }).click()
			await expect(page.getByRole('heading', { level: 2, name: 'Check your email', exact: true })).toBeVisible(OUTCOME)
			await page.getByRole('button', { name: 'Wrong email?', exact: true }).click()

			await expect(page.getByRole('heading', { level: 2, name: 'Join Inkquest.', exact: true })).toBeVisible()
		})
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
