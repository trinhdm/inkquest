import { getDefaultProps } from '@/hooks/useProps'
import { render, reset, screen } from '@/tests/test-utils'
import { COMPANY_NAME } from '@/utils/constants'
import { Footer } from './Footer'

describe('Footer', () => {
	// `Footer` always renders `Footer.Area` (info + legal), which in turn
	// renders `Logo`, `Icon` (social links), and `Menu`/`MenuItem` — all real
	// factory components whose registries need resetting alongside `Footer`'s own.
	reset('Footer', 'Footer.Area', 'Logo', 'Icon', 'Menu', 'MenuItem')

	it('renders the tagline', () => {
		render(<Footer />)
		expect(screen.getByText('Find your artist. Own the ink.')).toBeInTheDocument()
	})

	it('renders the copyright notice with the current year and the company name', () => {
		render(<Footer />)
		const currentYear = new Date().getFullYear()
		expect(screen.getByText(`© ${ currentYear } ${ COMPANY_NAME }`)).toBeInTheDocument()
	})

	it('renders as the registered default tag (footer)', () => {
		const defaults = getDefaultProps<Footer.Props & { as: string }>('Footer')
		const { container } = render(<Footer />)

		expect(container.firstElementChild?.tagName).toBe((defaults.as as string).toUpperCase())
		expect(container.querySelector('footer')).toBeInTheDocument()
	})

	it('renders the polymorphic "as" element instead of the default footer tag', () => {
		const { container } = render(<Footer as="div" />)

		expect(container.querySelector('footer')).not.toBeInTheDocument()
		expect(container.firstElementChild?.tagName).toBe('DIV')
	})
})
