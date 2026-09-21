import { expect, fn, userEvent, within } from 'storybook/test'
import { getDefaultProps } from '@/hooks/useProps'
import { Accordion } from './Accordion'
import { BOOLEAN_OPTIONS, INDICATOR_OPTIONS, LAYOUT_OPTIONS, TYPE_OPTIONS } from './options.story'
import type { ReactNode } from 'react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import classes from './Accordion.module.scss'

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

// `Accordion.Props` (the `declare namespace` export) is just the raw
// `AccordionProps` interface — it doesn't include `as`/`unstyled`/
// `attributes`/etc., which only exist on the actual accepted prop type,
// `PolymorphicProps<AccordionProps, C>`. `Parameters<typeof Accordion>[0]`
// reads that real, wrapped type straight off the component itself — the
// generic call signature's default `C` resolves to `'div'` here, since
// `AccordionSpecs`'s `defaults.as` is `'div'`.
type AccordionStoryProps = Parameters<typeof Accordion>[0]
type Story = StoryObj<AccordionStoryProps>

// `Accordion` renders nothing (`buildAccordion` returns `null`) unless it
// gets exactly one `Accordion.Title` and one `Accordion.Content` child — so
// every "normal" story shares this fixed pair via `meta.render`, and only
// the edge-case stories that are specifically about that contract (missing
// title/content, extras, stray children, reversed order) supply their own
// custom `render`.
const accordionTemplate = (args: AccordionStoryProps) => (
	<Accordion { ...args }>
		<Accordion.Title>What is your refund policy?</Accordion.Title>
		<Accordion.Content>
			We offer a 30-day money-back guarantee on all plans, no questions asked.
		</Accordion.Content>
	</Accordion>
)

const meta: Meta<AccordionStoryProps> = {
	component: Accordion,
	title: 'Data/Accordion',
	render: accordionTemplate,
	parameters: {
		controls: { exclude: ['children'] },
	},
	argTypes: {
		collapsible: {
			control: 'boolean',
			description: 'Defaults to `true`. Setting it `false` makes the item PERMANENTLY open and untogglable, enforced in two places: `Accordion` pins `isOpen` to `true` outright (skipping `open`/`defaultOpen` entirely, controlled or not), and `handleToggle` returns immediately — so neither `onToggle` nor `onItemToggle` ever fires. `AccordionTitle` then branches on `interactive = collapsible !== false` and renders a plain `<div>` instead of a `<button>`, with no `aria-expanded`, no `aria-controls` and no indicator — nothing focusable that lies about being expandable. Contrast `disabled`, which KEEPS the `<button>`: a disabled item is still a disclosure, merely unavailable, whereas `collapsible={false}` means it was never a disclosure at all. Also inheritable from an enclosing `Accordion.Group`, via `AccordionGroupProvider` / `useAccordionGroupProps`: the group publishes its own `collapsible` through context, filled onto this `Accordion`\'s own raw props ONLY when the key is absent from them (own prop always wins). See `Accordion.Group`\'s `Collapsible` story.',
		},
		defaultOpen: {
			control: 'boolean',
			description: 'Seeds the UNCONTROLLED initial open state (`useState(() => !!defaultOpen)`). Has no effect once `open` is set — see the `Controlled` story.',
		},
		disabled: {
			control: 'boolean',
			description: 'Also inheritable from an enclosing `Accordion.Group` (own prop always wins — see `Accordion.Group`\'s `Disabled` story). Published into `Accordion.context` and consumed directly by `AccordionTitle`, which renders it as a NATIVE `disabled` attribute on the title `<button>` — so a disabled title is genuinely unfocusable and skipped by Tab, on top of `handleToggle` returning immediately (before flipping any state or firing `onToggle`/`onItemToggle`) as a second line of defense. See the `Disabled` story.',
		},
		id: {
			control: 'text',
			description: 'Overrides the generated `useId()` seed for the root/title/content id triad (`acc-<id>`, `acc-<id>-title`, `acc-<id>-content`) with a deterministic value. See the `CustomId` story.',
		},
		index: {
			control: 'number',
			description: 'Also inheritable from an enclosing `Accordion.Group`. Feeds `onItemToggle(index, next)` and, when `layout` is `\'steps\'`, the zero-padded `step` label. See the `StepPadding` story.',
		},
		indicator: {
			control: 'select',
			options: INDICATOR_OPTIONS,
			description: '`\'none\'` renders no indicator element at all; otherwise an `Icon` (`add` for `\'plus\'`, `caret-down` for `\'chevron\'`) inside a selector-scoped modifier class.',
		},
		layout: {
			control: 'select',
			options: LAYOUT_OPTIONS,
			description: 'Also inheritable from an enclosing `Accordion.Group`. Only `\'steps\'` computes a `step` label; `\'default\'` (and unset) never does, regardless of `index`.',
		},
		onItemToggle: { action: 'itemToggled' },
		onToggle: { action: 'toggled' },
		open: {
			control: 'boolean',
			description: 'Setting this to a boolean (rather than leaving it `undefined`) switches `Accordion` into CONTROLLED mode (`isControlled = typeof open === \'boolean\'`): internal state is bypassed entirely, and `isOpen` always reflects this prop directly. `onToggle`/`onItemToggle` still fire on click. See the `Controlled` story.',
		},
		type: {
			control: 'select',
			options: TYPE_OPTIONS,
			description: 'NOT inheritable from an enclosing `Accordion.Group` — `type` is absent from both `AccordionGroup.tsx`\'s own `ctxValues` and the `AccordionGroupContext` interface it publishes, unlike `collapsible`/`disabled`/`layout`. On `Accordion` itself it\'s a dead prop: destructured out of `props` and otherwise unused. Only `Accordion.Group`\'s own internal state logic (`handleItemToggle`) reads its OWN `type`, entirely independent of any per-`Accordion` `type` prop.',
		},
		unstyled: {
			control: 'boolean',
			description: 'Part of `PolymorphicProps` (via the shared `SpecsContract`), not `Accordion`\'s own `AccordionProps`. The semantic base classes (`inkq-accordion`, `inkq-accordion__wrapper`, `inkq-accordion__divider`) are ALWAYS emitted regardless of this prop — `unstyled` only suppresses the CSS-module-hashed class normally appended alongside it. See the `Unstyled` story.',
		},
	},
	args: {
		...getDefaultProps<Accordion.Props>('Accordion'),
		onItemToggle: fn(),
		onToggle: fn(),
	},
}

