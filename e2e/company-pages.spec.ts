import { expect, test } from '@playwright/test'

// Content checks for the (company) pages. navigation.spec.ts already owns the Header/Footer
// sweep for every route here, so this file only asserts what each page renders for itself.
//
// Sources read (not assumed):
//   - /about    src/app/(company)/about/_components/hero.tsx        (hero title)
//   - /faqs     src/app/(company)/faqs/_utils/faqs.data.ts          (hero heading)
//   - /careers  src/app/(company)/careers/_utils/careers.data.ts    (hero, pillars, roles, steps)
//   - /press    src/app/(company)/press/_components/*.tsx + press.data.ts
//   - /support  src/app/(company)/support/_components/*.tsx + _utils/data.ts (page.tsx imports
//               SUPPORT_PAGE_DATA from _utils/data; the old support.data.ts is gone)
//
// Headings use exact: true - Playwright's default name match is a case-insensitive substring.

test.describe('/about and /faqs heroes', () => {
	test('/about renders its hero heading', async ({ page }) => {
		await page.goto('/about')

		await expect(page.getByRole('heading', { level: 1, name: 'The work comes first.', exact: true })).toBeVisible()
	})

	test('/faqs renders its hero heading', async ({ page }) => {
		await page.goto('/faqs')

		await expect(page.getByRole('heading', { level: 1, name: 'Questions, answered.', exact: true })).toBeVisible()
	})
})

test.describe('/careers', () => {
	const PILLARS = ['Craft over volume', 'Skin in the game', 'Honest terms']
	const STEPS = ['Apply', 'Talk', 'Work session', 'Offer']
	// Each role's "View Role" button is an anchor to the role's `url` in careers.data.ts.
	const ROLES = [
		{ title: 'Senior Product Engineer', department: 'engineering', location: 'remote', url: '/about' },
		{ title: 'Artist Relations Lead', department: 'artist relations', location: 'San Francisco, CA', url: '/community/events' },
		{ title: 'Community Manager', department: 'community', location: 'Brooklyn, NY', url: '/community' },
	] as const

	test('renders the hero heading and eyebrow', async ({ page }) => {
		await page.goto('/careers')

		await expect(page.getByRole('heading', { level: 1, name: 'Small crew, sharp needles.', exact: true })).toBeVisible()
		await expect(page.getByText('Careers · Brooklyn + remote', { exact: true })).toBeVisible()
	})

	test('lists the three culture pillars as headings', async ({ page }) => {
		await page.goto('/careers')

		for (const pillar of PILLARS)
			await expect(page.getByRole('heading', { level: 3, name: pillar, exact: true })).toBeVisible()
	})

	test('lists every open role with its department and location', async ({ page }) => {
		await page.goto('/careers')

		await expect(page.getByRole('heading', { level: 2, name: 'Join the crew.', exact: true })).toBeVisible()

		for (const { department, location, title } of ROLES) {
			const row = page.getByRole('row').filter({ hasText: title })

			await expect(row).toHaveCount(1)
			await expect(row.getByText(department, { exact: true })).toBeVisible()
			await expect(row.getByText(location, { exact: true })).toBeVisible()
		}
	})

	test('each role has a "View Role" link that points at its url', async ({ page }) => {
		await page.goto('/careers')

		for (const { title, url } of ROLES) {
			const link = page.getByRole('row').filter({ hasText: title }).getByRole('link', { name: 'View Role', exact: true })

			await expect(link).toHaveAttribute('href', url)
		}
	})

	test('offers a "See all roles" link back to /careers', async ({ page }) => {
		await page.goto('/careers')

		await expect(page.getByRole('link', { name: 'See all roles', exact: true })).toHaveAttribute('href', '/careers')
	})

	test('explains the four hiring steps in order', async ({ page }) => {
		await page.goto('/careers')

		await expect(page.getByRole('heading', { level: 2, name: 'Four steps. No mazes.', exact: true })).toBeVisible()

		for (const step of STEPS)
			await expect(page.getByRole('heading', { level: 3, name: step, exact: true })).toBeVisible()

		// the numeric labels are zero-padded and count up from 01
		for (const label of ['01', '02', '03', '04'])
			await expect(page.getByText(label, { exact: true })).toBeVisible()
	})

	test('a role link navigates to its destination', async ({ page }) => {
		await page.goto('/careers')

		await page.getByRole('row').filter({ hasText: 'Senior Product Engineer' }).getByRole('link', { name: 'View Role', exact: true }).click()

		await expect(page).toHaveURL('/about')
		await expect(page.getByRole('heading', { level: 1, name: 'The work comes first.', exact: true })).toBeVisible()
	})
})

