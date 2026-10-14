import userEvent from '@testing-library/user-event'
import { render, reset, screen } from '@/tests/test-utils'
import { getDefaultProps } from '@/hooks/useProps'
import { Accordion } from './Accordion'

const buildAccordion = (props: Partial<Accordion.Props> = {}) => (
	<Accordion { ...props }>
		<Accordion.Title>Section title</Accordion.Title>
		<Accordion.Content>Section body</Accordion.Content>
	</Accordion>
)

describe('Accordion', () => {
	// `Accordion.Title` renders a real `Icon` for its default "plus" indicator.
	reset('Accordion', 'Accordion.Title', 'Accordion.Content', 'Icon')

	it('renders the title as a button and the content as a labelled region', () => {
		render(buildAccordion())

		expect(screen.getByRole('button', { name: 'Section title' })).toBeInTheDocument()
		expect(screen.getByRole('region', { name: 'Section title' })).toHaveTextContent('Section body')
	})

	it('defaults to closed (no data-open, aria-expanded=false) when no open/defaultOpen is given', () => {
		render(buildAccordion())

		const title = screen.getByRole('button', { name: 'Section title' })
		expect(title).toHaveAttribute('aria-expanded', 'false')
		expect(title).not.toHaveAttribute('data-open')
	})

	it('opens uncontrolled on click and reflects it via aria-expanded/data-open', async () => {
		const user = userEvent.setup()
		render(buildAccordion())

		const title = screen.getByRole('button', { name: 'Section title' })
		await user.click(title)

		expect(title).toHaveAttribute('aria-expanded', 'true')
		expect(title).toHaveAttribute('data-open', '')
	})

	it('toggles closed again on a second click when uncontrolled', async () => {
		const user = userEvent.setup()
		render(buildAccordion())

		const title = screen.getByRole('button', { name: 'Section title' })
		await user.click(title)
		await user.click(title)

		expect(title).toHaveAttribute('aria-expanded', 'false')
	})

	it('honours defaultOpen to start expanded', () => {
		render(buildAccordion({ defaultOpen: true }))
		expect(screen.getByRole('button', { name: 'Section title' })).toHaveAttribute('aria-expanded', 'true')
	})

	it('treats `open` as controlled and ignores clicks toggling its own state', async () => {
		const user = userEvent.setup()
		render(buildAccordion({ open: true }))

		const title = screen.getByRole('button', { name: 'Section title' })
		expect(title).toHaveAttribute('aria-expanded', 'true')

		await user.click(title)
		// still true — a controlled accordion only changes via `onToggle`, not internal state
		expect(title).toHaveAttribute('aria-expanded', 'true')
	})

	it('calls onToggle and onItemToggle with the next open state and index on click', async () => {
		const user = userEvent.setup()
		const onToggle = jest.fn()
		const onItemToggle = jest.fn()
		render(buildAccordion({ index: 2, onToggle, onItemToggle }))

		await user.click(screen.getByRole('button', { name: 'Section title' }))

		expect(onToggle).toHaveBeenCalledWith(true)
		expect(onItemToggle).toHaveBeenCalledWith(2, true)
	})

	it('does not toggle or fire callbacks when disabled', async () => {
		const user = userEvent.setup()
		const onToggle = jest.fn()
		render(buildAccordion({ disabled: true, onToggle }))

		const title = screen.getByRole('button', { name: 'Section title' })
		await user.click(title)

		expect(title).toHaveAttribute('aria-expanded', 'false')
		expect(onToggle).not.toHaveBeenCalled()
	})

	it('wires aria-controls on the title to the content region id it renders', () => {
		render(buildAccordion({ id: 'billing' }))

		const title = screen.getByRole('button', { name: 'Section title' })
		const content = screen.getByRole('region', { name: 'Section title' })

		expect(title).toHaveAttribute('aria-controls', content.id)
		expect(content).toHaveAttribute('aria-labelledby', title.id)
	})

	it('defaults to a "plus" indicator, rendering an icon inside the title', () => {
		const { container } = render(buildAccordion())
		expect(container.querySelector('svg')).toBeInTheDocument()
	})

	it('renders no indicator icon when indicator="none"', () => {
		const { container } = render(buildAccordion({ indicator: 'none' }))
		expect(container.querySelector('svg')).not.toBeInTheDocument()
	})

	it('renders a zero-padded step number on the title when layout="steps"', () => {
		render(buildAccordion({ layout: 'steps', index: 0 }))
		expect(screen.getByText('01')).toBeInTheDocument()
	})

	it('renders no step number when layout is not "steps"', () => {
		render(buildAccordion({ index: 0 }))
		expect(screen.queryByText('01')).not.toBeInTheDocument()
	})

	it('throws when Accordion.Title is rendered outside an Accordion', () => {
		const spy = jest.spyOn(console, 'error').mockImplementation(() => {})
		expect(() => render(<Accordion.Title>Orphan</Accordion.Title>)).toThrow(
			'<Accordion.Title /> must be a direct child of <Accordion>'
		)
		spy.mockRestore()
	})

	it('throws when Accordion.Content is rendered outside an Accordion', () => {
		const spy = jest.spyOn(console, 'error').mockImplementation(() => {})
		expect(() => render(<Accordion.Content>Orphan</Accordion.Content>)).toThrow(
			'<Accordion.Content /> must be a direct child of <Accordion>'
		)
		spy.mockRestore()
	})

	// Accordion filters its children by name with `filterChildren(..., { total: 2 })`
	// and renders nothing unless it finds BOTH a Title and a Content.
	describe('child validation', () => {
		let warn: jest.SpyInstance

		beforeEach(() => { warn = jest.spyOn(console, 'warn').mockImplementation(() => {}) })
		afterEach(() => { warn.mockRestore() })

		it('renders nothing but the wrapper chrome, and warns, when given only text', () => {
			render(<Accordion>Just some text</Accordion>)

			expect(screen.queryByRole('button')).not.toBeInTheDocument()
			expect(screen.queryByText('Just some text')).not.toBeInTheDocument()
			expect(warn).toHaveBeenCalledWith('Accordion: 0 children found; a Accordion needs exactly 2 children.')
		})

		it('renders nothing and warns when there are no children at all', () => {
			render(<Accordion>{ null }</Accordion>)

			expect(screen.queryByRole('button')).not.toBeInTheDocument()
			expect(warn).toHaveBeenCalledWith('Accordion: 0 children found; a Accordion needs exactly 2 children.')
		})

		it('renders nothing, not even the title, and warns when Accordion.Content is missing', () => {
			render(<Accordion><Accordion.Title>Lonely title</Accordion.Title></Accordion>)

			expect(screen.queryByText('Lonely title')).not.toBeInTheDocument()
			expect(warn).toHaveBeenCalledWith('Accordion: 1 children found; a Accordion needs exactly 2 children.')
		})

		it('renders nothing, not even the content, and warns when Accordion.Title is missing', () => {
			render(<Accordion><Accordion.Content>Lonely body</Accordion.Content></Accordion>)

			expect(screen.queryByText('Lonely body')).not.toBeInTheDocument()
			expect(warn).toHaveBeenCalledWith('Accordion: 1 children found; a Accordion needs exactly 2 children.')
		})

		it('stays silent for a well-formed Title + Content pair', () => {
			render(buildAccordion())

			expect(screen.getByRole('button', { name: 'Section title' })).toBeInTheDocument()
			expect(warn).not.toHaveBeenCalled()
		})

		it('finds Title and Content when they are wrapped in a Fragment', () => {
			render(
				<Accordion>
					<>
						<Accordion.Title>Section title</Accordion.Title>
						<Accordion.Content>Section body</Accordion.Content>
					</>
				</Accordion>
			)

			expect(screen.getByRole('button', { name: 'Section title' })).toBeInTheDocument()
			expect(warn).not.toHaveBeenCalled()
		})

		it('always renders the Title before the Content, whatever order they were passed in', () => {
			render(
				<Accordion>
					<Accordion.Content>Section body</Accordion.Content>
					<Accordion.Title>Section title</Accordion.Title>
				</Accordion>
			)

			const title = screen.getByRole('button', { name: 'Section title' }),
				content = screen.getByRole('region', { name: 'Section title' })
			expect(title.compareDocumentPosition(content) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
		})

		it('drops an unrelated sibling element without rendering it, and warns about it', () => {
			render(
				<Accordion>
					<Accordion.Title>Section title</Accordion.Title>
					<Accordion.Content>Section body</Accordion.Content>
					<div>Extra child</div>
				</Accordion>
			)

			expect(screen.queryByText('Extra child')).not.toBeInTheDocument()
			expect(screen.getByRole('button', { name: 'Section title' })).toBeInTheDocument()
			expect(warn).toHaveBeenCalledTimes(1)
			expect(warn).toHaveBeenCalledWith('Accordion: ignoring unrelated <div>.')
		})

		// filterChildren's array mode keeps the first match per name and drops the
		// rest, warning about each repeat
		it('renders only the first Title, and warns about the second, when two are given', () => {
			render(
				<Accordion>
					<Accordion.Title>One</Accordion.Title>
					<Accordion.Title>Two</Accordion.Title>
					<Accordion.Content>Body</Accordion.Content>
				</Accordion>
			)

			expect(screen.getByRole('button', { name: 'One' })).toBeInTheDocument()
			expect(screen.queryByText('Two')).not.toBeInTheDocument()
			expect(warn).toHaveBeenCalledTimes(1)
			expect(warn).toHaveBeenCalledWith('Accordion: ignoring repeated Accordion.Title; only the first is rendered.')
		})
	})

	it('renders an unpadded step number (no leading zero) once the index reaches double digits', () => {
		render(buildAccordion({ layout: 'steps', index: 9 }))
		expect(screen.getByText('10')).toBeInTheDocument()
	})

	// The root carries the shared `--accordion-*` tokens inline. Values below come from
	// `tokensBySize` in `./utils.ts`: step = { sm: 2, md: 1, lg: 0 }, so md => column 8, gap 6, padding 5,
	// indicator 20, title h(order + 1).
	describe('shared inline tokens', () => {
		const TOKENS = [
			'--accordion-column-width',
			'--accordion-gap',
			'--accordion-indicator-size',
			'--accordion-padding',
			'--accordion-title-size',
		] as const

		// The root has no role or label, so find it by the id it builds from the
		// `id` prop (`acc-<id>`). A missing root fails here, not as a null deref.
		const getRoot = (id: string) => {
			const root = document.getElementById(`acc-${ id }`)
			expect(root).toBeInTheDocument()
			return root as HTMLElement
		}

		it('puts the registered-default tokens inline on a standalone root', () => {
			const defaults = getDefaultProps<Accordion.Props>('Accordion')
			expect(defaults).toMatchObject({ order: 3, size: 'md' })

			render(buildAccordion({ id: 'one' }))
			const root = getRoot('one')

			expect(root.style.getPropertyValue('--accordion-column-width')).toBe('var(--space-8)')
			expect(root.style.getPropertyValue('--accordion-gap')).toBe('var(--space-6)')
			expect(root.style.getPropertyValue('--accordion-indicator-size')).toBe('var(--font-size-20)')
			expect(root.style.getPropertyValue('--accordion-padding')).toBe('var(--space-5)')
			expect(root.style.getPropertyValue('--accordion-title-size')).toBe('var(--inkq-font-size-h4)')
		})

		it('omits the step token unless layout="steps"', () => {
			render(buildAccordion({ id: 'one' }))
			const root = getRoot('one')

			expect(root.style.getPropertyValue('--accordion-gap')).not.toBe('')
			expect(root.style.getPropertyValue('--accordion-step-size')).toBe('')
		})

		it('emits the step token when layout="steps"', () => {
			document.documentElement.style.fontSize = '16px'
			try {
				render(buildAccordion({ id: 'one', layout: 'steps' }))
				const step = getRoot('one').style.getPropertyValue('--accordion-step-size')

				expect(step).toContain('var(--accordion-title-size)')
				expect(step).not.toContain('NaN')
			} finally {
				document.documentElement.style.fontSize = ''
			}
		})

		it('changes the inline values when size changes', () => {
			render(buildAccordion({ id: 'small', size: 'sm' }))
			render(buildAccordion({ id: 'large', size: 'lg' }))
			const small = getRoot('small'), large = getRoot('large')

			expect(small.style.getPropertyValue('--accordion-gap')).toBe('var(--space-3)')
			expect(small.style.getPropertyValue('--accordion-padding')).toBe('var(--space-4)')
			expect(small.style.getPropertyValue('--accordion-indicator-size')).toBe('var(--font-size-16)')
			expect(small.style.getPropertyValue('--accordion-title-size')).toBe('var(--inkq-font-size-h5)')

			expect(large.style.getPropertyValue('--accordion-gap')).toBe('var(--space-9)')
			expect(large.style.getPropertyValue('--accordion-padding')).toBe('var(--space-6)')
			expect(large.style.getPropertyValue('--accordion-indicator-size')).toBe('var(--font-size-24)')
			expect(large.style.getPropertyValue('--accordion-title-size')).toBe('var(--inkq-font-size-h3)')
		})

		it('changes only the title size when order changes', () => {
			render(buildAccordion({ id: 'base' }))
			render(buildAccordion({ id: 'other', order: 1 }))
			const a = getRoot('base'), b = getRoot('other')

			expect(a.style.getPropertyValue('--accordion-title-size')).toBe('var(--inkq-font-size-h4)')
			expect(b.style.getPropertyValue('--accordion-title-size')).toBe('var(--inkq-font-size-h2)')
			TOKENS.filter(t => t !== '--accordion-title-size').forEach(token => {
				expect(b.style.getPropertyValue(token)).toBe(a.style.getPropertyValue(token))
			})
		})

		it('drops every inline token when unstyled, while a styled sibling keeps them', () => {
			render(
				<>
					{ buildAccordion({ id: 'styled' }) }
					<Accordion id="bare" unstyled>
						<Accordion.Title>Bare title</Accordion.Title>
						<Accordion.Content>Bare body</Accordion.Content>
					</Accordion>
				</>
			)
			const styled = getRoot('styled'), bare = getRoot('bare')

			expect(styled.style.getPropertyValue('--accordion-gap')).not.toBe('')
			TOKENS.forEach(token => {
				expect(bare.style.getPropertyValue(token)).toBe('')
			})
		})
	})
})