export default meta

export const Default: Story = {}

export const Indicators: Story = {
	parameters: {
		layout: 'padded',
		controls: { exclude: ['indicator'] },
	},
	render: args => (
		<Row>
			{ INDICATOR_OPTIONS.map(indicator => (
				<Group key={ indicator } label={ indicator }>
					{ accordionTemplate({ ...args, indicator }) }
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

		// Real compiled modifier classes from the shared stylesheet, rather than
		// literal generated-hash strings.
		const chevronIndicator = chevron.querySelector('[class*="indicator"]'),
			plusIndicator = plus.querySelector('[class*="indicator"]')

		await expect(chevronIndicator).toHaveClass(classes['inkq-accordion-title__indicator--chevron']!)
		await expect(plusIndicator).toHaveClass(classes['inkq-accordion-title__indicator--plus']!)
	},
}

export const Layouts: Story = {
	parameters: {
		layout: 'padded',
		controls: { exclude: ['layout'] },
	},
	render: args => (
		<Row>
			{ LAYOUT_OPTIONS.map(layout => (
				<Group key={ layout } label={ layout }>
					{ accordionTemplate({ ...args, layout, index: 0 }) }
				</Group>
			)) }
		</Row>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			roots = canvasElement.querySelectorAll('.inkq-accordion')

		expect(roots).toHaveLength(2)
		// `LAYOUT_OPTIONS` is `['default', 'steps']`, mapped in order.
		const [defaultRoot, stepsRoot] = roots

		await expect(defaultRoot).not.toHaveAttribute('data-step')
		await expect(canvas.getAllByRole('button')[0].querySelector('[class*="step"]')).not.toBeInTheDocument()

		await expect(stepsRoot).toHaveAttribute('data-step', '01')
		await expect(canvas.getAllByRole('button')[1].querySelector('[class*="step"]')).toHaveTextContent('01')
	},
}

// `step` zero-pads any index below 9 (`i = index + 1`) and switches to plain
// two-digit text once `i` crosses 9 — asserting both sides of that boundary.
export const StepPadding: Story = {
	parameters: { layout: 'padded' },
	render: args => (
		<Row>
			<Group label="index: 8 (step 09)">
				{ accordionTemplate({ ...args, layout: 'steps', index: 8 }) }
			</Group>
			<Group label="index: 9 (step 10)">
				{ accordionTemplate({ ...args, layout: 'steps', index: 9 }) }
			</Group>
		</Row>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			buttons = canvas.getAllByRole('button')

		await expect(buttons[0].querySelector('[class*="step"]')).toHaveTextContent('09')
		await expect(buttons[1].querySelector('[class*="step"]')).toHaveTextContent('10')
	},
}

// Uncontrolled: `defaultOpen` only seeds the initial `useState`, then the
// component manages its own open state internally from then on.
export const DefaultOpen: Story = {
	parameters: {
		layout: 'padded',
		controls: { exclude: ['defaultOpen'] },
	},
	render: args => (
		<Row>
			{ BOOLEAN_OPTIONS.map(defaultOpen => (
				<Group key={ String(defaultOpen) } label={ String(defaultOpen) }>
					{ accordionTemplate({ ...args, defaultOpen }) }
				</Group>
			)) }
		</Row>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			buttons = canvas.getAllByRole('button')

		expect(buttons).toHaveLength(2)
		const [isOpen, isClosed] = buttons

		await expect(isOpen).toHaveAttribute('aria-expanded', 'true')
		await expect(isClosed).toHaveAttribute('aria-expanded', 'false')

		const openInner = isOpen.closest('.inkq-accordion')?.querySelector('[role="region"] > div'),
			closedInner = isClosed.closest('.inkq-accordion')?.querySelector('[role="region"] > div')

		// `inert` (not visibility) is the real "is it interactive" signal.
		await expect(openInner).not.toHaveAttribute('inert')
		await expect(closedInner).toHaveAttribute('inert')
	},
}

// Controlled: `typeof open === 'boolean'` bypasses internal state entirely —
// clicking still fires `onToggle`/`onItemToggle`, but `isOpen` never moves
// away from whatever this fixed `open` arg says, since the story doesn't
// feed the click back into a new `open` value.
export const Controlled: Story = {
	args: { open: true },
	play: async ({ args, canvasElement }) => {
		const canvas = within(canvasElement),
			title = canvas.getByRole('button')

		await expect(title).toHaveAttribute('aria-expanded', 'true')

		await userEvent.click(title)

		// Still open — the `open` prop, not internal state, drives `isOpen`.
		await expect(title).toHaveAttribute('aria-expanded', 'true')
		await expect(args.onToggle).toHaveBeenCalledOnce()
		await expect(args.onToggle).toHaveBeenCalledWith(false)
		await expect(args.onItemToggle).toHaveBeenCalledOnce()
		await expect(args.onItemToggle).toHaveBeenCalledWith(0, false)
	},
}

export const Disabled: Story = {
	parameters: {
		layout: 'padded',
		controls: { exclude: ['disabled'] },
	},
	render: args => (
		<Row>
			{ BOOLEAN_OPTIONS.map(disabled => (
				<Group key={ String(disabled) } label={ String(disabled) }>
					{ accordionTemplate({ ...args, disabled }) }
				</Group>
			)) }
		</Row>
	),
	play: async ({ args, canvasElement }) => {
		const canvas = within(canvasElement),
			titles = canvas.getAllByRole('button')

		expect(titles).toHaveLength(2)
		const [isDisabled, isEnabled] = titles

		// `disabled` is published into `Accordion.context` and `AccordionTitle`
		// renders it as a NATIVE `disabled` attribute on the title `<button>` —
		// genuinely unfocusable, not just a `handleToggle` guard.
		await expect(isDisabled).toHaveAttribute('disabled')
		await expect(isEnabled).not.toHaveAttribute('disabled')

		// A disabled native button drops out of the Tab sequence entirely — even
		// though it's first in DOM order, the first Tab from a blurred state
		// lands directly on the enabled one.
		await userEvent.tab()
		await expect(isDisabled).not.toHaveFocus()
		await expect(isEnabled).toHaveFocus()

		await userEvent.click(isDisabled)
		await expect(args.onToggle).not.toHaveBeenCalled()

		await userEvent.click(isEnabled)
		await expect(args.onToggle).toHaveBeenCalledOnce()
	},
}

export const AsElement: Story = {
	parameters: { layout: 'padded' },
	render: args => (
		<Row>
			<Group label='as="div" (default)'>
				{ accordionTemplate(args) }
			</Group>
			<Group label='as="section"'>
				{ accordionTemplate({ ...args, as: 'section' }) }
			</Group>
		</Row>
	),
	play: async ({ canvasElement }) => {
		const roots = canvasElement.querySelectorAll('.inkq-accordion')

		expect(roots).toHaveLength(2)
		await expect(roots[0].tagName).toBe('DIV')
		await expect(roots[1].tagName).toBe('SECTION')
	},
}

// `idx.root`/`idx.title`/`idx.content` derive from `useId()` (unstable
// across runs) unless an explicit `id` is passed — with one, the triad is
// fully deterministic, so it's safe to assert the literal values here.
export const CustomId: Story = {
	args: { id: 'refund-policy' },
	play: async ({ canvasElement }) => {
		const root = canvasElement.querySelector('.inkq-accordion'),
			title = canvasElement.querySelector('[data-title]'),
			content = canvasElement.querySelector('[role="region"]')

		await expect(root).toHaveAttribute('id', 'acc-refund-policy')
		await expect(title).toHaveAttribute('id', 'acc-refund-policy-title')
		await expect(content).toHaveAttribute('id', 'acc-refund-policy-content')
	},
}

// Assert the RELATIONSHIP between title and content, never a literal
// generated id (`useId()` output is unstable) — `aria-controls` on the title
// must point at the content's real `id`, and vice-versa for
// `aria-labelledby`.
export const AccessibleRelationships: Story = {
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			title = canvas.getByRole('button'),
			content = canvasElement.querySelector('[role="region"]') as HTMLElement

		await expect(title).toHaveAttribute('aria-controls', content.id)
		await expect(content).toHaveAttribute('aria-labelledby', title.id)
	},
}

export const Clickable: Story = {
	play: async ({ args, canvasElement }) => {
		const canvas = within(canvasElement),
			title = canvas.getByRole('button')

		await expect(title).toHaveAttribute('aria-expanded', 'false')

		await userEvent.click(title)
		await expect(title).toHaveAttribute('aria-expanded', 'true')
		await expect(args.onToggle).toHaveBeenCalledOnce()
		await expect(args.onToggle).toHaveBeenCalledWith(true)
		await expect(args.onItemToggle).toHaveBeenCalledOnce()
		await expect(args.onItemToggle).toHaveBeenCalledWith(0, true)

		await userEvent.click(title)
		await expect(title).toHaveAttribute('aria-expanded', 'false')
		await expect(args.onToggle).toHaveBeenCalledTimes(2)
	},
}

export const KeyboardActivation: Story = {
	play: async ({ args, canvasElement }) => {
		const canvas = within(canvasElement),
			title = canvas.getByRole('button')

		await expect(title).not.toHaveFocus()

		await userEvent.tab()
		await expect(title).toHaveFocus()

		await userEvent.keyboard('{Enter}')
		await expect(title).toHaveAttribute('aria-expanded', 'true')
		await expect(args.onToggle).toHaveBeenCalledTimes(1)

		await userEvent.keyboard(' ')
		await expect(title).toHaveAttribute('aria-expanded', 'false')
		await expect(args.onToggle).toHaveBeenCalledTimes(2)

		title.blur()
		await expect(title).not.toHaveFocus()
	},
}

// `buildAccordion` warns and returns `null` when no `Accordion.Title` is
// found among the children, but that `null` only replaces the title/content
// PAIR — `Accordion`'s own root `Box`/`AccordionProvider`/wrapper `div`/
// divider `span` shell still renders regardless, since `buildAccordion(...)`
// is called from deep inside that structure, not as the whole return value.
export const MissingTitle: Story = {
	parameters: { layout: 'padded' },
	render: args => (
		<Accordion { ...args }>
			<Accordion.Content>Only content, no title.</Accordion.Content>
		</Accordion>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)

		const shell = canvasElement.querySelector('.inkq-accordion')
		await expect(shell).toBeInTheDocument()
		await expect(canvasElement.querySelector('.inkq-accordion__divider')).toBeInTheDocument()

		await expect(canvas.queryByRole('button')).not.toBeInTheDocument()
		await expect(canvas.queryByRole('region')).not.toBeInTheDocument()
		await expect(canvas.queryByText('Only content, no title.')).not.toBeInTheDocument()
	},
}

// Same `null` pair-replacement, on the missing-`Accordion.Content` branch
// instead — the shell still renders, just without a title/content pair.
export const MissingContent: Story = {
	parameters: { layout: 'padded' },
	render: args => (
		<Accordion { ...args }>
			<Accordion.Title>Only a title, no content.</Accordion.Title>
		</Accordion>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)

		const shell = canvasElement.querySelector('.inkq-accordion')
		await expect(shell).toBeInTheDocument()
		await expect(canvasElement.querySelector('.inkq-accordion__divider')).toBeInTheDocument()

		await expect(canvas.queryByRole('button')).not.toBeInTheDocument()
		await expect(canvas.queryByRole('region')).not.toBeInTheDocument()
		await expect(canvas.queryByText('Only a title, no content.')).not.toBeInTheDocument()
	},
}

