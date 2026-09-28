import { DEFAULT_COLOR_SCHEME } from '@/components/document/constants'
import { COMPANY_NAME } from '@/utils/constants'
import { getDefaultProps } from '@/hooks/useProps'
import { render, reset, screen } from '@/tests/test-utils'
import { Logo } from './Logo'

describe('Logo', () => {
	reset('Logo')

	it('renders as a link to the given href', () => {
		render(<Logo href="/dashboard" />)
		expect(screen.getByRole('link')).toHaveAttribute('href', '/dashboard')
	})

	it('defaults alt, href, type, and width per the registered defaults', () => {
		const defaults = getDefaultProps<Logo.Props>('Logo')
		expect(defaults).toEqual({
			alt: `${COMPANY_NAME} Logo`,
			href: '/',
			type: 'wordmark',
			width: 124,
		})
	})

	it('renders an image with the default alt text and href when no props are passed', () => {
		render(<Logo />)
		expect(screen.getByRole('link')).toHaveAttribute('href', '/')
		expect(screen.getByRole('img')).toHaveAttribute('alt', `${COMPANY_NAME} Logo`)
	})

	it('renders a custom alt when provided', () => {
		render(<Logo alt="Custom alt" />)
		expect(screen.getByRole('img')).toHaveAttribute('alt', 'Custom alt')
	})

	describe('type="wordmark" (default)', () => {
		it('builds the src from type and colorScheme, and derives height from the wordmark viewBox (240x42)', () => {
			render(<Logo width={ 240 } />)
			const img = screen.getByRole('img')

			expect(img).toHaveAttribute('src', `/logo/wordmark-${ DEFAULT_COLOR_SCHEME }.svg`)
			expect(img).toHaveAttribute('height', '42')
			expect(img).toHaveAttribute('width', '240')
		})

		it('rounds a derived height for a non-default width', () => {
			render(<Logo width={ 124 } />)
			// height = round(124 * 42 / 240) = 22
			expect(screen.getByRole('img')).toHaveAttribute('height', '22')
		})
	})

	describe('type="mark"', () => {
		it('builds a bare (no colorScheme suffix) filename for the mark viewBox (40x40, square)', () => {
			render(<Logo type="mark" width={ 40 } />)
			const img = screen.getByRole('img')

			expect(img).toHaveAttribute('src', '/logo/mark.svg')
			expect(img).toHaveAttribute('height', '40')
		})

		it('scales height 1:1 with width, since the mark viewBox is square', () => {
			render(<Logo type="mark" width={ 80 } />)
			expect(screen.getByRole('img')).toHaveAttribute('height', '80')
		})
	})
})
