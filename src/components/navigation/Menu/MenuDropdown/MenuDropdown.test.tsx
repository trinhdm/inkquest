import type { ComponentProps } from 'react'
import { act, fireEvent, render, reset, screen } from '@/tests/test-utils'
import { getDefaultProps } from '@/hooks/useProps'
import { MenuLabel } from '../MenuLabel'
import { MenuDropdown } from './MenuDropdown'

//	`Menu.Dropdown` is not attached to `Menu` (Menu.tsx has no `subcomponents`), so it is
//	imported directly. `MenuItem` is what mounts it in the app; these tests drive it alone,
//	passing the same `trigger` (a rendered `Menu.Label` link) that `MenuItem` passes.
//
//	The submenu is ALWAYS in the DOM. "Open" is `data-open` on the root `li` plus
//	`aria-expanded="true"` on the caret button; CSS hides the closed submenu and jsdom ignores
//	CSS, so every "closed" assertion is paired with a positive control that the submenu rendered.

describe('Menu.Dropdown', () => {
	reset('Menu.Dropdown', 'Menu', 'Menu.Item', 'Menu.Label', 'Button', 'Icon')

	const menu = [
		{ label: 'Feed', route: '/community/feed' as const },
		{ label: 'Spotlights', route: '/community/spotlights' as const },
	]

	const link = <MenuLabel label="Community" route="/community" />

	const renderDropdown = (props: Partial<ComponentProps<typeof MenuDropdown>> = {}) =>
		render(
			<MenuDropdown
				id="dropdown-community"
				label="Community"
				menu={ menu }
				trigger={ link }
				{ ...props }
			/>
		)

	const getCaret = () => screen.getByRole('button', { name: 'Community submenu' })
	const getLink = () => screen.getByRole('menuitem', { name: 'Community' })
	const getSubmenu = () => screen.getByRole('menubar')
	const getRoot = () => document.getElementById('dropdown-community')!

	const expectOpen = () => {
		expect(getRoot()).toHaveAttribute('data-open')
		expect(getCaret()).toHaveAttribute('aria-expanded', 'true')
	}

	const expectClosed = () => {
		// positive control: the submenu and its items are still rendered
		expect(getSubmenu()).toBeInTheDocument()
		expect(screen.getByRole('menuitem', { name: 'Feed' })).toBeInTheDocument()

		expect(getRoot()).not.toHaveAttribute('data-open')
		expect(getCaret()).toHaveAttribute('aria-expanded', 'false')
	}

	describe('defaults', () => {
		it('registers a list item and no caret default', () => {
			expect(getDefaultProps('Menu.Dropdown')).toEqual({ as: 'li' })
		})
	})

	describe('structure', () => {
		it('renders a root li with role="none" and the given id', () => {
			renderDropdown()

			const root = getRoot()
			expect(root.tagName).toBe('LI')
			expect(root).toHaveAttribute('role', 'none')
		})

		it('wires the caret button to the submenu for assistive tech', () => {
			renderDropdown()

			const caret = getCaret()
			expect(caret).toHaveAttribute('id', 'dropdown-community-trigger')
			expect(caret).toHaveAttribute('aria-controls', 'dropdown-community-menu')
			expect(caret).toHaveAttribute('aria-haspopup', 'true')
			expect(caret).toHaveAttribute('aria-expanded', 'false')

			const submenu = getSubmenu()
			expect(submenu).toHaveAttribute('id', 'dropdown-community-menu')
			expect(submenu).toHaveAttribute('aria-labelledby', 'dropdown-community-trigger')
		})

		it('puts the label link beside the caret button and never inside a button', () => {
			const { container } = renderDropdown()

			expect(getRoot()).toContainElement(getLink())
			expect(getCaret()).not.toContainElement(getLink())
			expect(getLink().closest('button')).not.toBeInTheDocument()
			expect(container.querySelector('button a, a button')).not.toBeInTheDocument()
		})

		it('renders the content first, then the caret button, then the submenu', () => {
			renderDropdown()

			const [first, second, third] = Array.from(getRoot().children)
			expect(first).toBe(getLink())
			expect(second).toBe(getCaret())
			expect(third).toBe(getSubmenu())
		})

		it('starts closed, with the submenu already in the DOM', () => {
			renderDropdown()
			expectClosed()
		})

		it('renders the plain label as text when no trigger is given', () => {
			renderDropdown({ trigger: undefined })

			expect(getRoot().firstChild).toHaveTextContent('Community')
			expect(screen.queryByRole('menuitem', { name: 'Community' })).not.toBeInTheDocument()
			expect(getCaret()).toBeInTheDocument()
		})

		it('gives the submenu only aria-labelledby, never data-open or data-current', () => {
			renderDropdown({ attributes: { data: { current: true } } })

			// positive control: the parent li is current
			expect(getRoot()).toHaveAttribute('data-current')

			fireEvent.click(getCaret())
			expectOpen()
			expect(getSubmenu()).not.toHaveAttribute('data-open')
			expect(getSubmenu()).not.toHaveAttribute('data-current')
		})

		it('passes `attributes` through to the root li, merged with data-open', () => {
			renderDropdown({ attributes: { data: { testid: 'dropdown' } } })

			expect(screen.getByTestId('dropdown')).toBe(getRoot())

			fireEvent.click(getCaret())
			expect(getRoot()).toHaveAttribute('data-testid', 'dropdown')
			expect(getRoot()).toHaveAttribute('data-open')
		})

		it('honours the polymorphic `as` prop on the root', () => {
			renderDropdown({ as: 'div' })
			expect(getRoot().tagName).toBe('DIV')
		})
	})

	describe('caret', () => {
		const isHidden = () => getCaret().className.includes('hidden')

		it('is named after the label, with the submenu labelled by it', () => {
			renderDropdown()

			expect(getCaret()).toHaveAccessibleName('Community submenu')
			expect(document.getElementById(getSubmenu().getAttribute('aria-labelledby')!)).toBe(getCaret())
		})

		it('shows for string content by default', () => {
			renderDropdown({ trigger: undefined })

			expect(isHidden()).toBe(false)
			expect(getCaret().querySelector('svg')).toBeInTheDocument()
		})

		it('gets the hidden modifier, but is still rendered, for non-string content', () => {
			renderDropdown()

			// the label link is a React element, so the caret is hidden unless asked for
			expect(isHidden()).toBe(true)
			expect(getCaret().querySelector('svg')).toBeInTheDocument()
		})

		it('follows an explicit hasCaret={ true } over the content type', () => {
			renderDropdown({ hasCaret: true })
			expect(isHidden()).toBe(false)
		})

		it('follows an explicit hasCaret={ false } over the content type, with a positive control', () => {
			renderDropdown({ hasCaret: false, trigger: undefined })

			expect(getCaret()).toHaveTextContent('')
			expect(isHidden()).toBe(true)
		})

		it('still toggles the menu while hidden', () => {
			renderDropdown()
			expect(isHidden()).toBe(true)

			fireEvent.click(getCaret())

			expectOpen()
		})
	})

	describe('click', () => {
		it('opens the submenu and flips aria-expanded when the caret is clicked', () => {
			renderDropdown()

			fireEvent.click(getCaret())

			expectOpen()
		})

		it('closes on a second caret click', () => {
			renderDropdown()

			fireEvent.click(getCaret())
			expectOpen()

			fireEvent.click(getCaret())
			expectClosed()
		})

		it('does not toggle when the label link is clicked', () => {
			renderDropdown()

			fireEvent.click(getLink())

			expectClosed()
		})

		it('closes when a mousedown lands outside the item, via useOutsideClick', () => {
			renderDropdown()

			fireEvent.click(getCaret())
			expectOpen()

			fireEvent.mouseDown(document.body)

			expectClosed()
		})

		it('does not close on a mousedown inside the item (e.g. on the caret itself)', () => {
			renderDropdown()

			fireEvent.click(getCaret())
			expectOpen()

			fireEvent.mouseDown(getCaret())
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

		it('clears the pending close timer when unmounted mid-grace-period', () => {
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

			it('opens on Enter pressed on the caret button, and focuses the first submenu item', () => {
				renderDropdown()

				fireEvent.keyDown(getCaret(), { key: 'Enter' })
				expectOpen()

				act(() => { jest.runOnlyPendingTimers() })
				expect(feed()).toHaveFocus()
			})

			it('opens on Space pressed on the caret button', () => {
				renderDropdown()

				fireEvent.keyDown(getCaret(), { key: ' ' })

				expectOpen()
			})

			it('prevents the default action when it opens, so the key does not also click', () => {
				renderDropdown()

				// fireEvent returns false when the event was default-prevented
				expect(fireEvent.keyDown(getCaret(), { key: 'Enter' })).toBe(false)
			})

			it('leaves Enter on the label link alone, so the link is followed and the menu stays closed', () => {
				renderDropdown()

				// fireEvent returns true when the event was NOT default-prevented
				expect(fireEvent.keyDown(getLink(), { key: 'Enter' })).toBe(true)

				expectClosed()
			})

			it('leaves Space on the label link alone as well', () => {
				renderDropdown()

				expect(fireEvent.keyDown(getLink(), { key: ' ' })).toBe(true)

				expectClosed()
			})

			it('opens on ArrowDown pressed on the label link', () => {
				renderDropdown()

				fireEvent.keyDown(getLink(), { key: 'ArrowDown' })

				expectOpen()
			})

			it('does not open on unrelated keys, ArrowUp, or the nested-only ArrowRight', () => {
				renderDropdown()

				fireEvent.keyDown(getRoot(), { key: 'a' })
				fireEvent.keyDown(getRoot(), { key: 'ArrowUp' })
				fireEvent.keyDown(getRoot(), { key: 'ArrowRight' })

				expectClosed()
			})

			it('lets keys it does not handle bubble to the parent menu, but swallows the ones it opens on', () => {
				const onParentKey = jest.fn()
				render(
					<div onKeyDown={ event => onParentKey(event.key) }>
						<MenuDropdown id="dropdown-community" label="Community" menu={ menu } trigger={ link } />
					</div>
				)

				fireEvent.keyDown(getRoot(), { key: 'Escape' })
				fireEvent.keyDown(getRoot(), { key: 'ArrowUp' })
				expect(onParentKey).toHaveBeenCalledWith('Escape')
				expect(onParentKey).toHaveBeenCalledWith('ArrowUp')

				onParentKey.mockClear()
				fireEvent.keyDown(getRoot(), { key: 'ArrowDown' })

				expectOpen()
				expect(onParentKey).not.toHaveBeenCalled()
			})
		})

		describe('while open', () => {
			it('moves focus forward with ArrowDown, wrapping at the end', () => {
				renderDropdown()
				fireEvent.click(getCaret()) // open without moving focus

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
				fireEvent.click(getCaret())

				// nothing focused yet inside the submenu -> ArrowUp wraps to the last item
				fireEvent.keyDown(getRoot(), { key: 'ArrowUp' })
				expect(spotlights()).toHaveFocus()

				fireEvent.keyDown(getRoot(), { key: 'ArrowUp' })
				expect(feed()).toHaveFocus()

				fireEvent.keyDown(getRoot(), { key: 'ArrowUp' })
				expect(spotlights()).toHaveFocus()
			})

			it('closes on Escape and returns focus to the label link', () => {
				renderDropdown()
				fireEvent.click(getCaret())
				fireEvent.keyDown(getRoot(), { key: 'ArrowDown' })
				expect(feed()).toHaveFocus()

				fireEvent.keyDown(getRoot(), { key: 'Escape' })

				expectClosed()
				expect(getLink()).toHaveFocus()
			})

			it('swallows Escape so the parent menu does not also close', () => {
				const onParentKey = jest.fn()
				render(
					<div onKeyDown={ event => onParentKey(event.key) }>
						<MenuDropdown id="dropdown-community" label="Community" menu={ menu } trigger={ link } />
					</div>
				)
				fireEvent.click(getCaret())

				fireEvent.keyDown(getRoot(), { key: 'Escape' })

				expectClosed()
				expect(onParentKey).not.toHaveBeenCalled()
			})

			it('ignores ArrowLeft at the top level, since only nested dropdowns close on it', () => {
				renderDropdown()
				fireEvent.click(getCaret())

				fireEvent.keyDown(getRoot(), { key: 'ArrowLeft' })

				expectOpen()
			})

			it('closes on Tab without moving focus itself', () => {
				renderDropdown()
				fireEvent.click(getCaret())
				fireEvent.keyDown(getRoot(), { key: 'ArrowDown' })
				expect(feed()).toHaveFocus()

				fireEvent.keyDown(getRoot(), { key: 'Tab' })

				expectClosed()
				expect(feed()).toHaveFocus()
			})

			it('does nothing for unrelated keys', () => {
				renderDropdown()
				fireEvent.click(getCaret())
				expectOpen()

				fireEvent.keyDown(getRoot(), { key: 'a' })

				expectOpen()
			})

			it('keeps focus where it is when ArrowDown is pressed on an empty submenu', () => {
				renderDropdown({ menu: [] })
				getCaret().focus()
				fireEvent.click(getCaret())

				fireEvent.keyDown(getRoot(), { key: 'ArrowDown' })

				expectOpen()
				expect(getCaret()).toHaveFocus()
			})
		})

		describe('nested (depth > 0)', () => {
			it('opens on ArrowRight and focuses the first submenu item', () => {
				renderDropdown({ depth: 1 })

				fireEvent.keyDown(getRoot(), { key: 'ArrowRight' })
				expectOpen()

				act(() => { jest.runOnlyPendingTimers() })
				expect(feed()).toHaveFocus()
			})

			it('does not open on ArrowDown, which belongs to the parent menu, and lets it bubble', () => {
				const onParentKey = jest.fn()
				render(
					<div onKeyDown={ event => onParentKey(event.key) }>
						<MenuDropdown depth={ 1 } id="dropdown-community" label="Community" menu={ menu } trigger={ link } />
					</div>
				)

				fireEvent.keyDown(getRoot(), { key: 'ArrowDown' })

				expectClosed()
				expect(onParentKey).toHaveBeenCalledWith('ArrowDown')
			})

			it('closes on ArrowLeft and returns focus to the label link', () => {
				renderDropdown({ depth: 1 })
				fireEvent.click(getCaret())
				fireEvent.keyDown(getRoot(), { key: 'ArrowDown' })
				expect(feed()).toHaveFocus()

				fireEvent.keyDown(feed(), { key: 'ArrowLeft' })

				expectClosed()
				expect(getLink()).toHaveFocus()
			})
		})
	})
})
