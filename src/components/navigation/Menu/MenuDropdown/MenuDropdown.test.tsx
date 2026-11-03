import type { ComponentProps } from 'react'
import { act, fireEvent, render, reset, screen } from '@/tests/test-utils'
import { getDefaultProps } from '@/hooks/useProps'
import { MenuDropdown } from './MenuDropdown'

//	`Menu.Dropdown` is not attached to `Menu` (Menu.tsx has no `subcomponents`), so it is
//	imported directly. `MenuItem` is what mounts it in the app; these tests drive it alone.
//
//	The submenu is ALWAYS in the DOM. "Open" is `data-open` on the submenu `ul` plus
//	`aria-expanded="true"` on the trigger; CSS hides the closed one and jsdom ignores CSS,
//	so every "closed" assertion is paired with a positive control that the submenu rendered.

describe('Menu.Dropdown', () => {
	reset('Menu.Dropdown', 'Menu', 'Menu.Item', 'Menu.Label', 'Button', 'Icon')

	const menu = [
		{ label: 'Feed', route: '/community/feed' as const },
		{ label: 'Spotlights', route: '/community/spotlights' as const },
	]

	const renderDropdown = (props: Partial<ComponentProps<typeof MenuDropdown>> = {}) =>
		render(<MenuDropdown id="dropdown-community" label="Community" menu={ menu } { ...props } />)

	const getTrigger = () => screen.getByRole('button')
	const getSubmenu = () => screen.getByRole('menubar')
	const getRoot = () => document.getElementById('dropdown-community')!

	const expectOpen = () => {
		expect(getSubmenu()).toHaveAttribute('data-open')
		expect(getTrigger()).toHaveAttribute('aria-expanded', 'true')
	}

	const expectClosed = () => {
		// positive control: the submenu and its items are still rendered
		expect(getSubmenu()).toBeInTheDocument()
		expect(screen.getByRole('menuitem', { name: 'Feed' })).toBeInTheDocument()

		expect(getSubmenu()).not.toHaveAttribute('data-open')
		expect(getTrigger()).toHaveAttribute('aria-expanded', 'false')
	}

	describe('defaults', () => {
		it('registers a list item with a caret', () => {
			expect(getDefaultProps('Menu.Dropdown')).toEqual({ as: 'li', hasCaret: true })
		})
	})

	describe('structure', () => {
		it('renders a root li with role="none" and the given id', () => {
			renderDropdown()

			const root = getRoot()
			expect(root.tagName).toBe('LI')
			expect(root).toHaveAttribute('role', 'none')
		})

		it('wires the trigger button to the submenu for assistive tech', () => {
			renderDropdown()

			const trigger = getTrigger()
			expect(trigger).toHaveAttribute('id', 'dropdown-community-trigger')
			expect(trigger).toHaveAttribute('aria-controls', 'dropdown-community-menu')
			expect(trigger).toHaveAttribute('aria-haspopup', 'true')
			expect(trigger).toHaveAttribute('aria-expanded', 'false')

			const submenu = getSubmenu()
			expect(submenu).toHaveAttribute('id', 'dropdown-community-menu')
			expect(submenu).toHaveAttribute('aria-labelledby', 'dropdown-community-trigger')
		})

		it('renders the label inside the trigger button', () => {
			renderDropdown({ label: <span data-testid="label">Community</span> })
			expect(getTrigger()).toContainElement(screen.getByTestId('label'))
		})

		it('starts closed, with the submenu already in the DOM', () => {
			renderDropdown()
			expectClosed()
		})

		it('renders the caret icon by default', () => {
			renderDropdown()
			expect(getTrigger().querySelector('svg')).toBeInTheDocument()
		})

		it('renders no caret icon for hasCaret={ false }', () => {
			renderDropdown({ hasCaret: false })

			// positive control: the trigger rendered with its label
			expect(getTrigger()).toHaveTextContent('Community')
			expect(getTrigger().querySelector('svg')).not.toBeInTheDocument()
		})

		it('passes `attributes` through to the root li', () => {
			renderDropdown({ attributes: { data: { testid: 'dropdown', current: true } } })

			const root = screen.getByTestId('dropdown')
			expect(root).toBe(getRoot())
			expect(root).toHaveAttribute('data-current')
		})

		it('honours the polymorphic `as` prop on the root', () => {
			renderDropdown({ as: 'div' })
			expect(getRoot().tagName).toBe('DIV')
		})
	})

	describe('click', () => {
		it('opens the submenu and flips aria-expanded when the trigger is clicked', () => {
			renderDropdown()

			fireEvent.click(getTrigger())

			expectOpen()
		})

		it('closes on a second trigger click', () => {
			renderDropdown()

			fireEvent.click(getTrigger())
			expectOpen()

			fireEvent.click(getTrigger())
			expectClosed()
		})

		it('closes when a mousedown lands outside the item, via useOutsideClick', () => {
			renderDropdown()

			fireEvent.click(getTrigger())
			expectOpen()

			fireEvent.mouseDown(document.body)

			expectClosed()
		})

		it('does not close on a mousedown inside the item (e.g. on the trigger itself)', () => {
			renderDropdown()

			fireEvent.click(getTrigger())
			expectOpen()

			fireEvent.mouseDown(getTrigger())
			expectOpen()
		})
	})

	describe('hover', () => {
		beforeEach(() => jest.useFakeTimers())
		afterEach(() => jest.useRealTimers())

		it('opens on mouseEnter', () => {
			renderDropdown()

			fireEvent.mouseEnter(getRoot())

			expectOpen()
		})

		it('stays open through the 300ms grace period after mouseLeave, then closes', () => {
			renderDropdown()

			fireEvent.mouseEnter(getRoot())
			fireEvent.mouseLeave(getRoot())

			act(() => { jest.advanceTimersByTime(299) })
			expectOpen()

			act(() => { jest.advanceTimersByTime(1) })
			expectClosed()
		})

		it('cancels the pending close if the pointer re-enters before the timeout fires', () => {
			renderDropdown()

			fireEvent.mouseEnter(getRoot())
			fireEvent.mouseLeave(getRoot())
			act(() => { jest.advanceTimersByTime(150) })

			fireEvent.mouseEnter(getRoot())
			act(() => { jest.advanceTimersByTime(300) })

			expectOpen()
		})

		it('does not close after unmounting mid-grace-period (the pending timer is cleared)', () => {
			const { unmount } = renderDropdown()

			fireEvent.mouseEnter(getRoot())
			fireEvent.mouseLeave(getRoot())
			expect(jest.getTimerCount()).toBeGreaterThan(0)

			unmount()

			expect(jest.getTimerCount()).toBe(0)
		})
	})

	describe('keyboard', () => {
		beforeEach(() => jest.useFakeTimers())
		afterEach(() => jest.useRealTimers())

		const feed = () => screen.getByRole('menuitem', { name: 'Feed' })
		const spotlights = () => screen.getByRole('menuitem', { name: 'Spotlights' })

		describe('while closed', () => {
			it('opens on ArrowDown and focuses the first submenu item on the next frame', () => {
				renderDropdown()

				fireEvent.keyDown(getRoot(), { key: 'ArrowDown' })
				expectOpen()
				expect(feed()).not.toHaveFocus()

				act(() => { jest.runOnlyPendingTimers() }) // flush the requestAnimationFrame focus call
				expect(feed()).toHaveFocus()
			})

			it('opens on Enter and focuses the first submenu item', () => {
				renderDropdown()

				fireEvent.keyDown(getRoot(), { key: 'Enter' })
				expectOpen()

				act(() => { jest.runOnlyPendingTimers() })
				expect(feed()).toHaveFocus()
			})

			it('opens on Space and focuses the first submenu item', () => {
				renderDropdown()

				fireEvent.keyDown(getRoot(), { key: ' ' })
				expectOpen()

				act(() => { jest.runOnlyPendingTimers() })
				expect(feed()).toHaveFocus()
			})

			it('does not open on unrelated keys', () => {
				renderDropdown()

				fireEvent.keyDown(getRoot(), { key: 'a' })

				expectClosed()
			})

			it('does not open on Escape or ArrowUp', () => {
				renderDropdown()

				fireEvent.keyDown(getRoot(), { key: 'Escape' })
				fireEvent.keyDown(getRoot(), { key: 'ArrowUp' })

				expectClosed()
			})
		})

		describe('while open', () => {
			it('moves focus forward with ArrowDown, wrapping at the end', () => {
				renderDropdown()
				fireEvent.click(getTrigger()) // open without moving focus

				// nothing focused yet inside the submenu -> ArrowDown goes to the first item
				fireEvent.keyDown(getRoot(), { key: 'ArrowDown' })
				expect(feed()).toHaveFocus()

				fireEvent.keyDown(getRoot(), { key: 'ArrowDown' })
				expect(spotlights()).toHaveFocus()

				fireEvent.keyDown(getRoot(), { key: 'ArrowDown' })
				expect(feed()).toHaveFocus()
			})

			it('moves focus backward with ArrowUp, wrapping at the start', () => {
				renderDropdown()
				fireEvent.click(getTrigger())

				// nothing focused yet inside the submenu -> ArrowUp wraps to the last item
				fireEvent.keyDown(getRoot(), { key: 'ArrowUp' })
				expect(spotlights()).toHaveFocus()

				fireEvent.keyDown(getRoot(), { key: 'ArrowUp' })
				expect(feed()).toHaveFocus()

				fireEvent.keyDown(getRoot(), { key: 'ArrowUp' })
				expect(spotlights()).toHaveFocus()
			})

			it('keeps focus on the trigger when ArrowDown is pressed on an empty submenu', () => {
				renderDropdown({ menu: [] })
				getTrigger().focus()
				fireEvent.click(getTrigger())

				fireEvent.keyDown(getRoot(), { key: 'ArrowDown' })

				expectOpen()
				expect(getTrigger()).toHaveFocus()
			})

			it('closes on Escape and returns focus to the trigger button', () => {
				renderDropdown()
				fireEvent.click(getTrigger())
				fireEvent.keyDown(getRoot(), { key: 'ArrowDown' })
				expect(feed()).toHaveFocus()

				fireEvent.keyDown(getRoot(), { key: 'Escape' })

				expectClosed()
				expect(getTrigger()).toHaveFocus()
			})

			it('closes on Tab without moving focus itself', () => {
				renderDropdown()
				fireEvent.click(getTrigger())
				fireEvent.keyDown(getRoot(), { key: 'ArrowDown' })
				expect(feed()).toHaveFocus()

				fireEvent.keyDown(getRoot(), { key: 'Tab' })

				expectClosed()
				expect(feed()).toHaveFocus()
			})

			it('does nothing for unrelated keys', () => {
				renderDropdown()
				fireEvent.click(getTrigger())
				expectOpen()

				fireEvent.keyDown(getRoot(), { key: 'a' })

				expectOpen()
			})
		})
	})
})
