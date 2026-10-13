import { Component } from 'react'
import { expect, userEvent, within } from 'storybook/test'
import { getDefaultProps } from '@/hooks/useProps'
import { Accordion } from '../Accordion'
import { BOOLEAN_OPTIONS, LAYOUT_OPTIONS, SIZE_OPTIONS } from '../options.story'
import type { ReactNode } from 'react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import classes from '../Accordion.module.scss'

const Row = ({ children }: { children: ReactNode }) => (
	<div style={ { display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'flex-start' } }>
		{ children }
	</div>
)

const Group = ({ label, children }: { label: string, children: ReactNode }) => (
	<div style={ { display: 'flex', flexDirection: 'column', gap: 8, width: 320 } }>
		<span style={ { font: 'var(--inkq-text-control)', letterSpacing: '.15em', textTransform: 'uppercase', opacity: 0.6 } }>
			{ label }
		</span>
		{ children }
	</div>
)

// Local-only class error boundary (not a source-file change — this never
// leaves the stories file) used purely to demonstrate `AccordionContent`'s
// required-context guard without crashing the whole story canvas: a raw,
// uncaught render throw would take down every other group rendered in the
// same story, not just the misuse case.
interface ErrorBoundaryState {
	message?: string
}

class RenderErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
	state: ErrorBoundaryState = {}

	static getDerivedStateFromError(error: Error): ErrorBoundaryState {
		return { message: error.message }
	}

	render() {
		if (this.state.message)
			return <span data-testid="accordion-content-error">{ this.state.message }</span>
		return this.props.children
	}
}

// `AccordionContent.Props` (the `declare namespace` export) is just the raw
// `AccordionContentProps` interface — it doesn't include `unstyled`/
// `attributes`/etc., which only exist on the actual accepted prop type,
// `PolymorphicProps<AccordionContentProps, C>`. `Parameters<typeof
// Accordion.Content>[0]` reads that real, wrapped type straight off the
// component itself — `AccordionContentSpecs`'s `isCompound: true` makes `as`
// resolve to `never` (compound components don't take a tag override), so
// this also correctly excludes `as` from the story's own controls.
type AccordionContentStoryProps = Parameters<typeof Accordion.Content>[0]
type Story = StoryObj<AccordionContentStoryProps>

// `AccordionContent` hard-throws (`useAccordionCtx`) unless it's rendered
// inside a real `<Accordion>` — and `Accordion` itself only renders its
// title/content pair at all when BOTH an `Accordion.Title` and an
// `Accordion.Content` are present among its children (`buildAccordion`
// returns `null` otherwise), so every story wraps the content under test in
// a full, valid `<Accordion>` with a real `Accordion.Title` sibling.
// `Accordion.Props` (the raw `declare namespace` export) doesn't include
// `unstyled`/`attributes`/etc., which only exist on the actual accepted
// prop type — `Parameters<typeof Accordion>[0]` reads that real, wrapped
// type straight off the component itself, same reasoning as
// `AccordionContentStoryProps` above.
type AccordionWrapperProps = Parameters<typeof Accordion>[0]

const contentTemplate = (
	args: AccordionContentStoryProps,
	accordionProps: AccordionWrapperProps = { children: null }
) => (
	<Accordion { ...accordionProps }>
		<Accordion.Title>What is your refund policy?</Accordion.Title>
		<Accordion.Content { ...args } />
	</Accordion>
)

const meta: Meta<AccordionContentStoryProps> = {
	component: Accordion.Content,
	title: 'Data/Accordion/Accordion.Content',
	render: args => contentTemplate(args),
	argTypes: {
		children: {
			control: 'text',
			description: 'Required. Rendered inside nested `styles(\'inner\')`/`styles(\'wrapper\')` divs — the outer `styles(\'root\')` element carries `role="region"` and `aria-labelledby` unconditionally, regardless of open state.',
		},
		unstyled: {
			control: 'boolean',
			description: 'Part of `PolymorphicProps` (via the shared `FactoryContract`), not `AccordionContent`\'s own `AccordionContentProps`. Read purely off `AccordionContent`\'s OWN props (`useProps(_props)`) — unlike `Accordion`, it does NOT inherit `unstyled` from the wrapping `Accordion`\'s context (the context is read for `idx`/`isOpen` and, for tokens, `size`/`step`, never `unstyled`). The semantic base classes (`inkq-accordion-content`, `inkq-accordion-content__inner`, `inkq-accordion-content__wrapper`) are ALWAYS emitted regardless of this prop. `unstyled` drops the CSS-module-hashed class normally appended alongside each, plus the global `inkq-prose` config class on the root and the root\'s `--accordion-content-size`/`--accordion-content-indent` tokens. See the `Unstyled` story.',
		},
	},
	args: {
		...getDefaultProps<Accordion.Content.Props>('Accordion.Content'),
		children: 'We offer a 30-day money-back guarantee on all plans, no questions asked.',
	},
}

