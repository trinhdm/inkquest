import { expect, userEvent, within } from 'storybook/test'
import { getDefaultProps } from '@/hooks/useProps'
import { Accordion } from '../Accordion'
import { BOOLEAN_OPTIONS, COLLAPSIBLE_OPTIONS, LAYOUT_OPTIONS, ORDER_OPTIONS, SIZE_OPTIONS } from '../options.story'
import type { ReactNode } from 'react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import classes from '../Accordion.module.scss'

const Row = ({ children }: { children: ReactNode }) => (
	<div style={ { display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'flex-start' } }>
		{ children }
	</div>
)

const Group = ({ label, children }: { label: string, children: ReactNode }) => (
	<div style={ { display: 'flex', flexDirection: 'column', gap: 8, width: 360 } }>
		<span style={ { font: 'var(--inkq-text-control)', letterSpacing: '.15em', textTransform: 'uppercase', opacity: 0.6 } }>
			{ label }
		</span>
		{ children }
	</div>
)

// `Accordion.Group.Props` (the `declare namespace` export) is just the raw
// `AccordionGroupProps` interface — it doesn't include `unstyled`/
// `attributes`/etc., which only exist on the actual accepted prop type,
// `PolymorphicProps<AccordionGroupProps, C>`. `Parameters<typeof
// Accordion.Group>[0]` reads that real, wrapped type straight off the
// component itself — `AccordionGroupSpecs`'s `isCompound: true` makes `as`
// resolve to `never` (compound components don't take a tag override), so
// this also correctly excludes `as` from the story's own controls.
type AccordionGroupStoryProps = Parameters<typeof Accordion.Group>[0]
type Story = StoryObj<AccordionGroupStoryProps>

// `Accordion.Group` assigns each surviving `Accordion` child a SEQUENTIAL
// `index` via `ctxValues` (`Array.from({ length: total }, (_, index) => ...)`)
// regardless of any prop set on the child itself — so a plain, unkeyed-index
// item list is enough to exercise every story here.
const renderItems = (count: number) =>
	Array.from({ length: count }, (_, index) => (
		<Accordion key={ index }>
			<Accordion.Title>{ `Item ${ index + 1 }` }</Accordion.Title>
			<Accordion.Content>{ `Content for item ${ index + 1 }.` }</Accordion.Content>
		</Accordion>
	))

