import { usePathname } from 'next/navigation'
import { getDefaultProps } from '@/hooks/useProps'
import { act, fireEvent, render, reset, screen, within } from '@/tests/test-utils'
import { COMPANY_NAME } from '@/utils/constants'
import { NAVIGATION_DATA, NavRoutes, type NavRoute } from '@/utils/navigation'
import { Navbar } from './Navbar'

// `Navbar.tsx` reads `usePathname()` (the auth tip/button and the slug), and the real hook
// returns `null` outside an app-router provider, which crashes `pathname.slice(1)`. So the
// hook is mocked to a real path. `Menu` reads it too, and `next/link` needs no router context.
jest.mock('next/navigation', () => ({
	...jest.requireActual('next/navigation'),
	usePathname: jest.fn(() => '/'),
}))

describe('Navbar', () => {
	// `Navbar` always renders `Logo`, the auth `Button`s, and the user `Menu` (with an `Avatar`
	// trigger) alongside the nav `Menu`. Each `Menu` mounts `Menu.Item`/`Menu.Label`/`Menu.Dropdown`.
	reset(
		'Navbar', 'Menu', 'Menu.Item', 'Menu.Label', 'Menu.Dropdown',
		'Button', 'Button.Group', 'Logo', 'Avatar', 'Icon',
	)

	// The navbar always mounts a user-account menu AFTER the nav menu, and every dropdown's
	// submenu is a nested menubar too. So the nav menu is the first top-level menubar, provided
	// another follows it; with a lone top-level menubar that is the user menu and there is no nav menu.
	const getNavMenu = () => {
		const menus = screen.queryAllByRole('menubar')
			.filter(menu => !menu.parentElement?.closest('[role="menubar"]'))

		return menus.length > 1 ? menus[0] : undefined
	}

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
			render(<Navbar routes={ [NavRoutes.HOME, NavRoutes.DISCOVER] } />)

			const menus = getTopLevelMenus()
			expect(menus).toHaveLength(2)
			expect(getUserMenu()).not.toBe(getNavMenu())

			// positive control: the main menu keeps its own items and has none of the user menu's
			expect(within(getNavMenu()!).getByRole('menuitem', { name: 'Home' })).toBeInTheDocument()
			expect(within(getNavMenu()!).queryByRole('menuitem', { name: 'User' })).not.toBeInTheDocument()
			expect(within(getUserMenu()).getByRole('menuitem', { name: 'User' })).toBeInTheDocument()
		})

		it('renders as the only top-level menubar when there is no main menu', () => {
			render(<Navbar />)

			expect(getTopLevelMenus()).toHaveLength(1)
			expect(within(getUserMenu()).getByRole('menuitem', { name: 'User' })).toBeInTheDocument()
		})

		it('links the avatar to the profile, named "User", with the avatar inside', () => {
			render(<Navbar />)

			const link = getAvatarLink()
			expect(link.tagName).toBe('A')
			expect(link).toHaveAttribute('href', '/profile')
			expect(link).toHaveAttribute('aria-label', 'User')
			// the mock account is "Doreen Trinh", shown as its initials
			expect(within(link).getByText('DT')).toBeInTheDocument()
			expect(link).not.toHaveTextContent('User')
		})

		it('has a caret button named "User submenu" with the hidden modifier class', () => {
			render(<Navbar />)

			const caret = getCaret()
			expect(caret.className).toContain('hidden')
			expect(caret).toHaveAttribute('aria-haspopup', 'true')
			expect(caret).toHaveAttribute('aria-expanded', 'false')
		})

		it('wires the caret to the submenu, which points back at the caret', () => {
			render(<Navbar />)

			const caret = getCaret(),
				submenu = getSubmenu()

			expect(submenu.tagName).toBe('UL')
			expect(submenu).toHaveAttribute('role', 'menubar')
			expect(submenu).toHaveAttribute('aria-labelledby', caret.id)
		})

		it('derives its ids from useId, ending in -user, -user-trigger and -user-menu', () => {
			render(<Navbar />)

			const caret = getCaret()
			expect(caret.id).toMatch(/-user-trigger$/)
			expect(getSubmenu().id).toBe(caret.id.replace(/-trigger$/, '-menu'))
			expect(document.getElementById(caret.id.replace(/-trigger$/, ''))?.tagName).toBe('LI')
		})

		it('lists every child of the data\'s User menu as a link to its route', () => {
			render(<Navbar />)

			const submenu = within(getSubmenu())
			expect(userChildren.length).toBeGreaterThan(0)
			userChildren.forEach(({ label, route }) => {
				expect(submenu.getByRole('menuitem', { name: label })).toHaveAttribute('href', route)
			})
			expect(submenu.getAllByRole('menuitem')).toHaveLength(userChildren.length)
		})

		it('is not open until asked: data-open is absent on the menu item', () => {
			render(<Navbar />)

			const item = document.getElementById(getCaret().id.replace(/-trigger$/, ''))!
			expect(item).not.toHaveAttribute('data-open')
		})

		it('opens when the hidden caret is clicked', () => {
			render(<Navbar />)

			fireEvent.click(getCaret())

			expect(getCaret()).toHaveAttribute('aria-expanded', 'true')
			expect(document.getElementById(getCaret().id.replace(/-trigger$/, ''))).toHaveAttribute('data-open')
		})

		describe('keyboard', () => {
			beforeEach(() => jest.useFakeTimers())
			afterEach(() => jest.useRealTimers())

			it('opens on ArrowDown from the avatar link and focuses the first child', () => {
				render(<Navbar />)

				fireEvent.keyDown(getAvatarLink(), { key: 'ArrowDown' })
				act(() => { jest.runOnlyPendingTimers() })

				expect(getCaret()).toHaveAttribute('aria-expanded', 'true')
				expect(within(getSubmenu()).getByRole('menuitem', { name: userChildren[0].label })).toHaveFocus()
			})

			it('leaves Enter on the avatar link alone, so the link is followed and the menu stays closed', () => {
				render(<Navbar />)

				// fireEvent returns true when the event was not default-prevented
				expect(fireEvent.keyDown(getAvatarLink(), { key: 'Enter' })).toBe(true)

				expect(getCaret()).toHaveAttribute('aria-expanded', 'false')
			})
		})

		it('gives two Navbars on one page no duplicate ids', () => {
			const { container } = render(<><Navbar /><Navbar /></>)

			// positive control: both user menus rendered
			expect(container.querySelectorAll('button[aria-label="User submenu"]')).toHaveLength(2)

			const ids = Array.from(container.querySelectorAll('[id]'), el => el.id)
			expect(new Set(ids).size).toBe(ids.length)
		})

		it.each(['/login', '/signup'])('is still rendered on %s, next to the auth tip', path => {
			(usePathname as jest.Mock).mockReturnValue(path)
			render(<Navbar />)

			// positive control: on an auth path the auth tip replaces the Log in / Sign up group
			expect(screen.queryByRole('group')).not.toBeInTheDocument()
			expect(getAvatarLink()).toHaveAttribute('href', '/profile')
			expect(getCaret()).toBeInTheDocument()
		})
	})
})
