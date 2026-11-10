import userEvent from '@testing-library/user-event'
import { render, reset, screen } from '@/tests/test-utils'
import { getDefaultProps } from '@/hooks/useProps'
import { Tab } from './Tab'

const renderTabs = (props: Partial<Tab.Group.Props> = {}) =>
	render(
		<Tab.Group { ...props }>
			<Tab.List>
				<Tab>One</Tab>
				<Tab>Two</Tab>
				<Tab>Three</Tab>
			</Tab.List>
			<Tab.Panel>Panel one</Tab.Panel>
			<Tab.Panel>Panel two</Tab.Panel>
			<Tab.Panel>Panel three</Tab.Panel>
		</Tab.Group>
	)

describe('Tab', () => {
	reset('Tab', 'Tab.Group', 'Tab.List', 'Tab.Panel')

	describe('defaults', () => {
		it('registers a button element at index 0 as its defaults', () => {
			expect(getDefaultProps('Tab')).toEqual({ as: 'button', index: 0 })
		})
	})

	describe('rendering', () => {
		it('renders one tab per Tab inside a tablist, labelled by its children', () => {
			renderTabs()

			const list = screen.getByRole('tablist')
			expect(list).toBeInTheDocument()
			expect(screen.getAllByRole('tab').map(tab => tab.textContent)).toEqual(['One', 'Two', 'Three'])
		})

		it('renders each tab as a button by default', () => {
			renderTabs()
			screen.getAllByRole('tab').forEach(tab => expect(tab.tagName).toBe('BUTTON'))
		})

		it('honours the polymorphic `as` prop', () => {
			render(
				<Tab.Group>
					<Tab.List>
						<Tab as="div">One</Tab>
					</Tab.List>
					<Tab.Panel>Panel one</Tab.Panel>
				</Tab.Group>
			)
			expect(screen.getByRole('tab', { name: 'One' }).tagName).toBe('DIV')
		})

		it('wraps the label in a span so the label can be styled apart from the tab', () => {
			renderTabs()
			const label = screen.getByText('One')
			expect(label.tagName).toBe('SPAN')
			expect(label.closest('[role="tab"]')).toBe(screen.getByRole('tab', { name: 'One' }))
		})

		it('passes unknown attributes such as data-testid through to the tab element', () => {
			render(
				<Tab.Group>
					<Tab.List>
						<Tab data-testid="first">One</Tab>
					</Tab.List>
					<Tab.Panel>Panel one</Tab.Panel>
				</Tab.Group>
			)
			expect(screen.getByTestId('first')).toBe(screen.getByRole('tab', { name: 'One' }))
		})
	})

	describe('selection state', () => {
		it('selects the first tab by default and shows only its panel', () => {
			renderTabs()

			expect(screen.getByRole('tab', { name: 'One' })).toHaveAttribute('aria-selected', 'true')
			expect(screen.getByRole('tab', { name: 'Two' })).toHaveAttribute('aria-selected', 'false')
			expect(screen.getByRole('tab', { name: 'Three' })).toHaveAttribute('aria-selected', 'false')

			expect(screen.getByRole('tabpanel')).toHaveTextContent('Panel one')
			expect(screen.getAllByRole('tabpanel', { hidden: true })).toHaveLength(3)
		})

		it('marks only the selected tab with data-active', () => {
			renderTabs()

			expect(screen.getByRole('tab', { name: 'One' })).toHaveAttribute('data-active')
			expect(screen.getByRole('tab', { name: 'Two' })).not.toHaveAttribute('data-active')
		})

		it('flags every tab with data-tab', () => {
			renderTabs()
			screen.getAllByRole('tab').forEach(tab => expect(tab).toHaveAttribute('data-tab'))
		})

		it('starts on `defaultActive` when given', () => {
			renderTabs({ defaultActive: 2 })

			expect(screen.getByRole('tab', { name: 'Three' })).toHaveAttribute('aria-selected', 'true')
			expect(screen.getByRole('tab', { name: 'One' })).toHaveAttribute('aria-selected', 'false')
			expect(screen.getByRole('tabpanel')).toHaveTextContent('Panel three')
		})

		it('selects a tab and swaps the visible panel when it is clicked', async () => {
			const user = userEvent.setup()
			renderTabs()

			await user.click(screen.getByRole('tab', { name: 'Two' }))

			expect(screen.getByRole('tab', { name: 'Two' })).toHaveAttribute('aria-selected', 'true')
			expect(screen.getByRole('tab', { name: 'One' })).toHaveAttribute('aria-selected', 'false')
			expect(screen.getByRole('tabpanel')).toHaveTextContent('Panel two')
		})

		it('selects a tab with the keyboard (Enter and Space activate the focused button)', async () => {
			const user = userEvent.setup()
			renderTabs()

			screen.getByRole('tab', { name: 'Three' }).focus()
			await user.keyboard('{Enter}')
			expect(screen.getByRole('tab', { name: 'Three' })).toHaveAttribute('aria-selected', 'true')

			screen.getByRole('tab', { name: 'Two' }).focus()
			await user.keyboard(' ')
			expect(screen.getByRole('tab', { name: 'Two' })).toHaveAttribute('aria-selected', 'true')
			expect(screen.getByRole('tabpanel')).toHaveTextContent('Panel two')
		})

		it('keeps the selection when the active tab is clicked again', async () => {
			const user = userEvent.setup()
			renderTabs()

			await user.click(screen.getByRole('tab', { name: 'One' }))

			expect(screen.getByRole('tab', { name: 'One' })).toHaveAttribute('aria-selected', 'true')
			expect(screen.getByRole('tabpanel')).toHaveTextContent('Panel one')
		})
	})

	describe('disabled', () => {
		it('does not select a tab inside a disabled Tab.List when it is clicked', async () => {
			const user = userEvent.setup()
			render(
				<Tab.Group>
					<Tab.List disabled>
						<Tab>One</Tab>
						<Tab>Two</Tab>
					</Tab.List>
					<Tab.Panel>Panel one</Tab.Panel>
					<Tab.Panel>Panel two</Tab.Panel>
				</Tab.Group>
			)

			await user.click(screen.getByRole('tab', { name: 'Two' }))

			expect(screen.getByRole('tab', { name: 'One' })).toHaveAttribute('aria-selected', 'true')
			expect(screen.getByRole('tabpanel')).toHaveTextContent('Panel one')
		})

		it('does not select a tab given its own `disabled` prop, but still selects its siblings', async () => {
			const user = userEvent.setup()
			render(
				<Tab.Group>
					<Tab.List>
						<Tab>One</Tab>
						<Tab disabled>Two</Tab>
						<Tab>Three</Tab>
					</Tab.List>
					<Tab.Panel>Panel one</Tab.Panel>
					<Tab.Panel>Panel two</Tab.Panel>
					<Tab.Panel>Panel three</Tab.Panel>
				</Tab.Group>
			)

			await user.click(screen.getByRole('tab', { name: 'Two' }))
			expect(screen.getByRole('tab', { name: 'One' })).toHaveAttribute('aria-selected', 'true')

			await user.click(screen.getByRole('tab', { name: 'Three' }))
			expect(screen.getByRole('tab', { name: 'Three' })).toHaveAttribute('aria-selected', 'true')
		})
	})

	describe('ARIA wiring', () => {
		it('points each tab at its panel with aria-controls, and the panel back with aria-labelledby', () => {
			renderTabs()

			const tabs = screen.getAllByRole('tab'),
				panels = screen.getAllByRole('tabpanel', { hidden: true })

			tabs.forEach((tab, i) => {
				expect(tab).toHaveAttribute('aria-controls', panels[i].id)
				expect(panels[i].id).toBeTruthy()
			})

			const ids = panels.map(panel => panel.id)
			expect(new Set(ids).size).toBe(3)
			panels.forEach((panel, i) => {
				expect(panel.id).toBe(`${panel.getAttribute('aria-labelledby')}-panel`)
				expect(panel.getAttribute('aria-labelledby')).toMatch(new RegExp(`-${i}$`))
			})
		})

		it('makes each panel reachable by its tab\'s accessible name and ties ids to the group root', async () => {
			const user = userEvent.setup()
			const { container } = renderTabs({ id: 'faq' })

			expect(container.querySelector('#tab-faq')).toBeInTheDocument()

			const tabs = screen.getAllByRole('tab')
			for (const [i, name] of ['One', 'Two', 'Three'].entries()) {
				//	hidden panels have no accessible name, so select each tab first
				await user.click(tabs[i])
				const panel = screen.getByRole('tabpanel', { name })
				expect(tabs[i]).toHaveAttribute('id', `tab-faq-${i}`)
				expect(tabs[i]).toHaveAttribute('aria-controls', panel.id)
				expect(panel).toHaveAttribute('aria-labelledby', tabs[i].id)
			}
		})

		it('derives the ids from a consumer-supplied Tab.Group id', () => {
			renderTabs({ id: 'faq' })

			const panels = screen.getAllByRole('tabpanel', { hidden: true })
			expect(panels.map(panel => panel.id)).toEqual([
				'tab-faq-0-panel', 'tab-faq-1-panel', 'tab-faq-2-panel',
			])
			expect(screen.getAllByRole('tab').map(tab => tab.getAttribute('aria-controls'))).toEqual(
				panels.map(panel => panel.id)
			)
			expect(panels.map(panel => panel.getAttribute('aria-labelledby'))).toEqual([
				'tab-faq-0', 'tab-faq-1', 'tab-faq-2',
			])
		})

		it('gives two groups on the same page distinct ids', () => {
			render(
				<>
					<Tab.Group>
						<Tab.List><Tab>A</Tab></Tab.List>
						<Tab.Panel>Panel A</Tab.Panel>
					</Tab.Group>
					<Tab.Group>
						<Tab.List><Tab>B</Tab></Tab.List>
						<Tab.Panel>Panel B</Tab.Panel>
					</Tab.Group>
				</>
			)

			const [first, second] = screen.getAllByRole('tab').map(tab => tab.getAttribute('aria-controls'))
			expect(first).not.toBe(second)
		})
	})

	describe('disabled attributes', () => {
		it('marks a disabled tab with aria-disabled and data-disabled', () => {
			render(
				<Tab.Group>
					<Tab.List><Tab>One</Tab><Tab disabled>Two</Tab></Tab.List>
					<Tab.Panel>Panel one</Tab.Panel>
					<Tab.Panel>Panel two</Tab.Panel>
				</Tab.Group>
			)

			const two = screen.getByRole('tab', { name: 'Two' })
			expect(two).toHaveAttribute('aria-disabled', 'true')
			expect(two).toHaveAttribute('data-disabled')
			expect(screen.getByRole('tab', { name: 'One' })).not.toHaveAttribute('aria-disabled')
			expect(screen.getByRole('tab', { name: 'One' })).not.toHaveAttribute('data-disabled')
		})

		it('leaves aria-disabled and data-disabled off a tab with an explicit disabled={ false }', () => {
			render(
				<Tab.Group>
					<Tab.List><Tab disabled={ false }>One</Tab><Tab disabled>Two</Tab></Tab.List>
					<Tab.Panel>Panel one</Tab.Panel>
					<Tab.Panel>Panel two</Tab.Panel>
				</Tab.Group>
			)

			const one = screen.getByRole('tab', { name: 'One' })
			expect(one).not.toHaveAttribute('aria-disabled')
			expect(one).not.toHaveAttribute('data-disabled')
			expect(screen.getByRole('tab', { name: 'Two' })).toHaveAttribute('data-disabled')
		})
	})

	describe('roving tabIndex', () => {
		it('gives the active tab tabIndex 0 and the others -1, moving with the selection', async () => {
			const user = userEvent.setup()
			renderTabs()

			const tabIndexes = () => screen.getAllByRole('tab').map(tab => tab.getAttribute('tabindex'))
			expect(tabIndexes()).toEqual(['0', '-1', '-1'])

			await user.click(screen.getByRole('tab', { name: 'Two' }))
			expect(tabIndexes()).toEqual(['-1', '0', '-1'])
		})
	})

	describe('outside its parents', () => {
		let error: jest.SpyInstance

		beforeEach(() => {
			//	React logs the thrown render error; the assertion below is the real check
			error = jest.spyOn(console, 'error').mockImplementation(() => {})
		})

		afterEach(() => error.mockRestore())

		it('throws a required-context error when rendered outside Tab.Group', () => {
			expect(() => render(<Tab>One</Tab>)).toThrow(
				'Tab.Group: <Tab /> must be a direct child of <Tab.Group>; it can\'t be returned from another component'
			)
		})
	})
})
