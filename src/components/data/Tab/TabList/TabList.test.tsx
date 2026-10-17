import { render, reset, screen } from '@/tests/test-utils'
import { Tab } from '../Tab'

describe('Tab.List', () => {
	reset('Tab', 'Tab.Group', 'Tab.List', 'Tab.Panel')

	let warn: jest.SpyInstance

	beforeEach(() => {
		warn = jest.spyOn(console, 'warn').mockImplementation(() => {})
	})

	afterEach(() => warn.mockRestore())

	it('renders a tablist containing each Tab', () => {
		render(
			<Tab.Group>
				<Tab.List>
					<Tab>One</Tab>
					<Tab>Two</Tab>
				</Tab.List>
			</Tab.Group>
		)

		const list = screen.getByRole('tablist')
		expect(list).toHaveAttribute('data-group')
		expect(screen.getAllByRole('tab')).toHaveLength(2)
		screen.getAllByRole('tab').forEach(tab => expect(list).toContainElement(tab))
		expect(warn).not.toHaveBeenCalled()
	})

	it('hands each Tab its own position, so aria-controls follows the order written', () => {
		render(
			<Tab.Group id="g">
				<Tab.List>
					<Tab>One</Tab>
					<Tab>Two</Tab>
				</Tab.List>
			</Tab.Group>
		)

		expect(screen.getAllByRole('tab').map(tab => tab.getAttribute('aria-controls'))).toEqual([
			'tab-g-0-panel', 'tab-g-1-panel',
		])
	})

	it('lets a Tab\'s own index override the position it is given', () => {
		render(
			<Tab.Group id="g">
				<Tab.List>
					<Tab index={ 4 }>One</Tab>
				</Tab.List>
			</Tab.Group>
		)

		expect(screen.getByRole('tab', { name: 'One' })).toHaveAttribute('aria-controls', 'tab-g-4-panel')
	})

	it('ignores Tabs wrapped in a Fragment no differently from direct ones', () => {
		render(
			<Tab.Group>
				<Tab.List>
					<>
						<Tab>One</Tab>
						<Tab>Two</Tab>
					</>
				</Tab.List>
			</Tab.Group>
		)

		expect(screen.getAllByRole('tab')).toHaveLength(2)
		expect(warn).not.toHaveBeenCalled()
	})

	it('drops a stray element child and warns about it', () => {
		render(
			<Tab.Group>
				<Tab.List>
					<Tab>One</Tab>
					<div>Stray</div>
				</Tab.List>
			</Tab.Group>
		)

		expect(screen.queryByText('Stray')).not.toBeInTheDocument()
		expect(screen.getAllByRole('tab')).toHaveLength(1)
		expect(warn).toHaveBeenCalledTimes(1)
		expect(warn).toHaveBeenCalledWith('Tab.List: ignoring unrelated <div>.')
	})

	it('drops bare text and warns with the text itself', () => {
		render(
			<Tab.Group>
				<Tab.List>
					<Tab>One</Tab>
					loose text
				</Tab.List>
			</Tab.Group>
		)

		expect(screen.queryByText('loose text')).not.toBeInTheDocument()
		expect(warn).toHaveBeenCalledWith('Tab.List: ignoring unrelated loose text.')
	})

	it('does not warn for whitespace-only text or a false conditional', () => {
		render(
			<Tab.Group>
				<Tab.List>
					<Tab>One</Tab>
					{ ' ' }
					{ false && <Tab>Hidden</Tab> }
				</Tab.List>
			</Tab.Group>
		)

		expect(screen.getAllByRole('tab')).toHaveLength(1)
		expect(warn).not.toHaveBeenCalled()
	})

	it('renders an empty tablist with no tabs and no rail', () => {
		const { container } = render(
			<Tab.Group>
				<Tab.List />
			</Tab.Group>
		)

		expect(screen.getByRole('tablist')).toBeInTheDocument()
		expect(screen.queryByRole('tab')).not.toBeInTheDocument()
		expect(container.querySelector('[style*="--tab-rail"]')).not.toBeInTheDocument()
	})

	describe('outside Tab.Group', () => {
		let error: jest.SpyInstance

		beforeEach(() => {
			error = jest.spyOn(console, 'error').mockImplementation(() => {})
		})

		afterEach(() => error.mockRestore())

		it('throws a required-context error', () => {
			expect(() => render(<Tab.List />)).toThrow(
				'Tab.Group: <Tab.List /> must be a direct child of <Tab.Group>; it can\'t be returned from another component'
			)
		})
	})
})
