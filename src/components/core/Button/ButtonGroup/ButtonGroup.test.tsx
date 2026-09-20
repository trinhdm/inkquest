import { getDefaultProps } from '@/hooks/useProps'
import { render, reset, screen } from '@/tests/test-utils'
import { Button } from '../Button'

describe('Button.Group', () => {
	reset('Button', 'Button.Group')

	it('registers hasPriority and orientation as its own defaults', () => {
		const defaults = getDefaultProps<Button.Group.Props>('Button.Group')
		expect(defaults).toEqual({ hasPriority: true, orientation: 'horizontal' })
	})

	it('renders a group role for assistive tech', () => {
		render(
			<Button.Group>
				<Button>Only</Button>
			</Button.Group>
		)
		expect(screen.getByRole('group')).toBeInTheDocument()
	})

	it('reflects orientation as aria-orientation', () => {
		render(
			<Button.Group orientation="vertical">
				<Button>Only</Button>
			</Button.Group>
		)
		expect(screen.getByRole('group')).toHaveAttribute('aria-orientation', 'vertical')
	})

	it('derives sequential priority (primary/secondary/tertiary) for each child by position when hasPriority defaults to true', () => {
		render(
			<Button.Group>
				<Button>First</Button>
				<Button>Second</Button>
				<Button>Third</Button>
				<Button>Fourth</Button>
			</Button.Group>
		)

		expect(screen.getByRole('button', { name: 'First' })).toHaveAttribute('data-priority', 'primary')
		expect(screen.getByRole('button', { name: 'Second' })).toHaveAttribute('data-priority', 'secondary')
		expect(screen.getByRole('button', { name: 'Third' })).toHaveAttribute('data-priority', 'tertiary')
		// clamps at the last role rather than indexing out of PRIORITY_ROLES
		expect(screen.getByRole('button', { name: 'Fourth' })).toHaveAttribute('data-priority', 'tertiary')
	})

	it('does not derive a priority for any child when hasPriority is false', () => {
		render(
			<Button.Group hasPriority={ false }>
				<Button>First</Button>
			</Button.Group>
		)
		expect(screen.getByRole('button', { name: 'First' })).not.toHaveAttribute('data-priority')
	})

	it('marks full width via data-block, and omits it when fullWidth is falsy', () => {
		const { rerender } = render(
			<Button.Group fullWidth>
				<Button>Only</Button>
			</Button.Group>
		)
		expect(screen.getByRole('group')).toHaveAttribute('data-block')

		rerender(
			<Button.Group>
				<Button>Only</Button>
			</Button.Group>
		)
		expect(screen.getByRole('group')).not.toHaveAttribute('data-block')
	})

	it('drops non-Button children, keeping only Button instances in the group', () => {
		render(
			<Button.Group>
				<Button>Kept</Button>
				<div>Dropped</div>
			</Button.Group>
		)
		expect(screen.getByText('Kept')).toBeInTheDocument()
		expect(screen.queryByText('Dropped')).not.toBeInTheDocument()
	})
})
