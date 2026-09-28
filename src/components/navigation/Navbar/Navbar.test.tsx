import { getDefaultProps } from '@/hooks/useProps'
import { render, reset, screen } from '@/tests/test-utils'
import { COMPANY_NAME } from '@/utils/constants'
import { NavRoutes, type NavRoute } from '@/utils/navigation'
import { Navbar } from './Navbar'

// `Navbar.tsx` itself never imports `next/navigation`; it composes `Menu`
// (route-aware only through `next/link`, which needs no router context in
// this Next version, per the already-passing `Button` "renders as a link"
// tests) and `filterNavigation`, which is pure data filtering. No navigation
// mock is required for these to render correctly.

describe('Navbar', () => {
	// `Navbar` always renders `Logo` alongside `Menu`/`MenuItem`/`Button`/`Button.Group`.
	reset('Navbar', 'Menu', 'MenuItem', 'Button', 'Button.Group', 'Logo')

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
		expect(screen.getByRole('link', { name: `${ COMPANY_NAME } Logo` })).toHaveAttribute('href', '/')
	})

	it('renders the login and signup actions grouped together', () => {
		render(<Navbar />)

		expect(screen.getByRole('group')).toBeInTheDocument()
		expect(screen.getByRole('button', { name: 'Log in' })).toBeInTheDocument()
		expect(screen.getByRole('button', { name: 'Sign up' })).toBeInTheDocument()
	})

	it('renders no nav Menu at all when no routes prop is given', () => {
		// SOURCE NOTE: `filterNavigation` now short-circuits to `[]` by default
		// (`isEmptyReturn` defaults to `true`) when `routes` is falsy/empty, and
		// `Navbar` calls `filterNavigation(routes)` with no override. In
		// production `Header` always forwards an explicit `routes` (defaulting
		// to `HEADER_GLOBAL_NAV`), so a bare `<Navbar />` never renders this way
		// in the app, but the component's own default is an empty menu.
		render(<Navbar />)
		expect(screen.queryByRole('menubar')).not.toBeInTheDocument()
	})

	it('hoists Profile/Settings out of the routeless "User" parent onto the menu when their routes are explicitly requested', () => {
		render(<Navbar routes={ [NavRoutes.HOME, NavRoutes.PROFILE, NavRoutes.SETTINGS] } />)

		expect(screen.getByRole('menuitem', { name: 'Home' })).toBeInTheDocument()
		expect(screen.getByRole('menuitem', { name: 'Profile' })).toBeInTheDocument()
		expect(screen.getByRole('menuitem', { name: 'Settings' })).toBeInTheDocument()
		expect(screen.queryByRole('menuitem', { name: 'User' })).not.toBeInTheDocument()
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