const meta: Meta<AccordionGroupStoryProps> = {
	component: Accordion.Group,
	title: 'Data/Accordion/Accordion.Group',
	parameters: { layout: 'padded' },
	argTypes: {
		collapsible: {
			control: 'select',
			options: COLLAPSIBLE_OPTIONS,
			description: 'Registered default `\'single\'`. `\'single\'`/`\'multiple\'` select the group\'s disclosure mode — read by `handleItemToggle` (`\'single\'`: at most one item open at a time; `\'multiple\'`: items toggle independently) — and are also PUBLISHED to every child `Accordion` through `ctxValues` as a plain `true` (`collapsible: typeof collapsible === \'string\'`), where each item can still override its own `collapsible` (own prop always wins). Setting it `false` instead makes EVERY item in the group permanently open and untogglable, with a non-interactive `<div>` title carrying no `aria-expanded` and no indicator, and makes `defaultOpen` moot — nothing can close, so nothing needs seeding. See the `Collapsible` story.',
		},
		defaultOpen: {
			control: 'object',
			description: 'A `number` or `number[]`, normalized by `handleOpenItems`. In `collapsible: \'single\'` mode the normalized list is SLICED to just the first index (`indices.slice(0, 1)`) — passing an array with more than one entry only ever opens the first of them. See the `DefaultOpen` story.',
		},
		disabled: {
			control: 'boolean',
			description: 'Not registered via `setDefaults` — `undefined` unless passed. Cascades to every child `Accordion` via context (`useAccordionGroupProps`), same own-prop-wins precedence as `layout`/`index`/`open`/`unstyled` — a child\'s own `disabled` (including an explicit `disabled={false}`) always wins over the group\'s. Ultimately reaches `AccordionTitle`, which renders it as a NATIVE `disabled` attribute on each title button — so a disabled group makes every title genuinely unfocusable/untabbable, not just inert to clicks. See the `Disabled` and `ContextOverrides` stories.',
		},
		layout: {
			control: 'select',
			options: LAYOUT_OPTIONS,
			description: 'Cascades to every child `Accordion` via context (`useAccordionGroupProps`), same own-prop-wins precedence as `index`/`open`/`onItemToggle`/`unstyled`. Only `\'steps\'` produces a zero-padded `step` label on each item, keyed off that item\'s own sequential `index`. See the `Layout` story.',
		},
		order: {
			control: 'select',
			options: ORDER_OPTIONS,
			description: 'Registered default `3`. Cascades to every child `Accordion` via context (own prop always wins), which reads it straight off `Accordion.context` and renders its title text as a literal `h${order}` heading tag — also feeds `getSharedTokens`\' `--accordion-text-size` token on the GROUP\'S OWN root, offset by `size` (`config.order = order + step`, where `step` is `{ sm: 2, md: 1, lg: 0 }[size]`). See the `Order` story.',
		},
		size: {
			control: 'select',
			options: SIZE_OPTIONS,
			description: 'Registered default `\'md\'`. Feeds `getSharedTokens`\' shared CSS custom properties on the GROUP\'S OWN root (`--accordion-column-width`, `--accordion-gap`, `--accordion-padding`, `--accordion-indicator-size`, `--accordion-text-size`, etc.) via a per-size `step` applied on top of `order`. Also cascades to every child `Accordion` via context (own prop always wins) — though each child\'s OWN token computation is skipped whenever it receives a function `onItemToggle` (as every grouped item does), so the CSS variables it renders with come from the group\'s root via normal CSS inheritance, not a second computation. See the `Size` story.',
		},
		unstyled: {
			control: 'boolean',
			description: 'Part of `PolymorphicProps` (via the shared `SpecsContract`), not `AccordionGroup`\'s own `AccordionGroupProps`. The semantic base class (`inkq-accordion-group`) on the group\'s root element is ALWAYS emitted regardless of this prop — `unstyled` only suppresses the CSS-module-hashed class normally appended alongside it (that hash exists thanks to the COMBINED `.inkq-accordion, .inkq-accordion-group { ... }` rule at the top of `Accordion.module.scss`, even though `.inkq-accordion-group`\'s own dedicated rule further down has no properties of its own). It also cascades to every child `Accordion` (which has its own, separately-styled root) via the same context precedence as `layout`/`index`/`open` — but NOT to a child `Accordion.Title`/`Accordion.Content`, which read `unstyled` purely off their own props, never off `Accordion.context`. See the `Unstyled` story.',
		},
	},
	args: {
		...getDefaultProps<Accordion.Group.Props>('Accordion.Group'),
	},
	render: args => (
		<Accordion.Group { ...args }>
			{ renderItems(3) }
		</Accordion.Group>
	),
}

export default meta

export const Default: Story = {
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)

		await expect(canvasElement.querySelector('[data-group]')).toBeInTheDocument()

		const titles = canvas.getAllByRole('button')
		expect(titles).toHaveLength(3)

		// Registered default `defaultOpen: 0` — only the first item starts open.
		await expect(titles[0]).toHaveAttribute('aria-expanded', 'true')
		await expect(titles[1]).toHaveAttribute('aria-expanded', 'false')
		await expect(titles[2]).toHaveAttribute('aria-expanded', 'false')
	},
}

