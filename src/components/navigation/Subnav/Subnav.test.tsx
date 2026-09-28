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

	it('leaves a matched parent\'s entire original submenu tree intact under the "breadcrumbs" layout, even branches absent from routes', () => {
		render(
			<Subnav
				routes={ [NavRoutes.COMMUNITY, NavRoutes.COMMUNITY_FEED, NavRoutes.COMMUNITY_SPOTLIGHTS] }
			/>
		)

		// SOURCE NOTE: `Subnav` calls `filterNavigation(routes, 'breadcrumbs')`.
		// Under the 'breadcrumbs' layout the matched item's `menu` is never
		// reassigned to the recursively-filtered submenu (that swap only runs
		// for `layout === 'dropdown'`) — the original, unfiltered menu passes
		// straight through, so "Events" surfaces even though its own route
		// was never requested. Its grandchild "Your Lineup" still does not
		// appear: `MenuItem`'s `hasDropdowns={ false }` branch only flattens
		// one level (`menu.map(item => MenuLabel(item))`), so a dropdown
		// item's own nested children are never recursed into.
		expect(screen.getByRole('menuitem', { name: 'Events' })).toBeInTheDocument()
		expect(screen.queryByText('Your Lineup')).not.toBeInTheDocument()
	})

	it('renders no label and no menu when nothing matches the given routes', () => {
		const { container } = render(<Subnav routes={ ['/does-not-exist' as NavRoute] } />)

		expect(screen.queryByRole('menubar')).not.toBeInTheDocument()
		expect(container.querySelector('span')).not.toBeInTheDocument()
	})

	it('renders nothing when the routes list happens to be empty, since filterNavigation now defaults to an empty result', () => {
		// SOURCE NOTE: `filterNavigation`'s guard is `!routes?.length`, and it
		// now returns `[]` by default (`isEmptyReturn` defaults to `true`)
		// rather than falling back to the full `NAVIGATION_DATA`. `Subnav`
		// calls `filterNavigation(routes, 'breadcrumbs')` with no override, so
		// an empty `routes` array yields zero nav items and the component
		// returns `null` — the same as the "nothing matches" case below.
		const { container } = render(<Subnav routes={ [] } />)
		expect(container).toBeEmptyDOMElement()
	})
})
