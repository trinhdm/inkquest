import { usePathname } from 'next/navigation'
import { getDefaultProps } from '@/hooks/useProps'
import { render, reset, screen, within } from '@/tests/test-utils'
import { Menu } from './Menu'
import { NAVIGATION_DATA, type NavigationItem } from '@/utils/navigation'

// Only mocked to DRIVE the fallback branch with a specific value — Next
// 16.2.11's real `usePathname` (`useContext(PathnameContext)`, a context
// created with a `null` default) already returns `null` outside an
// app-router provider and never throws — no mock is required just to keep
// the rest of this suite from crashing.
jest.mock('next/navigation', () => ({
	...jest.requireActual('next/navigation'),
	usePathname: jest.fn(() => null),
}))

describe('Menu', () => {
	// the default `hasDropdowns=true` branch renders `Menu.Dropdown`: a real `Button`
	// trigger with a nested `Icon`, around a nested `Menu` of `Menu.Item`s and `Menu.Label`s.
	reset('Menu', 'Menu.Item', 'Menu.Label', 'Menu.Dropdown', 'Button', 'Icon')

	afterEach(() => {
		(usePathname as jest.Mock).mockReturnValue(null)
	})

	const leafItems: NavigationItem['menu'] = [
		{ label: 'Marketplace', route: '/marketplace' },
		{ label: 'Login', route: '/login' },
	]

	it('renders a menubar role for assistive tech', () => {
		render(<Menu items={ leafItems } />)
		expect(screen.getByRole('menubar')).toBeInTheDocument()
	})

	it('renders one menuitem per item', () => {
		render(<Menu items={ leafItems } />)
		expect(screen.getAllByRole('menuitem')).toHaveLength(2)
		expect(screen.getByRole('menuitem', { name: 'Marketplace' })).toBeInTheDocument()
		expect(screen.getByRole('menuitem', { name: 'Login' })).toBeInTheDocument()
	})

	it('renders no menuitems when items is an empty array', () => {
		render(<Menu items={ [] } />)
		expect(screen.getByRole('menubar')).toBeEmptyDOMElement()
	})

	it('defaults hasDropdowns to true so nested submenus render a trigger button', () => {
		const defaults = getDefaultProps<Menu.Props>('Menu')
		expect(defaults.hasDropdowns).toBe(true)

		render(
			<Menu items={ [
				{ label: 'Community', route: '/community', menu: [{ label: 'Feed', route: '/community/feed' }] },
			] } />
		)

		// full-dropdown branch renders a trigger button with aria-haspopup, not a
		// flattened list of the submenu's own items
		expect(screen.getByRole('button')).toHaveAttribute('aria-haspopup', 'true')
	})

	it('keeps a default dropdown\'s submenu in the DOM with no data-open until it is opened', () => {
		render(
			<Menu items={ [
				{ label: 'Community', route: '/community', menu: [{ label: 'Feed', route: '/community/feed' }] },
			] } />
		)

		// positive control: the nested menubar and its item are rendered
		const submenu = screen.getByRole('menubar', { name: 'Community' })
		expect(screen.getByRole('menuitem', { name: 'Feed' })).toBeInTheDocument()

		expect(submenu).not.toHaveAttribute('data-open')
		expect(screen.getByRole('button')).toHaveAttribute('aria-expanded', 'false')
	})

	describe('trigger', () => {
		it('replaces the label of a one-item menu and drops the caret', () => {
			render(
				<Menu
					items={ [{ label: 'User', menu: [{ label: 'Settings', route: '/settings' }] }] }
					trigger={ <b data-testid="avatar">Me</b> }
				/>
			)

			const button = screen.getByRole('button')
			expect(within(button).getByTestId('avatar')).toBeInTheDocument()
			expect(within(button).queryByText('User')).not.toBeInTheDocument()
			expect(button.querySelector('svg')).not.toBeInTheDocument()
			// the submenu still renders its own items
			expect(screen.getByRole('menuitem', { name: 'Settings' })).toBeInTheDocument()
		})

		it('keeps the caret and the label when no trigger is given', () => {
			render(<Menu items={ [{ label: 'User', menu: [{ label: 'Settings', route: '/settings' }] }] } />)

			const button = screen.getByRole('button')
			expect(within(button).getByText('User')).toBeInTheDocument()
			expect(button.querySelector('svg')).toBeInTheDocument()
		})
	})

	it('passes hasDropdowns={ false } down so submenu items are flattened without a trigger', () => {
		render(
			<Menu
				hasDropdowns={ false }
				items={ [
					{ label: 'Community', route: '/community', menu: [
						{ label: 'Feed', route: '/community/feed' },
						{ label: 'Spotlights', route: '/community/spotlights' },
					] },
				] }
			/>
		)

		// no trigger button, but both submenu items surface as flattened menuitems
		expect(screen.queryByRole('button')).not.toBeInTheDocument()
		expect(screen.getByRole('menuitem', { name: 'Feed' })).toBeInTheDocument()
		expect(screen.getByRole('menuitem', { name: 'Spotlights' })).toBeInTheDocument()
	})

	describe('id', () => {
		const pick = (...labels: string[]) =>
			NAVIGATION_DATA.filter(item => labels.includes(item.label))

		// Every id is unique, every trigger's `aria-controls` resolves to a submenu `ul`, and every
		// submenu's `aria-labelledby` resolves to the trigger that controls it. The counts are the
		// positive control: a tree with no dropdowns would pass the loops vacuously.
		const expectConsistentIds = (container: HTMLElement, dropdowns: number) => {
			const ids = Array.from(container.querySelectorAll('[id]'), el => el.id)
			expect(new Set(ids).size).toBe(ids.length)

			const triggers = container.querySelectorAll('button[aria-controls]')
			expect(triggers).toHaveLength(dropdowns)
			triggers.forEach(trigger => {
				const submenu = document.getElementById(trigger.getAttribute('aria-controls')!)
				expect(submenu?.tagName).toBe('UL')
				expect(submenu).toHaveAttribute('role', 'menubar')
				expect(submenu).toHaveAttribute('aria-labelledby', trigger.id)
			})

			const submenus = container.querySelectorAll('ul[aria-labelledby]')
			expect(submenus).toHaveLength(dropdowns)
			submenus.forEach(submenu => {
				const trigger = document.getElementById(submenu.getAttribute('aria-labelledby')!)
				expect(trigger?.tagName).toBe('BUTTON')
				expect(trigger).toHaveAttribute('aria-controls', submenu.id)
			})
		}

		it('lands on the root menubar', () => {
			render(<Menu id="main" items={ leafItems } />)
			expect(screen.getByRole('menubar')).toHaveAttribute('id', 'main')
		})

		it('renders no id attribute on the root when none is given', () => {
			render(<Menu items={ leafItems } />)
			expect(screen.getByRole('menubar')).not.toHaveAttribute('id')
		})

		it('prefixes each dropdown with `${ id }-${ kebab(label) }`, with matching trigger and submenu ids', () => {
			const { container } = render(<Menu id="main" items={ pick('Discover') } />)

			expect(container.querySelector('li#main-discover')).toBeInTheDocument()
			expect(screen.getByRole('button')).toHaveAttribute('id', 'main-discover-trigger')
			expect(screen.getByRole('button')).toHaveAttribute('aria-controls', 'main-discover-menu')
			expect(container.querySelector('ul#main-discover-menu')).toHaveAttribute('aria-labelledby', 'main-discover-trigger')
		})

		it('falls back to `dropdown-<label>` ids when no id is given', () => {
			const { container } = render(<Menu items={ pick('Discover') } />)

			expect(container.querySelector('li#dropdown-discover')).toBeInTheDocument()
			expect(screen.getByRole('button')).toHaveAttribute('id', 'dropdown-discover-trigger')
			expect(container.querySelector('ul#dropdown-discover-menu')).toBeInTheDocument()
		})

		it('gives two top-level dropdowns under one id distinct ids', () => {
			const { container } = render(<Menu id="main" items={ pick('Discover', 'Community') } />)

			expect(container.querySelector('li#main-discover')).toBeInTheDocument()
			expect(container.querySelector('li#main-community')).toBeInTheDocument()
			expectConsistentIds(container, 4) // Discover, Community, and Community's Events and Feed
		})

		it('prefixes nested dropdowns with their parent submenu id', () => {
			const { container } = render(<Menu id="main" items={ pick('Community') } />)

			expect(container.querySelector('li#main-community-menu-events')).toBeInTheDocument()
			expect(container.querySelector('button#main-community-menu-events-trigger')).toBeInTheDocument()
			expect(container.querySelector('ul#main-community-menu-events-menu')).toBeInTheDocument()
			expect(container.querySelector('li#main-community-menu-feed')).toBeInTheDocument()
		})

		it('keeps nested dropdown ids unique and correctly wired, with an id', () => {
			const { container } = render(<Menu id="main" items={ pick('Community') } />)
			expectConsistentIds(container, 3)
		})

		it('keeps nested dropdown ids unique and correctly wired, without an id', () => {
			const { container } = render(<Menu items={ pick('Community') } />)

			expect(container.querySelector('li#dropdown-community-menu-events')).toBeInTheDocument()
			expectConsistentIds(container, 3)
		})

		it('keeps ids unique and wired for several top-level dropdowns without an id', () => {
			const { container } = render(<Menu items={ pick('Discover', 'Community') } />)
			expectConsistentIds(container, 4)
		})
	})

	describe('active', () => {
		const link = (name: string) => screen.getByRole('menuitem', { name })

		it('marks the item whose route equals `active` as the current page', () => {
			render(<Menu active="/login" items={ leafItems } />)

			expect(link('Login')).toHaveAttribute('aria-current', 'page')
			expect(link('Marketplace')).not.toHaveAttribute('aria-current')
		})

		it('lets `active` win over the router pathname', () => {
			(usePathname as jest.Mock).mockReturnValue('/marketplace')
			render(<Menu active="/login" items={ leafItems } />)

			expect(link('Login')).toHaveAttribute('aria-current', 'page')
			expect(link('Marketplace')).not.toHaveAttribute('aria-current')
		})

		it('falls back to the router pathname when `active` is not given', () => {
			(usePathname as jest.Mock).mockReturnValue('/marketplace')
			render(<Menu items={ leafItems } />)

			expect(link('Marketplace')).toHaveAttribute('aria-current', 'page')
			expect(link('Login')).not.toHaveAttribute('aria-current')
		})

		it('marks nothing current for active={ null }, even when the pathname matches an item', () => {
			(usePathname as jest.Mock).mockReturnValue('/marketplace')
			render(<Menu active={ null } items={ leafItems } />)

			expect(link('Marketplace')).not.toHaveAttribute('aria-current')
			expect(link('Login')).not.toHaveAttribute('aria-current')
		})
	})

	describe('as', () => {
		it('renders a <ul> menubar by default', () => {
			render(<Menu items={ leafItems } />)
			expect(screen.getByRole('menubar').tagName).toBe('UL')
		})

		it('forwards `as` to the root element and keeps the menubar role', () => {
			render(<Menu as="div" items={ leafItems } />)

			const menubar = screen.getByRole('menubar')
			expect(menubar.tagName).toBe('DIV')
			expect(screen.getAllByRole('menuitem')).toHaveLength(2)
		})
	})
})
