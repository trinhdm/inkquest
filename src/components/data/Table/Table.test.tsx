import { render, reset, screen } from '@/tests/test-utils'
import { Table } from './Table'

describe('Table', () => {
	reset('Table', 'Table.Row', 'Table.Cell')

	it('renders its children', () => {
		render(
			<Table>
				<Table.Row>
					<Table.Cell>Cell A</Table.Cell>
					<Table.Cell>Cell B</Table.Cell>
				</Table.Row>
			</Table>
		)

		expect(screen.getByText('Cell A')).toBeInTheDocument()
		expect(screen.getByText('Cell B')).toBeInTheDocument()
	})

	// Table registers no default props: it hardcodes `as={ TAG }` on its Box
	it('always renders a <table> element, since the tag is hardcoded rather than a default prop', () => {
		const { container } = render(
			<Table>
				<Table.Row><Table.Cell>Cell</Table.Cell></Table.Row>
			</Table>
		)
		expect(container.firstChild?.nodeName).toBe('TABLE')
	})

	it('always wraps its children in a hardcoded <tbody>', () => {
		const { container } = render(
			<Table>
				<Table.Row><Table.Cell>Cell</Table.Cell></Table.Row>
			</Table>
		)
		expect(container.querySelector('table > tbody')).toBeInTheDocument()
	})

	describe('Table.Row', () => {
		it('renders its children', () => {
			render(
				<Table>
					<Table.Row><Table.Cell>Row content</Table.Cell></Table.Row>
				</Table>
			)
			expect(screen.getByText('Row content')).toBeInTheDocument()
		})

		it('always renders as a native <tr>, since `as` is hardcoded and not part of its accepted props (isCompound with no defaults.as)', () => {
			render(
				<Table>
					<Table.Row data-testid="row"><Table.Cell>Row content</Table.Cell></Table.Row>
				</Table>
			)
			expect(screen.getByTestId('row').tagName).toBe('TR')
		})
	})

	describe('Table.Cell', () => {
		it('renders its children', () => {
			render(
				<Table>
					<Table.Row>
						<Table.Cell>Cell content</Table.Cell>
					</Table.Row>
				</Table>
			)
			expect(screen.getByText('Cell content')).toBeInTheDocument()
		})

		it('always renders as a native <td>, since `as` is hardcoded and not part of its accepted props (isCompound with no defaults.as)', () => {
			render(
				<Table>
					<Table.Row>
						<Table.Cell data-testid="cell">Cell content</Table.Cell>
					</Table.Row>
				</Table>
			)
			expect(screen.getByTestId('cell').tagName).toBe('TD')
		})
	})
})