// `collapsible` is `AccordionGroupType | false` (registered default
// `'single'`): `'single'`/`'multiple'` pick the group's disclosure mode
// (`handleItemToggle` reads its OWN value directly — `'single'` closes any
// other open item when one opens; `'multiple'` toggles independently), while
// `false` makes EVERY item in the group permanently open and untogglable —
// enforced in TWO places:
//
//  1. `Accordion.tsx` computes `isOpen = collapsible ? (...) : true`, so the
//     item is always open, and its `handleToggle` returns early.
//  2. `AccordionTitle.tsx` branches on `interactive = collapsible !== false`.
//     When NOT interactive it renders a plain `<div>` (with `data-title`, no
//     `aria`) instead of a `<button>` — so there is no button role and no
//     `aria-expanded` at all, rather than a button that lies about being
//     expandable. That is why the `false` group below is queried by
//     `[data-title]`, not by role.
export const Collapsible: Story = {
	parameters: { controls: { exclude: ['collapsible'] } },
	render: args => (
		<Row>
			{ COLLAPSIBLE_OPTIONS.map(collapsible => (
				<Group key={ String(collapsible) } label={ String(collapsible) }>
					<Accordion.Group { ...args } collapsible={ collapsible } defaultOpen={ 0 }>
						{ renderItems(3) }
					</Accordion.Group>
				</Group>
			)) }
		</Row>
	),
	play: async ({ canvasElement }) => {
		const groups = canvasElement.querySelectorAll('[data-group]')
		expect(groups).toHaveLength(3)

		// `COLLAPSIBLE_OPTIONS` is `['single', 'multiple', false]`, mapped in
		// order.
		const [single, multiple, nonCollapsible] = groups as unknown as [HTMLElement, HTMLElement, HTMLElement]

		const singleTitles = within(single).getAllByRole('button')
		await userEvent.click(singleTitles[2])
		await expect(singleTitles[0]).toHaveAttribute('aria-expanded', 'false')
		await expect(singleTitles[2]).toHaveAttribute('aria-expanded', 'true')

		const multipleTitles = within(multiple).getAllByRole('button')
		await userEvent.click(multipleTitles[2])
		await expect(multipleTitles[0]).toHaveAttribute('aria-expanded', 'true')
		await expect(multipleTitles[2]).toHaveAttribute('aria-expanded', 'true')

		// `false`: no button role anywhere in the group, and every title is a
		// plain <div> carrying no aria-expanded.
		await expect(within(nonCollapsible).queryAllByRole('button')).toHaveLength(0)

		// ALL THREE, not just the first: "every item forced open" is precisely
		// what separates these semantics from a reading where only one item is
		// always open, but you can switch which one — and that other reading
		// satisfies every assertion below if only item 0 is inspected.
		const nonCollapsibleTitles = [...nonCollapsible.querySelectorAll<HTMLElement>('[data-title]')]

		await expect(nonCollapsibleTitles).toHaveLength(3)

		for (const title of nonCollapsibleTitles) {
			await expect(title.tagName).toBe('DIV')
			await expect(title).not.toHaveAttribute('aria-expanded')

			// its item stays open, and clicking changes nothing.
			const item = title.closest('[data-open]')

			await expect(item).toBeInTheDocument()
			await userEvent.click(title)
			await expect(item).toHaveAttribute('data-open')
			await expect(title).not.toHaveAttribute('aria-expanded')
		}
	},
}

export const DefaultOpen: Story = {
	parameters: { controls: { exclude: ['defaultOpen', 'collapsible'] } },
	render: args => (
		<Row>
			<Group label="number: 1">
				<Accordion.Group { ...args } collapsible="single" defaultOpen={ 1 }>
					{ renderItems(3) }
				</Accordion.Group>
			</Group>
			<Group label="array [0, 2], collapsible: single (sliced to first index only)">
				<Accordion.Group { ...args } collapsible="single" defaultOpen={ [0, 2] }>
					{ renderItems(3) }
				</Accordion.Group>
			</Group>
			<Group label="array [0, 2], collapsible: multiple">
				<Accordion.Group { ...args } collapsible="multiple" defaultOpen={ [0, 2] }>
					{ renderItems(3) }
				</Accordion.Group>
			</Group>
		</Row>
	),
	play: async ({ canvasElement }) => {
		const groups = canvasElement.querySelectorAll('[data-group]')
		expect(groups).toHaveLength(3)

		const [numberGroup, slicedArrayGroup, multipleArrayGroup] = groups,
			numberTitles = within(numberGroup as HTMLElement).getAllByRole('button'),
			slicedTitles = within(slicedArrayGroup as HTMLElement).getAllByRole('button'),
			multipleTitles = within(multipleArrayGroup as HTMLElement).getAllByRole('button')

		await expect(numberTitles[0]).toHaveAttribute('aria-expanded', 'false')
		await expect(numberTitles[1]).toHaveAttribute('aria-expanded', 'true')
		await expect(numberTitles[2]).toHaveAttribute('aria-expanded', 'false')

		// `collapsible: 'single'` slices the normalized `[0, 2]` down to `[0]`.
		await expect(slicedTitles[0]).toHaveAttribute('aria-expanded', 'true')
		await expect(slicedTitles[2]).toHaveAttribute('aria-expanded', 'false')

		// `collapsible: 'multiple'` keeps the full normalized list.
		await expect(multipleTitles[0]).toHaveAttribute('aria-expanded', 'true')
		await expect(multipleTitles[2]).toHaveAttribute('aria-expanded', 'true')
	},
}

