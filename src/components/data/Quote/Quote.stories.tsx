import { expect, within } from 'storybook/test'
import { getDefaultProps } from '@/hooks/useProps'
import { Quote } from './Quote'
import type { ReactNode } from 'react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import moduleClasses from './Quote.module.scss'

const BOOLEAN_OPTIONS = [true, false] as const

const Row = ({ children }: { children: ReactNode }) => (
	<div style={ { display: 'flex', gap: 24, flexWrap: 'wrap' } }>
		{ children }
	</div>
)

const Group = ({ label, children }: { label: string, children: ReactNode }) => (
	<div style={ { display: 'flex', flexDirection: 'column', gap: 8 } }>
		<span style={ { font: 'var(--inkq-text-control)', letterSpacing: '.15em', textTransform: 'uppercase', opacity: 0.6 } }>
			{ label }
		</span>
		<div style={ { display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', width: 320 } }>
			{ children }
		</div>
	</div>
)

// `Quote.Props` (the `declare namespace` export) is just the raw
// `QuoteProps` interface — it doesn't include `as`/`unstyled`/`attributes`/
// etc., which only exist on the actual accepted prop type,
// `PolymorphicProps<QuoteProps, C>`. `Parameters<typeof Quote>[0]` reads
// that real, wrapped type straight off the component itself — the generic
// call signature's default `C` resolves to `'div'` here, since `QuoteSpecs`'s
// `defaults.as` is `'div'`.
type QuoteStoryProps = Parameters<typeof Quote>[0]
type Story = StoryObj<QuoteStoryProps>

const meta: Meta<QuoteStoryProps> = {
	component: Quote,
	title: 'Data/Quote',
	argTypes: {
		content: {
			control: 'text',
			description: 'Required. Rendered verbatim inside the `content` paragraph as `"{ content }"` — there is no `children` fallback in source.',
		},
		author: {
			control: 'text',
			description: 'The caption `<span>` (`styles(\'caption\', true)`) renders UNCONDITIONALLY — unlike `Timeline.Item`\'s sibling `title`, which is gated behind `{ title && (...) }`. With `author` omitted, an empty, classed `<span>` is still emitted to the DOM. See the `AuthorPresence` story, which documents this honestly (an empty element, not an absent one) rather than asserting it disappears.',
		},
		unstyled: {
			control: 'boolean',
			description: 'Part of `PolymorphicProps`, not `Quote`\'s own `QuoteProps`. The semantic base class is ALWAYS emitted for `root`/`rail`/`content` (`inkq-quote`, `inkq-quote__rail`, `inkq-quote__content`) regardless of this prop — `unstyled` only suppresses the CSS-module-hashed class normally appended alongside it, for each selector that actually has one (`root` and `content` have real declarations in `Quote.module.scss`; `rail` does not). Global-config classes (root\'s `item--block`, content\'s `h4`) and `caption`\'s literal `inkq-caption` boolean-config class have no CSS-module hash to suppress in the first place, so they survive `unstyled` unchanged too — see the `Unstyled` story.',
		},
	},
	args: {
		...getDefaultProps<Quote.Props>('Quote'),
		content: 'Design is not just what it looks like and feels like. Design is how it works.',
		author: 'Steve Jobs',
	},
}

export default meta

export const Default: Story = {
	play: async ({ canvasElement, args }) => {
		const canvas = within(canvasElement)

		await expect(canvas.getByText(`"${args.content}"`)).toBeInTheDocument()
		await expect(canvas.getByText(args.author as string)).toBeInTheDocument()
	},
}

// `author` is optional, but the caption `<span>` is rendered either way.
// "Without author" therefore means an EMPTY, still-present caption element,
// not a missing one.
export const AuthorPresence: Story = {
	parameters: { controls: { exclude: ['author'] } },
	render: (args) => (
		<Row>
			<Group label="with author">
				<Quote { ...args } author="Steve Jobs" />
			</Group>
			<Group label="without author">
				<Quote { ...args } author={ undefined } />
			</Group>
		</Row>
	),
	play: async ({ canvasElement, args }) => {
		const canvas = within(canvasElement),
			quotes = canvas.getAllByText(`"${args.content}"`)

		expect(quotes).toHaveLength(2)

		const [withAuthor, withoutAuthor] = quotes.map(
			quote => quote.closest('.inkq-quote') as HTMLElement
		)

		const withAuthorCaption = withAuthor.querySelector('.inkq-quote__caption'),
			withoutAuthorCaption = withoutAuthor.querySelector('.inkq-quote__caption')

		await expect(withAuthorCaption).toBeInTheDocument()
		await expect(withAuthorCaption).toHaveTextContent('Steve Jobs')

		// Present unconditionally — just empty, not removed from the DOM.
		await expect(withoutAuthorCaption).toBeInTheDocument()
		await expect(withoutAuthorCaption).toHaveTextContent('')
	},
}

export const AsElement: Story = {
	parameters: { layout: 'padded' },
	render: (args) => (
		<Row>
			<Group label='as="div" (default)'>
				<Quote { ...args } />
			</Group>
			<Group label='as="blockquote"'>
				<Quote { ...args } as="blockquote" />
			</Group>
		</Row>
	),
	play: async ({ canvasElement, args }) => {
		const canvas = within(canvasElement),
			quotes = canvas.getAllByText(`"${args.content}"`)

		expect(quotes).toHaveLength(2)

		const [asDiv, asBlockquote] = quotes.map(
			quote => quote.closest('.inkq-quote') as HTMLElement
		)

		await expect(asDiv.tagName).toBe('DIV')
		await expect(asBlockquote.tagName).toBe('BLOCKQUOTE')
	},
}

// `unstyled` does NOT remove any of `Quote`'s semantic base classes — per
// `getClassName.tsx`, the base class is now ALWAYS emitted. It only
// suppresses the CSS-module-hashed class normally appended alongside it, and
// only where a hash exists to suppress in the first place: `root` and
// `content` each have a real declaration in `Quote.module.scss`, but `rail`
// and `caption` (`&__rail`, `&__caption`) have NONE — so those two never
// carry a CSS-module hash, styled or unstyled alike.
//
// `root` and `content` ALSO each carry a literal global-config class from
// `styles('root', { global: { 'item--block': true } })` and
// `styles('content', { global: { h4: true } })` — `inkq-item--block` and
// `inkq-h4` respectively. Those global classes have no own SCSS declaration
// either, so — same as `rail`/`caption`'s boolean-config classes — they
// survive `unstyled` too: `getConfigClasses` falls back to the literal class
// name whenever no hash exists to suppress.
export const Unstyled: Story = {
	parameters: { controls: { exclude: ['unstyled'] } },
	render: (args) => (
		<Row>
			{ BOOLEAN_OPTIONS.map(unstyled => (
				<Group key={ String(unstyled) } label={ String(unstyled) }>
					<Quote { ...args } unstyled={ unstyled } />
				</Group>
			)) }
		</Row>
	),
	play: async ({ canvasElement, args }) => {
		const canvas = within(canvasElement),
			quotes = canvas.getAllByText(`"${args.content}"`)

		expect(quotes).toHaveLength(2)

		const [unstyledRoot, styledRoot] = quotes.map(
			quote => quote.closest('.inkq-quote') as HTMLElement
		)

		const hasModuleClass = (el: Element, base: string) => {
			const moduleClass = (moduleClasses as Record<string, string>)[base]
			return !!moduleClass && el.classList.contains(moduleClass)
		}

		// root — base class, hashed module class, and the `item--block`
		// global-config class (unhashed, always present).
		await expect(styledRoot).toHaveClass('inkq-quote', 'inkq-item--block')
		await expect(unstyledRoot).toHaveClass('inkq-quote', 'inkq-item--block')
		expect(hasModuleClass(styledRoot, 'inkq-quote')).toBe(true)
		expect(hasModuleClass(unstyledRoot, 'inkq-quote')).toBe(false)

		// rail — no own SCSS declaration, so no hash exists to suppress.
		const styledRail = styledRoot.querySelector('.inkq-quote__rail') as HTMLElement,
			unstyledRail = unstyledRoot.querySelector('.inkq-quote__rail') as HTMLElement

		await expect(styledRail).toHaveClass('inkq-quote__rail')
		await expect(unstyledRail).toHaveClass('inkq-quote__rail')
		expect(hasModuleClass(styledRail, 'inkq-quote__rail')).toBe(false)
		expect(hasModuleClass(unstyledRail, 'inkq-quote__rail')).toBe(false)

		// content — base class, hashed module class, and the `h4`
		// global-config class (unhashed, always present).
		const styledContent = styledRoot.querySelector('.inkq-quote__content') as HTMLElement,
			unstyledContent = unstyledRoot.querySelector('.inkq-quote__content') as HTMLElement

		await expect(styledContent).toHaveClass('inkq-quote__content', 'inkq-h4')
		await expect(unstyledContent).toHaveClass('inkq-quote__content', 'inkq-h4')
		expect(hasModuleClass(styledContent, 'inkq-quote__content')).toBe(true)
		expect(hasModuleClass(unstyledContent, 'inkq-quote__content')).toBe(false)

		// caption — no own SCSS declaration, so no hash exists to suppress in
		// the first place; both classes survive `unstyled` unchanged.
		const styledCaption = styledRoot.querySelector('.inkq-quote__caption') as HTMLElement,
			unstyledCaption = unstyledRoot.querySelector('.inkq-quote__caption') as HTMLElement

		await expect(styledCaption).toHaveClass('inkq-quote__caption', 'inkq-caption')
		await expect(unstyledCaption).toHaveClass('inkq-quote__caption', 'inkq-caption')
	},
}
