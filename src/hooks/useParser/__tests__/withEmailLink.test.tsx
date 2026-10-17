import { render, screen } from '@testing-library/react'
import { withEmailLink } from '../withEmailLink'

describe('withEmailLink', () => {
	it('returns the text alone when it holds no address', () => {
		expect(withEmailLink('no address here')).toEqual(['no address here'])
	})

	it('turns an address into a mailto link, keeping the text around it', () => {
		const { container } = render(<p>{ withEmailLink('Write to hi@inkquest.com today') }</p>)

		const link = screen.getByRole('link', { name: 'hi@inkquest.com' })
		expect(link).toHaveAttribute('href', 'mailto:hi@inkquest.com')
		expect(link).toHaveAttribute('data-cta')
		expect(container).toHaveTextContent('Write to hi@inkquest.com today')
	})

	it('links every address in the text', () => {
		render(<p>{ withEmailLink('a@x.io and b@y.co') }</p>)

		expect(screen.getAllByRole('link').map(l => l.getAttribute('href')))
			.toEqual(['mailto:a@x.io', 'mailto:b@y.co'])
	})
})
