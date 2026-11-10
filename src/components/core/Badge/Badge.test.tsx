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
		// generic to match what `.set()` actually stored.
		const defaults = getDefaultProps<
			Badge.Props & Pick<Badge.Specs['defaults'], 'as'>
		>('Badge')
		const { container } = render(<Badge>Default</Badge>)
		const root = container.firstElementChild

		expect(root?.tagName).toBe(defaults.as?.toUpperCase())
		expect(root).toHaveAttribute('data-variant', defaults.variant)
	})

	it('reflects an explicit tone as a data attribute', () => {
		const { container } = render(<Badge tone="danger">Alert</Badge>)
		expect(container.firstElementChild).toHaveAttribute('data-tone', 'danger')
	})

	it('reflects an explicit structural variant as a data attribute', () => {
		const { container } = render(<Badge variant="outline">Alert</Badge>)
		expect(container.firstElementChild).toHaveAttribute('data-variant', 'outline')
	})

	it('marks full width via data-block', () => {
		const { container } = render(<Badge fullWidth>Wide</Badge>)
		expect(container.firstElementChild).toHaveAttribute('data-block', '')
	})

	it('omits data-block entirely when fullWidth is falsy', () => {
		const { container } = render(<Badge>Narrow</Badge>)
		expect(container.firstElementChild).not.toHaveAttribute('data-block')
	})

	it('renders the polymorphic "as" element instead of the default div', () => {
		const { container } = render(<Badge as="span">Text</Badge>)
		expect(container.firstElementChild?.tagName).toBe('SPAN')
	})

	it('drops the decorative data-tone and data-variant attributes when unstyled, unlike Button (Badge keeps `unstyled` in its own ...rest, so it reaches the root Box)', () => {
		const { container } = render(<Badge unstyled tone="danger" variant="outline">Alert</Badge>)
		expect(container.firstElementChild).not.toHaveAttribute('data-tone')
		expect(container.firstElementChild).not.toHaveAttribute('data-variant')
	})

	it('keeps data-tone and data-variant when not unstyled', () => {
		const { container } = render(<Badge tone="danger" variant="outline">Alert</Badge>)
		expect(container.firstElementChild).toHaveAttribute('data-tone', 'danger')
		expect(container.firstElementChild).toHaveAttribute('data-variant', 'outline')
	})

	// NOTE: these two props are no longer the same case.
	//
	// `size` DOES have an observable effect: `Badge.tsx` feeds it into
	// `clsx.module` (`{ [`${size}`]: size }`), and `formatConfigClass`
	// (`getClassName.tsx`) builds that as `inkq-badge--${size}`. Because
	// `Badge.module.scss` declares no matching `&--sm`/`&--lg` rule,
	// `getStyleClass` finds no compiled hash and the unhashed fallback
	// (`styleName ?? baseName`) lands — so the class is real but carries no
	// styling of its own yet.
	//
	// `shape` remains a genuine no-op. It appears only in `DEFAULT_PROPS`
	// (`shape: 'pill'`), in `BadgeProps`, and in the destructure — it is
	// never fed into `data` or `clsx`, and the destructure excludes it from
	// `rest`, so it never reaches `others`/the DOM either. Confirmed by
	// reading the full component body.
	// Note the classes here are UNPREFIXED (`badge--lg`, not `inkq-badge--lg`).
	// `useStyles` reads `prefix` from `theme.prefix`, which only arrives via
	// `AppProvider` — the Storybook stories get it from `.storybook/preview.tsx`'s
	// global decorator, but these Jest tests render bare, so there is no theme
	// and no prefix. Don't "correct" these to `inkq-*`.
	it('renders size as a literal modifier class, while shape stays a no-op', () => {
		const { container } = render(<Badge shape="round" size="lg">Sized</Badge>)
		const root = container.firstElementChild

		expect(root).toHaveClass('badge--lg')
		expect(root).not.toHaveClass('badge--sm')

		expect(root).not.toHaveAttribute('data-shape')
		expect(root).not.toHaveClass('badge--round')
	})
})
