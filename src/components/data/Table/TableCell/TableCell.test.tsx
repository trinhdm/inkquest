import { getDefaultProps } from '@/hooks/useProps'
import { render, reset, screen } from '@/tests/test-utils'
import { Table } from '../Table'

describe('Table.Cell', () => {
	reset('Table', 'Table.Cell', 'Table.Row')

	it('renders as a <td>', () => {
		render(
			<Table>
				<Table.Row>
					<Table.Cell>Ink</Table.Cell>
				</Table.Row>
			</Table>
		)
		expect(screen.getByRole('cell', { name: 'Ink' }).tagName).toBe('TD')
	})

	it('renders its children', () => {
		render(
			<Table>
				<Table.Row>
					<Table.Cell><span>Inner content</span></Table.Cell>
				</Table.Row>
			</Table>
		)
		expect(screen.getByText('Inner content')).toBeInTheDocument()
	})

	it('registers no default props', () => {
		expect(getDefaultProps('Table.Cell')).toEqual({})
	})
})
