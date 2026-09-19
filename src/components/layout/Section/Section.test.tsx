import { getDefaultProps } from '@/hooks/useProps'
import { render, reset, screen, within } from '@/tests/test-utils'
import { Section } from './Section'

describe('Section', () => {
	reset('Section', 'Container', 'Grid', 'GridItem', 'Button', 'ButtonGroup')

	it('defaults layout to "default"', () => {
		expect(getDefaultProps<Section.Props>('Section').layout).toBe('default')
	})

	it('always renders the root through Container, ignoring its own "as" prop', () => {
		// `Section.tsx` reads `others` off `extractOtherProps(rest)` but never
		// its sibling `as` — the root is hardcoded to `<Box as={Container}>`.
		const { container } = render(
			// `as` is typed `never` on `Section` (no `defaults.as` in its specs),
			// same escape hatch `Section.stories.tsx`'s `AsPropIgnored` story uses.
			<Section as={ 'div' as never } title="Ignored as">content</Section>
		)
		expect(container.firstElementChild?.tagName).toBe('SECTION')
	})

	it('renders the title as an h2 heading by default', () => {
		render(<Section title="Section title">content</Section>)
		expect(screen.getByRole('heading', { level: 2, name: 'Section title' })).toBeInTheDocument()
	})

	it('renders the title as an h1 heading for the hero layout', () => {
		render(<Section layout="hero" title="Hero title">content</Section>)
		expect(screen.getByRole('heading', { level: 1, name: 'Hero title' })).toBeInTheDocument()
	})

	it('renders no heading at all when title is unset', () => {
		render(<Section>content only</Section>)
		expect(screen.queryByRole('heading')).not.toBeInTheDocument()
	})

	it('renders the eyebrow only when provided', () => {
		const { rerender } = render(<Section eyebrow="Featured" title="t">content</Section>)
		expect(screen.getByText('Featured')).toBeInTheDocument()

		rerender(<Section title="t">content</Section>)
		expect(screen.queryByText('Featured')).not.toBeInTheDocument()
	})

	it('renders a bare string child as a paragraph', () => {
		render(<Section title="t">A description.</Section>)
		expect(screen.getByText('A description.').tagName).toBe('P')
	})

	it('renders nothing (but stays in the DOM) when children is null', () => {
		const { container } = render(<Section title="Title only">{ null }</Section>)
		expect(screen.getByRole('heading', { name: 'Title only' })).toBeInTheDocument()
		expect(screen.queryByRole('group')).not.toBeInTheDocument()
		expect(container.firstElementChild).toBeInTheDocument()
	})

	// `orderSection` always wraps content items in a `body` element that sits
	// beside the heading; only 2+ items get an extra `description` wrapper
	// inside that body.
	it('places a single non-string content child directly in a body beside the heading', () => {
		render(
			<Section title="t">
				<span>Only content</span>
			</Section>
		)

		const heading = screen.getByRole('heading', { name: 't' }),
			body = screen.getByText('Only content').parentElement

		expect(body).not.toBe(heading.parentElement)
		expect(body?.parentElement).toBe(heading.parentElement)
	})

	it('wraps two or more non-string content children in a shared container inside the body', () => {
		render(
			<Section title="t">
				<span>First</span>
				<span>Second</span>
			</Section>
		)

		const heading = screen.getByRole('heading', { name: 't' }),
			first = screen.getByText('First'),
			description = first.parentElement,
			body = description?.parentElement

		expect(screen.getByText('Second').parentElement).toBe(description)
		expect(body).not.toBe(heading.parentElement)
		expect(body?.parentElement).toBe(heading.parentElement)
	})

	it('groups up to two Section.Button children into a CTA button group', () => {
		render(
			<Section title="t">
				<Section.Button>Learn more</Section.Button>
				<Section.Button>View more</Section.Button>
			</Section>
		)

		const group = screen.getByRole('group')
		expect(within(group).getAllByRole('button')).toHaveLength(2)
		expect(within(group).getByRole('button', { name: 'Learn more' })).toBeInTheDocument()
		expect(within(group).getByRole('button', { name: 'View more' })).toBeInTheDocument()
	})

	// `orderSection`'s `buttons` push is gated with `else if (buttons.length < 2)`
	// — a THIRD `Section.Button` matches `child.type === Button` so it never
	// falls into the `content` branch either; it is silently dropped from the
	// render entirely, not merely excluded from the CTA group.
	it('silently drops a third Section.Button beyond the first two', () => {
		render(
			<Section title="t">
				<Section.Button>One</Section.Button>
				<Section.Button>Two</Section.Button>
				<Section.Button>Three</Section.Button>
			</Section>
		)

		expect(screen.getAllByRole('button')).toHaveLength(2)
		expect(screen.queryByRole('button', { name: 'Three' })).not.toBeInTheDocument()
	})

	it('assigns a single Section.Button no priority (hasPriority requires 2+ buttons)', () => {
		render(
			<Section title="t">
				<Section.Button>Solo</Section.Button>
			</Section>
		)
		expect(screen.getByRole('button', { name: 'Solo' })).not.toHaveAttribute('data-priority')
	})

	it('assigns the CTA group\'s two buttons distinct priorities (primary, then secondary)', () => {
		render(
			<Section title="t">
				<Section.Button>First</Section.Button>
				<Section.Button>Second</Section.Button>
			</Section>
		)

		expect(screen.getByRole('button', { name: 'First' })).toHaveAttribute('data-priority', 'primary')
		expect(screen.getByRole('button', { name: 'Second' })).toHaveAttribute('data-priority', 'secondary')
	})

	it('wraps header and content in two separate Grid.Items for the split layout', () => {
		render(
			<Section layout="split" title="Split title">
				A split description.
			</Section>
		)

		expect(screen.getByRole('heading', { name: 'Split title' })).toBeInTheDocument()
		expect(screen.getByText('A split description.')).toBeInTheDocument()
	})
})
