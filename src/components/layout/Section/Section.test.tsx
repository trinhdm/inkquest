import { Suspense, type ReactElement } from 'react'
import { getDefaultProps } from '@/hooks/useProps'
import { render, reset, screen, within } from '@/tests/test-utils'
import { Button } from '@/components/core/Button'
import { Section } from './Section'

describe('Section', () => {
	reset('Section', 'Container', 'Grid', 'Grid.Item', 'Button', 'Button.Group')

	it('defaults layout to "default"', () => {
		expect(getDefaultProps<Section.Props>('Section').layout).toBe('default')
	})

	it('always renders the root through Container, ignoring its own "as" prop', () => {
		// `Section.tsx` reads `others` off `extractOthers(rest)` but never
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

	it('groups Button children of Section.Footer into a CTA button group', () => {
		render(
			<Section title="t">
				<Section.Footer>
					<Button>Learn more</Button>
					<Button>View more</Button>
				</Section.Footer>
			</Section>
		)

		const group = screen.getByRole('group')
		expect(within(group).getAllByRole('button')).toHaveLength(2)
		expect(within(group).getByRole('button', { name: 'Learn more' })).toBeInTheDocument()
		expect(within(group).getByRole('button', { name: 'View more' })).toBeInTheDocument()
	})

	// the old 2-button cap is gone — `Button.Group` already caps priorities at tertiary
	it('keeps a third footer Button and gives it the tertiary priority', () => {
		render(
			<Section title="t">
				<Section.Footer>
					<Button>One</Button>
					<Button>Two</Button>
					<Button>Three</Button>
				</Section.Footer>
			</Section>
		)

		expect(screen.getAllByRole('button')).toHaveLength(3)
		expect(screen.getByRole('button', { name: 'Three' })).toHaveAttribute('data-priority', 'tertiary')
	})

	it('assigns a single footer Button no priority (hasPriority requires 2+ buttons)', () => {
		render(
			<Section title="t">
				<Section.Footer>
					<Button>Solo</Button>
				</Section.Footer>
			</Section>
		)
		expect(screen.getByRole('button', { name: 'Solo' })).not.toHaveAttribute('data-priority')
	})

	it('assigns the footer\'s two buttons distinct priorities (primary, then secondary)', () => {
		render(
			<Section title="t">
				<Section.Footer>
					<Button>First</Button>
					<Button>Second</Button>
				</Section.Footer>
			</Section>
		)

		expect(screen.getByRole('button', { name: 'First' })).toHaveAttribute('data-priority', 'primary')
		expect(screen.getByRole('button', { name: 'Second' })).toHaveAttribute('data-priority', 'secondary')
	})

	// the FAQs hero case: the builder can't see through `Suspense`, the footer doesn't need to
	it('keeps non-Button footer content in the footer, ahead of the button group', () => {
		render(
			<Section title="t">
				<Section.Footer>
					<Suspense fallback={ null }>
						<input aria-label="Search" />
					</Suspense>
					<Button>Go</Button>
				</Section.Footer>
			</Section>
		)

		const input = screen.getByRole('textbox', { name: 'Search' })
		expect(input.parentElement?.nextElementSibling).toBe(screen.getByRole('group'))
	})

	it('treats a Button outside Section.Footer as ordinary content, not a CTA', () => {
		render(
			<Section title="t">
				<Button>Loose</Button>
			</Section>
		)

		expect(screen.getByRole('button', { name: 'Loose' })).toBeInTheDocument()
		expect(screen.queryByRole('group')).not.toBeInTheDocument()
	})

	// `Section` publishes `{ revealFrom, size }` to `Section.Footer` through its
	// context; `size` is "lg" for the hero layout and "md" for every other one.
	describe('footer button size from Section context', () => {
		const footer = (
			<Section.Footer>
				<Button>Go</Button>
			</Section.Footer>
		)

		// Button reflects `size` through inline CSS tokens, not a data attribute,
		// so compare against a standalone Button of the expected size rather than
		// hand-typing theme values.
		const tracking = (ui: ReactElement) => {
			const { unmount } = render(ui),
				value = screen.getByRole('button').style.getPropertyValue('--button-tracking')
			unmount()
			return value
		}

		it('sizes the footer buttons like a Button size="lg" in the hero layout', () => {
			const lg = tracking(<Button size="lg">Go</Button>),
				md = tracking(<Button size="md">Go</Button>)
			expect(lg).not.toBe('')
			expect(lg).not.toBe(md)

			expect(tracking(<Section layout="hero" title="t">{ footer }</Section>)).toBe(lg)
		})

		it('sizes the footer buttons like a Button size="md" in the default layout', () => {
			const md = tracking(<Button size="md">Go</Button>)
			expect(md).not.toBe('')

			expect(tracking(<Section title="t">{ footer }</Section>)).toBe(md)
		})

		it('sizes the footer buttons like a Button size="md" in hero-split, which is not "hero"', () => {
			const md = tracking(<Button size="md">Go</Button>)

			expect(tracking(<Section layout="hero-split" title="t">{ footer }</Section>)).toBe(md)
		})

		it('throws when Section.Footer is rendered outside a Section', () => {
			const spy = jest.spyOn(console, 'error').mockImplementation(() => {})
			expect(() => render(footer)).toThrow('<Section.Footer /> must be a direct child of <Section>')
			spy.mockRestore()
		})

		// Section only provides context to a footer it finds among its direct
		// children, so one returned from another component throws even though
		// it sits inside <Section> on the page
		it('throws the direct-child error when Section.Footer is returned from another component', () => {
			const spy = jest.spyOn(console, 'error').mockImplementation(() => {})
			const Actions = () => footer

			expect(() => render(<Section title="t"><Actions /></Section>)).toThrow(
				'Section: <Section.Footer /> must be a direct child of <Section>; it can\'t be returned from another component'
			)
			spy.mockRestore()
		})
	})

	describe('layout="hero-split"', () => {
		const renderSplit = () => render(
			<Section eyebrow="New" layout="hero-split" title="Split headline">
				Split description
				<Section.Footer>
					<Button>Join</Button>
				</Section.Footer>
			</Section>
		)

		it('renders the title as an h1 like the other hero layout', () => {
			renderSplit()
			expect(screen.getByRole('heading', { level: 1, name: 'Split headline' })).toBeInTheDocument()
		})

		it('tags the headline with the global h1-display class', () => {
			renderSplit()
			expect(screen.getByRole('heading', { level: 1 })).toHaveClass('h1-display')
		})

		it('does not add the display class to the headline of other layouts', () => {
			render(<Section layout="hero" title="Plain hero">content</Section>)
			expect(screen.getByRole('heading', { level: 1 })).not.toHaveClass('h1-display')
		})

		it('keeps the headline and description in one column and the CTA in the other', () => {
			renderSplit()

			const heading = screen.getByRole('heading', { level: 1 }),
				description = screen.getByText('Split description'),
				cta = screen.getByRole('button', { name: 'Join' })

			// one shared Grid.Item holds header + body; the footer lives in a different one
			const textColumn = heading.parentElement
			expect(textColumn).toContainElement(screen.getByText('New'))
			expect(textColumn).toContainElement(description)
			expect(textColumn).not.toContainElement(cta)
			expect(heading.parentElement?.parentElement).toContainElement(cta)
		})

		it('renders the headline once only, not duplicated into both columns', () => {
			renderSplit()
			expect(screen.getAllByRole('heading')).toHaveLength(1)
			expect(screen.getAllByRole('button')).toHaveLength(1)
		})
	})

	describe('unstyled forwarding to Container', () => {
		// Regression coverage: `Box.tsx` now re-attaches `unstyled` onto an
		// `as` target that carries `POLYMORPHIC_MARKER` (see `Box.test.tsx`'s
		// "unstyled forwarding" block). Section's root is always
		// `<Box as={Container}>` (see "always renders the root through
		// Container" above), and any prop Section itself doesn't declare
		// passes straight through `rest`/`others` — including `unstyled` and
		// `fullWidth`, which Container's own `useProps` reads directly.
		// Container computes its root data attributes as
		// `{ block: !!fullWidth || null }`; `block` isn't one of
		// `buildAttributes`'s `STATE_KEYS`, so it's now correctly dropped once
		// `unstyled` reaches Container — previously it never did. This is a
		// data-attribute effect, not a CSS-module className one: `next/jest`'s
		// module mock is an `object-proxy` with only a `get` trap, so
		// `Object.hasOwn(classes, baseName)` in `getClassName.tsx` is always
		// false there and `unstyled` can't be observed via className under Jest.
		it('drops data-block on Container\'s root once unstyled reaches it through Section', () => {
			const props = {
				children: 'content',
				fullWidth: true,
				title: 'Unstyled section',
				unstyled: true,
			} as Section.Props & { fullWidth?: boolean }

			const { container } = render(<Section { ...props } />)
			const root = container.firstElementChild

			expect(root?.tagName).toBe('SECTION')
			expect(root).not.toHaveAttribute('data-block')
		})

		it('keeps data-block on Container\'s root when Section is not unstyled, for contrast', () => {
			const props = {
				children: 'content',
				fullWidth: true,
				title: 'Styled section',
			} as Section.Props & { fullWidth?: boolean }

			const { container } = render(<Section { ...props } />)
			expect(container.firstElementChild).toHaveAttribute('data-block', '')
		})
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
