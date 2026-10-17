import { render, reset, screen } from '@/tests/test-utils'
import { Tab } from '../Tab'

describe('Tab.Panel', () => {
	reset('Tab', 'Tab.Group', 'Tab.List', 'Tab.Panel')

	it('renders a tabpanel div carrying the id its tab points at', () => {
		render(
			<Tab.Group id="g">
				<Tab.List><Tab>One</Tab></Tab.List>
				<Tab.Panel>Body</Tab.Panel>
			</Tab.Group>
		)

		const panel = screen.getByRole('tabpanel')
		expect(panel.tagName).toBe('DIV')
		expect(panel).toHaveAttribute('id', 'tab-g-0-panel')
		expect(panel).toHaveAttribute('aria-labelledby', 'tab-g-0')
	})

	it('wraps text-only content in a paragraph', () => {
		render(
			<Tab.Group>
				<Tab.Panel>Just words</Tab.Panel>
			</Tab.Group>
		)

		expect(screen.getByText('Just words').tagName).toBe('P')
	})

	it('leaves block content unwrapped', () => {
		render(
			<Tab.Group>
				<Tab.Panel><section>Block</section></Tab.Panel>
			</Tab.Group>
		)

		expect(screen.getByText('Block').tagName).toBe('SECTION')
		expect(screen.getByText('Block').closest('p')).toBeNull()
	})

	it('keeps inactive content mounted but hidden', () => {
		render(
			<Tab.Group defaultActive={ 1 }>
				<Tab.Panel>First body</Tab.Panel>
				<Tab.Panel>Second body</Tab.Panel>
			</Tab.Group>
		)

		expect(screen.getByText('First body')).toBeInTheDocument()
		expect(screen.getByText('First body')).not.toBeVisible()
		expect(screen.getByText('Second body')).toBeVisible()
	})

	describe('outside Tab.Group', () => {
		let error: jest.SpyInstance

		beforeEach(() => {
			error = jest.spyOn(console, 'error').mockImplementation(() => {})
		})

		afterEach(() => error.mockRestore())

		it('throws a required-context error', () => {
			expect(() => render(<Tab.Panel>Body</Tab.Panel>)).toThrow(
				'Tab.Group: <Tab.Panel /> must be a direct child of <Tab.Group>; it can\'t be returned from another component'
			)
		})
	})
})
