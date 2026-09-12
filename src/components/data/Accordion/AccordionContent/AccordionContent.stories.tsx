import { Accordion } from '../Accordion'
import { AccordionContent } from './AccordionContent'
import { BOOLEAN_OPTIONS } from '../options.story'
import { Component } from 'react'
import { expect, userEvent, within } from 'storybook/test'
import classes from '../Accordion.module.scss'
import type { ReactNode } from 'react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

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
// AccordionContent>[0]` reads that real, wrapped type straight off the
// component itself — `AccordionContentSpecs`'s `isCompound: true` makes `as`
// resolve to `never` (compound components don't take a tag override), so
// this also correctly excludes `as` from the story's own controls.
type AccordionContentStoryProps = Parameters<typeof AccordionContent>[0]
type Story = StoryObj<AccordionContentStoryProps>

// `AccordionContent` hard-throws (`useAccordionCxt`) unless it's rendered
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
		<AccordionContent { ...args } />
	</Accordion>
)

const meta: Meta<AccordionContentStoryProps> = {
	component: AccordionContent,
	title: 'Data/Accordion/Accordion.Content',
	render: args => contentTemplate(args),
	argTypes: {
		children: {
			control: 'text',
			description: 'Required. Rendered inside nested `styles(\'inner\')`/`styles(\'wrapper\')` divs — the outer `styles(\'root\')` element carries `role="region"` and `aria-labelledby` unconditionally, regardless of open state.',
		},
		unstyled: {
			control: 'boolean',
			description: 'Part of `PolymorphicProps` (via the shared `SpecsContract`), not `AccordionContent`\'s own `AccordionContentProps`. Read purely off `AccordionContent`\'s OWN props (`useProps(NAME, _props)`) — unlike `Accordion`, it does NOT inherit `unstyled` from the wrapping `Accordion`\'s context (`useAccordionCxt` only ever destructures `idx`/`isOpen` here). The semantic base classes (`inkq-accordion-content`, `inkq-accordion-content__inner`, `inkq-accordion-content__wrapper`) are ALWAYS emitted regardless of this prop — it only suppresses the CSS-module-hashed class normally appended alongside each. See the `Unstyled` story.',
		},
	},
	args: {
		children: 'We offer a 30-day money-back guarantee on all plans, no questions asked.',
	},
}

export default meta

export const Default: Story = {}

// `inert` (not visibility/display) is the real "is it interactive" signal:
// set on the INNER div (`styles('inner')`), not the `role="region"` root —
// `!isOpen || undefined`, so it's entirely absent when open.
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
			inner = content.firstElementChild as HTMLElement

		await expect(inner).toHaveAttribute('inert')

		await userEvent.click(title)
		await expect(inner).not.toHaveAttribute('inert')

		await userEvent.click(title)
		await expect(inner).toHaveAttribute('inert')
	},
}

// `unstyled` is `AccordionContent`'s OWN prop, read straight off its own
// `_props` via `useProps` — unlike `Accordion` (which merges an enclosing
// `Accordion.Group`'s context), `AccordionContent` only pulls `idx`/`isOpen`
// off `Accordion.context` (`useAccordionCxt`), never `unstyled`. So it must
// be set directly on `AccordionContent` itself here, NOT on the wrapping
// `Accordion` (which has no effect on it at all).
//
// It does NOT remove `AccordionContent`'s own semantic base classes
// (`inkq-accordion-content`, `inkq-accordion-content__inner`,
// `inkq-accordion-content__wrapper`) — per `getClassName.tsx`, the base
// class is now ALWAYS emitted. It only suppresses the CSS-module hashed
// class normally appended alongside it, for every selector this component
// styles — asserted here against the REAL compiled export map
// (`Accordion.module.scss`), not a literal hash or an "any extra class"
// heuristic.
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

		const styledInner = styledRoot.firstElementChild as HTMLElement,
			unstyledInner = unstyledRoot.firstElementChild as HTMLElement

		await expect(styledInner).toHaveClass('inkq-accordion-content__inner')
		await expect(unstyledInner).toHaveClass('inkq-accordion-content__inner')

		const innerHash = classes['inkq-accordion-content__inner']!
		expect(styledInner.classList.contains(innerHash)).toBe(true)
		expect(unstyledInner.classList.contains(innerHash)).toBe(false)

		const styledWrapper = styledInner.firstElementChild as HTMLElement,
			unstyledWrapper = unstyledInner.firstElementChild as HTMLElement

		await expect(styledWrapper).toHaveClass('inkq-accordion-content__wrapper')
		await expect(unstyledWrapper).toHaveClass('inkq-accordion-content__wrapper')

		const wrapperHash = classes['inkq-accordion-content__wrapper']!
		expect(styledWrapper.classList.contains(wrapperHash)).toBe(true)
		expect(unstyledWrapper.classList.contains(wrapperHash)).toBe(false)
	},
}

// `useAccordionCxt(NAME)` (`createRootCxt`'s REQUIRED reader, not the
// optional `useSafeRootCxt`) throws the instant `AccordionContent` is
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
			<Group label="standalone — throws (guarded by useAccordionCxt)">
				<RenderErrorBoundary>
					<AccordionContent>{ args.children }</AccordionContent>
				</RenderErrorBoundary>
			</Group>
		</Row>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)

		const validContent = canvasElement.querySelector('[role="region"]')
		await expect(validContent).toBeInTheDocument()

		const errorFallback = await canvas.findByTestId('accordion-content-error')
		await expect(errorFallback).toHaveTextContent('<AccordionContent /> must be rendered inside <Accordion>')
	},
}
