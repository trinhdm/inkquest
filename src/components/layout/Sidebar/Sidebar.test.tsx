import userEvent from '@testing-library/user-event'
import { usePathname } from 'next/navigation'
import { getDefaultProps } from '@/hooks/useProps'
import { act, render, reset, screen, within } from '@/tests/test-utils'
import { Sidebar } from './Sidebar'

// `usePathname()` is null outside an app-router provider; mocked only to drive
// the same-page anchor branch of SidebarItem with a specific pathname.
jest.mock('next/navigation', () => ({
	...jest.requireActual('next/navigation'),
	usePathname: jest.fn(() => null),
}))

describe('Sidebar', () => {
	reset('Sidebar', 'Button')

	afterEach(() => {
		(usePathname as jest.Mock).mockReturnValue(null)
	})

	const linkItems: Sidebar.Item.Link[] = [
		{ id: 'overview', label: 'Overview', url: '/profile' },
		{ id: 'settings', label: 'Settings', url: '/settings' },
	]

	const actionItems: Sidebar.Item.Action[] = [
		{ id: 'save', label: 'Save' },
		{ id: 'discard', label: 'Discard' },
	]

	it('defaults `as` to "aside", `scroll` to false, and `shallow` to true', () => {
		const defaults = getDefaultProps<Sidebar.Props & { as: 'aside' }>('Sidebar')
		expect(defaults.as).toBe('aside')
		expect(defaults.scroll).toBe(false)
		expect(defaults.shallow).toBe(true)
	})

	it('renders a complementary landmark holding a navigation list of every item', () => {
		render(<Sidebar active="overview" items={ linkItems } />)
		const aside = screen.getByRole('complementary')
		const nav = within(aside).getByRole('navigation')
		const list = within(nav).getByRole('list')

		expect(within(list).getAllByRole('listitem')).toHaveLength(linkItems.length)
		expect(within(list).getByRole('link', { name: 'Overview' })).toBeInTheDocument()
		expect(within(list).getByRole('link', { name: 'Settings' })).toBeInTheDocument()
	})

	it('renders items with a `url` as links pointing to that url', () => {
		render(<Sidebar active="overview" items={ linkItems } />)
		expect(screen.getByRole('link', { name: 'Settings' })).toHaveAttribute('href', '/settings')
	})

	it('marks the active link item with aria-current="page"', () => {
		render(<Sidebar active="settings" items={ linkItems } />)
		expect(screen.getByRole('link', { name: 'Settings' })).toHaveAttribute('aria-current', 'page')
	})

	it('does not mark inactive link items with aria-current', () => {
		render(<Sidebar active="settings" items={ linkItems } />)
		expect(screen.getByRole('link', { name: 'Overview' })).not.toHaveAttribute('aria-current')
	})

	it('renders items without a `url` as buttons instead of links', () => {
		render(
			<Sidebar
				active="save"
				items={ actionItems }
				onChange={ jest.fn() }
			/>
		)
		expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument()
		expect(screen.queryByRole('link')).not.toBeInTheDocument()
	})

	it('marks the active action item with aria-current="true"', () => {
		render(
			<Sidebar
				active="save"
				items={ actionItems }
				onChange={ jest.fn() }
			/>
		)
		expect(screen.getByRole('button', { name: 'Save' })).toHaveAttribute('aria-current', 'true')
	})

	it('calls onChange with the clicked action item id', async () => {
		const user = userEvent.setup()
		const onChange = jest.fn()

		render(
			<Sidebar
				active="save"
				items={ actionItems }
				onChange={ onChange }
			/>
		)

		await user.click(screen.getByRole('button', { name: 'Discard' }))
		expect(onChange).toHaveBeenCalledWith('discard')
	})

	// `items` and `children` are two separate modes: with items, Sidebar renders
	// only its item list; without items, it renders only its children
	it('renders its children, and no navigation list, when given no items', () => {
		render(
			<Sidebar>
				<span>Filter content</span>
			</Sidebar>
		)
		// positive control: the sidebar itself and its children are rendered
		expect(screen.getByRole('complementary')).toBeInTheDocument()
		expect(screen.getByText('Filter content')).toBeInTheDocument()

		expect(screen.queryByRole('navigation')).not.toBeInTheDocument()
		expect(screen.queryByRole('list')).not.toBeInTheDocument()
		expect(screen.queryByRole('link')).not.toBeInTheDocument()
	})

	it('renders only the item list, not its children, when given items', () => {
		render(
			<Sidebar active="overview" items={ linkItems }>
				<span>Ignored content</span>
			</Sidebar>
		)
		expect(screen.getByRole('navigation')).toBeInTheDocument()
		expect(screen.getByRole('list')).toBeInTheDocument()
		expect(screen.queryByText('Ignored content')).not.toBeInTheDocument()
	})

	describe('same-page anchor links', () => {
		const anchorItems: Sidebar.Item.Link[] = [
			{ id: 'intro', label: 'Intro', url: '/privacy-policy#intro' as Sidebar.Item.Link['url'] },
			{ id: 'rights', label: 'Rights', url: '/privacy-policy#rights' as Sidebar.Item.Link['url'] },
		]

		it('marks the active anchor link aria-current="true" when it targets the current page', () => {
			(usePathname as jest.Mock).mockReturnValue('/privacy-policy')
			render(<Sidebar active="rights" items={ anchorItems } />)

			expect(screen.getByRole('link', { name: 'Rights' })).toHaveAttribute('aria-current', 'true')
			expect(screen.getByRole('link', { name: 'Intro' })).not.toHaveAttribute('aria-current')
		})

		it('marks it aria-current="page" when the anchor belongs to a different page', () => {
			(usePathname as jest.Mock).mockReturnValue('/terms-conditions')
			render(<Sidebar active="rights" items={ anchorItems } />)

			expect(screen.getByRole('link', { name: 'Rights' })).toHaveAttribute('aria-current', 'page')
		})

		it('marks it aria-current="page" when the pathname is unknown (null)', () => {
			render(<Sidebar active="rights" items={ anchorItems } />)

			expect(screen.getByRole('link', { name: 'Rights' })).toHaveAttribute('aria-current', 'page')
		})

		it('treats a plain page link as the current page even when the pathname matches', () => {
			(usePathname as jest.Mock).mockReturnValue('/profile')
			render(<Sidebar active="overview" items={ linkItems } />)

			expect(screen.getByRole('link', { name: 'Overview' })).toHaveAttribute('aria-current', 'page')
		})

		it('treats an anchor with a query string as a different page', () => {
			(usePathname as jest.Mock).mockReturnValue('/privacy-policy')
			const queried: Sidebar.Item.Link[] = [
				{ id: 'q', label: 'Queried', url: '/privacy-policy?tab=1#intro' as Sidebar.Item.Link['url'] },
			]
			render(<Sidebar active="q" items={ queried } />)

			expect(screen.getByRole('link', { name: 'Queried' })).toHaveAttribute('aria-current', 'page')
		})
	})

	// jsdom lays nothing out and the global ResizeObserver stub never fires, so the
	// highlight measurement is driven by faking `offsetTop`/`offsetHeight` per element
	// (keyed by what the element is) and by a ResizeObserver that records its observers
	describe('active-row highlight', () => {
		type Box = { height: number, top: number }

		interface Layout {
			highlightHeight: number
			listTop: number
			rows: Record<string, Box>
		}

		let layout: Layout
		let observers: FakeResizeObserver[]

		class FakeResizeObserver {
			observe = jest.fn()
			disconnect = jest.fn()
			constructor(public callback: ResizeObserverCallback) { observers.push(this) }
		}

		const rowOf = (el: HTMLElement) => layout.rows[el.textContent ?? '']
		const isHighlight = (el: HTMLElement) => el.tagName === 'SPAN' && !el.textContent

		const protoOffsets = {
			offsetHeight: Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetHeight'),
			offsetTop: Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetTop'),
		}
		const globalObserver = Object.getOwnPropertyDescriptor(global, 'ResizeObserver')
		const windowObserver = Object.getOwnPropertyDescriptor(window, 'ResizeObserver')

		beforeEach(() => {
			observers = []
			// `rem()` divides by the root font size, which jsdom reports as empty (NaN)
			document.documentElement.style.fontSize = '16px'
			layout = {
				highlightHeight: 20,
				listTop: 16,
				rows: {
					Overview: { height: 20, top: 0 },
					Settings: { height: 40, top: 32 },
				},
			}

			Object.defineProperty(HTMLElement.prototype, 'offsetHeight', {
				configurable: true,
				get(this: HTMLElement) {
					if (this.tagName === 'LI') return rowOf(this)?.height ?? 0
					return isHighlight(this) ? layout.highlightHeight : 0
				},
			})
			Object.defineProperty(HTMLElement.prototype, 'offsetTop', {
				configurable: true,
				get(this: HTMLElement) {
					if (this.tagName === 'UL') return layout.listTop
					return this.tagName === 'LI' ? rowOf(this)?.top ?? 0 : 0
				},
			})

			Object.defineProperty(global, 'ResizeObserver', { configurable: true, writable: true, value: FakeResizeObserver })
			Object.defineProperty(window, 'ResizeObserver', { configurable: true, writable: true, value: FakeResizeObserver })
		})

		afterEach(() => {
			document.documentElement.style.removeProperty('font-size')
			Object.defineProperty(HTMLElement.prototype, 'offsetHeight', protoOffsets.offsetHeight!)
			Object.defineProperty(HTMLElement.prototype, 'offsetTop', protoOffsets.offsetTop!)
			Object.defineProperty(global, 'ResizeObserver', globalObserver!)
			Object.defineProperty(window, 'ResizeObserver', windowObserver!)
		})

		// the highlight is the only empty span directly inside the nav
		const getHighlight = () => screen.getByRole('navigation').querySelector(':scope > span') as HTMLElement
		const vars = (el: HTMLElement) => ({
			position: el.style.getPropertyValue('--sidebar-highlight-position'),
			scale: el.style.getPropertyValue('--sidebar-highlight-scale'),
		})

		it('places the highlight at the active row offset (in rem) and stretches it to the row height', () => {
			render(<Sidebar active="settings" items={ linkItems } />)
			const highlight = getHighlight()

			// list.offsetTop (16) + row.offsetTop (32) = 48px; row 40px over a 20px highlight
			expect(vars(highlight)).toEqual({ position: '3rem', scale: '2' })
			expect(highlight).not.toHaveStyle({ visibility: 'hidden' })
		})

		it('measures the first row from the list offset alone', () => {
			render(<Sidebar active="overview" items={ linkItems } />)

			expect(vars(getHighlight())).toEqual({ position: '1rem', scale: '1' })
		})

		it('falls back to a scale of 1 when the highlight has no measurable height', () => {
			layout.highlightHeight = 0
			render(<Sidebar active="settings" items={ linkItems } />)

			expect(vars(getHighlight()).scale).toBe('1')
		})

		it('hides the highlight, without position variables, when no item matches `active`', () => {
			render(<Sidebar active="missing" items={ linkItems } />)
			const highlight = getHighlight()

			expect(highlight).toHaveStyle({ visibility: 'hidden' })
			expect(vars(highlight)).toEqual({ position: '', scale: '' })
		})

		it('hides the highlight when `active` is unset', () => {
			render(<Sidebar items={ linkItems } />)

			expect(getHighlight()).toHaveStyle({ visibility: 'hidden' })
		})

		it('moves the highlight when the active item changes', () => {
			const { rerender } = render(<Sidebar active="overview" items={ linkItems } />)
			expect(vars(getHighlight()).position).toBe('1rem')

			rerender(<Sidebar active="settings" items={ linkItems } />)

			expect(vars(getHighlight())).toEqual({ position: '3rem', scale: '2' })
		})

		it('measures again when the item count changes', () => {
			const { rerender } = render(<Sidebar active="settings" items={ linkItems.slice(0, 1) } />)
			expect(getHighlight()).toHaveStyle({ visibility: 'hidden' })

			rerender(<Sidebar active="settings" items={ linkItems } />)

			expect(vars(getHighlight()).position).toBe('3rem')
		})

		it('observes the list and every row for resizes', () => {
			render(<Sidebar active="settings" items={ linkItems } />)

			expect(observers).toHaveLength(1)
			const observed = observers[0].observe.mock.calls.map(([el]) => (el as HTMLElement).tagName)
			expect(observed).toEqual(['UL', 'LI', 'LI'])
		})

		it('re-measures when a row resizes, such as a label wrapping onto more lines', () => {
			render(<Sidebar active="settings" items={ linkItems } />)
			expect(vars(getHighlight()).scale).toBe('2')

			layout.rows.Settings = { height: 60, top: 32 }
			act(() => observers[0].callback([], observers[0] as unknown as ResizeObserver))

			expect(vars(getHighlight()).scale).toBe('3')
		})

		it('stops observing on unmount', () => {
			const { unmount } = render(<Sidebar active="settings" items={ linkItems } />)
			const [observer] = observers
			expect(observer.disconnect).not.toHaveBeenCalled()

			unmount()

			expect(observer.disconnect).toHaveBeenCalledTimes(1)
		})

		it('measures nothing, and renders no highlight, in children mode', () => {
			render(<Sidebar><span>Filter content</span></Sidebar>)

			expect(screen.getByText('Filter content')).toBeInTheDocument()
			expect(observers).toHaveLength(0)
			expect(screen.queryByRole('navigation')).not.toBeInTheDocument()
		})
	})

	// TODO: see the TODO in Sidebar.tsx's `tokens` - with no matching `active`,
	// the rail is positioned at -3rem, one row above the list
	it.todo('does not position the rail above the list when no item is active')
})