export default meta

export const Default: Story = {}

// `inert` (not visibility/display) is the real "is it interactive" signal:
// set on the WRAPPER div (`styles('wrapper')`, the root's first child), not
// the `role="region"` root — `!isOpen || undefined`, so it's entirely absent
// when open.
export const Inert: Story = {
	parameters: { layout: 'padded' },
	render: args => (
		<Row>
			{ BOOLEAN_OPTIONS.map(open => (
				<Group key={ String(open) } label={ `open: ${ String(open) }` }>
					{ contentTemplate(args, { children: null, open }) }
				</Group>
			)) }
		</Row>
	),
	play: async ({ canvasElement }) => {
		const regions = canvasElement.querySelectorAll('[role="region"]')

		expect(regions).toHaveLength(2)
		const [openRegion, closedRegion] = regions

		const openInner = openRegion.firstElementChild,
			closedInner = closedRegion.firstElementChild

		await expect(openInner).not.toHaveAttribute('inert')
		await expect(closedInner).toHaveAttribute('inert')
	},
}

// Assert the RELATIONSHIP to the sibling title, never a literal generated id
// (`useId()` output is unstable).
export const AccessibleAttributes: Story = {
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			title = canvas.getByRole('button'),
			content = canvasElement.querySelector('[role="region"]') as HTMLElement

		await expect(content).toHaveAttribute('role', 'region')
		await expect(content).toHaveAttribute('aria-labelledby', title.id)
		await expect(title).toHaveAttribute('aria-controls', content.id)
	},
}

export const KeyboardToggle: Story = {
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			title = canvas.getByRole('button'),
			content = canvasElement.querySelector('[role="region"]') as HTMLElement,
			wrapper = content.firstElementChild as HTMLElement

		await expect(wrapper).toHaveAttribute('inert')

		await userEvent.click(title)
		await expect(wrapper).not.toHaveAttribute('inert')

		await userEvent.click(title)
		await expect(wrapper).toHaveAttribute('inert')
	},
}

// The root carries the global `inkq-prose` class (the `prose` global name,
// prefixed like every other global class) so rich content gets prose
// typography.
export const Prose: Story = {
	play: async ({ canvasElement }) => {
		const content = canvasElement.querySelector('[role="region"]') as HTMLElement

		await expect(content).toHaveClass('inkq-prose')
	},
}

