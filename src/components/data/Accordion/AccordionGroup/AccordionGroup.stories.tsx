import { expect, userEvent, within } from 'storybook/test'
import { getDefaultProps } from '@/hooks/useProps'
import { Accordion } from '../Accordion'
import { BOOLEAN_OPTIONS, LAYOUT_OPTIONS, TYPE_OPTIONS } from '../options.story'
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
// `index` via `cxtValues` (`Array.from({ length: total }, (_, index) => ...)`)
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
			control: 'boolean',
			description: 'Only consulted in `type: \'single\'` mode: gates whether closing the CURRENTLY open item is allowed at all (`handleItemToggle`\'s `!next` branch: `collapsible ? [] : prev`). Has no effect in `\'multiple\'` mode, where each item toggles independently regardless. See the `Collapsible` story.',
		},
		defaultOpen: {
			control: 'object',
			description: 'A `number` or `number[]`, normalized by `handleOpenItems`. In `type: \'single\'` mode the normalized list is SLICED to just the first index (`indices.slice(0, 1)`) — passing an array with more than one entry only ever opens the first of them. See the `DefaultOpen` story.',
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
		type: {
			control: 'select',
			options: TYPE_OPTIONS,
			description: '`\'single\'`: at most one item open at a time (opening one closes any other). `\'multiple\'`: items toggle independently. See the `Types` story.',
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

export const Types: Story = {
	render: args => (
		<Row>
			{ TYPE_OPTIONS.map(type => (
				<Group key={ type } label={ type }>
					<Accordion.Group { ...args } type={ type } defaultOpen={ 0 } collapsible>
						{ renderItems(3) }
					</Accordion.Group>
				</Group>
			)) }
		</Row>
	),
	play: async ({ canvasElement }) => {
		const groups = canvasElement.querySelectorAll('[data-group]')

		expect(groups).toHaveLength(2)

		// `TYPE_OPTIONS` is `['single', 'multiple']`, mapped in order.
		const [single, multiple] = groups,
			singleTitles = within(single as HTMLElement).getAllByRole('button'),
			multipleTitles = within(multiple as HTMLElement).getAllByRole('button')

		await userEvent.click(singleTitles[2])
		await expect(singleTitles[0]).toHaveAttribute('aria-expanded', 'false')
		await expect(singleTitles[2]).toHaveAttribute('aria-expanded', 'true')

		await userEvent.click(multipleTitles[2])
		await expect(multipleTitles[0]).toHaveAttribute('aria-expanded', 'true')
		await expect(multipleTitles[2]).toHaveAttribute('aria-expanded', 'true')
	},
}

// Only meaningful in `type: 'single'` mode — `handleItemToggle`'s `!next`
// branch returns `prev` unchanged (a no-op) when `collapsible` is false,
// instead of clearing the open item.
export const Collapsible: Story = {
	parameters: { controls: { exclude: ['collapsible'] } },
	render: args => (
		<Row>
			{ BOOLEAN_OPTIONS.map(collapsible => (
				<Group key={ String(collapsible) } label={ String(collapsible) }>
					<Accordion.Group { ...args } type="single" collapsible={ collapsible } defaultOpen={ 0 }>
						{ renderItems(3) }
					</Accordion.Group>
				</Group>
			)) }
		</Row>
	),
	play: async ({ canvasElement }) => {
		const groups = canvasElement.querySelectorAll('[data-group]')
		expect(groups).toHaveLength(2)

		const [collapsibleGroup, nonCollapsibleGroup] = groups,
			collapsibleTitle = within(collapsibleGroup as HTMLElement).getAllByRole('button')[0],
			nonCollapsibleTitle = within(nonCollapsibleGroup as HTMLElement).getAllByRole('button')[0]

		await expect(collapsibleTitle).toHaveAttribute('aria-expanded', 'true')
		await userEvent.click(collapsibleTitle)
		await expect(collapsibleTitle).toHaveAttribute('aria-expanded', 'false')

		await expect(nonCollapsibleTitle).toHaveAttribute('aria-expanded', 'true')
		await userEvent.click(nonCollapsibleTitle)
		await expect(nonCollapsibleTitle).toHaveAttribute('aria-expanded', 'true')
	},
}

export const DefaultOpen: Story = {
	parameters: { controls: { exclude: ['defaultOpen', 'type'] } },
	render: args => (
		<Row>
			<Group label="number: 1">
				<Accordion.Group { ...args } type="single" defaultOpen={ 1 }>
					{ renderItems(3) }
				</Accordion.Group>
			</Group>
			<Group label="array [0, 2], type: single (sliced to first index only)">
				<Accordion.Group { ...args } type="single" defaultOpen={ [0, 2] }>
					{ renderItems(3) }
				</Accordion.Group>
			</Group>
			<Group label="array [0, 2], type: multiple">
				<Accordion.Group { ...args } type="multiple" defaultOpen={ [0, 2] }>
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

		// `type: 'single'` slices the normalized `[0, 2]` down to `[0]`.
		await expect(slicedTitles[0]).toHaveAttribute('aria-expanded', 'true')
		await expect(slicedTitles[2]).toHaveAttribute('aria-expanded', 'false')

		// `type: 'multiple'` keeps the full normalized list.
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
// `type: 'single'`), but the third item forces its own `open` prop to `true`
// regardless; the group's own `disabled` cascades to items 1-3 (none set
// their own), but the fourth item's own `disabled={false}` wins over it.
export const ContextOverrides: Story = {
	render: args => (
		<Accordion.Group { ...args } type="single" defaultOpen={ 0 } disabled>
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
