import { buildSection } from '../buildSection'
import { render, reset, screen } from '@/tests/test-utils'
import { Button } from '@/components/core/Button'
import { SectionFooter } from '../SectionFooter'
import type { useStyles } from '@/hooks/useStyles'
import type { RevealCounter } from '@/hooks/animation'
import type { Section } from '../Section'

// `buildSection` renders real `Button`/`Button.Group`/`Grid`/`Grid.Item`
// children, so their registries need resetting like any other suite that
// renders factory components.
describe('buildSection', () => {
	reset('Button', 'Button.Group', 'Grid', 'Grid.Item')

	// `styles` is mocked to a deterministic `style-<selector>` class per
	// selector — the builder's own branching (which wrapper renders, which
	// selector gets called) is what's under test here, not `useStyles`'s
	// hashing/theming, which has its own suite.
	const makeStyles = () => jest.fn(
		(selector: string) => ({ className: `style-${ selector }` })
	) as unknown as ReturnType<typeof useStyles>

	const makeReveal = (): RevealCounter => {
		let index = 0
		return {
			next: jest.fn(() => ({ 'data-reveal-item': `${ index++ }` })),
			reserve: jest.fn((total: number) => {
				const from = index
				index += total
				return from
			}),
		}
	}

	const buildProps = (overrides: Partial<Section.Props> = {}) => ({
		children: null,
		...overrides,
	}) as Section.Props & { id?: string }

	describe('header', () => {
		it('renders an eyebrow and a title for the default layout', () => {
			const styles = makeStyles()
			render(
				<>{ buildSection({
					props: buildProps({ eyebrow: 'New', title: 'Headline' }),
					reveal: makeReveal(),
					styles,
				}) }</>
			)

			expect(screen.getByText('New')).toBeInTheDocument()
			expect(screen.getByRole('heading', { level: 2, name: 'Headline' })).toBeInTheDocument()
		})

		it('renders the title as an <h1> for layout="hero"', () => {
			render(
				<>{ buildSection({
					props: buildProps({ layout: 'hero', title: 'Hero title' }),
					reveal: makeReveal(),
					styles: makeStyles(),
				}) }</>
			)

			expect(screen.getByRole('heading', { level: 1, name: 'Hero title' })).toBeInTheDocument()
		})

		it('omits the eyebrow/title header entirely for layout="content-blocks"', () => {
			render(
				<>{ buildSection({
					// `content-blocks` types eyebrow/title as `never`; cast only those two so the layout name stays checked
					props: buildProps({ eyebrow: 'New' as never, layout: 'content-blocks', title: 'Headline' as never }),
					reveal: makeReveal(),
					styles: makeStyles(),
				}) }</>
			)

			expect(screen.queryByText('New')).not.toBeInTheDocument()
			expect(screen.queryByRole('heading')).not.toBeInTheDocument()
		})

		it('renders no eyebrow/title elements when neither prop is passed', () => {
			render(
				<>{ buildSection({
					props: buildProps(),
					reveal: makeReveal(),
					styles: makeStyles(),
				}) }</>
			)

			expect(screen.queryByRole('heading')).not.toBeInTheDocument()
		})
	})

	describe('content partitioning', () => {
		it('renders plain string children as description text', () => {
			render(
				<>{ buildSection({
					props: buildProps({ children: 'Plain description text' }),
					reveal: makeReveal(),
					styles: makeStyles(),
				}) }</>
			)

			expect(screen.getByText('Plain description text')).toBeInTheDocument()
		})

		it('renders Section.Footer buttons as a CTA group', () => {
			render(
				<>{ buildSection({
					props: buildProps({
						children: (
							<SectionFooter>
								<Button>First</Button>
								<Button>Second</Button>
							</SectionFooter>
						),
					}),
					reveal: makeReveal(),
					styles: makeStyles(),
				}) }</>
			)

			expect(screen.getByRole('group')).toBeInTheDocument()
			expect(screen.getByRole('button', { name: 'First' })).toBeInTheDocument()
			expect(screen.getByRole('button', { name: 'Second' })).toBeInTheDocument()
		})

		it('reserves one reveal slot for footer content plus one per footer Button, after the description', () => {
			const reveal = makeReveal()

			render(
				<>{ buildSection({
					props: buildProps({
						children: [
							'Description',
							<SectionFooter key="footer">
								<input aria-label="Search" />
								<Button>First</Button>
								<Button>Second</Button>
							</SectionFooter>,
						],
						title: 'Headline',
					}),
					reveal,
					styles: makeStyles(),
				}) }</>
			)

			// title = 0, description = 1, then the footer's reserved range starts at 2
			expect(reveal.reserve).toHaveBeenCalledWith(3)
			expect(screen.getByText('Description')).toHaveAttribute('data-reveal-item', '1')
			expect(screen.getByRole('textbox', { name: 'Search' }).parentElement).toHaveAttribute('data-reveal-item', '2')
			expect(screen.getByRole('button', { name: 'First' }).closest('[data-reveal-item]')).toHaveAttribute('data-reveal-item', '3')
			expect(screen.getByRole('button', { name: 'Second' }).closest('[data-reveal-item]')).toHaveAttribute('data-reveal-item', '4')
		})

		it('no longer spends a reveal slot on non-text element children', () => {
			const reveal = makeReveal()

			render(
				<>{ buildSection({
					props: buildProps({ children: [<span key="a">Custom</span>, 'Text'] }),
					reveal,
					styles: makeStyles(),
				}) }</>
			)

			expect(screen.getByText('Text')).toHaveAttribute('data-reveal-item', '0')
		})

		it('renders only the first Section.Footer and warns about the rest', () => {
			const warn = jest.spyOn(console, 'warn').mockImplementation(() => {})

			render(
				<>{ buildSection({
					props: buildProps({
						children: [
							<SectionFooter key="a"><Button>Kept</Button></SectionFooter>,
							<SectionFooter key="b"><Button>Dropped</Button></SectionFooter>,
						],
					}),
					reveal: makeReveal(),
					styles: makeStyles(),
				}) }</>
			)

			expect(screen.getByRole('button', { name: 'Kept' })).toBeInTheDocument()
			expect(screen.queryByRole('button', { name: 'Dropped' })).not.toBeInTheDocument()
			// each extra footer is checked against the first via verifyChildren({ total: 1 })
			expect(warn).toHaveBeenCalledWith(
				'Section.Footer: 2 children found; a Section.Footer needs exactly 1 children.'
			)
			warn.mockRestore()
		})

		it('renders a non-Button element child as-is, outside of the description wrapper', () => {
			render(
				<>{ buildSection({
					props: buildProps({ children: <span>Custom node</span> }),
					reveal: makeReveal(),
					styles: makeStyles(),
				}) }</>
			)

			expect(screen.getByText('Custom node').tagName).toBe('SPAN')
		})

		it('wraps multiple description items in a container element', () => {
			render(
				<>{ buildSection({
					props: buildProps({ children: ['First line', 'Second line'] }),
					reveal: makeReveal(),
					styles: makeStyles(),
				}) }</>
			)

			expect(screen.getByText('First line')).toBeInTheDocument()
			expect(screen.getByText('Second line')).toBeInTheDocument()
		})

		it('wraps the description in a "body" div when a title/eyebrow/CTA is present', () => {
			const { container } = render(
				<>{ buildSection({
					props: buildProps({ children: 'Body text', title: 'Headline' }),
					reveal: makeReveal(),
					styles: makeStyles(),
				}) }</>
			)

			expect(container.querySelector('.style-body')).toBeInTheDocument()
		})

		it('skips the "body" wrapper when there is no title, eyebrow, or CTA', () => {
			const { container } = render(
				<>{ buildSection({
					props: buildProps({ children: 'Body text' }),
					reveal: makeReveal(),
					styles: makeStyles(),
				}) }</>
			)

			expect(container.querySelector('.style-body')).not.toBeInTheDocument()
			expect(screen.getByText('Body text')).toBeInTheDocument()
		})
	})

	describe('layout wrapper', () => {
		it('wraps hero/cta layouts in a single "inner" element', () => {
			const { container } = render(
				<>{ buildSection({
					props: buildProps({ layout: 'hero', title: 'Hero' }),
					reveal: makeReveal(),
					styles: makeStyles(),
				}) }</>
			)

			expect(container.querySelector('.style-inner')).toBeInTheDocument()
		})

		it('renders header and content side-by-side in a Grid for layout="split"', () => {
			render(
				<>{ buildSection({
					props: buildProps({ children: 'Split body', layout: 'content-split', title: 'Split title' }),
					reveal: makeReveal(),
					styles: makeStyles(),
				}) }</>
			)

			expect(screen.getByRole('heading', { name: 'Split title' })).toBeInTheDocument()
			expect(screen.getByText('Split body')).toBeInTheDocument()
		})

		it('places the hero-split footer directly in the Grid, beside the content column', () => {
			const { container } = render(
				<>{ buildSection({
					props: buildProps({
						children: [
							'Split body',
							<SectionFooter key="footer"><Button>Join</Button></SectionFooter>,
						],
						layout: 'hero-split',
						title: 'Split title',
					}),
					reveal: makeReveal(),
					styles: makeStyles(),
				}) }</>
			)

			const inner = container.querySelector('.style-inner') as HTMLElement,
				content = container.querySelector('.style-content') as HTMLElement,
				button = screen.getByRole('button', { name: 'Join' })

			expect(content).toContainElement(screen.getByRole('heading', { level: 1, name: 'Split title' }))
			expect(content).toContainElement(screen.getByText('Split body'))
			expect(content).not.toContainElement(button)
			expect(inner).toContainElement(content)
			// the footer is its own direct child of the Grid, not nested in the content column
			const footerColumn = Array.from(inner.children).find(child => child.contains(button))
			expect(footerColumn).toBeDefined()
			expect(footerColumn).not.toBe(content)
			// no cta wrapper any more
			expect(container.querySelector('.style-cta')).not.toBeInTheDocument()
		})

		it('renders only the content column in the hero-split Grid when there is no footer', () => {
			const { container } = render(
				<>{ buildSection({
					props: buildProps({ children: 'Split body', layout: 'hero-split', title: 'Split title' }),
					reveal: makeReveal(),
					styles: makeStyles(),
				}) }</>
			)

			const inner = container.querySelector('.style-inner') as HTMLElement,
				content = container.querySelector('.style-content') as HTMLElement

			expect(content).not.toBeEmptyDOMElement()
			expect(content).toContainElement(screen.getByText('Split body'))
			expect(Array.from(inner.children)).toEqual([content])
			expect(screen.queryByRole('button')).not.toBeInTheDocument()
		})

		it('renders no "inner" wrapper for the default layout', () => {
			const { container } = render(
				<>{ buildSection({
					props: buildProps({ title: 'Plain' }),
					reveal: makeReveal(),
					styles: makeStyles(),
				}) }</>
			)

			expect(container.querySelector('.style-inner')).not.toBeInTheDocument()
		})
	})
})
