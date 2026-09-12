import { screen } from '@testing-library/react'
import { resetVariantStyles, getDefaultProps } from '@/lib/registries'
import { resetComponentDefaults } from '@/lib/registries/componentDefaultProps'
import { renderWithTheme as render } from '@/tests/test-utils'
import { Card } from './Card'

describe('Card', () => {
	afterEach(() => {
		resetVariantStyles('Card')
	})

	afterAll(() => {
		resetComponentDefaults('Card')
	})

	it('renders the title in a heading', () => {
		render(<Card title="Rose Sleeve" />)
		expect(screen.getByRole('heading', { level: 3, name: 'Rose Sleeve' })).toBeInTheDocument()
	})

	it('renders the caption when provided', () => {
		render(<Card title="Rose Sleeve" caption="by Jane Doe" />)
		expect(screen.getByText('by Jane Doe')).toBeInTheDocument()
	})

	it('does not render a caption element when none is provided', () => {
		const { container } = render(<Card title="Rose Sleeve" />)
		// `caption` is only rendered conditionally (`{ caption && ... }`), so
		// its text should be entirely absent — there's no accessible role for
		// it, so assert against the rendered markup directly.
		expect(container.textContent).not.toContain('by Jane Doe')
	})

	it('applies the registered default tag and hasTitleAlt', () => {
		// `as` is registered in the defaults registry at runtime, but it's
		// declared on the component's Specs rather than its Props — widen the
		// generic to match what `setDefaults` actually stored.
		const defaults = getDefaultProps<
			Card.Props & Pick<Card.Specs['defaults'], 'as'>
		>('Card')
		const { container } = render(<Card title="Rose Sleeve" />)

		expect(container.firstElementChild?.tagName).toBe(defaults.as?.toUpperCase())
		expect(defaults.hasTitleAlt).toBe(false)
	})

	it('defaults the image caption placeholder to "[ PHOTO ]" when there is no image and hasTitleAlt is unset', () => {
		render(<Card title="Rose Sleeve" />)
		expect(screen.getByText('[ PHOTO ]')).toBeInTheDocument()
	})

	it('falls back to the title text as the image caption placeholder when hasTitleAlt is set', () => {
		render(<Card title="Rose Sleeve" hasTitleAlt />)
		// title appears both as the heading and (via `altDefault`) as the
		// placeholder caption — assert there are two occurrences of the text.
		expect(screen.getAllByText('Rose Sleeve')).toHaveLength(2)
	})

	it('renders an image and prefers its own alt text over the placeholder', () => {
		render(
			<Card
				title="Rose Sleeve"
				image={ { src: '/rose.jpg', alt: 'A rose tattoo sleeve', width: 400, height: 400 } }
			/>
		)
		expect(screen.getByRole('img', { name: 'A rose tattoo sleeve' })).toBeInTheDocument()
		expect(screen.queryByText('[ PHOTO ]')).not.toBeInTheDocument()
	})

	it('does not render an <img> when no image prop is given', () => {
		render(<Card title="Rose Sleeve" />)
		expect(screen.queryByRole('img')).not.toBeInTheDocument()
	})

	it('renders the polymorphic "as" element instead of the default div', () => {
		const { container } = render(<Card as="article" title="Rose Sleeve" />)
		expect(container.firstElementChild?.tagName).toBe('ARTICLE')
	})
})
