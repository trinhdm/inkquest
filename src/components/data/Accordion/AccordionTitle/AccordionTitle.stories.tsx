import { Component } from 'react'
import { expect, userEvent, within } from 'storybook/test'
import { getDefaultProps } from '@/hooks/useProps'
import { Accordion } from '../Accordion'
import { BOOLEAN_OPTIONS, INDICATOR_OPTIONS, ORDER_OPTIONS } from '../options.story'
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
// leaves the stories file) used purely to demonstrate `AccordionTitle`'s
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
			return <span data-testid="accordion-title-error">{ this.state.message }</span>
		return this.props.children
	}
}

// `AccordionTitle.Props` (the `declare namespace` export) is just the raw
// `AccordionTitleProps` interface — it doesn't include `unstyled`/
// `attributes`/etc., which only exist on the actual accepted prop type,
// `PolymorphicProps<AccordionTitleProps, C>`. `Parameters<typeof
// Accordion.Title>[0]` reads that real, wrapped type straight off the
// component itself — `AccordionTitleSpecs`'s `isCompound: true` makes `as`
// resolve to `never` (compound components don't take a tag override), so
// this also correctly excludes `as` from the story's own controls.
type AccordionTitleStoryProps = Parameters<typeof Accordion.Title>[0]
type Story = StoryObj<AccordionTitleStoryProps>

// `AccordionTitle` hard-throws (`useAccordionCtx`) unless it's rendered
// inside a real `<Accordion>` — and `Accordion` itself only renders its
// title/content pair at all when BOTH an `Accordion.Title` and an
// `Accordion.Content` are present among its children (`buildAccordion`
// returns `null` otherwise), so every story wraps the title under test in a
// full, valid `<Accordion>` with a real `Accordion.Content` sibling.
// `Accordion.Props` (the raw `declare namespace` export) doesn't include
// `unstyled`/`attributes`/etc., which only exist on the actual accepted
// prop type — `Parameters<typeof Accordion>[0]` reads that real, wrapped
// type straight off the component itself, same reasoning as
// `AccordionTitleStoryProps` above.
type AccordionWrapperProps = Parameters<typeof Accordion>[0]

const titleTemplate = (
	args: AccordionTitleStoryProps,
	accordionProps: AccordionWrapperProps = { children: null }
) => (
	<Accordion { ...accordionProps }>
		<Accordion.Title { ...args } />
		<Accordion.Content>Refunds are processed within 5 business days of approval.</Accordion.Content>
	</Accordion>
)

const meta: Meta<AccordionTitleStoryProps> = {
	component: Accordion.Title,
	title: 'Data/Accordion/Accordion.Title',
	render: args => titleTemplate(args),
	argTypes: {
		children: {
			control: 'text',
			description: 'Required. Rendered inside a `styles(\'text\')` `<span>`, alongside the optional `step` label and indicator icon.',
		},
		unstyled: {
			control: 'boolean',
			description: 'Part of `PolymorphicProps` (via the shared `FactoryContract`), not `AccordionTitle`\'s own `AccordionTitleProps`. Read purely off `AccordionTitle`\'s OWN props (`useProps(_props)`) — `useAccordionCtx(NAME)` only ever destructures `collapsible`/`disabled`/`handleToggle`/`idx`/`indicator`/`isOpen`/`order`/`step` here, never `unstyled`, so it does NOT inherit from the wrapping `Accordion`\'s context and must be set directly on `Accordion.Title` itself. The semantic base classes (`inkq-accordion-title`, `inkq-accordion-title__step`, `inkq-accordion-title__text`, `inkq-accordion-title__indicator`) are ALWAYS emitted regardless of this prop. `unstyled` drops the CSS-module-hashed class normally appended alongside each, plus: the config classes (the `inkq-h${order}` global class on the text `<span>`, and the `--plus`/`--chevron` modifier on the indicator `<span>`), the `--accordion-title-indent` token, and — because it is also forwarded to the title\'s `Box` — the non-state `data-*` attributes (`data-title`, `data-open`). See the `Unstyled` story.',
		},
	},
	args: {
		...getDefaultProps<Accordion.Title.Props>('Accordion.Title'),
		children: 'What is your refund policy?',
	},
}

export default meta

export const Default: Story = {}