// `filterChildren(children, [Title.displayName, Content.displayName])`
// destructures the FIRST matched child of either type as `title`, the
// SECOND as `content`, and everything after as `extras` — a second
// `Accordion.Title` here lands in `extras` (dev-warned, not rendered), while
// the original title/content pair still renders normally.
export const ExtraChildren: Story = {
	parameters: { layout: 'padded' },
	render: args => (
		<Accordion { ...args }>
			<Accordion.Title>Primary title</Accordion.Title>
			<Accordion.Content>Primary content</Accordion.Content>
			<Accordion.Title>Duplicate title (dropped)</Accordion.Title>
		</Accordion>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)

		await expect(canvas.getAllByRole('button')).toHaveLength(1)
		await expect(canvas.getByRole('button')).toHaveTextContent('Primary title')
		await expect(canvas.queryByText('Duplicate title (dropped)')).not.toBeInTheDocument()
	},
}

// A child that's neither `Accordion.Title` nor `Accordion.Content` is
// excluded from `filterChildren`'s result entirely (not rendered at all),
// while still counting toward the "children outside of ..." dev warning via
// `Children.count(children) > matched`.
export const ChildrenOutsideSubcomponents: Story = {
	parameters: { layout: 'padded' },
	render: args => (
		<Accordion { ...args }>
			<Accordion.Title>Title</Accordion.Title>
			<Accordion.Content>Content</Accordion.Content>
			<div>Stray child (never rendered)</div>
		</Accordion>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)

		await expect(canvas.getByRole('button')).toBeInTheDocument()
		await expect(canvas.queryByText('Stray child (never rendered)')).not.toBeInTheDocument()
	},
}