// `layout` cascades to every child `Accordion` via context — each item's
// `step` is keyed off its own sequential `index` (assigned by the group,
// not any prop on the child itself).
export const Layout: Story = {
	args: { layout: 'steps' },
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			titles = canvas.getAllByRole('button')

		expect(titles).toHaveLength(3)

		await expect(titles[0].querySelector('[class*="step"]')).toHaveTextContent('01')
		await expect(titles[1].querySelector('[class*="step"]')).toHaveTextContent('02')
		await expect(titles[2].querySelector('[class*="step"]')).toHaveTextContent('03')
	},
}

// `order` cascades to every child `Accordion` via context (own prop always
// wins), which renders its title text as a literal `h${order}` heading tag —
// tested here via the implicit ARIA `heading` role's `level`, not a
// class/selector heuristic.
export const Order: Story = {
	parameters: { controls: { exclude: ['order'] } },
	render: args => (
		<Row>
			{ ORDER_OPTIONS.map(order => (
				<Group key={ order } label={ String(order) }>
					<Accordion.Group { ...args } order={ order }>
						{ renderItems(1) }
					</Accordion.Group>
				</Group>
			)) }
		</Row>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)

		for (const order of ORDER_OPTIONS) {
			const heading = canvas.getByRole('heading', { level: order })
			await expect(heading.tagName).toBe(`H${ order }`)
		}
	},
}

// `size` feeds `getSharedTokens`' shared CSS custom properties on the GROUP'S
// OWN root via a per-size `step` (`{ sm: 2, md: 1, lg: 0 }`) applied on top of
// `order` — asserted here against `--accordion-text-size` (`config.order =
// order + step`), which with the registered default `order: 3` resolves to
// `h5`/`h4`/`h3` respectively.
export const Size: Story = {
	parameters: { controls: { exclude: ['size'] } },
	render: args => (
		<Row>
			{ SIZE_OPTIONS.map(size => (
				<Group key={ size } label={ size }>
					<Accordion.Group { ...args } size={ size }>
						{ renderItems(1) }
					</Accordion.Group>
				</Group>
			)) }
		</Row>
	),
	play: async ({ canvasElement }) => {
		const groups = canvasElement.querySelectorAll('[data-group]')

		expect(groups).toHaveLength(3)
		// `SIZE_OPTIONS` is `['sm', 'md', 'lg']`, mapped in order.
		const [sm, md, lg] = groups as unknown as HTMLElement[]

		await expect(sm.style.getPropertyValue('--accordion-text-size')).toBe('var(--inkq-font-size-heading-h5)')
		await expect(md.style.getPropertyValue('--accordion-text-size')).toBe('var(--inkq-font-size-heading-h4)')
		await expect(lg.style.getPropertyValue('--accordion-text-size')).toBe('var(--inkq-font-size-heading-h3)')
	},
}

