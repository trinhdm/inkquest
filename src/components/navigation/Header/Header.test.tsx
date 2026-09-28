import { getDefaultProps } from '@/hooks/useProps'
import { render, reset, screen, within } from '@/tests/test-utils'
import { HEADER_GLOBAL_NAV } from '@/utils/navigation'
import { usePathname } from 'next/navigation'
import { Header } from './Header'

jest.mock('next/navigation', () => ({
	usePathname: jest.fn(),
}))

const mockUsePathname = usePathname as jest.Mock

describe('Header', () => {
	reset('Header', 'Navbar', 'Subnav', 'Logo', 'Menu', 'MenuItem', 'Button', 'Button.Group')

	beforeEach(() => {
		mockUsePathname.mockReturnValue('/discover')
	})

	it('defaults `as` to "header" and `navbar.routes` to the global nav', () => {
		const defaults = getDefaultProps<Header.Props & { as: 'header' }>('Header')
		expect(defaults.as).toBe('header')
		expect(defaults.navbar).toEqual({ routes: HEADER_GLOBAL_NAV })
	})

	it('renders the Navbar as a navigation landmark', () => {
		render(<Header />)
		expect(screen.getByRole('navigation')).toBeInTheDocument()
	})

	it('renders a Navbar menu item for every route in navbar.routes by default', () => {
		render(<Header />)
		const [navMenu] = screen.getAllByRole('menubar')

		expect(within(navMenu).getByRole('menuitem', { name: 'Discover' })).toBeInTheDocument()
		expect(within(navMenu).getByRole('menuitem', { name: 'Marketplace' })).toBeInTheDocument()
		expect(within(navMenu).getByRole('menuitem', { name: 'Community' })).toBeInTheDocument()
	})

	it('restricts the Navbar to a custom set of routes when navbar.routes is overridden', () => {
		render(<Header navbar={ { routes: ['/marketplace'] } } />)
		const [navMenu] = screen.getAllByRole('menubar')

		expect(within(navMenu).getByRole('menuitem', { name: 'Marketplace' })).toBeInTheDocument()
		expect(within(navMenu).queryByRole('menuitem', { name: 'Discover' })).not.toBeInTheDocument()
	})

	it('derives the Subnav breadcrumbs from the current pathname when subnav.routes is not passed', () => {
		mockUsePathname.mockReturnValue('/discover')
		render(<Header />)

		const menubars = screen.getAllByRole('menubar')
		expect(menubars.length).toBeGreaterThan(1)
		const [, subnavMenu] = menubars
		expect(within(subnavMenu).getByRole('menuitem', { name: 'Your Style' })).toBeInTheDocument()
	})

	it('uses the explicit subnav.category label instead of the derived route label', () => {
		mockUsePathname.mockReturnValue('/discover')
		render(<Header subnav={ { category: 'Custom Label', routes: ['/discover/style'] } } />)

		expect(screen.getByText('Custom Label')).toBeInTheDocument()
	})

	it('renders no Subnav when the current pathname matches no navigable route', () => {
		mockUsePathname.mockReturnValue('/totally-unknown-route')
		render(<Header />)

		// only the Navbar's own menubar remains
		expect(screen.getAllByRole('menubar')).toHaveLength(1)
	})
})
