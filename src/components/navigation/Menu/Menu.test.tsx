import { screen } from '@testing-library/react'
import { getDefaultProps, resetComponentDefaults } from '@/hooks/useProps'
import { renderWithTheme as render } from '@/tests/test-utils'
import { resetVariantStyles } from '@/lib/registries'
import { Menu } from './Menu'
import type { NavigationItem } from '@/utils/navigation'

describe('Menu', () => {
	afterEach(() => {
		resetVariantStyles('Menu')
		resetVariantStyles('MenuItem')
	})

	afterAll(() => {
		resetComponentDefaults('Menu')
		resetComponentDefaults('MenuItem')
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
