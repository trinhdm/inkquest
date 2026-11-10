import { getDefaultProps } from '@/hooks/useProps'
import { render, reset, screen } from '@/tests/test-utils'
import { Table } from '../Table'

describe('Table.Row', () => {
	reset('Table', 'Table.Cell', 'Table.Row')

	it('renders as a <tr>', () => {
		render(
			<Table>
				<Table.Row>
					<Table.Cell>Ink</Table.Cell>
				</Table.Row>
			</Table>
		)
		expect(screen.getByRole('row').tagName).toBe('TR')
	})

	it('renders its children cells', () => {
		render(
			<Table>
				<Table.Row>
					<Table.Cell>First</Table.Cell>
					<Table.Cell>Second</Table.Cell>
				</Table.Row>
			</Table>
		)
		expect(screen.getByRole('cell', { name: 'First' })).toBeInTheDocument()
		expect(screen.getByRole('cell', { name: 'Second' })).toBeInTheDocument()
	})

	it('registers no default props', () => {
		expect(getDefaultProps('Table.Row')).toEqual({})
	})
})