test.describe('/press', () => {
	const ASSETS = ['Logo pack', 'Product screenshots', 'Founder photos', 'Brand guidelines']
	const STATS = ['Founded', 'Artists', 'Paid to artists', 'Model']
	const MENTIONS = [
		{ author: 'The Verge', headline: '"How Inkquest is rewiring the way tattoo artists get booked"', href: '/' },
		{ author: 'Fast Company', headline: '"The startup letting tattoo artists set their own floor price"', href: 'https://react.dev/' },
		{ author: 'TechCrunch', headline: '"Inkquest raises to expand its artist-first marketplace"', href: '/about' },
		{ author: 'Hyperallergic', headline: '"Inside the app turning flash sheets into live auctions"', href: 'https://www.npmjs.com/' },
		{ author: 'Wired', headline: '"Bidding for body art: the new economics of tattooing"', href: '/careers' },
	] as const

	test('renders the press-kit hero with its contact address and kit download', async ({ page }) => {
		await page.goto('/press')

		await expect(page.getByRole('heading', { level: 1, name: 'Writing about us?', exact: true })).toBeVisible()
		await expect(page.getByText('Press kit', { exact: true })).toBeVisible()
		await expect(page.getByRole('link', { name: 'press@inkquest.com', exact: true })).toBeVisible()
		await expect(page.getByRole('button', { name: 'Download full kit (ZIP)', exact: true })).toBeVisible()
	})

	test('tells the company story with a copy-boilerplate action', async ({ page }) => {
		await page.goto('/press')

		await expect(page.getByRole('heading', { name: 'About Inkquest.', exact: true })).toBeVisible()
		await expect(page.getByText('Founded in Brooklyn in 2024', { exact: false })).toBeVisible()
		await expect(page.getByRole('button', { name: 'Copy boilerplate', exact: true })).toBeVisible()
	})

	test('shows the company facts', async ({ page }) => {
		await page.goto('/press')

		for (const caption of STATS)
			await expect(page.getByText(caption, { exact: true }).first()).toBeVisible()
		await expect(page.getByText('12,400+ across 38 cities', { exact: false })).toBeVisible()
	})

	test('lists each downloadable asset with a Download link', async ({ page }) => {
		await page.goto('/press')

		await expect(page.getByRole('heading', { name: 'Logos & photography.', exact: true })).toBeVisible()

		for (const asset of ASSETS)
			await expect(page.getByRole('heading', { level: 3, name: asset, exact: true })).toBeVisible()

		await expect(page.getByRole('link', { name: 'Download', exact: true })).toHaveCount(ASSETS.length)
	})

	test('lists past press mentions, each linking to its article', async ({ page }) => {
		await page.goto('/press')

		await expect(page.getByRole('heading', { name: 'Past press mentions.', exact: true })).toBeVisible()

		for (const { author, headline, href } of MENTIONS) {
			const row = page.getByRole('row').filter({ hasText: author })

			await expect(row.getByRole('link', { name: headline, exact: true })).toHaveAttribute('href', href)
		}
	})
})

test.describe('/support', () => {
	const EMAILS = [
		'support@inkquest.com',
		'safety@inkquest.com',
		'press@inkquest.com',
		'partners@inkquest.com',
	] as const

	test('renders the hero with a link to the FAQs', async ({ page }) => {
		await page.goto('/support')

		await expect(page.getByRole('heading', { level: 1, name: 'Talk to a human.', exact: true })).toBeVisible()

		const faqs = page.getByRole('main').getByRole('link', { name: 'FAQs', exact: true })

		await expect(faqs).toHaveAttribute('href', '/faqs')
	})

	test('the FAQs link navigates to /faqs', async ({ page }) => {
		await page.goto('/support')

		await page.getByRole('main').getByRole('link', { name: 'FAQs', exact: true }).click()

		await expect(page).toHaveURL('/faqs')
		await expect(page.getByRole('heading', { level: 1, name: 'Questions, answered.', exact: true })).toBeVisible()
	})

	test('offers Client, Artist and Studio tabs, with Client selected first', async ({ page }) => {
		await page.goto('/support')

		const tabs = page.getByRole('tablist')

		await expect(tabs.getByRole('tab', { name: 'Client', exact: true })).toHaveAttribute('aria-selected', 'true')
		await expect(tabs.getByRole('tab', { name: 'Artist', exact: true })).toHaveAttribute('aria-selected', 'false')
		await expect(tabs.getByRole('tab', { name: 'Studio', exact: true })).toHaveAttribute('aria-selected', 'false')
	})

	test('the Client form asks what it is about and for name, email, message and screenshots', async ({ page }) => {
		await page.goto('/support')

		const form = page.getByRole('tabpanel').locator('form')

		await expect(form.getByRole('group', { name: "What's it about?" })).toBeVisible()
		// a radio's accessible name is its label plus its caption, so match the label as a prefix
		for (const topic of ['General Support', 'Booking', 'Payments'])
			await expect(form.getByRole('radio', { name: new RegExp(`^${topic}`) })).toHaveCount(1)
		await expect(form.getByRole('radio', { name: /^General Support/ })).toBeChecked()
		await expect(form.getByRole('textbox', { name: 'Name', exact: true })).toBeVisible()
		await expect(form.getByRole('textbox', { name: 'Email', exact: true })).toHaveAttribute('type', 'email')
		await expect(form.getByRole('textbox', { name: 'Message', exact: true })).toBeVisible()
		// optional: the only textarea without `required`
		await expect(form.getByRole('textbox', { name: 'Screenshots', exact: true })).toBeVisible()
		await expect(form.getByRole('textbox', { name: 'Screenshots', exact: true })).not.toHaveJSProperty('required', true)
		await expect(form.getByRole('button', { name: 'Send Message', exact: true })).toBeVisible()
	})

	test('selecting the Artist tab swaps in the artist topics', async ({ page }) => {
		await page.goto('/support')

		await page.getByRole('tab', { name: 'Artist', exact: true }).click()

		await expect(page.getByRole('tab', { name: 'Artist', exact: true })).toHaveAttribute('aria-selected', 'true')
		const panel = page.getByRole('tabpanel')

		await expect(panel.getByRole('radio', { name: /^Verification/ })).toHaveCount(1)
		await expect(panel.getByRole('radio', { name: /^Partnerships/ })).toHaveCount(1)
		// Booking is a Client-only topic, so it proves the Client panel is no longer showing
		await expect(panel.getByRole('radio', { name: /^Booking/ })).toHaveCount(0)
	})

	test('lists a mailto link for each recipient under "Prefer Email?"', async ({ page }) => {
		await page.goto('/support')

		await expect(page.getByText('Prefer Email?', { exact: true })).toBeVisible()

		for (const email of EMAILS)
			await expect(page.getByRole('link', { name: email, exact: true })).toHaveAttribute('href', `mailto:${email}`)
	})
})
