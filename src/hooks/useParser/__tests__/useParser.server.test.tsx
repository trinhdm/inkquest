/**
 * @jest-environment node
 */

// Next renders these components on the server too, where browser-only
// globals such as `Text` and `document` don't exist. jsdom provides them, so
// code that relies on one passes the main suite and only fails here.
import { renderToString } from 'react-dom/server'
import { useParser } from '../useParser'

const Parsed = ({ html }: { html: string }) => <>{ useParser(html) }</>

describe('useParser on the server', () => {
	it('renders links and email addresses without browser globals', () => {
		expect(typeof document).toBe('undefined')

		const html = renderToString(
			<Parsed html='<p>Mail hi@inkquest.com or read <a class="cta" href="/about">about us</a></p>' />
		)

		expect(html).toContain('href="mailto:hi@inkquest.com"')
		expect(html).toContain('class="cta"')
		expect(html).toContain('href="/about"')
	})
})
