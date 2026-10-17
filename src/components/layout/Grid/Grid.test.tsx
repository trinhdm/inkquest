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

	// `Grid.tsx` has no filtering step: the render is a bare `{ children }`,
	// so a plain, non-`Grid.Item` child renders through untouched, same as a
	// `Grid.Item`.
	it('renders every child verbatim, including non-Grid.Item elements', () => {
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
	// inline `style`, via `defineTokens` (see `Grid.tsx`) — NOT as a className
	// modifier or a `data-*` attribute. The property holds the full track list.
	it('publishes columns as the full track list in --grid-cols on the root', () => {
		const { container } = render(<Grid columns={ 3 }>content</Grid>)
		const root = container.firstElementChild as HTMLElement

		expect(root.style.getPropertyValue('--grid-cols')).toBe('repeat(3, minmax(0, 1fr))')
	})

	it('falls back to repeat(auto-fit, ...) for unset or non-positive columns', () => {
		const { container: zero } = render(<Grid columns={ 0 }>content</Grid>)
		const { container: negative } = render(<Grid columns={ -2 }>content</Grid>)
		const { container: unset } = render(<Grid>content</Grid>)

		const expected = 'repeat(auto-fit, minmax(0, 1fr))'
		for (const { container } of [{ container: zero }, { container: negative }, { container: unset }])
			expect((container.firstElementChild as HTMLElement).style.getPropertyValue('--grid-cols')).toBe(expected)
	})

	describe('equalWidth', () => {
		it('defaults to true in the registry', () => {
			expect(getDefaultProps<Grid.Props>('Grid')).toMatchObject({ equalWidth: true })
		})

		it('wraps the track in repeat() when equalWidth is true (the default)', () => {
			const { container } = render(<Grid columns={ 2 } equalWidth>content</Grid>)

			expect((container.firstElementChild as HTMLElement).style.getPropertyValue('--grid-cols'))
				.toBe('repeat(2, minmax(0, 1fr))')
		})

		it('sizes explicit columns to their content when equalWidth is false', () => {
			const { container } = render(<Grid columns={ 2 } equalWidth={ false }>content</Grid>)

			expect((container.firstElementChild as HTMLElement).style.getPropertyValue('--grid-cols'))
				.toBe('repeat(2, auto)')
		})

		it('uses a string columns as the full track list, whatever equalWidth is', () => {
			const { container: equal } = render(<Grid columns="1fr 2fr">content</Grid>)
			const { container: loose } = render(<Grid columns="1fr 2fr" equalWidth={ false }>content</Grid>)

			for (const container of [equal, loose])
				expect((container.firstElementChild as HTMLElement).style.getPropertyValue('--grid-cols'))
					.toBe('1fr 2fr')
		})
	})

	it('uses four columns for layout="sidebar"', () => {
		const { container } = render(<Grid layout="sidebar">content</Grid>)

		expect((container.firstElementChild as HTMLElement).style.getPropertyValue('--grid-cols'))
			.toBe('repeat(4, minmax(0, 1fr))')
	})

	describe('Grid.Item', () => {
		it('renders its children', () => {
			render(<Grid.Item>Item content</Grid.Item>)
			expect(screen.getByText('Item content')).toBeInTheDocument()
		})

		it('renders a div by default, and the element passed as `as` otherwise', () => {
			const { container: plain } = render(<Grid.Item>Plain</Grid.Item>)
			expect(plain.firstElementChild?.tagName).toBe('DIV')

			const { container: listed } = render(<Grid.Item as="li">Listed</Grid.Item>)
			expect(listed.firstElementChild?.tagName).toBe('LI')
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
