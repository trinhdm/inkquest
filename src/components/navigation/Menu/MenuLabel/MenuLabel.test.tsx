import { render, reset, screen } from '@/tests/test-utils'
import { getDefaultProps } from '@/hooks/useProps'
import { MenuLabel } from './MenuLabel'

//	`Menu.Label` is not attached to `Menu` (Menu.tsx has no `subcomponents`), so it is imported directly.

describe('Menu.Label', () => {
	reset('Menu.Label')

	describe('defaults', () => {
		it('registers a span that is not active', () => {
			expect(getDefaultProps('Menu.Label')).toEqual({ as: 'span', isActive: false })
		})
	})

	describe('routeless label', () => {
		it('renders a non-interactive menuitem span out of the tab order', () => {
			render(<MenuLabel label="User" />)

			const label = screen.getByRole('menuitem', { name: 'User' })
			expect(label.tagName).toBe('SPAN')
			expect(label).toHaveAttribute('tabindex', '-1')
			expect(label).not.toHaveAttribute('href')
		})

		it('honours the polymorphic `as` prop', () => {
			render(<MenuLabel as="div" label="User" />)
			expect(screen.getByRole('menuitem', { name: 'User' }).tagName).toBe('DIV')
		})

		it('never exposes aria-current, even when isActive is set', () => {
			render(<MenuLabel isActive label="User" />)
			expect(screen.getByRole('menuitem', { name: 'User' })).not.toHaveAttribute('aria-current')
		})

		it('uses the label rather than children as its content', () => {
			render(<MenuLabel label="User">Ignored</MenuLabel>)

			expect(screen.getByRole('menuitem')).toHaveTextContent('User')
			expect(screen.queryByText('Ignored')).not.toBeInTheDocument()
		})

		it('renders a React element passed as the label inside the menuitem', () => {
			render(<MenuLabel label={ <em data-testid="custom">Custom label</em> } />)

			const label = screen.getByRole('menuitem')
			expect(screen.getByTestId('custom')).toHaveTextContent('Custom label')
			expect(label).toContainElement(screen.getByTestId('custom'))
		})
	})

	describe('routed label', () => {
		it('renders a menuitem link to the route', () => {
			render(<MenuLabel label="Marketplace" route="/marketplace" />)

			const link = screen.getByRole('menuitem', { name: 'Marketplace' })
			expect(link.tagName).toBe('A')
			expect(link).toHaveAttribute('href', '/marketplace')
		})

		it('renders a React element label inside the link', () => {
			render(<MenuLabel label={ <strong data-testid="custom">Shop</strong> } route="/marketplace" />)

			const link = screen.getByRole('menuitem', { name: 'Shop' })
			expect(link.tagName).toBe('A')
			expect(link).toContainElement(screen.getByTestId('custom'))
		})

		it('marks the link as the current page when active', () => {
			render(<MenuLabel isActive label="Marketplace" route="/marketplace" />)
			expect(screen.getByRole('menuitem', { name: 'Marketplace' })).toHaveAttribute('aria-current', 'page')
		})

		it('omits aria-current when not active, with a positive control that the link rendered', () => {
			render(<MenuLabel label="Marketplace" route="/marketplace" />)

			const link = screen.getByRole('menuitem', { name: 'Marketplace' })
			expect(link).toHaveAttribute('href', '/marketplace')
			expect(link).not.toHaveAttribute('aria-current')
		})

		it('passes extra attributes through to the link', () => {
			render(<MenuLabel data-testid="label" label="Marketplace" route="/marketplace" />)
			expect(screen.getByTestId('label')).toBe(screen.getByRole('menuitem', { name: 'Marketplace' }))
		})

		it('does not leak isActive onto the DOM', () => {
			render(<MenuLabel isActive label="Marketplace" route="/marketplace" />)
			expect(screen.getByRole('menuitem')).not.toHaveAttribute('isactive')
		})
	})
})
