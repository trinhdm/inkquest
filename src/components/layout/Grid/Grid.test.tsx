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

	// `columns` only ever affects the root's CSS-module `className` (an
	// `{n}-col` modifier); it is never reflected as a `data-*` attribute or
	// inline `style`. CSS-module hashes are unresolvable under `next/jest`
	// (see the batch-1 note), so assert the *contract* — different `columns`
	// values produce different `className`s — rather than any literal token.
	it('changes the root className when columns is set, relative to when it is unset', () => {
		const { container: withColumns } = render(<Grid columns={ 3 }>content</Grid>)
		const { container: withoutColumns } = render(<Grid>content</Grid>)

		expect(withColumns.firstElementChild?.className)
			.not.toBe(withoutColumns.firstElementChild?.className)
	})

	it('does not modify the root className for a non-positive columns value', () => {
		const { container: zero } = render(<Grid columns={ 0 }>content</Grid>)
		const { container: unset } = render(<Grid>content</Grid>)

		expect(zero.firstElementChild?.className).toBe(unset.firstElementChild?.className)
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