// `indicator` isn't `AccordionTitle`'s own prop — it's read off the
// `Accordion.context` value published by the wrapping `<Accordion>`, so each
// group here varies the WRAPPING `Accordion`'s `indicator`, not the title
// itself.
export const Indicators: Story = {
	parameters: { layout: 'padded' },
	render: args => (
		<Row>
			{ INDICATOR_OPTIONS.map(indicator => (
				<Group key={ indicator } label={ indicator }>
					{ titleTemplate(args, { children: null, indicator }) }
				</Group>
			)) }
		</Row>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			titles = canvas.getAllByRole('button')

		expect(titles).toHaveLength(3)
		const [chevron, plus, none] = titles

		await expect(chevron.querySelector('svg')).toBeInTheDocument()
		await expect(plus.querySelector('svg')).toBeInTheDocument()
		await expect(none.querySelector('svg')).not.toBeInTheDocument()
	},
}

// `step` (from context) only renders a `styles('step')` `<span>` when the
// wrapping `Accordion`'s `layout` is `'steps'` — otherwise it's entirely
// absent, regardless of `index`.
export const Step: Story = {
	parameters: { layout: 'padded' },
	render: args => (
		<Row>
			<Group label="layout: default (no step)">
				{ titleTemplate(args, { children: null, layout: 'default', index: 0 }) }
			</Group>
			<Group label="layout: steps (step 01)">
				{ titleTemplate(args, { children: null, layout: 'steps', index: 0 }) }
			</Group>
		</Row>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			titles = canvas.getAllByRole('button')

		await expect(titles[0].querySelector('[class*="step"]')).not.toBeInTheDocument()
		await expect(titles[1].querySelector('[class*="step"]')).toHaveTextContent('01')
	},
}

// With the `steps` layout the title also sets `--accordion-title-indent: 0`
// on its own root (the step label sits first, so the text needs no extra
// left margin); with the default layout the token is not set at all.
// `Accordion` sets `--accordion-step-size` on ITS root, and only for
// `layout="steps"`. The wrapping `Accordion` here gets no `onItemToggle`, so
// it computes its own shared tokens (a function `onItemToggle` would skip
// them).
export const StepTokens: Story = {
	parameters: { layout: 'padded' },
	render: args => (
		<Row>
			<Group label="layout: default">
				{ titleTemplate(args, { children: null, layout: 'default' }) }
			</Group>
			<Group label="layout: steps">
				{ titleTemplate(args, { children: null, layout: 'steps' }) }
			</Group>
		</Row>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			titles = canvas.getAllByRole('button'),
			roots = canvasElement.querySelectorAll<HTMLElement>('.inkq-accordion')

		expect(titles).toHaveLength(2)
		expect(roots).toHaveLength(2)

		const [defaultTitle, stepsTitle] = titles,
			[defaultRoot, stepsRoot] = roots

		await expect(defaultTitle.style.getPropertyValue('--accordion-title-indent')).toBe('')
		await expect(stepsTitle.style.getPropertyValue('--accordion-title-indent')).toBe('0')

		await expect(defaultRoot.style.getPropertyValue('--accordion-step-size')).toBe('')
		await expect(stepsRoot.style.getPropertyValue('--accordion-step-size')).not.toBe('')
	},
}

// `id`/`aria-controls`/`aria-expanded`/`data-title` all come straight off
// `Accordion.context` (`idx`, `isOpen`) — assert the RELATIONSHIP to the
// sibling content, never a literal generated id (`useId()` output is
// unstable).
export const AccessibleAttributes: Story = {
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			title = canvas.getByRole('button'),
			content = canvasElement.querySelector('[role="region"]') as HTMLElement

		await expect(title).toHaveAttribute('data-title')
		await expect(title).toHaveAttribute('type', 'button')
		await expect(title).toHaveAttribute('aria-expanded', 'false')
		await expect(title).toHaveAttribute('aria-controls', content.id)
		await expect(content).toHaveAttribute('aria-labelledby', title.id)
	},
}

export const Clickable: Story = {
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			title = canvas.getByRole('button')

		await expect(title).toHaveAttribute('aria-expanded', 'false')
		await expect(title).not.toHaveAttribute('data-open')

		await userEvent.click(title)
		await expect(title).toHaveAttribute('aria-expanded', 'true')
		await expect(title).toHaveAttribute('data-open')

		await userEvent.click(title)
		await expect(title).toHaveAttribute('aria-expanded', 'false')
		await expect(title).not.toHaveAttribute('data-open')
	},
}

