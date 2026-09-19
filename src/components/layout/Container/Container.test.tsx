import { getDefaultProps, resetComponentDefaults } from '@/hooks/useProps'
import { renderWithTheme as render, screen } from '@/tests/test-utils'
import { resetVariantStyles } from '@/lib/registries'
import { Container } from './Container'

describe('Container', () => {
	afterEach(() => {
		resetVariantStyles('Container')
	})

	afterAll(() => {
		resetComponentDefaults('Container')
	})

	it('renders children inside the root', () => {
		render(<Container>Container content</Container>)
		expect(screen.getByText('Container content')).toBeInTheDocument()
	})

	it('renders as the registered default tag ("section")', () => {
		const defaults = getDefaultProps<Container.Props & { as?: string }>('Container')
		const { container } = render(<Container>content</Container>)

		expect(defaults.as).toBe('section')
		expect(container.firstElementChild?.tagName).toBe(defaults.as?.toUpperCase())
	})

	it('renders the polymorphic "as" element instead of the registered default', () => {
		const { container } = render(<Container as="div">content</Container>)
		expect(container.firstElementChild?.tagName).toBe('DIV')
	})

	it('adds data-block when fullWidth is set', () => {
		render(<Container fullWidth>content</Container>)
		expect(screen.getByText('content').closest('section')).toHaveAttribute('data-block')
	})

	it('renders no data-block attribute at all when fullWidth is unset (falsy flags render no attribute)', () => {
		render(<Container>content</Container>)
		expect(screen.getByText('content').closest('section')).not.toHaveAttribute('data-block')
	})

	// `ContainerProps` declares `revealed`, but `Container.tsx` never reads it —
	// it flows into `extractOtherProps(rest)`, whose own destructuring (see
	// `hooks/useProps/helpers.ts`) explicitly pulls `revealed` out of `rest`
	// and never re-attaches it to the returned `others` bag. So, verified
	// against the live source (not the `revealed` argType doc in
	// `Container.stories.tsx`, which claims it "falls straight through...
	// and lands as a raw DOM attribute" — that is NOT what happens here),
	// `revealed` is silently swallowed and never reaches the DOM at all.
	it('silently drops the (unused) revealed prop instead of forwarding it to the DOM', () => {
		const { container } = render(<Container revealed>content</Container>)
		expect(container.firstElementChild).not.toHaveAttribute('revealed')
	})
})