// `--accordion-content-size` is derived from the wrapping `Accordion`'s
// `size`: `sm` uses the plain body size, every other size the larger body
// size — so `md` and `lg` match each other and differ from `sm`. Compared
// relative to each other rather than against hardcoded token strings.
// `--accordion-content-indent` is only set for `layout="steps"`, where it
// lines the content up under the title text (past the step column and gap);
// otherwise it is unset and the stylesheet's own fallback applies.
export const Tokens: Story = {
	parameters: { layout: 'padded' },
	render: args => (
		<Row>
			{ SIZE_OPTIONS.map(size => (
				<Group key={ size } label={ `size: ${ size }` }>
					{ contentTemplate(args, { children: null, size }) }
				</Group>
			)) }
			{ LAYOUT_OPTIONS.map(layout => (
				<Group key={ layout } label={ `layout: ${ layout }` }>
					{ contentTemplate(args, { children: null, layout }) }
				</Group>
			)) }
		</Row>
	),
	play: async ({ canvasElement }) => {
		const regions = [...canvasElement.querySelectorAll<HTMLElement>('[role="region"]')]

		expect(regions).toHaveLength(SIZE_OPTIONS.length + LAYOUT_OPTIONS.length)

		const read = (region: HTMLElement, token: string) => region.style.getPropertyValue(token)

		// `SIZE_OPTIONS` is `['sm', 'md', 'lg']`, then `LAYOUT_OPTIONS` is
		// `['default', 'steps']`, mapped in order.
		const [sm, md, lg, defaultLayout, stepsLayout] = regions

		await expect(read(sm, '--accordion-content-size')).not.toBe('')
		await expect(read(md, '--accordion-content-size')).not.toBe('')
		await expect(read(sm, '--accordion-content-size')).not.toBe(read(md, '--accordion-content-size'))
		await expect(read(lg, '--accordion-content-size')).toBe(read(md, '--accordion-content-size'))

		await expect(read(defaultLayout, '--accordion-content-indent')).toBe('')
		await expect(read(stepsLayout, '--accordion-content-indent'))
			.toBe('calc(var(--accordion-column-width) + var(--accordion-gap))')
	},
}

// `withInlineWrap(children)` wraps the content in a `<p>` only when EVERY
// child is inline: plain text, a number, or an inline tag such as `strong`
// or `a`. A single block-level child (here a `div`), or a mix of inline and
// block, is left as written. (Children are passed as arrays rather than
// Fragments: a Fragment counts as one non-inline child.)
export const InlineWrap: Story = {
	parameters: { layout: 'padded' },
	render: args => (
		<Row>
			<Group label="text only">
				{ contentTemplate({ ...args, children: 'Plain text content.' }, { children: null, defaultOpen: true }) }
			</Group>
			<Group label="text + inline tag">
				{ contentTemplate({ ...args, children: ['Text with ', <strong key="strong">strong</strong>, ' inline.'] }, { children: null, defaultOpen: true }) }
			</Group>
			<Group label="block child">
				{ contentTemplate({ ...args, children: <div>Block content.</div> }, { children: null, defaultOpen: true }) }
			</Group>
			<Group label="text + block child">
				{ contentTemplate({ ...args, children: ['Text next to ', <div key="block">a block.</div>] }, { children: null, defaultOpen: true }) }
			</Group>
		</Row>
	),
	play: async ({ canvasElement }) => {
		const regions = [...canvasElement.querySelectorAll<HTMLElement>('[role="region"]')]

		expect(regions).toHaveLength(4)

		const inner = (region: HTMLElement) =>
			region.firstElementChild!.firstElementChild as HTMLElement

		const [textOnly, textInline, block, textBlock] = regions

		await expect(inner(textOnly).firstElementChild?.tagName).toBe('P')
		await expect(inner(textInline).firstElementChild?.tagName).toBe('P')
		await expect(inner(textInline).querySelector('p > strong')).toBeInTheDocument()

		await expect(inner(block).firstElementChild?.tagName).toBe('DIV')
		await expect(inner(block).querySelector('p')).not.toBeInTheDocument()
		await expect(inner(textBlock).querySelector('p')).not.toBeInTheDocument()
	},
}