export const KeyboardActivation: Story = {
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			title = canvas.getByRole('button')

		await expect(title).not.toHaveFocus()

		await userEvent.tab()
		await expect(title).toHaveFocus()

		await userEvent.keyboard('{Enter}')
		await expect(title).toHaveAttribute('aria-expanded', 'true')

		await userEvent.keyboard(' ')
		await expect(title).toHaveAttribute('aria-expanded', 'false')

		title.blur()
		await expect(title).not.toHaveFocus()
	},
}

// `handleKeyDown` scopes to `event.currentTarget.closest('[data-group]')` —
// only an `Accordion.Group` renders that attribute, so roving nav
// (`ArrowDown`/`ArrowUp` with wrap-around, `Home`, `End`) only works when
// the title is rendered inside one. Outside a group, `handleKeyDown` returns
// immediately (no `[data-group]` ancestor).
export const KeyboardFocus: Story = {
	render: () => (
		<Accordion.Group defaultOpen={ 0 }>
			<Accordion>
				<Accordion.Title>First</Accordion.Title>
				<Accordion.Content>First content.</Accordion.Content>
			</Accordion>
			<Accordion>
				<Accordion.Title>Second</Accordion.Title>
				<Accordion.Content>Second content.</Accordion.Content>
			</Accordion>
			<Accordion>
				<Accordion.Title>Third</Accordion.Title>
				<Accordion.Content>Third content.</Accordion.Content>
			</Accordion>
		</Accordion.Group>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			titles = canvas.getAllByRole('button')

		expect(titles).toHaveLength(3)
		const [first, second, third] = titles

		await userEvent.tab()
		await expect(first).toHaveFocus()

		await userEvent.keyboard('{ArrowDown}')
		await expect(second).toHaveFocus()

		// Wraps from the LAST title back to the FIRST.
		await userEvent.keyboard('{ArrowDown}')
		await userEvent.keyboard('{ArrowDown}')
		await expect(first).toHaveFocus()

		// Wraps backward from the FIRST title to the LAST.
		await userEvent.keyboard('{ArrowUp}')
		await expect(third).toHaveFocus()

		await userEvent.keyboard('{Home}')
		await expect(first).toHaveFocus()

		await userEvent.keyboard('{End}')
		await expect(third).toHaveFocus()
	},
}

// `disabled` (read off `Accordion.context`, published by the wrapping
// `<Accordion>`) is rendered as a NATIVE `disabled` attribute on the title
// `<button>` — genuinely unfocusable/untabbable, not just a `handleToggle`
// guard, though that guard is still there as a second line of defense.
export const DisabledParent: Story = {
	render: args => titleTemplate(args, { children: null, disabled: true }),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			title = canvas.getByRole('button')

		await expect(title).toHaveAttribute('disabled')
		await expect(title).toHaveAttribute('aria-expanded', 'false')

		await userEvent.tab()
		await expect(title).not.toHaveFocus()

		await userEvent.click(title)
		await expect(title).toHaveAttribute('aria-expanded', 'false')
	},
}

