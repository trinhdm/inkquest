import { getDefaultProps } from '@/hooks/useProps'
import { render, reset, screen } from '@/tests/test-utils'
import { Button } from '../Button'

describe('Button.Section', () => {
	reset('Button', 'Button.Section')

	it('renders its children', () => {
		render(
			<Button>
				<Button.Section left>Icon</Button.Section>
			</Button>
		)
		expect(screen.getByText('Icon')).toBeInTheDocument()
	})

	it('marks a left section with data-side="left"', () => {
		render(
			<Button>
				<Button.Section left>L</Button.Section>
			</Button>
		)
		expect(screen.getByText('L')).toHaveAttribute('data-side', 'left')
	})

	it('marks a right section with data-side="right"', () => {
		render(
			<Button>
				<Button.Section right>R</Button.Section>
			</Button>
		)
		expect(screen.getByText('R')).toHaveAttribute('data-side', 'right')
	})

	it('registers no default props, since a pre-filled `left` default would always win over an explicit `right`', () => {
		expect(getDefaultProps('Button.Section')).toEqual({})
	})

	it('throws when rendered outside of a Button, per the REQUIRED useButtonCtx reader', () => {
		const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {})

		expect(() => render(<Button.Section left>Icon</Button.Section>))
			.toThrow(/must be rendered inside <Button>/)

		consoleError.mockRestore()
	})
})