// `unstyled` is `AccordionContent`'s OWN prop, read straight off its own
// `_props` via `useProps` — unlike `Accordion` (which merges an enclosing
// `Accordion.Group`'s context), `AccordionContent` pulls `idx`/`isOpen`
// (and, for its tokens, `size`/`step`) off `Accordion.context`
// (`useAccordionCtx`), never `unstyled`. So it must be set directly on
// `AccordionContent` itself here, NOT on the wrapping `Accordion` (which has
// no effect on it at all).
//
// It does NOT remove `AccordionContent`'s own semantic base classes
// (`inkq-accordion-content`, `inkq-accordion-content__inner`,
// `inkq-accordion-content__wrapper`) — per `getClassName.tsx`, the base
// class is ALWAYS emitted. It does suppress the CSS-module hashed class
// normally appended alongside it, for every selector this component styles —
// asserted here against the REAL compiled export map
// (`Accordion.module.scss`), not a literal hash or an "any extra class"
// heuristic. It also drops the root's global `inkq-prose` config class and
// its tokens (`getStyle.tsx`): `--accordion-content-size` is set on the
// styled root and absent on the unstyled one.
export const Unstyled: Story = {
	parameters: {
		layout: 'padded',
		controls: { exclude: ['unstyled'] },
	},
	render: args => (
		<Row>
			{ BOOLEAN_OPTIONS.map(unstyled => (
				<Group key={ String(unstyled) } label={ String(unstyled) }>
					{ contentTemplate({ ...args, unstyled }, { children: null, defaultOpen: true }) }
				</Group>
			)) }
		</Row>
	),
	play: async ({ canvasElement }) => {
		const regions = canvasElement.querySelectorAll('[role="region"]')

		expect(regions).toHaveLength(2)
		const [unstyledRoot, styledRoot] = regions as unknown as [HTMLElement, HTMLElement]

		await expect(styledRoot).toHaveClass('inkq-accordion-content')
		await expect(unstyledRoot).toHaveClass('inkq-accordion-content')

		const rootHash = classes['inkq-accordion-content']!
		expect(styledRoot.classList.contains(rootHash)).toBe(true)
		expect(unstyledRoot.classList.contains(rootHash)).toBe(false)

		// Global config classes (`inkq-prose`) are dropped too when unstyled.
		await expect(styledRoot).toHaveClass('inkq-prose')
		await expect(unstyledRoot).not.toHaveClass('inkq-prose')

		// Tokens are dropped too.
		await expect(styledRoot.style.getPropertyValue('--accordion-content-size')).not.toBe('')
		await expect(unstyledRoot.style.getPropertyValue('--accordion-content-size')).toBe('')

		// Nesting is root > wrapper > inner. The `wrapper` is the element
		// `AccordionContent.tsx` puts `inert` on while closed; `inner` holds
		// the actual content.
		const styledWrapper = styledRoot.firstElementChild as HTMLElement,
			unstyledWrapper = unstyledRoot.firstElementChild as HTMLElement

		await expect(styledWrapper).toHaveClass('inkq-accordion-content__wrapper')
		await expect(unstyledWrapper).toHaveClass('inkq-accordion-content__wrapper')

		const wrapperHash = classes['inkq-accordion-content__wrapper']!
		expect(styledWrapper.classList.contains(wrapperHash)).toBe(true)
		expect(unstyledWrapper.classList.contains(wrapperHash)).toBe(false)

		const styledInner = styledWrapper.firstElementChild as HTMLElement,
			unstyledInner = unstyledWrapper.firstElementChild as HTMLElement

		await expect(styledInner).toHaveClass('inkq-accordion-content__inner')
		await expect(unstyledInner).toHaveClass('inkq-accordion-content__inner')

		const innerHash = classes['inkq-accordion-content__inner']!
		expect(styledInner.classList.contains(innerHash)).toBe(true)
		expect(unstyledInner.classList.contains(innerHash)).toBe(false)
	},
}

// `useAccordionCtx(NAME)` (`createCompoundCtx`'s REQUIRED reader, not the
// optional `useSafeRootCtx`) throws the instant `AccordionContent` is
// rendered with no wrapping `Accordion` at all, rather than silently
// rendering unstyled/inert. A raw, uncaught render throw would crash every
// other group in this story, so the misuse case is wrapped in a local
// (stories-file-only, not a source change) `RenderErrorBoundary` purely to
// demonstrate/assert the guard's error message without taking down the
// whole canvas.
export const RequiresAccordionParent: Story = {
	parameters: { layout: 'padded' },
	render: args => (
		<Row>
			<Group label="inside an Accordion (valid)">
				{ contentTemplate(args) }
			</Group>
			<Group label="standalone — throws (guarded by useAccordionCtx)">
				<RenderErrorBoundary>
					<Accordion.Content>{ args.children }</Accordion.Content>
				</RenderErrorBoundary>
			</Group>
		</Row>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)

		const validContent = canvasElement.querySelector('[role="region"]')
		await expect(validContent).toBeInTheDocument()

		const errorFallback = await canvas.findByTestId('accordion-content-error')
		await expect(errorFallback).toHaveTextContent('<Accordion.Content /> must be a direct child of <Accordion>')
	},
}