// Cascades to every child `Accordion` via context, and — since
// `AccordionTitle` renders `disabled` as a NATIVE `disabled` attribute — a
// disabled group makes every title genuinely unfocusable, not just inert to
// clicks.
export const Disabled: Story = {
	parameters: { controls: { exclude: ['disabled'] } },
	render: args => (
		<Row>
			{ BOOLEAN_OPTIONS.map(disabled => (
				<Group key={ String(disabled) } label={ String(disabled) }>
					<Accordion.Group { ...args } disabled={ disabled }>
						{ renderItems(3) }
					</Accordion.Group>
				</Group>
			)) }
		</Row>
	),
	play: async ({ canvasElement }) => {
		const groups = canvasElement.querySelectorAll('[data-group]')
		expect(groups).toHaveLength(2)

		// `BOOLEAN_OPTIONS` is `[true, false]`, mapped in order.
		const [disabledGroup, enabledGroup] = groups as unknown as [HTMLElement, HTMLElement],
			disabledTitles = within(disabledGroup).getAllByRole('button'),
			enabledTitles = within(enabledGroup).getAllByRole('button')

		for (const title of disabledTitles)
			await expect(title).toHaveAttribute('disabled')
		for (const title of enabledTitles)
			await expect(title).not.toHaveAttribute('disabled')

		// Every title in the disabled group drops out of the Tab sequence
		// entirely — Tab from a blurred state skips the whole group and lands
		// directly on the first title of the ENABLED group, not anywhere inside
		// the disabled one.
		await userEvent.tab()
		for (const title of disabledTitles)
			await expect(title).not.toHaveFocus()
		await expect(enabledTitles[0]).toHaveFocus()

		// A disabled title can't even be focused programmatically —
		// `.focus()` on a native `disabled` button is a no-op — which is
		// exactly why `AccordionTitle`'s roving `handleKeyDown`
		// (`titles[next]?.focus()`) can't land on one either, even though its
		// `[data-title]` selector still MATCHES disabled buttons via
		// `querySelectorAll`.
		disabledTitles[0].focus()
		await expect(disabledTitles[0]).not.toHaveFocus()
	},
}

// Roving keyboard nav (`AccordionTitle`'s `handleKeyDown`) only works when
// scoped inside a `[data-group]` ancestor — `Accordion.Group` is the only
// thing that renders one. `ArrowDown`/`ArrowUp` wrap at both ends; `Home`/
// `End` jump straight to the first/last title. None of these items are
// disabled — see the `Disabled` story for how a disabled group's titles
// drop out of the Tab sequence and can't be `.focus()`ed at all (which is
// what would make an arrow-key `.focus()` call onto one a no-op too).
export const KeyboardFocus: Story = {
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			titles = canvas.getAllByRole('button')

		expect(titles).toHaveLength(3)
		const [first, second, third] = titles

		await userEvent.tab()
		await expect(first).toHaveFocus()

		await userEvent.keyboard('{ArrowDown}')
		await expect(second).toHaveFocus()

		await userEvent.keyboard('{ArrowDown}')
		await expect(third).toHaveFocus()

		// Wraps from the LAST title back to the FIRST.
		await userEvent.keyboard('{ArrowDown}')
		await expect(first).toHaveFocus()

		// Wraps backward from the FIRST title to the LAST.
		await userEvent.keyboard('{ArrowUp}')
		await expect(third).toHaveFocus()

		await userEvent.keyboard('{Home}')
		await expect(first).toHaveFocus()

		await userEvent.keyboard('{End}')
		await expect(third).toHaveFocus()

		first.focus()
		await expect(first).toHaveFocus()

		// Any other key is a no-op — focus doesn't move.
		await userEvent.keyboard('a')
		await expect(first).toHaveFocus()
	},
}