// `[title, content, ...extras] = filterChildren(...)` is POSITIONAL, not
// type-aware: the first matched element (of EITHER type) always becomes
// `title`, the second always becomes `content`. With `Accordion.Content`
// listed before `Accordion.Title`, the "title" slot actually holds the real
// content element and vice-versa — `buildAccordion` renders `<>{title}
// {content}</>` regardless, so the content block visually renders ABOVE the
// interactive title button.
export const ReversedOrder: Story = {
	parameters: { layout: 'padded' },
	render: args => (
		<Accordion { ...args }>
			<Accordion.Content>This renders first.</Accordion.Content>
			<Accordion.Title>This renders second.</Accordion.Title>
		</Accordion>
	),
	play: async ({ canvasElement }) => {
		const root = canvasElement.querySelector('.inkq-accordion__wrapper') as HTMLElement,
			children = root.querySelectorAll(':scope > *:not(.inkq-accordion__divider)')

		await expect(children[0]).toHaveAttribute('role', 'region')
		await expect(children[1].tagName).toBe('BUTTON')
	},
}

// `unstyled` does NOT remove `Accordion`'s own semantic base classes
// (`inkq-accordion`, `inkq-accordion__wrapper`) — per `getClassName.tsx`,
// the base class is now ALWAYS emitted. It only suppresses the CSS-module
// hashed class normally appended alongside it — asserted here against the
// REAL compiled export map (`Accordion.module.scss`), not a literal hash or
// an "any extra class" heuristic (which false-positives on the always-on
// `getConfigClasses` modifier/global classes).
export const Unstyled: Story = {
	parameters: {
		layout: 'padded',
		controls: { exclude: ['unstyled'] },
	},
	render: args => (
		<Row>
			{ BOOLEAN_OPTIONS.map(unstyled => (
				<Group key={ String(unstyled) } label={ String(unstyled) }>
					{ accordionTemplate({ ...args, unstyled }) }
				</Group>
			)) }
		</Row>
	),
	play: async ({ canvasElement }) => {
		const roots = canvasElement.querySelectorAll('.inkq-accordion')

		expect(roots).toHaveLength(2)
		const [unstyledRoot, styledRoot] = roots

		await expect(styledRoot).toHaveClass('inkq-accordion')
		await expect(unstyledRoot).toHaveClass('inkq-accordion')

		const hashed = classes['inkq-accordion']!
		expect(styledRoot.classList.contains(hashed)).toBe(true)
		expect(unstyledRoot.classList.contains(hashed)).toBe(false)
	},
}
