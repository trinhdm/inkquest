import { expect, fn, userEvent, within } from 'storybook/test'
import { getDefaultProps } from '@/hooks/useProps'
import { Accordion } from './Accordion'
import {
	BOOLEAN_OPTIONS, INDICATOR_OPTIONS, LAYOUT_OPTIONS,
	MAX_TITLE_SIZE_LEVEL, ORDER_OPTIONS, SIZE_OPTIONS,
} from './options.story'
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

// `Accordion` renders no title/content pair (`buildAccordion` returns `null`)
// unless `filterChildren` finds BOTH an `Accordion.Title` and an
// `Accordion.Content` among its children — so every "normal" story shares
// this fixed pair via `meta.render`, and only the edge-case stories that are
// specifically about that contract (missing title/content, duplicates, stray
// children, reversed order, fragments) supply their own custom `render`.
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
			description: 'Defaults to `true`. Setting it `false` makes the item PERMANENTLY open and untogglable, enforced in two places: `Accordion` pins `isOpen` to `true` outright (skipping `open`/`defaultOpen` entirely, controlled or not), and `handleToggle` returns immediately — so neither `onToggle` nor `onItemToggle` ever fires. `AccordionTitle` then branches on `interactive = collapsible !== false` and renders a plain `<div>` instead of a `<button>`, with no `aria-expanded`, no `aria-controls` and no indicator — nothing focusable that lies about being expandable. Contrast `disabled`, which KEEPS the `<button>`: a disabled item is still a disclosure, merely unavailable, whereas `collapsible={false}` means it was never a disclosure at all. Also inheritable from an enclosing `Accordion.Group`, via `AccordionGroupProvider` / `useAccordionGroupProps`: the group publishes its own `collapsible` through context, filled onto this `Accordion`\'s own raw props ONLY when the key is absent from them (own prop always wins). See this file\'s `Collapsible` story and `Accordion.Group`\'s `Collapsible` story.',
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
			description: '`\'none\'` renders no indicator element at all; otherwise a `lucide-react` icon (`Plus` for `\'plus\'`, `ChevronDown` for `\'chevron\'`) rendered via `<Box as={...}>` inside a selector-scoped modifier class.',
		},
		layout: {
			control: 'select',
			options: LAYOUT_OPTIONS,
			description: 'Also inheritable from an enclosing `Accordion.Group`. Only `\'steps\'` computes a `step` label; `\'default\'` (and unset) never does, regardless of `index`.',
		},
		// No `action` here: an `action` argType would inject a function into
	// `args.onItemToggle` for every story, and a function `onItemToggle` makes
	// `Accordion.tsx`'s `tokens` function return `{}` (no `--accordion-*`
	// custom properties). Stories that assert on it pass their own `fn()`.
	onItemToggle: {
		control: false,
		description: 'Called as `onItemToggle(index, next)` on every toggle. Passing ANY function also makes `Accordion.tsx`\'s `tokens` function return `{}`, so the item computes no `--accordion-*` custom properties of its own (an enclosing `Accordion.Group` always supplies one and computes them on its own root instead).',
	},
		onToggle: { action: 'toggled' },
		open: {
			control: 'boolean',
			description: 'Setting this to a boolean (rather than leaving it `undefined`) switches `Accordion` into CONTROLLED mode (`isControlled = typeof open === \'boolean\'`): internal state is bypassed entirely, and `isOpen` always reflects this prop directly. `onToggle`/`onItemToggle` still fire on click. See the `Controlled` and `Open` stories.',
		},
		order: {
			control: 'select',
			options: ORDER_OPTIONS,
			description: 'Registered default `3`. Published onto `Accordion.context` and read directly by `AccordionTitle`, which applies it as a global `inkq-h${order}` class name on the title text `<span>` (no actual heading element is rendered) — also feeds `getSharedTokens`\' `--accordion-title-size` token (`var(--inkq-font-size-h<level>)`), offset by `size` (`level = order + step`, where `step` is `{ sm: 2, md: 1, lg: 0 }[size]`). Only h1-h5 sizes are defined, so a resolved level above 5 points at a token that does not exist. Also inheritable from an enclosing `Accordion.Group` (own prop always wins). See the `Order` story.',
		},
		size: {
			control: 'select',
			options: SIZE_OPTIONS,
			description: 'Registered default `\'md\'`. Feeds `getSharedTokens`\' shared CSS custom properties (`--accordion-column-width`, `--accordion-gap`, `--accordion-padding`, `--accordion-indicator-size`, `--accordion-title-size`, etc.) via a per-size `step` (`{ sm: 2, md: 1, lg: 0 }`) applied on top of `order`. Those tokens are skipped whenever `onItemToggle` is a function. Also inheritable from an enclosing `Accordion.Group` (own prop always wins). Also read by `Accordion.Content` for `--accordion-content-size`. See the `Size` story.',
		},
		unstyled: {
			control: 'boolean',
			description: 'Part of `PolymorphicProps` (via the shared `FactoryContract`), not `Accordion`\'s own `AccordionProps`. Also inheritable from an enclosing `Accordion.Group`. The semantic base classes (`inkq-accordion`, `inkq-accordion__wrapper`, `inkq-accordion__divider`) are ALWAYS emitted regardless of this prop. `unstyled` drops the CSS-module-hashed class normally appended alongside each, and ALSO every token `getStyle` would compute for the root (the shared `--accordion-*` custom properties). `Accordion` destructures `unstyled` out instead of forwarding it to its root `Box`, so the root\'s `data-open`/`data-step` attributes are kept. Its own `styles()` calls pass no config classes, so there are none to drop here. See the `Unstyled` story.',
		},
	},
	args: {
		...getDefaultProps<Accordion.Props>('Accordion'),
		// `onItemToggle` is deliberately NOT set here: `Accordion.tsx`'s
		// `tokens` function returns `{}` whenever it is a function, which would
		// strip every `--accordion-*` custom property from every story. Only
		// the stories that assert on toggling supply their own `fn()`.
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

// `HeadingOrder` (`1`-`5`, see `ORDER_OPTIONS`) is read straight off
// `Accordion.context` by `AccordionTitle`, which only applies it as a global
// `inkq-h${order}` class name on the title text `<span>` — no `<hN>` element
// is ever rendered anywhere in the `Accordion` family, so there's no ARIA
// `heading` role to query. Asserted instead against the one thing `order`
// actually drives at the DOM level: `getSharedTokens`' `--accordion-title-size`
// custom property (`var(--inkq-font-size-h<level>)`, `level = order + step`,
// where `step` is `{ sm: 2, md: 1, lg: 0 }[size]`) — mirroring the `Size`
// story's shape below.
// `Accordion.tsx`'s `tokens` function skips computing `getSharedTokens`
// entirely whenever `onItemToggle` is a function, which is why `meta.args`
// leaves it unset.
export const Order: Story = {
	parameters: {
		layout: 'padded',
		controls: { exclude: ['order'] },
	},
	render: args => (
		<Row>
			{ ORDER_OPTIONS.map(order => (
				<Group key={ order } label={ String(order) }>
					{ accordionTemplate({ ...args, order }) }
				</Group>
			)) }
		</Row>
	),
	play: async ({ canvasElement }) => {
		const roots = canvasElement.querySelectorAll('.inkq-accordion') as unknown as HTMLElement[]

		expect(roots).toHaveLength(ORDER_OPTIONS.length)

		// Registered default `size: 'md'` → `step` is `1`, so the resolved
		// heading level is `order + 1` per `tokensBySize`/`getTokenGroup`.
		for (const [i, order] of ORDER_OPTIONS.entries()) {
			const level = order + 1
			if (level > MAX_TITLE_SIZE_LEVEL) continue
			await expect(roots[i]!.style.getPropertyValue('--accordion-title-size'))
				.toBe(`var(--inkq-font-size-h${ level })`)
		}
	},
}

// `size` feeds `getSharedTokens`' shared CSS custom properties via a per-size
// `step` (`{ sm: 2, md: 1, lg: 0 }`) applied on top of `order` — asserted here
// against `--accordion-title-size` (`level = order + step`), which with the
// registered default `order: 3` resolves to `h5`/`h4`/`h3` respectively.
// The shared `getSharedTokens` computation is SKIPPED whenever `onItemToggle`
// is a function (`Accordion.tsx`'s guard against double-computing tokens
// already applied by an enclosing `Accordion.Group`'s own root) — so
// `meta.args` leaves it unset, and only the stories that assert on toggling
// supply their own `fn()`. A standalone `Accordion` here therefore shows its
// real per-size token output.
export const Size: Story = {
	parameters: {
		layout: 'padded',
		controls: { exclude: ['size'] },
	},
	render: args => (
		<Row>
			{ SIZE_OPTIONS.map(size => (
				<Group key={ size } label={ size }>
					{ accordionTemplate({ ...args, size }) }
				</Group>
			)) }
		</Row>
	),
	play: async ({ canvasElement }) => {
		const roots = canvasElement.querySelectorAll('.inkq-accordion')

		expect(roots).toHaveLength(3)
		// `SIZE_OPTIONS` is `['sm', 'md', 'lg']`, mapped in order.
		const [sm, md, lg] = roots as unknown as HTMLElement[]

		await expect(sm.style.getPropertyValue('--accordion-title-size')).toBe('var(--inkq-font-size-h5)')
		await expect(md.style.getPropertyValue('--accordion-title-size')).toBe('var(--inkq-font-size-h4)')
		await expect(lg.style.getPropertyValue('--accordion-title-size')).toBe('var(--inkq-font-size-h3)')
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
	args: { open: true, onItemToggle: fn() },
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

// Both values of the controlled `open` prop. A boolean `open` (either one)
// switches `Accordion` into controlled mode, so each item's open state is
// pinned to its own value; clicking still reports the requested next state
// through `onToggle` but never moves the item.
export const Open: Story = {
	parameters: {
		layout: 'padded',
		controls: { exclude: ['open'] },
	},
	render: args => (
		<Row>
			{ BOOLEAN_OPTIONS.map(open => (
				<Group key={ String(open) } label={ String(open) }>
					{ accordionTemplate({ ...args, open }) }
				</Group>
			)) }
		</Row>
	),
	play: async ({ args, canvasElement }) => {
		const canvas = within(canvasElement),
			titles = canvas.getAllByRole('button'),
			roots = canvasElement.querySelectorAll('.inkq-accordion')

		expect(titles).toHaveLength(2)
		expect(roots).toHaveLength(2)
		// `BOOLEAN_OPTIONS` is `[true, false]`, mapped in order.
		const [openTitle, closedTitle] = titles,
			[openRoot, closedRoot] = roots

		await expect(openTitle).toHaveAttribute('aria-expanded', 'true')
		await expect(closedTitle).toHaveAttribute('aria-expanded', 'false')
		await expect(openRoot).toHaveAttribute('data-open')
		await expect(closedRoot).not.toHaveAttribute('data-open')
		await expect(openRoot.querySelector('[role="region"] > div')).not.toHaveAttribute('inert')
		await expect(closedRoot.querySelector('[role="region"] > div')).toHaveAttribute('inert')

		await userEvent.click(openTitle)
		await expect(args.onToggle).toHaveBeenCalledTimes(1)
		await expect(args.onToggle).toHaveBeenLastCalledWith(false)
		await expect(openTitle).toHaveAttribute('aria-expanded', 'true')

		await userEvent.click(closedTitle)
		await expect(args.onToggle).toHaveBeenCalledTimes(2)
		await expect(args.onToggle).toHaveBeenLastCalledWith(true)
		await expect(closedTitle).toHaveAttribute('aria-expanded', 'false')
	},
}

// Both values of `collapsible`. `false` pins `isOpen` to `true` and makes
// `handleToggle` return early, and `AccordionTitle` renders a plain `<div>`
// (still carrying `data-title`) instead of a `<button>`: no button role, no
// `aria-expanded`, no indicator. `true` (the registered default) keeps the
// closed-by-default disclosure `<button>`.
export const Collapsible: Story = {
	parameters: {
		layout: 'padded',
		controls: { exclude: ['collapsible'] },
	},
	render: args => (
		<Row>
			{ BOOLEAN_OPTIONS.map(collapsible => (
				<Group key={ String(collapsible) } label={ String(collapsible) }>
					{ accordionTemplate({ ...args, collapsible }) }
				</Group>
			)) }
		</Row>
	),
	play: async ({ args, canvasElement }) => {
		const canvas = within(canvasElement),
			roots = canvasElement.querySelectorAll('.inkq-accordion')

		expect(roots).toHaveLength(2)
		// `BOOLEAN_OPTIONS` is `[true, false]`, mapped in order.
		const [collapsibleRoot, fixedRoot] = roots as unknown as [HTMLElement, HTMLElement]

		// Only the `true` item has a disclosure button; it starts closed.
		await expect(canvas.getAllByRole('button')).toHaveLength(1)
		const button = within(collapsibleRoot).getByRole('button')
		await expect(button).toHaveAttribute('aria-expanded', 'false')
		await expect(collapsibleRoot).not.toHaveAttribute('data-open')
		await expect(collapsibleRoot.querySelector('[role="region"] > div')).toHaveAttribute('inert')
		await expect(collapsibleRoot.querySelector('svg')).toBeInTheDocument()

		// The `false` item: a `<div>` title, forced open, no indicator.
		const fixedTitle = fixedRoot.querySelector<HTMLElement>('[data-title]')!
		await expect(fixedTitle.tagName).toBe('DIV')
		await expect(fixedTitle).not.toHaveAttribute('aria-expanded')
		await expect(fixedTitle).not.toHaveAttribute('aria-controls')
		await expect(fixedRoot).toHaveAttribute('data-open')
		await expect(fixedRoot.querySelector('[role="region"] > div')).not.toHaveAttribute('inert')
		await expect(fixedRoot.querySelector('svg')).not.toBeInTheDocument()

		await userEvent.click(fixedTitle)
		await expect(args.onToggle).not.toHaveBeenCalled()
		await expect(fixedRoot).toHaveAttribute('data-open')

		await userEvent.click(button)
		await expect(args.onToggle).toHaveBeenCalledTimes(1)
		await expect(args.onToggle).toHaveBeenCalledWith(true)
		await expect(button).toHaveAttribute('aria-expanded', 'true')
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
	args: { onItemToggle: fn() },
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

// `filterChildren` (called with `total: 2`) warns in development when it
// doesn't find both parts, and `buildAccordion` returns `null` when the
// title slot is empty — but that `null` only replaces the title/content PAIR.
// `Accordion`'s own root `Box`/`AccordionProvider`/wrapper `div`/divider
// `span` shell still renders regardless, since `buildAccordion(...)` is
// called from deep inside that structure, not as the whole return value.
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

// `filterChildren(children, [titleName, contentName])` gives each name ONE
// slot, and the FIRST matching child fills it — later duplicates are dropped
// silently (no warning), while the first title/content pair renders
// normally. Both a repeated `Accordion.Title` and a repeated
// `Accordion.Content` are shown.
export const ExtraChildren: Story = {
	parameters: { layout: 'padded' },
	render: args => (
		<Accordion { ...args }>
			<Accordion.Title>Primary title</Accordion.Title>
			<Accordion.Content>Primary content</Accordion.Content>
			<Accordion.Title>Duplicate title (dropped)</Accordion.Title>
			<Accordion.Content>Duplicate content (dropped)</Accordion.Content>
		</Accordion>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)

		await expect(canvas.getAllByRole('button')).toHaveLength(1)
		await expect(canvas.getByRole('button')).toHaveTextContent('Primary title')
		await expect(canvas.getAllByRole('region', { hidden: true })).toHaveLength(1)
		await expect(canvas.queryByText('Duplicate title (dropped)')).not.toBeInTheDocument()
		await expect(canvas.queryByText('Duplicate content (dropped)')).not.toBeInTheDocument()
	},
}

// `filterChildren` only keeps elements whose component name is in the list
// it's given: a child that's neither `Accordion.Title` nor
// `Accordion.Content` is dropped from the result (never rendered), and so are
// plain string and number children, which have no component name to match.
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

// Plain string and number children have no component name, so
// `filterChildren` drops them even when they sit next to a valid pair — the
// title/content pair still renders, the loose text and number do not.
export const PlainTextChildren: Story = {
	parameters: { layout: 'padded' },
	render: args => (
		<Accordion { ...args }>
			Loose text (never rendered)
			<Accordion.Title>Title</Accordion.Title>
			{ 42 }
			<Accordion.Content>Content</Accordion.Content>
		</Accordion>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)

		await expect(canvas.getAllByRole('button')).toHaveLength(1)
		await expect(canvas.getByRole('button')).toHaveTextContent('Title')
		await expect(canvas.getByText('Content')).toBeInTheDocument()
		await expect(canvas.queryByText('Loose text (never rendered)')).not.toBeInTheDocument()
		await expect(canvas.queryByText('42')).not.toBeInTheDocument()
	},
}

// `filterChildren` looks inside Fragments, so a title and content wrapped in
// one (or split across two) are still found and fill their slots.
export const FragmentChildren: Story = {
	parameters: { layout: 'padded' },
	render: args => (
		<Accordion { ...args }>
			<>
				<Accordion.Title>Fragment title</Accordion.Title>
			</>
			<>
				<Accordion.Content>Fragment content</Accordion.Content>
			</>
		</Accordion>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)

		await expect(canvas.getByRole('button')).toHaveTextContent('Fragment title')
		await expect(canvas.getByRole('region', { hidden: true })).toHaveTextContent('Fragment content')
	},
}

// `filterChildren` called with a list of names fills one FIXED slot per name
// (title first, content second), whatever order the children are written in.
// So `Accordion.Content` listed before `Accordion.Title` still renders the
// title button first and the content region second.
export const ReversedOrder: Story = {
	parameters: { layout: 'padded' },
	render: args => (
		<Accordion { ...args }>
			<Accordion.Content>Written first, rendered second.</Accordion.Content>
			<Accordion.Title>Written second, rendered first.</Accordion.Title>
		</Accordion>
	),
	play: async ({ canvasElement }) => {
		const root = canvasElement.querySelector('.inkq-accordion__wrapper') as HTMLElement,
			children = root.querySelectorAll(':scope > *:not(.inkq-accordion__divider)')

		await expect(children).toHaveLength(2)
		await expect(children[0].tagName).toBe('BUTTON')
		await expect(children[1]).toHaveAttribute('role', 'region')
	},
}

// `unstyled` does NOT remove `Accordion`'s own semantic base classes
// (`inkq-accordion`, `inkq-accordion__wrapper`) — per `getClassName.tsx`,
// the base class is ALWAYS emitted. It does suppress the CSS-module hashed
// class normally appended alongside it — asserted here against the REAL
// compiled export map (`Accordion.module.scss`), not a literal hash or an
// "any extra class" heuristic — and, via `getStyle.tsx`, every token the
// root would compute: the shared `--accordion-*` custom properties, which
// are present on the styled root (no `onItemToggle` is set, so `tokens`
// computes them) and absent on the unstyled one. `Accordion` destructures
// `unstyled` out rather than forwarding it to its root `Box`, so the root's
// `data-open` attribute survives; that is asserted too (`defaultOpen` is set
// so there is one to keep).
export const Unstyled: Story = {
	parameters: {
		layout: 'padded',
		controls: { exclude: ['unstyled'] },
	},
	render: args => (
		<Row>
			{ BOOLEAN_OPTIONS.map(unstyled => (
				<Group key={ String(unstyled) } label={ String(unstyled) }>
					{ accordionTemplate({ ...args, defaultOpen: true, unstyled }) }
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

		await expect((styledRoot as HTMLElement).style.getPropertyValue('--accordion-title-size')).not.toBe('')
		await expect((unstyledRoot as HTMLElement).style.getPropertyValue('--accordion-title-size')).toBe('')

		await expect(styledRoot).toHaveAttribute('data-open')
		await expect(unstyledRoot).toHaveAttribute('data-open')
	},
}