// A child `Accordion`'s own raw props win over whatever `Accordion.Group`
// would otherwise inject through context — `useAccordionGroupProps`'
// `Object.hasOwn` guard only fills a key when it's entirely ABSENT from that
// child's own props. Two independent overrides, both against a `disabled`
// group so the `disabled` precedence isn't confused with the `open` one:
// only the first item is opened by the group's own state (`defaultOpen: 0`,
// `collapsible: 'single'`), but the third item forces its own `open` prop to `true`
// regardless; the group's own `disabled` cascades to items 1-3 (none set
// their own), but the fourth item's own `disabled={false}` wins over it.
export const ContextOverrides: Story = {
	render: args => (
		<Accordion.Group { ...args } collapsible="single" defaultOpen={ 0 } disabled>
			<Accordion>
				<Accordion.Title>Item 1</Accordion.Title>
				<Accordion.Content>Content for item 1.</Accordion.Content>
			</Accordion>
			<Accordion>
				<Accordion.Title>Item 2</Accordion.Title>
				<Accordion.Content>Content for item 2.</Accordion.Content>
			</Accordion>
			<Accordion open>
				<Accordion.Title>Item 3 (own open=true)</Accordion.Title>
				<Accordion.Content>Content for item 3.</Accordion.Content>
			</Accordion>
			<Accordion disabled={ false }>
				<Accordion.Title>Item 4 (own disabled=false)</Accordion.Title>
				<Accordion.Content>Content for item 4.</Accordion.Content>
			</Accordion>
		</Accordion.Group>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			titles = canvas.getAllByRole('button')

		await expect(titles[0]).toHaveAttribute('aria-expanded', 'true')
		await expect(titles[1]).toHaveAttribute('aria-expanded', 'false')
		await expect(titles[2]).toHaveAttribute('aria-expanded', 'true')

		await expect(titles[0]).toHaveAttribute('disabled')
		await expect(titles[1]).toHaveAttribute('disabled')
		await expect(titles[2]).toHaveAttribute('disabled')
		await expect(titles[3]).not.toHaveAttribute('disabled')
	},
}

// `.inkq-accordion-group`'s OWN dedicated rule (`{ $name: &; }`) has no
// properties — but it still gets a real, compiled CSS-module hash, because
// it's also named in the COMBINED selector at the very top of
// `Accordion.module.scss` (`.inkq-accordion, .inkq-accordion-group {
// --accordion-border-color: ...; }`), which does have a declaration. Each
// class token in a combined selector list gets its own local-scoped export,
// so `inkq-accordion-group` and `inkq-accordion` resolve to two distinct
// hashes despite sharing that one rule — asserted here against the REAL
// compiled export map. `unstyled` also cascades to every child `Accordion`,
// suppressing each child's own hashed class.
export const Unstyled: Story = {
	parameters: { controls: { exclude: ['unstyled'] } },
	render: args => (
		<Row>
			{ BOOLEAN_OPTIONS.map(unstyled => (
				<Group key={ String(unstyled) } label={ String(unstyled) }>
					<Accordion.Group { ...args } unstyled={ unstyled }>
						{ renderItems(1) }
					</Accordion.Group>
				</Group>
			)) }
		</Row>
	),
	play: async ({ canvasElement }) => {
		const groups = canvasElement.querySelectorAll('[data-group]')
		expect(groups).toHaveLength(2)

		const [unstyledGroup, styledGroup] = groups as unknown as [HTMLElement, HTMLElement]

		// The group's own root: base class always present; the hashed
		// CSS-module class (from the combined top-of-file rule) is suppressed
		// only on the unstyled instance.
		await expect(styledGroup).toHaveClass('inkq-accordion-group')
		await expect(unstyledGroup).toHaveClass('inkq-accordion-group')

		const groupHash = classes['inkq-accordion-group']!
		expect(styledGroup.classList.contains(groupHash)).toBe(true)
		expect(unstyledGroup.classList.contains(groupHash)).toBe(false)

		// Cascades to the child `Accordion`'s own (real, styled) root.
		const styledChild = styledGroup.querySelector('.inkq-accordion') as HTMLElement,
			unstyledChild = unstyledGroup.querySelector('.inkq-accordion') as HTMLElement,
			hashed = classes['inkq-accordion']!

		await expect(styledChild).toHaveClass('inkq-accordion')
		await expect(unstyledChild).toHaveClass('inkq-accordion')
		expect(styledChild.classList.contains(hashed)).toBe(true)
		expect(unstyledChild.classList.contains(hashed)).toBe(false)
	},
}
