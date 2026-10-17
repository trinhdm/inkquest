import { render, reset, screen } from '@/tests/test-utils'
import { getDefaultProps } from '@/hooks/useProps'
import { Tab } from '../Tab'

describe('Tab.Group', () => {
	reset('Tab', 'Tab.Group', 'Tab.List', 'Tab.Panel')

	it('renders a div wrapper around its tablist and panels', () => {
		render(
			<Tab.Group data-testid="group">
				<Tab.List><Tab>One</Tab></Tab.List>
				<Tab.Panel>Panel one</Tab.Panel>
			</Tab.Group>
		)

		const group = screen.getByTestId('group')
		expect(group.tagName).toBe('DIV')
		expect(group).toContainElement(screen.getByRole('tablist'))
		expect(group).toContainElement(screen.getByRole('tabpanel'))
	})

	it('registers defaultActive: 0 under the Tab.Group key', () => {
		expect(getDefaultProps('Tab.Group')).toEqual(expect.objectContaining({ defaultActive: 0 }))
	})

	it('gives the root the tab-group class and leaks no defaultActive attribute onto the DOM', () => {
		const { container } = render(
			<Tab.Group id="g" data-testid="group">
				<Tab.List><Tab>One</Tab></Tab.List>
				<Tab.Panel>Panel one</Tab.Panel>
			</Tab.Group>
		)

		const group = screen.getByTestId('group')
		expect(group).toHaveClass('tab-group')
		expect(group).not.toHaveClass('tab-panel')
		expect(group).toHaveAttribute('id', 'tab-g')
		expect(container.querySelectorAll('[defaultactive], [default-active], [defaultActive]')).toHaveLength(0)
	})

	it('makes every panel focusable with tabIndex 0', () => {
		render(
			<Tab.Group>
				<Tab.List><Tab>One</Tab><Tab>Two</Tab></Tab.List>
				<Tab.Panel>Panel one</Tab.Panel>
				<Tab.Panel>Panel two</Tab.Panel>
			</Tab.Group>
		)

		screen.getAllByRole('tabpanel', { hidden: true }).forEach(panel =>
			expect(panel).toHaveAttribute('tabindex', '0')
		)
	})

	it('only the first Tab.Panel is visible until another tab is chosen', () => {
		render(
			<Tab.Group>
				<Tab.List><Tab>One</Tab><Tab>Two</Tab></Tab.List>
				<Tab.Panel>Panel one</Tab.Panel>
				<Tab.Panel>Panel two</Tab.Panel>
			</Tab.Group>
		)

		const [one, two] = screen.getAllByRole('tabpanel', { hidden: true })
		expect(one).not.toHaveAttribute('hidden')
		expect(two).toHaveAttribute('hidden')
	})

	it('indexes panels by their order among the group\'s direct panel children, skipping other children', () => {
		render(
			<Tab.Group id="x">
				<Tab.List><Tab>One</Tab><Tab>Two</Tab></Tab.List>
				<p>Between panels</p>
				<Tab.Panel>Panel one</Tab.Panel>
				<Tab.Panel>Panel two</Tab.Panel>
			</Tab.Group>
		)

		expect(screen.getByText('Between panels')).toBeInTheDocument()
		expect(screen.getAllByRole('tabpanel', { hidden: true }).map(p => p.id)).toEqual([
			'tab-x-0-panel', 'tab-x-1-panel',
		])
	})

	it('renders an out-of-range defaultActive with every panel hidden', () => {
		render(
			<Tab.Group defaultActive={ 5 }>
				<Tab.List><Tab>One</Tab></Tab.List>
				<Tab.Panel>Panel one</Tab.Panel>
			</Tab.Group>
		)

		expect(screen.queryByRole('tabpanel')).not.toBeInTheDocument()
		expect(screen.getByRole('tab', { name: 'One' })).toHaveAttribute('aria-selected', 'false')
	})
})
