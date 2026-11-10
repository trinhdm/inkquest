import { render, renderHook, screen } from '@testing-library/react'
import { useParser } from '../useParser'

let mockSiteUrl = 'https://inkquest.com'
jest.mock('@/utils/constants', () => ({
	get SITE_URL() { return mockSiteUrl },
}))

const parsed = (html?: string) => render(<div data-testid="out">{ renderHook(() => useParser(html)).result.current }</div>)

describe('useParser', () => {
	beforeEach(() => { mockSiteUrl = 'https://inkquest.com' })

	it('returns null for undefined or empty content', () => {
		expect(renderHook(() => useParser()).result.current).toBeNull()
		expect(renderHook(() => useParser('')).result.current).toBeNull()
	})

	it('renders ordinary markup as it is', () => {
		parsed('<p>Hello <strong>world</strong></p>')
		expect(screen.getByTestId('out').innerHTML).toBe('<p>Hello <strong>world</strong></p>')
	})

	it('renders an internal link and marks it as a call to action', () => {
		parsed('<a href="/privacy-policy">Privacy</a>')

		const link = screen.getByRole('link', { name: 'Privacy' })
		expect(link).toHaveAttribute('href', '/privacy-policy')
		expect(link).toHaveAttribute('data-cta')
		expect(link).not.toHaveAttribute('target')
	})

	it('keeps a hash link in the page', () => {
		parsed('<a href="#cookies">Cookies</a>')

		const link = screen.getByRole('link', { name: 'Cookies' })
		expect(link).toHaveAttribute('href', '#cookies')
		expect(link).not.toHaveAttribute('target')
	})

	it('opens a link to another site in a new tab, safely', () => {
		parsed('<a href="https://example.com/x">Out</a>')

		const link = screen.getByRole('link', { name: 'Out' })
		expect(link).toHaveAttribute('href', 'https://example.com/x')
		expect(link).toHaveAttribute('target', '_blank')
		expect(link).toHaveAttribute('rel', 'noopener noreferrer')
		expect(link).toHaveAttribute('data-cta')
	})

	it('treats an absolute link to the site itself as internal', () => {
		parsed('<a href="https://inkquest.com/about">About</a>')

		expect(screen.getByRole('link', { name: 'About' })).not.toHaveAttribute('target')
	})

	it('does not open mailto: or tel: links in a new tab', () => {
		parsed('<a href="mailto:hi@inkquest.com">Mail</a> <a href="tel:+15551234567">Call</a>')

		expect(screen.getByRole('link', { name: 'Mail' })).not.toHaveAttribute('target')
		expect(screen.getByRole('link', { name: 'Call' })).not.toHaveAttribute('target')
	})

	it('parses the contents of a link, including nested markup', () => {
		parsed('<a href="https://example.com"><em>bold</em> move</a>')

		expect(screen.getByRole('link', { name: 'bold move' }).querySelector('em')).toHaveTextContent('bold')
	})

	it('converts a link\'s HTML attributes into React props without errors', () => {
		const error = jest.spyOn(console, 'error').mockImplementation(() => {})

		try {
			parsed('<a class="cta big" href="/about" tabindex="0" style="color: red">About</a>')

			const link = screen.getByRole('link', { name: 'About' })
			expect(link).toHaveClass('cta', 'big')
			expect(link).toHaveAttribute('tabindex', '0')
			expect(link).toHaveStyle({ color: 'red' })
			expect(error).not.toHaveBeenCalled()
		} finally {
			error.mockRestore()
		}
	})

	it('renders an anchor without an href as plain markup, not a call to action', () => {
		parsed('<a name="top">Top</a>')

		expect(screen.queryByRole('link')).not.toBeInTheDocument()
		expect(screen.getByText('Top')).toHaveAttribute('name', 'top')
		expect(screen.getByText('Top')).not.toHaveAttribute('data-cta')
	})

	describe('email addresses', () => {
		it('turns an address in the text into a mailto link, keeping the text around it', () => {
			parsed('<p>Write to hi@inkquest.com today</p>')

			const link = screen.getByRole('link', { name: 'hi@inkquest.com' })
			expect(link).toHaveAttribute('href', 'mailto:hi@inkquest.com')
			expect(screen.getByTestId('out')).toHaveTextContent('Write to hi@inkquest.com today')
		})

		it('links an address inside nested markup', () => {
			parsed('<p>Ask <strong>press@inkquest.com</strong></p>')

			const link = screen.getByRole('link', { name: 'press@inkquest.com' })
			expect(link.closest('strong')).not.toBeNull()
		})

		it('leaves an address that is already a link alone', () => {
			parsed('<a href="mailto:a@b.io">a@b.io</a>')

			const links = screen.getAllByRole('link')
			expect(links).toHaveLength(1)
			expect(links[0]).toHaveAttribute('href', 'mailto:a@b.io')
			expect(links[0].querySelector('a')).toBeNull()
		})

		it('never rewrites addresses inside attribute values', () => {
			parsed('<a href="mailto:a@b.io" title="a@b.io">Write</a>')

			const link = screen.getByRole('link', { name: 'Write' })
			expect(link).toHaveAttribute('href', 'mailto:a@b.io')
			expect(link).toHaveAttribute('title', 'a@b.io')
		})
	})

	it('gives the same output for the same content across re-renders', () => {
		const { result, rerender } = renderHook(({ html }) => useParser(html), { initialProps: { html: '<p>a</p>' } })
		const first = result.current

		rerender({ html: '<p>a</p>' })
		expect(result.current).toBe(first)

		rerender({ html: '<p>b</p>' })
		expect(result.current).not.toBe(first)
	})
})
