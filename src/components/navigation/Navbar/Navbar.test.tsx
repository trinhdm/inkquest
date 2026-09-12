import { screen } from '@testing-library/react'
import { resetVariantStyles, getDefaultProps } from '@/lib/registries'
import { resetComponentDefaults } from '@/lib/registries/componentDefaultProps'
import { renderWithTheme as render } from '@/tests/test-utils'
import { NavRoutes, type NavRoute } from '@/utils/navigation'
import { Navbar } from './Navbar'

// `Navbar.tsx` itself never imports `next/navigation`; it composes `Menu`
// (route-aware only through `next/link`, which needs no router context in
// this Next version, per the already-passing `Button` "renders as a link"
// tests) and `filterNavigation`, which is pure data filtering. No navigation
// mock is required for these to render correctly.

describe('Navbar', () => {
	afterEach(() => {
		resetVariantStyles('Navbar')
		resetVariantStyles('Menu')
		resetVariantStyles('MenuItem')
		resetVariantStyles('Button')
		resetVariantStyles('Button.Group')
	})

	afterAll(() => {
		resetComponentDefaults('Navbar')
	})

	it('renders a navigation landmark', () => {
		render(<Navbar />)
		expect(screen.getByRole('navigation')).toBeInTheDocument()
	})

	it('renders as the registered default tag (nav)', () => {
		const defaults = getDefaultProps<Navbar.Props & { as: string }>('Navbar')
		const { container } = render(<Navbar />)

		expect(container.querySelector((defaults.as as string) ?? 'nav')).toBeInTheDocument()
	})

	it('links the logo back home', () => {
		render(<Navbar />)
		expect(screen.getByRole('link', { name: 'logo' })).toHaveAttribute('href', '/')
	})

	it('renders the login and signup actions grouped together', () => {
		render(<Navbar />)

		expect(screen.getByRole('group')).toBeInTheDocument()
		expect(screen.getByRole('button', { name: 'Log in' })).toBeInTheDocument()
		expect(screen.getByRole('button', { name: 'Sign up' })).toBeInTheDocument()
	})

	it('renders the full unfiltered nav data (including routeless items) when no routes prop is given', () => {
		render(<Navbar />)

		// `filterNavigation` short-circuits to the raw `NAVIGATION_DATA` when
		// `routes` is unset — that data set includes the routeless "User" item
		expect(screen.getByRole('menuitem', { name: 'User' })).toBeInTheDocument()
		expect(screen.getByRole('menuitem', { name: 'Home' })).toBeInTheDocument()
	})

	it('narrows the menu to only the items matching an explicit routes list', () => {
		render(<Navbar routes={ [NavRoutes.HOME, NavRoutes.MARKETPLACE] } />)

		expect(screen.getByRole('menuitem', { name: 'Home' })).toBeInTheDocument()
		expect(screen.getByRole('menuitem', { name: 'Marketplace' })).toBeInTheDocument()
		expect(screen.queryByRole('menuitem', { name: 'Discover' })).not.toBeInTheDocument()
		expect(screen.queryByRole('menuitem', { name: 'Community' })).not.toBeInTheDocument()
	})

	it('omits the nav Menu entirely when the routes list matches nothing', () => {
		// SOURCE NOTE: `filterNavigation` only short-circuits when `routes` is
		// falsy/empty; a non-empty list of routes that exist nowhere in
		// `NAVIGATION_DATA` legitimately filters down to zero items.
		render(<Navbar routes={ ['/does-not-exist' as NavRoute] } />)
		expect(screen.queryByRole('menubar')).not.toBeInTheDocument()
	})

	it('renders a <nav> by default, from the registered default tag', () => {
		const { container } = render(<Navbar />)
		expect(container.querySelector('nav')).toBeInTheDocument()
	})

	it('forwards the polymorphic "as" prop to the rendered tag', () => {
		// Guards a fixed bug: the root `<Box>` used to hardcode `as="nav"`
		// instead of forwarding the `as` that `extractOtherProps` returns, so
		// an override was silently dropped.
		const { container } = render(<Navbar as="div" />)

		expect(container.querySelector('div')).toBeInTheDocument()
		expect(container.querySelector('nav')).not.toBeInTheDocument()
	})
})
