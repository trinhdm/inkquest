import { usePathname } from 'next/navigation'
import { act, fireEvent, render, reset, screen, within } from '@/tests/test-utils'
import { getDefaultProps } from '@/hooks/useProps'
import { AuthProvider } from '@/providers/AuthProvider'
import { Navbar } from './Navbar'
import { COMPANY_NAME } from '@/utils/constants'
import { MOCK_ACCOUNT } from '@/lib/form'
import { NAVIGATION_DATA, NavRoutes, type NavRoute } from '@/utils/navigation'
import type { ReactElement } from 'react'

// `Navbar.tsx` reads `usePathname()` (the auth tip/button and the slug), and the real hook
// returns `null` outside an app-router provider, which crashes `pathname.slice(1)`. So the
// hook is mocked to a real path. `Menu` reads it too, and `next/link` needs no router context.
jest.mock('next/navigation', () => ({
	...jest.requireActual('next/navigation'),
	usePathname: jest.fn(() => '/'),
}))

const mockUsePathname = usePathname as jest.Mock

describe('Navbar', () => {
	// `Navbar` always renders `Logo`, the auth `Button`s, and the user `Menu` (with an `Avatar`
	// trigger) alongside the nav `Menu`. Each `Menu` mounts `Menu.Item`/`Menu.Label`/`Menu.Dropdown`.
	reset(
		'Navbar', 'Menu', 'Menu.Item', 'Menu.Label', 'Menu.Dropdown',
		'Button', 'Button.Group', 'Logo', 'Avatar', 'Icon',
	)

	// The nav menu is the one `Navbar` gives the `-nav` id (the user menu gets `-user`). Every
	// dropdown's submenu is a nested menubar too, so only top-level menubars are considered.
	const getNavMenu = () =>
		screen.queryAllByRole('menubar')
			.filter(menu => !menu.parentElement?.closest('[role="menubar"]'))
			.find(menu => /-nav$/.test(menu.id))

	// the user menu only renders for a signed-in user, so its tests render inside an `AuthProvider`
	const renderSignedIn = (ui: ReactElement) =>
		render(<AuthProvider user={ MOCK_ACCOUNT }>{ ui }</AuthProvider>)

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

		// both render `<Button href="...">`, which renders as an `<a href>` —
		// so the accessible role is "link", not "button" (see Button.tsx's
		// polymorphic href handling)
		expect(screen.getByRole('group')).toBeInTheDocument()
		expect(screen.getByRole('link', { name: 'Log in' })).toBeInTheDocument()
		expect(screen.getByRole('link', { name: 'Sign up' })).toBeInTheDocument()
	})

	it('renders no nav Menu at all when no routes prop is given', () => {
		// SOURCE NOTE: `filterNavigation` now short-circuits to `[]` by default
		// (`isEmptyReturn` defaults to `true`) when `routes` is falsy/empty, and
		// `Navbar` calls `filterNavigation(routes)` with no override. In
		// production `Header` always forwards an explicit `routes` (defaulting
		// to `HEADER_GLOBAL_NAV`), so a bare `<Navbar />` never renders this way
		// in the app, but the component's own default is an empty menu.
		render(<Navbar />)
		expect(getNavMenu()).toBeUndefined()
	})

	it('keeps a routed parent such as "User" with only its requested children in a dropdown', () => {
		render(<Navbar routes={ [NavRoutes.HOME, NavRoutes.USER_PROFILE, NavRoutes.USER_SETTINGS] } />)
		const navMenu = within(getNavMenu()!)

		expect(navMenu.getByRole('menuitem', { name: 'Home' })).toBeInTheDocument()
		expect(navMenu.getByRole('menuitem', { name: 'User' })).toHaveAttribute('href', '/profile')
		expect(navMenu.getByRole('menuitem', { name: 'Settings' })).toHaveAttribute('href', '/settings')
		expect(navMenu.queryByRole('menuitem', { name: 'Messages' })).not.toBeInTheDocument()
	})

	it('narrows the menu to only the items matching an explicit routes list', () => {
		// "Marketplace" has no route of its own, so only its "Browse work" child is hoisted out
		render(<Navbar routes={ [NavRoutes.HOME, NavRoutes.MARKETPLACE] } />)
		const navMenu = within(getNavMenu()!)

		expect(navMenu.getByRole('menuitem', { name: 'Home' })).toBeInTheDocument()
		expect(navMenu.getByRole('menuitem', { name: 'Browse work' })).toHaveAttribute('href', '/marketplace')
		expect(navMenu.queryByRole('menuitem', { name: 'Discover' })).not.toBeInTheDocument()
		expect(navMenu.queryByRole('menuitem', { name: 'Community' })).not.toBeInTheDocument()
	})

	it('omits the nav Menu entirely when the routes list matches nothing', () => {
		// SOURCE NOTE: `filterNavigation` only short-circuits when `routes` is
		// falsy/empty; a non-empty list of routes that exist nowhere in
		// `NAVIGATION_DATA` legitimately filters down to zero items.
		render(<Navbar routes={ ['/does-not-exist' as NavRoute] } />)
		expect(getNavMenu()).toBeUndefined()
	})

	it('renders a <nav> by default, from the registered default tag', () => {
		const { container } = render(<Navbar />)
		expect(container.querySelector('nav')).toBeInTheDocument()
	})

	it('leaves the default <nav> without an explicit role, relying on its implicit navigation role', () => {
		const { container } = render(<Navbar />)

		expect(container.querySelector('nav')).not.toHaveAttribute('role')
		expect(screen.getByRole('navigation')).toBe(container.querySelector('nav'))
	})

	it.each(['div', 'section'] as const)('keeps the navigation role when rendered as a <%s>', as => {
		const { container } = render(<Navbar as={ as } />)

		const root = screen.getByRole('navigation')
		expect(root.tagName).toBe(as.toUpperCase())
		expect(root).toHaveAttribute('role', 'navigation')
		expect(container.querySelector('nav')).not.toBeInTheDocument()
	})

	it('forwards the polymorphic "as" prop to the rendered tag', () => {
		// Guards a fixed bug: the root `<Box>` used to hardcode `as="nav"`
		// instead of forwarding the `as` that `extractOthers` returns, so
		// an override was silently dropped.
		const { container } = render(<Navbar as="div" />)

		expect(container.querySelector('div')).toBeInTheDocument()
		expect(container.querySelector('nav')).not.toBeInTheDocument()
	})

	describe('user menu', () => {
		const userItem = NAVIGATION_DATA.find(item => item.label === 'User')!,
			userChildren = userItem.menu!

		const getTopLevelMenus = () =>
			screen.getAllByRole('menubar')
				.filter(menu => !menu.parentElement?.closest('[role="menubar"]'))

		// the user menu is the last column's menu, so it is the last top-level menubar
		const getUserMenu = () => getTopLevelMenus().at(-1)!
		const getAvatarLink = () => screen.getByRole('menuitem', { name: 'User' })
		const getCaret = () => screen.getByRole('button', { name: 'User submenu' })
		const getSubmenu = () => document.getElementById(getCaret().getAttribute('aria-controls')!)!

		afterEach(() => {
			(usePathname as jest.Mock).mockReturnValue('/')
		})

		it('renders as a second top-level menubar, apart from the main nav menu', () => {
			renderSignedIn(<Navbar routes={ [NavRoutes.HOME, NavRoutes.DISCOVER] } />)

			const menus = getTopLevelMenus()
			expect(menus).toHaveLength(2)
			expect(getUserMenu()).not.toBe(getNavMenu())

			// positive control: the main menu keeps its own items and has none of the user menu's
			expect(within(getNavMenu()!).getByRole('menuitem', { name: 'Home' })).toBeInTheDocument()
			expect(within(getNavMenu()!).queryByRole('menuitem', { name: 'User' })).not.toBeInTheDocument()
			expect(within(getUserMenu()).getByRole('menuitem', { name: 'User' })).toBeInTheDocument()
		})

		it('renders as the only top-level menubar when there is no main menu', () => {
			renderSignedIn(<Navbar />)

			expect(getTopLevelMenus()).toHaveLength(1)
			expect(within(getUserMenu()).getByRole('menuitem', { name: 'User' })).toBeInTheDocument()
		})

		it('links the avatar to the profile, named "User", with the avatar inside', () => {
			renderSignedIn(<Navbar />)

			const link = getAvatarLink()
			expect(link.tagName).toBe('A')
			expect(link).toHaveAttribute('href', '/profile')
			expect(link).toHaveAttribute('aria-label', 'User')
			// the mock account is "Doreen Trinh", shown as its initials
			expect(within(link).getByText('DT')).toBeInTheDocument()
			expect(link).not.toHaveTextContent('User')
		})

		it('has a caret button named "User submenu" with the hidden modifier class', () => {
			renderSignedIn(<Navbar />)

			const caret = getCaret()
			expect(caret.className).toContain('hidden')
			expect(caret).toHaveAttribute('aria-haspopup', 'true')
			expect(caret).toHaveAttribute('aria-expanded', 'false')
		})

		it('wires the caret to the submenu, which points back at the caret', () => {
			renderSignedIn(<Navbar />)

			const caret = getCaret(),
				submenu = getSubmenu()

			expect(submenu.tagName).toBe('UL')
			expect(submenu).toHaveAttribute('role', 'menubar')
			expect(submenu).toHaveAttribute('aria-labelledby', caret.id)
		})

		it('derives its ids from useId plus -user, so the menu ends in -user and its item in -user-user', () => {
			renderSignedIn(<Navbar />)

			const caret = getCaret()
			expect(caret.id).toMatch(/-user-user-trigger$/)
			expect(getUserMenu().id).toMatch(/-user$/)
			expect(getSubmenu().id).toBe(caret.id.replace(/-trigger$/, '-menu'))
			expect(document.getElementById(caret.id.replace(/-trigger$/, ''))?.tagName).toBe('LI')
		})

		it('lists every child of the data\'s User menu as a link to its route', () => {
			renderSignedIn(<Navbar />)

			const submenu = within(getSubmenu())
			expect(userChildren.length).toBeGreaterThan(0)
			userChildren.forEach(({ label, route }) => {
				expect(submenu.getByRole('menuitem', { name: label })).toHaveAttribute('href', route)
			})
			expect(submenu.getAllByRole('menuitem')).toHaveLength(userChildren.length)
		})

		it('is not open until asked: data-open is absent on the menu item', () => {
			renderSignedIn(<Navbar />)

			const item = document.getElementById(getCaret().id.replace(/-trigger$/, ''))!
			expect(item).not.toHaveAttribute('data-open')
		})

		it('opens when the hidden caret is clicked', () => {
			renderSignedIn(<Navbar />)

			fireEvent.click(getCaret())

			expect(getCaret()).toHaveAttribute('aria-expanded', 'true')
			expect(document.getElementById(getCaret().id.replace(/-trigger$/, ''))).toHaveAttribute('data-open')
		})

		describe('keyboard', () => {
			beforeEach(() => jest.useFakeTimers())
			afterEach(() => jest.useRealTimers())

			it('opens on ArrowDown from the avatar link and focuses the first child', () => {
				renderSignedIn(<Navbar />)

				fireEvent.keyDown(getAvatarLink(), { key: 'ArrowDown' })
				act(() => { jest.runOnlyPendingTimers() })

				expect(getCaret()).toHaveAttribute('aria-expanded', 'true')
				expect(within(getSubmenu()).getByRole('menuitem', { name: userChildren[0].label })).toHaveFocus()
			})

			it('leaves Enter on the avatar link alone, so the link is followed and the menu stays closed', () => {
				renderSignedIn(<Navbar />)

				// fireEvent returns true when the event was not default-prevented
				expect(fireEvent.keyDown(getAvatarLink(), { key: 'Enter' })).toBe(true)

				expect(getCaret()).toHaveAttribute('aria-expanded', 'false')
			})
		})

		it('gives two Navbars on one page no duplicate ids', () => {
			const { container } = renderSignedIn(<><Navbar /><Navbar /></>)

			// positive control: both user menus rendered
			expect(container.querySelectorAll('button[aria-label="User submenu"]')).toHaveLength(2)

			const ids = Array.from(container.querySelectorAll('[id]'), el => el.id)
			expect(new Set(ids).size).toBe(ids.length)
		})

		it.each(['/login', '/signup'])('shows no auth tip or Log in / Sign up on %s once signed in', path => {
			(usePathname as jest.Mock).mockReturnValue(path)
			renderSignedIn(<Navbar />)

			// positive control: the user menu is there
			expect(getAvatarLink()).toHaveAttribute('href', '/profile')
			expect(getCaret()).toBeInTheDocument()

			expect(screen.queryByRole('group')).not.toBeInTheDocument()
			expect(screen.queryByText('New to Inkquest?')).not.toBeInTheDocument()
			expect(screen.queryByText('Already have an account?')).not.toBeInTheDocument()
		})

		it('replaces the Log in / Sign up group when a user is signed in', () => {
			renderSignedIn(<Navbar />)

			expect(getAvatarLink()).toBeInTheDocument()
			expect(screen.queryByRole('link', { name: 'Log in' })).not.toBeInTheDocument()
			expect(screen.queryByRole('link', { name: 'Sign up' })).not.toBeInTheDocument()
		})

		it('uses the signed-in user for the avatar, so another name shows other initials', () => {
			render(<AuthProvider user={ { email: 'mira@example.com', name: 'Mira Okafor' } }><Navbar /></AuthProvider>)

			expect(within(getAvatarLink()).getByText('MO')).toBeInTheDocument()
		})
	})

	//	`Avatar` is aria-hidden, so the user menu's trigger has no accessible name. Its id is the stable handle.
	const getUserTrigger = () => document.querySelector('[id$="-user-trigger"]')

	describe('logged out', () => {
		it('shows Log in and Sign up, and no user menu', () => {
			render(<Navbar />)
			expect(screen.getByRole('link', { name: 'Log in' })).toBeInTheDocument()
			expect(screen.getByRole('link', { name: 'Sign up' })).toBeInTheDocument()
			expect(getUserTrigger()).not.toBeInTheDocument()
			expect(screen.queryByRole('menuitem', { name: 'Log out' })).not.toBeInTheDocument()
		})
		it('shows the tip and one outline button on /login', () => {
			mockUsePathname.mockReturnValue('/login')
			render(<Navbar />)
			expect(screen.getByText('New to Inkquest?')).toBeInTheDocument()
			expect(screen.getByRole('link', { name: 'Sign up' })).toHaveAttribute('href', '/signup')
			expect(screen.queryByRole('link', { name: 'Log in' })).not.toBeInTheDocument()
			expect(getUserTrigger()).not.toBeInTheDocument()
		})
		it('shows the tip and one outline button on /signup', () => {
			mockUsePathname.mockReturnValue('/signup')
			render(<Navbar />)
			expect(screen.getByText('Already have an account?')).toBeInTheDocument()
			expect(screen.getByRole('link', { name: 'Login' })).toHaveAttribute('href', '/login')
			expect(getUserTrigger()).not.toBeInTheDocument()
		})
	})
	describe('logged in', () => {
		const renderLoggedIn = (logout?: () => Promise<void>) =>
			render(
				<AuthProvider logout={ logout } user={ MOCK_ACCOUNT }>
					<Navbar />
				</AuthProvider>
			)
		it('shows the user menu', () => {
			renderLoggedIn()
			expect(getUserTrigger()).toBeInTheDocument()
			expect(screen.getByRole('menuitem', { name: 'Log out' })).toBeInTheDocument()
		})
		it('hides Log in and Sign up', () => {
			renderLoggedIn()
			expect(screen.queryByRole('link', { name: 'Log in' })).not.toBeInTheDocument()
			expect(screen.queryByRole('link', { name: 'Sign up' })).not.toBeInTheDocument()
			expect(screen.queryByRole('group')).not.toBeInTheDocument()
		})
		it.each(['/login', '/signup'])('shows no tip and no auth button on %s', path => {
			mockUsePathname.mockReturnValue(path)
			renderLoggedIn()
			expect(screen.queryByText('New to Inkquest?')).not.toBeInTheDocument()
			expect(screen.queryByText('Already have an account?')).not.toBeInTheDocument()
			expect(screen.queryByRole('link', { name: 'Sign up' })).not.toBeInTheDocument()
			expect(screen.queryByRole('link', { name: 'Login' })).not.toBeInTheDocument()
			expect(getUserTrigger()).toBeInTheDocument()
		})
		it('renders Log out as a button', () => {
			renderLoggedIn(jest.fn())
			expect(screen.getByRole('menuitem', { name: 'Log out' }).tagName).toBe('BUTTON')
		})
		it('calls logout once when Log out is clicked', () => {
			const logout = jest.fn()
			renderLoggedIn(logout)
			fireEvent.click(screen.getByRole('menuitem', { name: 'Log out' }))
			expect(logout).toHaveBeenCalledTimes(1)
		})
		it('keeps Log out as a link to /logout when no logout is provided', () => {
			renderLoggedIn()
			const logOut = screen.getByRole('menuitem', { name: 'Log out' })
			expect(logOut.tagName).toBe('A')
			expect(logOut).toHaveAttribute('href', '/logout')
		})
		it('leaves the other user menu items as links', () => {
			renderLoggedIn(jest.fn())
			expect(screen.getByRole('menuitem', { name: 'Settings' })).toHaveAttribute('href', '/settings')
			expect(screen.getByRole('menuitem', { name: 'Messages' })).toHaveAttribute('href', '/messages')
		})
	})

	describe('main menu ids', () => {
		// the child routes of Events and Feed are included so those two are dropdowns as well
		const communityRoutes = [
			NavRoutes.COMMUNITY,
			NavRoutes.COMMUNITY_EVENTS, NavRoutes.COMMUNITY_EVENTS_LINEUP,
			NavRoutes.COMMUNITY_FEED, NavRoutes.COMMUNITY_FEED_CIRCLE,
		]

		it('ends the main menubar id with -nav, apart from the user menu id', () => {
			renderSignedIn(<Navbar routes={ communityRoutes } />)

			const [navMenu, userMenu] = screen.getAllByRole('menubar')
				.filter(menu => !menu.parentElement?.closest('[role="menubar"]'))

			expect(navMenu.id).toMatch(/-nav$/)
			expect(userMenu.id).toMatch(/-user$/)
			expect(navMenu.id).not.toBe(userMenu.id)
		})

		it('prefixes the main menu\'s dropdown ids with its -nav id', () => {
			const { container } = renderSignedIn(<Navbar routes={ communityRoutes } />)

			const navId = getNavMenu()!.id
			expect(container.querySelector(`li[id="${ navId }-community"]`)).toBeInTheDocument()
			expect(container.querySelector(`button[id="${ navId }-community-trigger"]`)).toBeInTheDocument()
			expect(container.querySelector(`ul[id="${ navId }-community-menu"]`)).toBeInTheDocument()
			expect(container.querySelector(`li[id="${ navId }-community-menu-events"]`)).toBeInTheDocument()
		})

		it('gives two Navbars with dropdown menus no duplicate ids, nav menus included', () => {
			const { container } = renderSignedIn(
				<>
					<Navbar routes={ communityRoutes } />
					<Navbar routes={ communityRoutes } />
				</>
			)

			// positive control: both nav menus have dropdowns, and both user menus rendered
			expect(container.querySelectorAll('button[aria-label="Community submenu"]')).toHaveLength(2)
			expect(container.querySelectorAll('button[aria-label="Events submenu"]')).toHaveLength(2)
			expect(container.querySelectorAll('button[aria-label="User submenu"]')).toHaveLength(2)

			const ids = Array.from(container.querySelectorAll('[id]'), el => el.id)
			expect(new Set(ids).size).toBe(ids.length)
		})
	})
})