// `unstyled` is `AccordionTitle`'s OWN prop, read straight off its own
// `_props` via `useProps` — `useAccordionCtx(NAME)` only ever destructures
// `collapsible`/`disabled`/`handleToggle`/`idx`/`indicator`/`isOpen`/`order`/
// `step` off `Accordion.context`, never `unstyled`, so it must be set directly on
// `Accordion.Title` itself here, NOT on the wrapping `Accordion` (which has
// no effect on it at all).
//
// It does NOT remove `AccordionTitle`'s own semantic base classes
// (`inkq-accordion-title`, `inkq-accordion-title__step`,
// `inkq-accordion-title__text`, `inkq-accordion-title__indicator`) — per
// `getClassName.tsx`, the base class is ALWAYS emitted. It does suppress the
// CSS-module hashed class normally appended alongside it, for every selector
// this component styles — asserted here against the REAL compiled export map
// (`Accordion.module.scss`), not a literal hash or an "any extra class"
// heuristic. Beyond that it also drops:
//  - the config classes: the `inkq-h${order}` global class on the text
//    `<span>` and the `--plus` modifier on the indicator `<span>`
//    (`getClassName.tsx`);
//  - the `--accordion-title-indent` token (`getStyle.tsx`);
//  - the non-state `data-*` attributes (`data-title`, `data-open`), because
//    `AccordionTitle` forwards `unstyled` on to its `Box`
//    (`buildAttributes.ts`).
// The wrapping `Accordion` is given `layout: 'steps'` (so the `step` `<span>`
// and the indent token exist) and `defaultOpen: true` (so there is a
// `data-open` to drop), and keeps its registered default `indicator: 'plus'`
// (so the indicator `<span>` renders too) — all four selectors have real SCSS
// declarations, so suppression is genuinely observable on every one.
export const Unstyled: Story = {
	parameters: {
		layout: 'padded',
		controls: { exclude: ['unstyled'] },
	},
	render: args => (
		<Row>
			{ BOOLEAN_OPTIONS.map(unstyled => (
				<Group key={ String(unstyled) } label={ String(unstyled) }>
					{ titleTemplate({ ...args, unstyled }, { children: null, layout: 'steps', index: 0, defaultOpen: true }) }
				</Group>
			)) }
		</Row>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			titles = canvas.getAllByRole('button')

		expect(titles).toHaveLength(2)
		const [unstyledRoot, styledRoot] = titles as HTMLElement[]

		await expect(styledRoot).toHaveClass('inkq-accordion-title')
		await expect(unstyledRoot).toHaveClass('inkq-accordion-title')

		const rootHash = classes['inkq-accordion-title']!
		expect(styledRoot.classList.contains(rootHash)).toBe(true)
		expect(unstyledRoot.classList.contains(rootHash)).toBe(false)

		const styledStep = styledRoot.querySelector('.inkq-accordion-title__step') as HTMLElement,
			unstyledStep = unstyledRoot.querySelector('.inkq-accordion-title__step') as HTMLElement

		await expect(styledStep).toHaveClass('inkq-accordion-title__step')
		await expect(unstyledStep).toHaveClass('inkq-accordion-title__step')

		const stepHash = classes['inkq-accordion-title__step']!
		expect(styledStep.classList.contains(stepHash)).toBe(true)
		expect(unstyledStep.classList.contains(stepHash)).toBe(false)

		const styledText = styledRoot.querySelector('.inkq-accordion-title__text') as HTMLElement,
			unstyledText = unstyledRoot.querySelector('.inkq-accordion-title__text') as HTMLElement

		await expect(styledText).toHaveClass('inkq-accordion-title__text')
		await expect(unstyledText).toHaveClass('inkq-accordion-title__text')

		const textHash = classes['inkq-accordion-title__text']!
		expect(styledText.classList.contains(textHash)).toBe(true)
		expect(unstyledText.classList.contains(textHash)).toBe(false)

		const styledIndicator = styledRoot.querySelector('.inkq-accordion-title__indicator') as HTMLElement,
			unstyledIndicator = unstyledRoot.querySelector('.inkq-accordion-title__indicator') as HTMLElement

		await expect(styledIndicator).toHaveClass('inkq-accordion-title__indicator')
		await expect(unstyledIndicator).toHaveClass('inkq-accordion-title__indicator')

		const indicatorHash = classes['inkq-accordion-title__indicator']!
		expect(styledIndicator.classList.contains(indicatorHash)).toBe(true)
		expect(unstyledIndicator.classList.contains(indicatorHash)).toBe(false)

		// Config classes: global heading class on the text, `--plus` modifier
		// on the indicator.
		await expect(styledText).toHaveClass('inkq-h3')
		await expect(unstyledText).not.toHaveClass('inkq-h3')

		const plusHash = classes['inkq-accordion-title__indicator--plus']!
		await expect(styledIndicator).toHaveClass(plusHash)
		await expect(unstyledIndicator).not.toHaveClass(plusHash)
		await expect(unstyledIndicator).not.toHaveClass('inkq-accordion-title__indicator--plus')

		// Tokens.
		await expect(styledRoot.style.getPropertyValue('--accordion-title-indent')).toBe('0')
		await expect(unstyledRoot.style.getPropertyValue('--accordion-title-indent')).toBe('')

		// Non-state `data-*` attributes, forwarded to `Box`.
		await expect(styledRoot).toHaveAttribute('data-title')
		await expect(styledRoot).toHaveAttribute('data-open')
		await expect(unstyledRoot).not.toHaveAttribute('data-title')
		await expect(unstyledRoot).not.toHaveAttribute('data-open')

		// State attributes (`aria-expanded`) are kept either way.
		await expect(styledRoot).toHaveAttribute('aria-expanded', 'true')
		await expect(unstyledRoot).toHaveAttribute('aria-expanded', 'true')
	},
}

