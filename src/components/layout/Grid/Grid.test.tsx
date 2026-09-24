import { getDefaultProps } from '@/hooks/useProps'
import { render, reset, screen } from '@/tests/test-utils'
import { Grid } from './Grid'

describe('Grid', () => {
	reset('Grid', 'Grid.Item')

	it('renders as the registered default tag ("div")', () => {
		const defaults = getDefaultProps<Grid.Props & { as?: string }>('Grid')
		const { container } = render(<Grid>content</Grid>)

		expect(defaults.as).toBe('div')
		expect(container.firstElementChild?.tagName).toBe(defaults.as?.toUpperCase())
	})

	it('renders the polymorphic "as" element instead of the registered default', () => {
		const { container } = render(<Grid as="ul">content</Grid>)
		expect(container.firstElementChild?.tagName).toBe('UL')
	})

	// `Grid.tsx` still imports `filterChildren` but its call site (line 42) is
	// commented out — the actual render is a bare `{ children }` spread, so
	// there is no filtering step at all: a plain, non-`Grid.Item` element
	// child renders through untouched, same as a `Grid.Item`.
	it('renders every child verbatim, including non-Grid.Item elements (filterChildren is dead code)', () => {
		render(
			<Grid>
				<Grid.Item>Item one</Grid.Item>
				<div>Not a Grid.Item</div>
				{ 'A bare string child' }
			</Grid>
		)

		expect(screen.getByText('Item one')).toBeInTheDocument()
		expect(screen.getByText('Not a Grid.Item')).toBeInTheDocument()
		expect(screen.getByText('A bare string child')).toBeInTheDocument()
	})

	it('renders nothing but stays present in the DOM when given no children', () => {
		const { container } = render(<Grid>{ null }</Grid>)
		expect(container.firstElementChild).toBeEmptyDOMElement()
	})

	// `columns` is published as the `--grid-cols` custom property on the root's
	// inline `style`, via `setThemeCSS`'s `tokens` (see `Grid.tsx`) — NOT as a
	// className modifier or a `data-*` attribute. `Grid.module.scss` reads it
	// back through `repeat(var(--group-cols), ...)`.
	it('publishes columns as the --grid-cols custom property on the root', () => {
		const { container } = render(<Grid columns={ 3 }>content</Grid>)
		const root = container.firstElementChild as HTMLElement

		expect(root.style.getPropertyValue('--grid-cols')).toBe('3')
	})

	it('leaves --grid-cols unset for a non-positive columns value, so the stylesheet default applies', () => {
		const { container: zero } = render(<Grid columns={ 0 }>content</Grid>)
		const { container: unset } = render(<Grid>content</Grid>)

		const zeroRoot = zero.firstElementChild as HTMLElement,
			unsetRoot = unset.firstElementChild as HTMLElement

		expect(zeroRoot.style.getPropertyValue('--grid-cols')).toBe('')
		expect(unsetRoot.style.getPropertyValue('--grid-cols')).toBe('')
		expect(zeroRoot.className).toBe(unsetRoot.className)
	})

	describe('Grid.Item', () => {
		it('renders its children', () => {
			render(<Grid.Item>Item content</Grid.Item>)
			expect(screen.getByText('Item content')).toBeInTheDocument()
		})

		// **Probable source bug, verified against the live `GridItem.tsx`**:
		// `GridItem` (`isCompound: true`, no `defaults.as`) destructures only
		// `others` off `extractOtherProps(rest)` — it never reads the sibling
		// `as` value that call also returns, so `as` is silently discarded and
		// the root always renders through `<Box>`'s own default, `div`.
		it('ignores its "as" prop and always renders a div (as is never read)', () => {
			const { container } = render(<Grid.Item as={ 'li' as never }>Item content</Grid.Item>)
			expect(container.firstElementChild?.tagName).toBe('DIV')
		})

		it('composes inside a Grid, preserving each item\'s own content', () => {
			render(
				<Grid columns={ 2 }>
					<Grid.Item>First</Grid.Item>
					<Grid.Item>Second</Grid.Item>
				</Grid>
			)

			expect(screen.getByText('First')).toBeInTheDocument()
			expect(screen.getByText('Second')).toBeInTheDocument()
		})
	})
})
