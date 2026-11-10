import { usePathname } from 'next/navigation'
import { getDefaultProps } from '@/hooks/useProps'
import { act, fireEvent, render, reset, screen } from '@/tests/test-utils'
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
		const { container } = render(
			<Menu items={ [
				{ label: 'Community', route: '/community', menu: [{ label: 'Feed', route: '/community/feed' }] },
			] } />
		)

		// positive control: the nested menubar and its item are rendered
		const root = container.querySelector('li#dropdown-community')!
		expect(screen.getByRole('menubar', { name: 'Community submenu' })).toBeInTheDocument()
		expect(screen.getByRole('menuitem', { name: 'Feed' })).toBeInTheDocument()

		expect(root).not.toHaveAttribute('data-open')
		expect(screen.getByRole('button')).toHaveAttribute('aria-expanded', 'false')

		fireEvent.click(screen.getByRole('button'))

		expect(root).toHaveAttribute('data-open')
		expect(screen.getByRole('button')).toHaveAttribute('aria-expanded', 'true')
		expect(screen.getByRole('menubar', { name: 'Community submenu' })).not.toHaveAttribute('data-open')
	})

	describe('triggers', () => {
		const items: NavigationItem['menu'] = [
			{ label: 'User', route: '/profile', menu: [{ label: 'Settings', route: '/settings' }] },
			{ label: 'Discover', route: '/discover', menu: [{ label: 'Artists', route: '/discover/artists' }] },
			{ label: 'Login', route: '/login' },
		]

		const renderTriggered = () =>
			render(<Menu items={ items } triggers={ { '/profile': <b data-testid="avatar">DT</b> } } />)

		it('renders the node for the item whose route is a key', () => {
			renderTriggered()

			const link = screen.getByRole('menuitem', { name: 'User' })
			expect(link).toContainElement(screen.getByTestId('avatar'))
			expect(link).not.toHaveTextContent('User')
		})

		it('names the triggered link after the item label', () => {
			renderTriggered()
			expect(screen.getByRole('menuitem', { name: 'User' })).toHaveAttribute('aria-label', 'User')
		})

		it('lets every other item keep its own label, dropdown or leaf', () => {
			renderTriggered()

			expect(screen.getByRole('menuitem', { name: 'Discover' })).toHaveTextContent('Discover')
			expect(screen.getByRole('menuitem', { name: 'Login' })).toHaveTextContent('Login')
			expect(screen.getAllByTestId('avatar')).toHaveLength(1)
		})

		it('hides the caret of the triggered item only', () => {
			renderTriggered()

			expect(screen.getByRole('button', { name: 'User submenu' }).className).toContain('hidden')
			expect(screen.getByRole('button', { name: 'Discover submenu' }).className).not.toContain('hidden')
		})

		it('also swaps the content of a leaf item', () => {
			render(<Menu items={ items } triggers={ { '/login': <b data-testid="icon">in</b> } } />)

			const link = screen.getByRole('menuitem', { name: 'Login' })
			expect(link).toContainElement(screen.getByTestId('icon'))
			expect(link).toHaveAttribute('href', '/login')
		})

		it('ignores a trigger whose route matches no item, with a positive control', () => {
			render(<Menu items={ items } triggers={ { '/terms': <b data-testid="avatar">DT</b> } } />)

			expect(screen.getByRole('menuitem', { name: 'User' })).toHaveTextContent('User')
			expect(screen.queryByTestId('avatar')).not.toBeInTheDocument()
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

		it('prefixes each dropdown with `${ id }-${ slug(label) }`, with matching trigger and submenu ids', () => {
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

		it('slugs a multi-word dropdown label into its ids', () => {
			const { container } = render(
				<Menu id="main" items={ [{ label: 'Browse Work', menu: [{ label: 'Prints', route: '/marketplace' }] }] } />
			)

			expect(container.querySelector('li#main-browse-work')).toBeInTheDocument()
			expect(container.querySelector('button#main-browse-work-trigger')).toBeInTheDocument()
			expect(container.querySelector('ul#main-browse-work-menu')).toBeInTheDocument()
		})

		it('renders no id on plain items, even when the menu has one', () => {
			const { container } = render(<Menu id="main" items={ leafItems } />)

			// positive control: the items and the root rendered
			expect(container.querySelectorAll('li[role="none"]')).toHaveLength(2)
			expect(container.querySelector('ul#main')).toBeInTheDocument()
			expect(container.querySelectorAll('[id]')).toHaveLength(1)
		})

		it('keeps ids unique across a flattened menu, where only the root has an id', () => {
			const { container } = render(<Menu hasDropdowns={ false } id="main" items={ pick('Discover', 'Community') } />)

			expect(container.querySelectorAll('li[role="none"]').length).toBeGreaterThan(2)
			const ids = Array.from(container.querySelectorAll('[id]'), el => el.id)
			expect(ids).toEqual(['main'])
		})

		it('keeps ids unique across two menus given different ids', () => {
			const { container } = render(
				<>
					<Menu id="first" items={ pick('Discover', 'Community') } />
					<Menu id="second" items={ pick('Discover', 'Community') } />
				</>
			)

			const ids = Array.from(container.querySelectorAll('[id]'), el => el.id)
			expect(ids.length).toBeGreaterThan(8)
			expect(new Set(ids).size).toBe(ids.length)
		})

		it('names every caret button after its label, and the submenu it controls is labelled by it', () => {
			const { container } = render(<Menu id="main" items={ pick('Community') } />)

			const carets = Array.from(container.querySelectorAll<HTMLElement>('button[aria-controls]'))
			expect(carets.map(c => c.getAttribute('aria-label'))).toEqual([
				'Community submenu', 'Events submenu', 'Feed submenu',
			])
			carets.forEach(caret => {
				expect(document.getElementById(caret.getAttribute('aria-controls')!))
					.toHaveAttribute('aria-labelledby', caret.id)
			})
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

	describe('keyboard navigation through nested dropdowns', () => {
		const community = NAVIGATION_DATA.filter(item => item.label === 'Community')

		const link = (name: string) => screen.getByRole('menuitem', { name })
		const openCommunity = () => {
			render(<Menu items={ community } />)
			fireEvent.click(screen.getByRole('button', { name: 'Community submenu' }))
		}
		const communityItem = () => document.getElementById('dropdown-community')!

		beforeEach(() => jest.useFakeTimers())
		afterEach(() => jest.useRealTimers())

		it('reaches the labels of nested dropdowns (Events, Feed) as well as Spotlights, wrapping around', () => {
			openCommunity()

			const order: string[] = []
			for (let i = 0; i < 4; i++) {
				fireEvent.keyDown(communityItem(), { key: 'ArrowDown' })
				order.push(document.activeElement?.textContent ?? '')
			}

			expect(order).toEqual(['Events', 'Feed', 'Spotlights', 'Events'])
		})

		it('moves to the next sibling when ArrowDown is pressed on a closed nested dropdown\'s link', () => {
			openCommunity()
			link('Events').focus()

			fireEvent.keyDown(link('Events'), { key: 'ArrowDown' })

			expect(link('Feed')).toHaveFocus()
			// positive control: the nested dropdown did not open itself
			expect(screen.getByRole('button', { name: 'Events submenu' })).toHaveAttribute('aria-expanded', 'false')
		})

		it('closes the parent on Escape pressed on a closed nested dropdown, focusing the parent link', () => {
			openCommunity()
			link('Events').focus()

			fireEvent.keyDown(link('Events'), { key: 'Escape' })

			expect(screen.getByRole('button', { name: 'Community submenu' })).toHaveAttribute('aria-expanded', 'false')
			expect(link('Community')).toHaveFocus()
		})

		it('opens a nested dropdown on ArrowRight and focuses its first item', () => {
			openCommunity()
			link('Events').focus()

			fireEvent.keyDown(link('Events'), { key: 'ArrowRight' })
			act(() => { jest.runOnlyPendingTimers() })

			expect(screen.getByRole('button', { name: 'Events submenu' })).toHaveAttribute('aria-expanded', 'true')
			expect(link('Your Lineup')).toHaveFocus()
			// the parent stays open
			expect(screen.getByRole('button', { name: 'Community submenu' })).toHaveAttribute('aria-expanded', 'true')
		})

		it('closes only the nested dropdown on ArrowLeft and refocuses its link', () => {
			openCommunity()
			link('Events').focus()
			fireEvent.keyDown(link('Events'), { key: 'ArrowRight' })
			act(() => { jest.runOnlyPendingTimers() })

			fireEvent.keyDown(link('Your Lineup'), { key: 'ArrowLeft' })

			expect(screen.getByRole('button', { name: 'Events submenu' })).toHaveAttribute('aria-expanded', 'false')
			expect(link('Events')).toHaveFocus()
			expect(screen.getByRole('button', { name: 'Community submenu' })).toHaveAttribute('aria-expanded', 'true')
		})
	})
})
