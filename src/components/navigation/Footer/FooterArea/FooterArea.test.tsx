import { render, reset, screen, within } from '@/tests/test-utils'
import { Footer } from '../Footer'

// `FooterArea` is only reachable through `Footer.Area` (its `index.ts`
// exports the parent alone), so this colocated suite imports the parent —
// same convention as `Accordion.Group` importing `Accordion`.
describe('Footer.Area', () => {
	// `FooterArea`'s own `const NAME` is the dotted `'Footer.Area'`, matching
	// its attached name on `Footer`. `reset()` and `getDefaultProps()` both
	// key off `NAME`, so this must stay `'Footer.Area'` — `reset('FooterArea')`
	// would silently be a no-op and leak registry state between tests.
	reset('Footer.Area', 'Menu', 'MenuItem')

	it('renders its children', () => {
		render(
			<Footer.Area items={ [] }>
				<span>Brand content</span>
			</Footer.Area>
		)
		expect(screen.getByText('Brand content')).toBeInTheDocument()
	})

	it('renders no navigation menu when items is empty', () => {
		render(
			<Footer.Area items={ [] }>
				<span>Brand content</span>
			</Footer.Area>
		)
		expect(screen.queryByRole('menubar')).not.toBeInTheDocument()
	})

	it('renders a menu group per item, filtered to breadcrumb-eligible routes', () => {
		render(
			<Footer.Area items={ [{ category: 'Discover', routes: ['/marketplace'] }] }>
				<span>Brand content</span>
			</Footer.Area>
		)
		const menu = screen.getByRole('menubar')
		expect(within(menu).getByRole('menuitem', { name: 'Marketplace' })).toBeInTheDocument()
	})

	it('labels a group with its category when one is given', () => {
		render(<Footer.Area items={ [{ category: 'Discover', routes: ['/marketplace'] }] } />)
		expect(screen.getByText('Discover')).toBeInTheDocument()
	})

	it('omits the category label entirely when a group has none', () => {
		render(<Footer.Area items={ [{ routes: ['/marketplace'] }] } />)
		expect(screen.queryByText('Discover')).not.toBeInTheDocument()
		expect(screen.getByRole('menuitem', { name: 'Marketplace' })).toBeInTheDocument()
	})

	it('renders one group per items entry', () => {
		render(
			<Footer.Area
				items={ [
					{ category: 'Discover', routes: ['/marketplace'] },
					{ category: 'Legal', routes: ['/privacy-policy'] },
				] }
			/>
		)
		expect(screen.getAllByRole('menubar')).toHaveLength(2)
	})
})
