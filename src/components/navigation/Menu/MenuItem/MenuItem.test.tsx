import { act, fireEvent, render, reset, screen } from '@/tests/test-utils'
import { MenuItem } from './MenuItem'

// `MenuItem.tsx` renders `activeItem` matching purely from the `route` it's
// handed as a prop — it has no `next/navigation` import of its own, and
// doesn't need one: `Menu` (its parent) is the only place `usePathname` is
// read, and it forwards the resolved route down as `activeItem`. No router
// mock is required for these tests.

describe('MenuItem', () => {
	// the "full dropdown" branch renders a real `Button` trigger with a nested
	// `Icon` (caret-up/down), so both need resetting alongside `MenuItem`/`Menu`.
	reset('MenuItem', 'Menu', 'Button', 'Icon')

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
			render(<MenuItem activeItem="/marketplace" label="Marketplace" route="/marketplace" />)
			const link = screen.getByRole('menuitem', { name: 'Marketplace' })
			expect(link).toHaveAttribute('aria-current', 'page')
			expect(link.closest('li')).toHaveAttribute('data-current')
		})
		it('does not mark a non-matching item current', () => { /* ... */ })
		it('never marks a routeless item current, even if activeItem happens to be falsy', () => { /* ... */ })
		it('preserves a consumer-supplied attributes.data bag alongside the computed data-current', () => { /* ... */ })
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

		it('does not render the parent item\'s own label, only its children', () => {
			render(<MenuItem label="Community" route="/community" menu={ menu } hasDropdowns={ false } />)
			expect(screen.queryByRole('menuitem', { name: 'Community' })).not.toBeInTheDocument()
		})
	})

	describe('full dropdown (hasDropdowns=true, default)', () => {
		const menu = [
			{ label: 'Feed', route: '/community/feed' as const },
			{ label: 'Spotlights', route: '/community/spotlights' as const },
		]

		const renderDropdown = () =>
			render(<MenuItem label="Community" route="/community" menu={ menu } hasDropdowns />)

		it('renders the parent label plus a trigger button wired for a popup menu', () => {
			renderDropdown()

			expect(screen.getByRole('menuitem', { name: 'Community' })).toBeInTheDocument()

			const trigger = screen.getByRole('button')
			expect(trigger).toHaveAttribute('id', 'community-dropdown-trigger')
			expect(trigger).toHaveAttribute('aria-controls', 'community-menu-list')
			expect(trigger).toHaveAttribute('aria-haspopup', 'true')
			expect(trigger).toHaveAttribute('aria-expanded', 'false')
		})

		it('does not render the nested menu until opened', () => {
			renderDropdown()
			expect(screen.queryByRole('menubar')).not.toBeInTheDocument()
		})

		it('opens the nested menu and flips aria-expanded when the trigger is clicked', () => {
			renderDropdown()

			fireEvent.click(screen.getByRole('button'))

			expect(screen.getByRole('button')).toHaveAttribute('aria-expanded', 'true')
			const submenu = screen.getByRole('menubar')
			expect(submenu).toHaveAttribute('aria-labelledby', 'community-dropdown-trigger')
			expect(submenu).toHaveAttribute('id', 'community-menu-list')
			expect(screen.getByRole('menuitem', { name: 'Feed' })).toBeInTheDocument()
		})

		it('closes the nested menu on a second trigger click', () => {
			renderDropdown()

			const trigger = screen.getByRole('button')
			fireEvent.click(trigger)
			expect(screen.getByRole('menubar')).toBeInTheDocument()

			fireEvent.click(trigger)
			expect(screen.queryByRole('menubar')).not.toBeInTheDocument()
			expect(trigger).toHaveAttribute('aria-expanded', 'false')
		})

		it('closes when a click lands outside the item, via useOutsideClick', () => {
			renderDropdown()

			fireEvent.click(screen.getByRole('button'))
			expect(screen.getByRole('menubar')).toBeInTheDocument()

			fireEvent.mouseDown(document.body)

			expect(screen.queryByRole('menubar')).not.toBeInTheDocument()
		})

		it('does not close on a click inside the item (e.g. on the trigger itself)', () => {
			renderDropdown()

			const trigger = screen.getByRole('button')
			fireEvent.click(trigger)
			expect(screen.getByRole('menubar')).toBeInTheDocument()

			// a mousedown that lands on the trigger is inside `itemRef`, so
			// `useOutsideClick`'s callback should not fire
			fireEvent.mouseDown(trigger)
			expect(screen.getByRole('menubar')).toBeInTheDocument()
		})

		describe('hover open/close', () => {
			beforeEach(() => jest.useFakeTimers())
			afterEach(() => jest.useRealTimers())

			it('opens on mouseEnter', () => {
				renderDropdown()
				fireEvent.mouseEnter(screen.getByRole('menuitem', { name: 'Community' }).closest('li')!)
				expect(screen.getByRole('menubar')).toBeInTheDocument()
			})

			it('stays open through the 300ms grace period after mouseLeave, then closes', () => {
				renderDropdown()
				const item = screen.getByRole('menuitem', { name: 'Community' }).closest('li')!

				fireEvent.mouseEnter(item)
				fireEvent.mouseLeave(item)

				act(() => { jest.advanceTimersByTime(299) })
				expect(screen.getByRole('menubar')).toBeInTheDocument()

				act(() => { jest.advanceTimersByTime(1) })
				expect(screen.queryByRole('menubar')).not.toBeInTheDocument()
			})

			it('cancels the pending close if the pointer re-enters before the timeout fires', () => {
				renderDropdown()
				const item = screen.getByRole('menuitem', { name: 'Community' }).closest('li')!

				fireEvent.mouseEnter(item)
				fireEvent.mouseLeave(item)
				act(() => { jest.advanceTimersByTime(150) })

				fireEvent.mouseEnter(item)
				act(() => { jest.advanceTimersByTime(300) })

				expect(screen.getByRole('menubar')).toBeInTheDocument()
			})
		})

		describe('keyboard navigation', () => {
			beforeEach(() => jest.useFakeTimers())
			afterEach(() => jest.useRealTimers())

			const getItem = () => screen.getByRole('menuitem', { name: 'Community' }).closest('li')!

			it('opens on ArrowDown when closed and focuses the first submenu item', () => {
				renderDropdown()
				const item = getItem()

				fireEvent.keyDown(item, { key: 'ArrowDown' })
				expect(screen.getByRole('menubar')).toBeInTheDocument()

				act(() => { jest.runOnlyPendingTimers() }) // flush the requestAnimationFrame focus call
				expect(screen.getByRole('menuitem', { name: 'Feed' })).toHaveFocus()
			})

			it('opens on Enter when closed', () => {
				renderDropdown()
				fireEvent.keyDown(getItem(), { key: 'Enter' })
				expect(screen.getByRole('menubar')).toBeInTheDocument()
			})

			it('opens on Space when closed', () => {
				renderDropdown()
				fireEvent.keyDown(getItem(), { key: ' ' })
				expect(screen.getByRole('menubar')).toBeInTheDocument()
			})

			it('does not open on unrelated keys while closed', () => {
				renderDropdown()
				fireEvent.keyDown(getItem(), { key: 'a' })
				expect(screen.queryByRole('menubar')).not.toBeInTheDocument()
			})

			it('moves focus forward through submenu items with ArrowDown, wrapping at the end', () => {
				renderDropdown()
				const item = getItem()

				fireEvent.click(screen.getByRole('button')) // open without moving focus
				const feed = screen.getByRole('menuitem', { name: 'Feed' })
				const spotlights = screen.getByRole('menuitem', { name: 'Spotlights' })

				fireEvent.keyDown(item, { key: 'ArrowDown' })
				expect(feed).toHaveFocus()

				fireEvent.keyDown(item, { key: 'ArrowDown' })
				expect(spotlights).toHaveFocus()

				// wraps back around to the first item
				fireEvent.keyDown(item, { key: 'ArrowDown' })
				expect(feed).toHaveFocus()
			})

			it('moves focus backward through submenu items with ArrowUp, wrapping at the start', () => {
				renderDropdown()
				const item = getItem()

				fireEvent.click(screen.getByRole('button'))
				const feed = screen.getByRole('menuitem', { name: 'Feed' })
				const spotlights = screen.getByRole('menuitem', { name: 'Spotlights' })

				// nothing focused yet inside the submenu -> ArrowUp wraps to the last item
				fireEvent.keyDown(item, { key: 'ArrowUp' })
				expect(spotlights).toHaveFocus()

				fireEvent.keyDown(item, { key: 'ArrowUp' })
				expect(feed).toHaveFocus()
			})

			it('closes on Escape and returns focus to the trigger button', () => {
				renderDropdown()
				const item = getItem()
				const trigger = screen.getByRole('button')

				fireEvent.click(trigger)
				expect(screen.getByRole('menubar')).toBeInTheDocument()

				fireEvent.keyDown(item, { key: 'Escape' })

				expect(screen.queryByRole('menubar')).not.toBeInTheDocument()
				expect(trigger).toHaveFocus()
			})

			it('closes on Tab without stealing focus', () => {
				renderDropdown()
				const item = getItem()

				fireEvent.click(screen.getByRole('button'))
				expect(screen.getByRole('menubar')).toBeInTheDocument()

				fireEvent.keyDown(item, { key: 'Tab' })
				expect(screen.queryByRole('menubar')).not.toBeInTheDocument()
			})
		})
	})
})
