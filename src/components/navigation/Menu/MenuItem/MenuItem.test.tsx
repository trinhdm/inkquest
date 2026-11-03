import type { ComponentProps } from 'react'
import { render, reset, screen, within } from '@/tests/test-utils'
import { MenuItem } from './MenuItem'

// `MenuItem.tsx` renders `active` matching purely from the `route` it's
// handed as a prop — it has no `next/navigation` import of its own, and
// doesn't need one: `Menu` (its parent) is the only place `usePathname` is
// read, and it forwards the resolved route down as `active`. No router
// mock is required for these tests.

describe('Menu.Item', () => {
	// the dropdown branch renders `Menu.Dropdown` (a real `Button` trigger with a
	// nested `Icon`), whose submenu is a real `Menu` of `Menu.Item`s and `Menu.Label`s.
	// `Menu.Item` is not attached to `Menu`, so it is imported directly.
	reset('Menu.Item', 'Menu.Label', 'Menu.Dropdown', 'Menu', 'Button', 'Icon')

	describe('non-dropdown item (no menu)', () => {
		it('renders a single menuitem link for a routed item', () => {
			render(<MenuItem label="Marketplace" route="/marketplace" />)

			const link = screen.getByRole('menuitem', { name: 'Marketplace' })
			expect(link).toHaveAttribute('href', '/marketplace')
		})

		it('renders a non-interactive menuitem span for a routeless item', () => {
			render(<MenuItem label="User" />)

			const span = screen.getByRole('menuitem', { name: 'User' })
			expect(span.tagName).toBe('SPAN')
			expect(span).toHaveAttribute('tabindex', '-1')
		})

		it('wraps the label in an li with role="none"', () => {
			const { container } = render(<MenuItem label="Marketplace" route="/marketplace" />)
			expect(container.querySelector('li[role="none"]')).toBeInTheDocument()
		})

		it('marks the matching item current: data-current on the li, aria-current on the link', () => {
			render(<MenuItem active="/marketplace" label="Marketplace" route="/marketplace" />)
			const link = screen.getByRole('menuitem', { name: 'Marketplace' })
			expect(link).toHaveAttribute('aria-current', 'page')
			expect(link.closest('li')).toHaveAttribute('data-current')
		})
		it('does not render a given `id` on a leaf item', () => {
			const { container } = render(<MenuItem id="custom" label="Marketplace" route="/marketplace" />)

			// positive control: the leaf rendered
			expect(container.querySelector('li[role="none"]')).toBeInTheDocument()
			expect(container.querySelector('[id]')).not.toBeInTheDocument()
		})

		it('does not mark a non-matching item current', () => {
			render(<MenuItem active="/login" label="Marketplace" route="/marketplace" />)
			const link = screen.getByRole('menuitem', { name: 'Marketplace' })

			expect(link).not.toHaveAttribute('aria-current')
			expect(link.closest('li')).not.toHaveAttribute('data-current')
		})

		it('never marks a routeless item current, even if active happens to be falsy', () => {
			render(<MenuItem active={ undefined } label="User" />)
			const span = screen.getByRole('menuitem', { name: 'User' })

			expect(span).not.toHaveAttribute('aria-current')
			expect(span.closest('li')).not.toHaveAttribute('data-current')
		})

		it('preserves a consumer-supplied attributes.data bag alongside the computed data-current', () => {
			render(
				<MenuItem
					active="/marketplace"
					attributes={ { data: { testid: 'item' } } }
					label="Marketplace"
					route="/marketplace"
				/>
			)
			const li = screen.getByRole('menuitem', { name: 'Marketplace' }).closest('li')

			expect(li).toHaveAttribute('data-testid', 'item')
			expect(li).toHaveAttribute('data-current')
		})

		it('keeps a consumer-supplied data-current even when the route does not match', () => {
			render(
				<MenuItem
					active="/login"
					attributes={ { data: { current: true } } }
					label="Marketplace"
					route="/marketplace"
				/>
			)
			const link = screen.getByRole('menuitem', { name: 'Marketplace' })

			expect(link.closest('li')).toHaveAttribute('data-current')
			expect(link).not.toHaveAttribute('aria-current')
		})
	})

	describe('dropdown without hasDropdowns (flattened submenu)', () => {
		const menu = [
			{ label: 'Feed', route: '/community/feed' as const },
			{ label: 'Spotlights', route: '/community/spotlights' as const },
		]

		it('renders every submenu item as its own menuitem, with no trigger', () => {
			const { container } = render(
				<MenuItem label="Community" route="/community" menu={ menu } hasDropdowns={ false } />
			)

			expect(screen.queryByRole('button')).not.toBeInTheDocument()
			expect(screen.getByRole('menuitem', { name: 'Feed' })).toBeInTheDocument()
			expect(screen.getByRole('menuitem', { name: 'Spotlights' })).toBeInTheDocument()
			// each flattened entry gets its own top-level li[role="none"]
			expect(container.querySelectorAll('li[role="none"]')).toHaveLength(2)
		})

		it('renders no id on flattened items, even when one is given', () => {
			const { container } = render(
				<MenuItem id="custom" label="Community" route="/community" menu={ menu } hasDropdowns={ false } />
			)

			expect(container.querySelectorAll('li[role="none"]')).toHaveLength(2)
			expect(container.querySelector('[id]')).not.toBeInTheDocument()
		})

		it('does not render the parent item\'s own label, only its children', () => {
			render(<MenuItem label="Community" route="/community" menu={ menu } hasDropdowns={ false } />)
			expect(screen.queryByRole('menuitem', { name: 'Community' })).not.toBeInTheDocument()
		})
	})

	//	Wiring only. The open/close, hover and keyboard behaviour lives in `MenuDropdown.test.tsx`.
	describe('full dropdown (hasDropdowns=true, default)', () => {
		const menu = [
			{ label: 'Feed', route: '/community/feed' as const },
			{ label: 'Spotlights', route: '/community/spotlights' as const },
		]

		const renderDropdown = (props: Partial<ComponentProps<typeof MenuItem>> = {}) =>
			render(<MenuItem label="Community" route="/community" menu={ menu } hasDropdowns { ...props } />)

		it('wires a trigger button to its submenu using ids derived from the label', () => {
			renderDropdown()

			const trigger = screen.getByRole('button')
			expect(trigger).toHaveAttribute('id', 'dropdown-community-trigger')
			expect(trigger).toHaveAttribute('aria-controls', 'dropdown-community-menu')
			expect(trigger).toHaveAttribute('aria-haspopup', 'true')
			expect(trigger).toHaveAttribute('aria-expanded', 'false')

			const submenu = screen.getByRole('menubar')
			expect(submenu).toHaveAttribute('id', 'dropdown-community-menu')
			expect(submenu).toHaveAttribute('aria-labelledby', 'dropdown-community-trigger')
		})

		it('renders the parent label as a link beside the caret button, not inside it', () => {
			const { container } = renderDropdown()

			const link = screen.getByRole('menuitem', { name: 'Community' })
			expect(link).toHaveAttribute('href', '/community')
			expect(link.closest('button')).not.toBeInTheDocument()
			expect(screen.getByRole('button')).not.toContainElement(link)
			expect(container.querySelector('button a, a button')).not.toBeInTheDocument()
		})

		it('names the caret button after the label', () => {
			renderDropdown()
			expect(screen.getByRole('button', { name: 'Community submenu' })).toBeInTheDocument()
		})

		it('keeps the submenu items in the DOM while closed, with the root as an li[role="none"]', () => {
			const { container } = renderDropdown()

			expect(screen.getByRole('menubar')).not.toHaveAttribute('data-open')
			expect(screen.getByRole('menuitem', { name: 'Feed' })).toBeInTheDocument()
			expect(screen.getByRole('menuitem', { name: 'Spotlights' })).toBeInTheDocument()
			expect(container.querySelector('li#dropdown-community')).toHaveAttribute('role', 'none')
		})

		it('shows the caret for a string label', () => {
			renderDropdown()

			const caret = screen.getByRole('button')
			expect(caret.querySelector('svg')).toBeInTheDocument()
			expect(caret.className).not.toContain('hidden')
		})

		it('replaces the label with `trigger`, keeps the link named after the label, and hides the caret', () => {
			renderDropdown({ trigger: <b data-testid="avatar">Me</b> })

			const link = screen.getByRole('menuitem', { name: 'Community' })
			expect(link).toContainElement(screen.getByTestId('avatar'))
			expect(link).toHaveAttribute('aria-label', 'Community')

			// the caret button is still there and still works, only its hidden modifier is set
			const caret = screen.getByRole('button', { name: 'Community submenu' })
			expect(caret.className).toContain('hidden')
			expect(caret.querySelector('svg')).toBeInTheDocument()
		})

		it('slugs a multi-word label into the ids', () => {
			renderDropdown({ label: 'Browse Work', route: undefined })

			expect(screen.getByRole('button')).toHaveAttribute('id', 'dropdown-browse-work-trigger')
			expect(screen.getByRole('menubar')).toHaveAttribute('id', 'dropdown-browse-work-menu')
		})

		it('still derives the ids from `label` when `trigger` replaces what is shown', () => {
			renderDropdown({ trigger: <b>Me</b> })
			expect(screen.getByRole('button')).toHaveAttribute('id', 'dropdown-community-trigger')
		})

		it('lets an explicit `id` override the derived one on the root li, trigger and submenu', () => {
			const { container } = renderDropdown({ id: 'custom' })

			expect(container.querySelector('li#custom')).toBeInTheDocument()
			expect(container.querySelector('li#dropdown-community')).not.toBeInTheDocument()

			const trigger = screen.getByRole('button')
			expect(trigger).toHaveAttribute('id', 'custom-trigger')
			expect(trigger).toHaveAttribute('aria-controls', 'custom-menu')
			expect(screen.getByRole('menubar')).toHaveAttribute('id', 'custom-menu')
			expect(screen.getByRole('menubar')).toHaveAttribute('aria-labelledby', 'custom-trigger')
		})

		it('marks the dropdown li current when `active` matches the parent route', () => {
			const { container } = renderDropdown({ active: '/community' })

			expect(container.querySelector('li#dropdown-community')).toHaveAttribute('data-current')
			// the submenu list never takes the parent's current marker
			expect(screen.getByRole('menubar')).not.toHaveAttribute('data-current')
		})

		it('does not mark the dropdown li current for a different `active`, with a positive control', () => {
			const { container } = renderDropdown({ active: '/login' })

			const li = container.querySelector('li#dropdown-community')
			expect(li).toBeInTheDocument()
			expect(li).not.toHaveAttribute('data-current')
		})

		it('passes `active` down so a matching submenu item is the current page', () => {
			renderDropdown({ active: '/community/feed' })

			expect(screen.getByRole('menuitem', { name: 'Feed' })).toHaveAttribute('aria-current', 'page')
			expect(screen.getByRole('menuitem', { name: 'Spotlights' })).not.toHaveAttribute('aria-current')
		})
	})
})
