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
	reset(
		'Header', 'Navbar', 'Subnav', 'Logo', 'Menu', 'Menu.Item', 'Menu.Label', 'Menu.Dropdown',
		'Button', 'Button.Group', 'Avatar', 'Icon',
	)

	beforeEach(() => {
		mockUsePathname.mockReturnValue('/discover')
	})

	// The Navbar also mounts a user-account menu, and every dropdown's submenu is a nested
	// menubar, so menubars are never counted. Each menu is found by where it sits instead:
	// the nav menu is the Navbar's first top-level menubar, provided the user menu follows it,
	// and the subnav menu is the top-level menubar outside the `<nav>` landmark.
	const topLevelMenus = (root: HTMLElement) =>
		within(root).queryAllByRole('menubar')
			.filter(menu => !menu.parentElement?.closest('[role="menubar"]'))

	const getNavMenu = () => {
		const nav = screen.queryByRole('navigation')
		const menus = nav ? topLevelMenus(nav) : []
		return menus.length > 1 ? menus[0] : undefined
	}

	const getSubnavMenu = () => {
		const nav = screen.queryByRole('navigation')
		return topLevelMenus(screen.getByRole('banner')).find(menu => !nav?.contains(menu))
	}

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
		// "Marketplace" has no route, so its "Browse work" child is hoisted into the nav
		render(<Header />)
		const navMenu = within(getNavMenu()!)

		expect(navMenu.getByRole('menuitem', { name: 'Discover' })).toBeInTheDocument()
		expect(navMenu.getByRole('menuitem', { name: 'Browse work' })).toBeInTheDocument()
		expect(navMenu.getByRole('menuitem', { name: 'Community' })).toBeInTheDocument()
	})

	it('restricts the Navbar to a custom set of routes when navbar.routes is overridden', () => {
		render(<Header navbar={ { routes: ['/marketplace'] } } />)
		const navMenu = within(getNavMenu()!)

		expect(navMenu.getByRole('menuitem', { name: 'Browse work' })).toBeInTheDocument()
		expect(navMenu.queryByRole('menuitem', { name: 'Discover' })).not.toBeInTheDocument()
	})

	it('derives the Subnav breadcrumbs from the current pathname when subnav.routes is not passed', () => {
		mockUsePathname.mockReturnValue('/discover')
		render(<Header />)

		const subnavMenu = within(getSubnavMenu()!)
		expect(subnavMenu.getByRole('menuitem', { name: 'Artists' })).toBeInTheDocument()
		expect(subnavMenu.getByRole('menuitem', { name: 'Styles' })).toBeInTheDocument()
	})

	it('uses the explicit subnav.category label instead of the derived route label', () => {
		mockUsePathname.mockReturnValue('/discover')
		render(<Header subnav={ { category: 'Custom Label', routes: ['/discover/style'] } } />)

		expect(screen.getByText('Custom Label')).toBeInTheDocument()
	})

	it('renders no Subnav when the current pathname matches no navigable route', () => {
		mockUsePathname.mockReturnValue('/totally-unknown-route')
		render(<Header />)

		// positive control: the Navbar's menu is still there
		expect(getNavMenu()).toBeInTheDocument()
		expect(getSubnavMenu()).toBeUndefined()
	})

	describe('hiding parts with null', () => {
		it('hides the Navbar for navbar={ null } but still renders the derived Subnav', () => {
			render(<Header navbar={ null } />)

			expect(screen.queryByRole('navigation')).not.toBeInTheDocument()
			// the Subnav holds the section's own items, not the global nav
			const subnavMenu = within(getSubnavMenu()!)
			expect(subnavMenu.getByRole('menuitem', { name: 'Styles' })).toBeInTheDocument()
			expect(subnavMenu.queryByRole('menuitem', { name: 'Browse work' })).not.toBeInTheDocument()
		})

		it('hides the Subnav for subnav={ null } even when the pathname would derive one', () => {
			// positive control: without `subnav={ null }` this pathname yields a Subnav menu
			const { unmount } = render(<Header />)
			expect(getSubnavMenu()).toBeInTheDocument()
			unmount()

			render(<Header subnav={ null } />)

			expect(getSubnavMenu()).toBeUndefined()
			expect(within(getNavMenu()!).getByRole('menuitem', { name: 'Browse work' })).toBeInTheDocument()
		})

		it('hides the Subnav for subnav={ null } even when explicit routes elsewhere would apply', () => {
			render(<Header subnav={ null } />)
			expect(screen.queryByText('Custom Label')).not.toBeInTheDocument()
		})

		it('renders an empty header element when both navbar and subnav are null', () => {
			render(<Header navbar={ null } subnav={ null } />)

			expect(screen.getByRole('banner')).toBeEmptyDOMElement()
		})

		it('treats an omitted navbar as "show the default Navbar", not as hidden', () => {
			render(<Header subnav={ null } navbar={ undefined } />)
			expect(screen.getByRole('navigation')).toBeInTheDocument()
		})
	})
})
