import { getDefaultProps } from '@/hooks/useProps'
import { render, reset, screen } from '@/tests/test-utils'
import { NavRoutes, type NavRoute } from '@/utils/navigation'
import { Subnav } from './Subnav'

// No `next/navigation` calls sit on this path either — `Subnav.tsx` composes
// `Menu`/`filterNavigation` exactly like `Navbar`, so no router mock is needed.

describe('Subnav', () => {
	reset('Subnav', 'Menu', 'MenuItem')

	it('renders as the registered default tag (div)', () => {
		const defaults = getDefaultProps<Subnav.Props & { as: string }>('Subnav')
		const { container } = render(<Subnav routes={ [NavRoutes.MARKETPLACE] } />)

		expect(container.firstElementChild?.tagName).toBe((defaults.as as string).toUpperCase())
	})

	it('labels the section with the first matching item\'s own label', () => {
		render(<Subnav routes={ [NavRoutes.MARKETPLACE] } />)
		expect(screen.getByText('Marketplace', { selector: 'span' })).toBeInTheDocument()
	})

	it('renders the matching items as a flattened menu (hasDropdowns=false)', () => {
		render(
			<Subnav
				routes={ [NavRoutes.COMMUNITY, NavRoutes.COMMUNITY_FEED, NavRoutes.COMMUNITY_SPOTLIGHTS] }
			/>
		)

		// SOURCE NOTE: with `hasDropdowns={ false }`, `MenuItem`'s
		// dropdown-without-trigger branch returns ONLY its flattened children
		// (`menu?.map(...)`) and never renders the parent's own label as a
		// menuitem — so "Community" surfaces solely as the section's label
		// span (from `navItems[0].label`), not as an item inside the menu too.
		expect(screen.getAllByText('Community')).toHaveLength(1)
		expect(screen.getByText('Community', { selector: 'span' })).toBeInTheDocument()
		// no trigger button is rendered, since Subnav always passes hasDropdowns={false}
		expect(screen.queryByRole('button')).not.toBeInTheDocument()
		expect(screen.getByRole('menuitem', { name: 'Feed' })).toBeInTheDocument()
		expect(screen.getByRole('menuitem', { name: 'Spotlights' })).toBeInTheDocument()
	})

	it('recursively filters nested submenus to only the routes provided', () => {
		render(
			<Subnav
				routes={ [NavRoutes.COMMUNITY, NavRoutes.COMMUNITY_FEED, NavRoutes.COMMUNITY_SPOTLIGHTS] }
			/>
		)

		// "Events" is a child of Community but was not included in `routes`,
		// so `filterNavigation`'s recursive call drops it (and its own child,
		// "Your Lineup") entirely
		expect(screen.queryByRole('menuitem', { name: 'Events' })).not.toBeInTheDocument()
		expect(screen.queryByText('Your Lineup')).not.toBeInTheDocument()
	})

	it('renders no label and no menu when nothing matches the given routes', () => {
		const { container } = render(<Subnav routes={ ['/does-not-exist' as NavRoute] } />)

		expect(screen.queryByRole('menubar')).not.toBeInTheDocument()
		expect(container.querySelector('span')).not.toBeInTheDocument()
	})

	it('renders every top-level item when the routes list happens to be empty (same short-circuit as filterNavigation)', () => {
		// SOURCE NOTE: `filterNavigation`'s guard is `!routes?.length`, so an
		// empty array is treated the same as "no filter" and returns the full,
		// unfiltered `NAVIGATION_DATA`. The routeless "User" item is present in
		// that data, but (per `hasDropdowns={ false }`'s flattening behavior
		// above) it never renders itself — only its children ("Profile",
		// "Settings") surface as menuitems.
		render(<Subnav routes={ [] } />)
		expect(screen.getByText('Home', { selector: 'span' })).toBeInTheDocument()
		expect(screen.getByRole('menuitem', { name: 'Profile' })).toBeInTheDocument()
		expect(screen.getByRole('menuitem', { name: 'Settings' })).toBeInTheDocument()
	})
})
