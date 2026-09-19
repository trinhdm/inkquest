import { act, fireEvent, screen } from '@testing-library/react'
import { renderWithTheme as render } from '@/tests/test-utils'
import { resetComponentDefaults } from '@/hooks/useProps'
import { resetVariantStyles } from '@/lib/registries'
import { MenuItem } from './MenuItem'

// `MenuItem.tsx` imports `usePathname` from `next/navigation`, but it is
// commented out (dead code, tracked by a literal `// add behavior for:
// aria-current="page"` TODO). Nothing in the component actually calls it at
// runtime, so no navigation mock is required for these components to render
// correctly — this is asserted directly in the "active link" section below.

describe('MenuItem', () => {
	afterEach(() => {
		resetVariantStyles('MenuItem')
		resetVariantStyles('Menu')
	})

	afterAll(() => {
		resetComponentDefaults('MenuItem')
		resetComponentDefaults('Menu')
	})

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

		it('does not set aria-current, since active-link state is an unimplemented TODO', () => {
			// SOURCE GAP: `MenuItem.tsx` has a literal
			// `// add behavior for: aria-current="page"` comment and never sets
			// this attribute — this test documents current (unfinished) behavior,
			// it does not assert a working feature.
			render(<MenuItem label="Marketplace" route="/marketplace" />)
			expect(screen.getByRole('menuitem')).not.toHaveAttribute('aria-current')
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