// `order` isn't `AccordionTitle`'s own prop — `AccordionTitle` reads it off
// `Accordion.context`, published by the wrapping `<Accordion>`, and applies it
// as a global `inkq-h${order}` class on the text `<span>`. Each group sets the
// WRAPPING `Accordion`'s `order` and asserts its own class is present and
// every sibling's is absent.
export const Order: Story = {
	parameters: { layout: 'padded' },
	render: args => (
		<Row>
			{ ORDER_OPTIONS.map(order => (
				<Group key={ order } label={ String(order) }>
					{ titleTemplate(args, { children: null, order }) }
				</Group>
			)) }
		</Row>
	),
	play: async ({ canvasElement }) => {
		const texts = canvasElement.querySelectorAll('.inkq-accordion-title__text')

		expect(texts).toHaveLength(ORDER_OPTIONS.length)

		for (const [i, order] of ORDER_OPTIONS.entries()) {
			await expect(texts[i]).toHaveClass(`inkq-h${ order }`)

			for (const other of ORDER_OPTIONS.filter(o => o !== order))
				await expect(texts[i]).not.toHaveClass(`inkq-h${ other }`)
		}
	},
}

// `collapsible` isn't `AccordionTitle`'s own prop either — it comes off
// `Accordion.context`. With `collapsible: false`, `AccordionTitle` skips its
// interactive branch: it renders a plain `<div>` (still with `data-title` and
// `data-open`, since the item is always open) with no `aria-expanded`/
// `aria-controls`, no `type`, and no indicator `<span>`. `collapsible: true`
// renders the disclosure `<button>`.
export const NonInteractive: Story = {
	parameters: { layout: 'padded' },
	render: args => (
		<Row>
			{ BOOLEAN_OPTIONS.map(collapsible => (
				<Group key={ String(collapsible) } label={ `collapsible: ${ String(collapsible) }` }>
					{ titleTemplate(args, { children: null, collapsible }) }
				</Group>
			)) }
		</Row>
	),
	play: async ({ canvasElement }) => {
		const titles = canvasElement.querySelectorAll<HTMLElement>('[data-title]')

		expect(titles).toHaveLength(2)
		// `BOOLEAN_OPTIONS` is `[true, false]`, mapped in order.
		const [interactive, fixed] = titles

		await expect(interactive.tagName).toBe('BUTTON')
		await expect(interactive).toHaveAttribute('aria-expanded', 'false')
		await expect(interactive).toHaveAttribute('aria-controls')
		await expect(interactive.querySelector('.inkq-accordion-title__indicator')).toBeInTheDocument()

		await expect(fixed.tagName).toBe('DIV')
		await expect(fixed).toHaveClass('inkq-accordion-title')
		await expect(fixed).toHaveAttribute('data-open')
		await expect(fixed).not.toHaveAttribute('aria-expanded')
		await expect(fixed).not.toHaveAttribute('aria-controls')
		await expect(fixed).not.toHaveAttribute('type')
		await expect(fixed.querySelector('.inkq-accordion-title__indicator')).not.toBeInTheDocument()
		await expect(fixed.querySelector('.inkq-accordion-title__text')).toHaveTextContent('What is your refund policy?')

		// Only the `true` title is a button.
		await expect(within(canvasElement).getAllByRole('button')).toHaveLength(1)
	},
}

// `useAccordionCtx(NAME)` (`createCompoundCtx`'s REQUIRED reader, not the
// optional `useSafeRootCtx`) throws the instant `AccordionTitle` is rendered
// with no wrapping `Accordion` at all, rather than silently rendering
// unstyled/inert. A raw, uncaught render throw would crash every other
// group in this story, so the misuse case is wrapped in a local
// (stories-file-only, not a source change) `RenderErrorBoundary` purely to
// demonstrate/assert the guard's error message without taking down the
// whole canvas.
export const RequiresAccordionParent: Story = {
	parameters: { layout: 'padded' },
	render: args => (
		<Row>
			<Group label="inside an Accordion (valid)">
				{ titleTemplate(args) }
			</Group>
			<Group label="standalone — throws (guarded by useAccordionCtx)">
				<RenderErrorBoundary>
					<Accordion.Title>{ args.children }</Accordion.Title>
				</RenderErrorBoundary>
			</Group>
		</Row>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)

		const validTitle = canvasElement.querySelector('[data-title]')
		await expect(validTitle).toBeInTheDocument()

		const errorFallback = await canvas.findByTestId('accordion-title-error')
		await expect(errorFallback).toHaveTextContent('<Accordion.Title /> must be a direct child of <Accordion>')
	},
}
