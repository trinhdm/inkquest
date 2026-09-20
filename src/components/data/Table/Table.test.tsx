import { getDefaultProps } from '@/hooks/useProps'
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

	it('renders as a table by default per its registered defaults', () => {
		const { container } = render(
			<Table>
				<Table.Row><Table.Cell>Cell</Table.Cell></Table.Row>
			</Table>
		)
		expect(getDefaultProps<Table.Props & { as: string }>('Table').as).toBe('table')
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

	it('renders as a custom element when `as` is overridden, even though the hardcoded <tbody> then nests invalidly', () => {
		// `Table.tsx` always wraps `children` in a literal `<tbody>`, regardless
		// of `as` — overriding away from `table` produces an invalid-nesting
		// dev warning (`<tbody>` outside a `<table>`), which is suppressed here
		// since it's expected noise, not a failure signal for this assertion.
		const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {})

		const { container } = render(<Table as="section">Content</Table>)
		expect(container.querySelector('section')).toBeInTheDocument()

		consoleError.mockRestore()
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
