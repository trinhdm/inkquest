import userEvent from '@testing-library/user-event'
import { render, reset, screen } from '@/tests/test-utils'
import { getDefaultProps } from '@/hooks/useProps'
import { Accordion } from '@/components/data/Accordion'

const item = (title: string, content: string) => (
	<Accordion key={ title }>
		<Accordion.Title>{ title }</Accordion.Title>
		<Accordion.Content>{ content }</Accordion.Content>
	</Accordion>
)

describe('Accordion.Group', () => {
	// `Accordion.Title` renders a real `Icon` for its default "plus" indicator.
	reset('Accordion.Group', 'Accordion', 'Accordion.Title', 'Accordion.Content', 'Icon')

	it('registers defaults of collapsible="single", defaultOpen=0, order=3, size="md"', () => {
		expect(getDefaultProps<Accordion.Group.Props>('Accordion.Group')).toEqual({
			collapsible: 'single',
			defaultOpen: 0,
			order: 3,
			size: 'md',
		})
	})

	it('defaults defaultOpen to 0, so the first item starts open with no defaultOpen given', () => {
		render(
			<Accordion.Group>
				{ item('One', 'First body') }
				{ item('Two', 'Second body') }
			</Accordion.Group>
		)

		const [first, second] = screen.getAllByRole('button')
		expect(first).toHaveAttribute('aria-expanded', 'true')
		expect(second).toHaveAttribute('aria-expanded', 'false')
	})

	it('renders as a group container with a data-group marker', () => {
		const { container } = render(
			<Accordion.Group>
				{ item('One', 'First body') }
				{ item('Two', 'Second body') }
			</Accordion.Group>
		)
		expect(container.querySelector('[data-group]')).toBeInTheDocument()
	})

	it('assigns each child Accordion its position via context (steps layout numbering)', () => {
		render(
			<Accordion.Group layout="steps">
				{ item('One', 'First body') }
				{ item('Two', 'Second body') }
				{ item('Three', 'Third body') }
			</Accordion.Group>
		)

		expect(screen.getByText('01')).toBeInTheDocument()
		expect(screen.getByText('02')).toBeInTheDocument()
		expect(screen.getByText('03')).toBeInTheDocument()
	})

	it('defaults to collapsible="single": opening one item closes any other that was open', async () => {
		const user = userEvent.setup()
		render(
			<Accordion.Group defaultOpen={ 0 }>
				{ item('One', 'First body') }
				{ item('Two', 'Second body') }
			</Accordion.Group>
		)

		const [first, second] = screen.getAllByRole('button')
		expect(first).toHaveAttribute('aria-expanded', 'true')
		expect(second).toHaveAttribute('aria-expanded', 'false')

		await user.click(second)

		expect(first).toHaveAttribute('aria-expanded', 'false')
		expect(second).toHaveAttribute('aria-expanded', 'true')
	})

	it('allows several open at once when collapsible="multiple"', async () => {
		const user = userEvent.setup()
		render(
			<Accordion.Group defaultOpen={ [] } collapsible="multiple">
				{ item('One', 'First body') }
				{ item('Two', 'Second body') }
			</Accordion.Group>
		)

		const [first, second] = screen.getAllByRole('button')
		await user.click(first)
		await user.click(second)

		expect(first).toHaveAttribute('aria-expanded', 'true')
		expect(second).toHaveAttribute('aria-expanded', 'true')
	})

	it('defaults collapsible=true: clicking the only open item in "single" mode closes it', async () => {
		const user = userEvent.setup()
		render(
			<Accordion.Group defaultOpen={ 0 }>
				{ item('One', 'First body') }
				{ item('Two', 'Second body') }
			</Accordion.Group>
		)

		const [first] = screen.getAllByRole('button')
		expect(first).toHaveAttribute('aria-expanded', 'true')

		await user.click(first)
		expect(first).toHaveAttribute('aria-expanded', 'false')
	})

	it('when collapsible=false, the only open item in "single" mode stays open and is non-interactive', async () => {
		const user = userEvent.setup()
		render(
			<Accordion.Group collapsible={ false } defaultOpen={ 0 }>
				{ item('One', 'First body') }
				{ item('Two', 'Second body') }
			</Accordion.Group>
		)

		expect(screen.queryAllByRole('button')).toHaveLength(0)

		const [first] = screen.getAllByRole('region')
		expect(first).toBeVisible()

		const title = document.querySelector('[data-title]') as HTMLElement
		expect(title.tagName).toBe('DIV')
		expect(title).not.toHaveAttribute('aria-expanded')

		await user.click(title)
		expect(first).toBeVisible()
		expect(title).not.toHaveAttribute('aria-expanded')
	})

	it('honours defaultOpen as an array of indices when collapsible="multiple"', () => {
		render(
			<Accordion.Group defaultOpen={ [0, 2] } collapsible="multiple">
				{ item('One', 'First body') }
				{ item('Two', 'Second body') }
				{ item('Three', 'Third body') }
			</Accordion.Group>
		)

		const [first, second, third] = screen.getAllByRole('button')
		expect(first).toHaveAttribute('aria-expanded', 'true')
		expect(second).toHaveAttribute('aria-expanded', 'false')
		expect(third).toHaveAttribute('aria-expanded', 'true')
	})

	it('supports ArrowDown/ArrowUp keyboard navigation between titles in the group', async () => {
		const user = userEvent.setup()
		render(
			<Accordion.Group>
				{ item('One', 'First body') }
				{ item('Two', 'Second body') }
			</Accordion.Group>
		)

		const [first, second] = screen.getAllByRole('button')
		first.focus()
		await user.keyboard('{ArrowDown}')
		expect(second).toHaveFocus()

		await user.keyboard('{ArrowUp}')
		expect(first).toHaveFocus()
	})

	it('closes an item in collapsible="multiple" mode when it is clicked again (removes it from openItems)', async () => {
		const user = userEvent.setup()
		render(
			<Accordion.Group defaultOpen={ [] } collapsible="multiple">
				{ item('One', 'First body') }
				{ item('Two', 'Second body') }
			</Accordion.Group>
		)

		const [first, second] = screen.getAllByRole('button')
		await user.click(first)
		await user.click(second)
		expect(first).toHaveAttribute('aria-expanded', 'true')
		expect(second).toHaveAttribute('aria-expanded', 'true')

		await user.click(first)
		expect(first).toHaveAttribute('aria-expanded', 'false')
		expect(second).toHaveAttribute('aria-expanded', 'true')
	})

	it('drops children that are not Accordion instances, and warns about them', () => {
		const warn = jest.spyOn(console, 'warn').mockImplementation(() => {})

		try {
			render(
				<Accordion.Group>
					{ item('One', 'First body') }
					<div>not an accordion</div>
				</Accordion.Group>
			)

			expect(screen.queryByText('not an accordion')).not.toBeInTheDocument()
			expect(screen.getAllByRole('button')).toHaveLength(1)
			expect(warn).toHaveBeenCalledWith('Accordion.Group: ignoring unrelated <div>.')
		} finally {
			warn.mockRestore()
		}
	})

	// `getSharedTokens('root')` returns {} whenever an Accordion has a group context, so the
	// GROUP root alone carries the tokens (from the group's props) and items inherit them via
	// CSS. The group's values always win, even over an item's own size/order (confirmed design).
	describe('shared inline tokens', () => {
		const TOKENS = [
			'--accordion-column-width',
			'--accordion-gap',
			'--accordion-indicator-size',
			'--accordion-padding',
			'--accordion-title-size',
		] as const

		// An Accordion root has no role or label, so find it by the id it builds
		// from the `id` prop (`acc-<id>`). A missing root fails here, not as a null deref.
		const getRoot = (id: string) => {
			const root = document.getElementById(`acc-${ id }`)
			expect(root).toBeInTheDocument()
			return root as HTMLElement
		}

		it('puts the tokens inline on the group root, computed from the group props', () => {
			const { container } = render(
				<Accordion.Group size="sm" order={ 1 }>
					{ item('One', 'First body') }
				</Accordion.Group>
			)
			const group = container.querySelector('[data-group]') as HTMLElement

			expect(group.style.getPropertyValue('--accordion-column-width')).toBe('var(--space-5)')
			expect(group.style.getPropertyValue('--accordion-gap')).toBe('var(--space-3)')
			expect(group.style.getPropertyValue('--accordion-indicator-size')).toBe('var(--font-size-16)')
			expect(group.style.getPropertyValue('--accordion-padding')).toBe('var(--space-4)')
			expect(group.style.getPropertyValue('--accordion-title-size')).toBe('var(--inkq-font-size-h3)')
		})

		it('uses the registered defaults (md, order 3) when the group passes neither', () => {
			const { container } = render(
				<Accordion.Group>
					{ item('One', 'First body') }
				</Accordion.Group>
			)
			const group = container.querySelector('[data-group]') as HTMLElement

			expect(group.style.getPropertyValue('--accordion-gap')).toBe('var(--space-6)')
			expect(group.style.getPropertyValue('--accordion-title-size')).toBe('var(--inkq-font-size-h4)')
		})

		it('leaves every grouped Accordion root without tokens, even with its own size/order', () => {
			const { container } = render(
				<Accordion.Group size="md" order={ 3 }>
					<Accordion id="one" size="sm" order={ 1 }>
						<Accordion.Title>One</Accordion.Title>
						<Accordion.Content>First body</Accordion.Content>
					</Accordion>
					<Accordion id="two">
						<Accordion.Title>Two</Accordion.Title>
						<Accordion.Content>Second body</Accordion.Content>
					</Accordion>
				</Accordion.Group>
			)
			const group = container.querySelector('[data-group]') as HTMLElement
			const roots = [getRoot('one'), getRoot('two')]

			// positive control: the group root has the group's (not the item's) values
			expect(group.style.getPropertyValue('--accordion-gap')).toBe('var(--space-6)')
			expect(group.style.getPropertyValue('--accordion-title-size')).toBe('var(--inkq-font-size-h4)')

			roots.forEach(root => {
				TOKENS.forEach(token => {
					expect(root.style.getPropertyValue(token)).toBe('')
				})
				expect(root.style.getPropertyValue('--accordion-step-size')).toBe('')
			})
		})

		it('drops the group tokens when the group is unstyled, with a styled group as control', () => {
			const { container } = render(
				<>
					<Accordion.Group>{ item('One', 'First body') }</Accordion.Group>
					<Accordion.Group unstyled>{ item('Two', 'Second body') }</Accordion.Group>
				</>
			)
			const [styled, bare] = Array.from(container.querySelectorAll<HTMLElement>('[data-group]'))

			expect(styled.style.getPropertyValue('--accordion-gap')).not.toBe('')
			TOKENS.forEach(token => {
				expect(bare.style.getPropertyValue(token)).toBe('')
			})
		})
	})
})
