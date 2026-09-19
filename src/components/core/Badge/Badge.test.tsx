import { getDefaultProps } from '@/hooks/useProps'
import { render, reset, screen } from '@/tests/test-utils'
import { Badge } from './Badge'

describe('Badge', () => {
	reset('Badge')

	it('renders its children inside the inner wrapper', () => {
		render(<Badge>New</Badge>)
		expect(screen.getByText('New')).toBeInTheDocument()
	})

	it('applies the registered default tag and variant', () => {
		// `as` is registered in the defaults registry at runtime, but it's
		// declared on the component's Specs rather than its Props — widen the
		// generic to match what `setDefaults` actually stored.
		const defaults = getDefaultProps<
			Badge.Props & Pick<Badge.Specs['defaults'], 'as'>
		>('Badge')
		const { container } = render(<Badge>Default</Badge>)
		const root = container.firstElementChild

		expect(root?.tagName).toBe(defaults.as?.toUpperCase())
		expect(root).toHaveAttribute('data-variant', defaults.variant)
	})

	it('reflects an explicit variant as a data attribute', () => {
		const { container } = render(<Badge variant="danger">Alert</Badge>)
		expect(container.firstElementChild).toHaveAttribute('data-variant', 'danger')
	})

	it('marks full width via data-block', () => {
		const { container } = render(<Badge fullWidth>Wide</Badge>)
		expect(container.firstElementChild).toHaveAttribute('data-block', 'true')
	})

	it('omits data-block entirely when fullWidth is falsy', () => {
		const { container } = render(<Badge>Narrow</Badge>)
		expect(container.firstElementChild).not.toHaveAttribute('data-block')
	})

	it('renders the polymorphic "as" element instead of the default div', () => {
		const { container } = render(<Badge as="span">Text</Badge>)
		expect(container.firstElementChild?.tagName).toBe('SPAN')
	})

	it('drops the decorative data-variant attribute when unstyled, unlike Button (Badge keeps `unstyled` in its own ...rest, so it reaches the root Box)', () => {
		const { container } = render(<Badge unstyled variant="danger">Alert</Badge>)
		expect(container.firstElementChild).not.toHaveAttribute('data-variant')
	})

	it('keeps data-variant when not unstyled', () => {
		const { container } = render(<Badge variant="danger">Alert</Badge>)
		expect(container.firstElementChild).toHaveAttribute('data-variant', 'danger')
	})

	// NOTE: `shape` and `size` are destructured out of `props` in `Badge.tsx`
	// but never read again afterward — they're not fed into `data`, `clsx`
	// (only `global: { block: fullWidth }` is used), or passed to `others`
	// (they're excluded from `rest` by the destructure). Confirmed by reading
	// the full source: there is no other reference to `shape`/`size` in the
	// component body. This means neither prop currently has any observable
	// effect on the rendered output — not even a class or attribute. Rather
	// than assert on made-up behavior, this is flagged as dead/no-op props;
	// see the Maintenance Note.
	it('accepts shape and size props without throwing, though they currently have no observable effect on markup (see Maintenance Note)', () => {
		expect(() => render(<Badge shape="round" size="lg">Sized</Badge>)).not.toThrow()
	})
})
