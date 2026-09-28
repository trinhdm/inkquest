import { usePathname } from 'next/navigation'
import { getDefaultProps } from '@/hooks/useProps'
import { render, reset, screen } from '@/tests/test-utils'
import { Menu } from './Menu'
import type { NavigationItem } from '@/utils/navigation'

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
	// the default `hasDropdowns=true` full-dropdown branch (see below) renders
	// a real `Button` trigger with a nested `Icon`, so both need resetting too.
	reset('Menu', 'MenuItem', 'Button', 'Icon')

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
})
