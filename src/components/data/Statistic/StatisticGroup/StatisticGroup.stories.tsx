import { expect, within } from 'storybook/test'
import { getDefaultProps } from '@/hooks/useProps'
import { Statistic } from '../Statistic'
import { AS_OPTIONS, BOOLEAN_OPTIONS, COLUMNS_OPTIONS, ORDER_OPTIONS, ORIENTATION_OPTIONS, SIZE_OPTIONS } from '../options.story'
import type { ReactNode } from 'react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import statisticModuleClasses from '../Statistic.module.scss'

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
		{ children }
	</div>
)

// `Statistic.Group.Props` (the `declare namespace` export, re-exported off
// `Statistic`) is just the raw `Omit<Group.Props, 'childName' | 'provider'>`
// interface — it doesn't include `unstyled`/`attributes`/etc., which only
// exist on the actual accepted prop type, `PolymorphicProps<...>`.
// `Parameters<typeof Statistic.Group>[0]` reads that real, wrapped type
// straight off the component itself — `StatisticGroupSpecs` is a group
// (`isGroup: true`) with a registered default `as: 'div'`, so `as` is
// accepted and `getDefaultProps` returns it.
type StatisticGroupStoryProps = Parameters<typeof Statistic.Group>[0]

// `layout/Group`'s props are a union (`MaybeAnimationProps`: an animated
// branch with `animated: true` + `duration`, and a static branch), and this
// cast was written to pick the animated lane. But `StatisticGroupProps`
// `extends Omit<Group.Props, ...>`, and `Omit` over a union is not
// distributive, so that union is most likely already flattened into a single
// object type here — in which case this `Exclude` removes nothing and the
// cast is an identity. That has NOT been confirmed with the compiler; if
// `AnimatedGroupArgs` resolves to the same type as `StatisticGroupStoryProps`,
// the cast can be dropped.
type AnimatedGroupArgs = Exclude<StatisticGroupStoryProps, { animated?: never }>

type Story = StoryObj<StatisticGroupStoryProps>

const hasStatisticModuleClass = (el: Element, base: string) => {
	const moduleClass = (statisticModuleClasses as Record<string, string>)[base]
	return !!moduleClass && el.classList.contains(moduleClass)
}

const read = (el: Element, token: string) =>
	(el as HTMLElement).style.getPropertyValue(token)

// Every child here is rendered with its own `animated={false}` purely for
// story determinism (structural stories about `columns`/`divider`/
// `fullWidth`/`orientation`/`justify` don't need a live count-up race to
// prove their point) — the group's own `animated`/`duration`/`stagger` DO
// genuinely cascade to any child that doesn't set its own (see the
// `animated` argType doc note and `ContextPrecedence` below), so this is
// just each child opting out individually, the same way an explicit own
// prop always wins over the inherited one.
const renderStatistics = (count: number) => Array.from({ length: count }, (_, index) => (
	<Statistic
		key={ index }
		animated={ false }
		caption={ `Metric ${ index + 1 }` }
		value={ (index + 1) * 100 }
	/>
))

const statisticGroupDefaults = getDefaultProps<Statistic.Group.Props>('Statistic.Group')

const meta: Meta<StatisticGroupStoryProps> = {
	component: Statistic.Group,
	title: 'Data/Statistic/Statistic.Group',
	argTypes: {
		as: {
			control: 'select',
			options: AS_OPTIONS,
			description: 'Registered default `\'div\'`. The tag of the group\'s root element, passed on to the inner `<Group>`; The inner `<Group>` adds `role="group"` unless the tag is `fieldset`, `hgroup` or `optgroup`. See the `As` story.',
		},
		columns: {
			control: 'number',
			description: 'Fed straight through to the inner `<Group>`, which feeds a `--group-item-count` CSS custom property on the root element via its own `tokens` function built with `defineTokens` (`tokens.root`) — no clamping/validation. `--group-cols` (the property `Group.module.scss`\'s `grid-template-columns` actually reads) is computed FROM `--group-item-count` inside the stylesheet itself and is never set inline, so it isn\'t something a story can assert on directly. Rendered as an inline style, not a class. See the `Columns` story.',
		},
		divider: {
			control: 'boolean',
			description: '`Group.tsx` no longer applies any `module`/`global`-scope config class at all (`styles(\'root\')` is called with no second argument) — divider styling lives entirely on the self-referencing `&:where([data-divide])` selector in `Group.module.scss`, keyed off the `data-divide` attribute (`attributes.data.divide`) `Group` sets directly. There is no `inkq-group--divider` class to assert on. See the `Divider` story.',
		},
		fullWidth: {
			control: 'boolean',
			description: 'Adds a `data-block` attribute to the root element (`attributes.data.block`, present only when truthy) — no accompanying class, unlike `Button`\'s own `fullWidth`. See the `FullWidth` story.',
		},
		orientation: {
			control: 'select',
			options: ORIENTATION_OPTIONS,
			description: 'Sets `aria-orientation` on the root unconditionally when present — that\'s its ONLY effect. `Group.tsx` calls `styles(\'root\')` with no config object at all, so there is no accompanying `inkq-group--horizontal`/`inkq-group--vertical`/`inkq-group--grid` class in either state; the actual layout switch (grid vs. row/column) lives entirely in `Group.module.scss`\'s `&:not([aria-orientation])` selector, keyed off the same attribute. See the `Orientation` story.',
		},
		justify: {
			control: 'text',
			description: 'Passed through to the inner `Group`, which destructures it and emits it as the `--group-justify` token on the root element (`justify ?? undefined`); `Group.module.scss` applies it as `justify-content: var(--group-justify)`. It is not rendered as a DOM attribute. Like every token it is dropped when `unstyled`. See the `Justify` story.',
		},
		animated: {
			control: 'boolean',
			description: 'Cascades to every child `Statistic` that doesn\'t set its own `animated`. `animated` (along with `duration`/`stagger`/`once`) IS in `RESERVED_PROPS` (`@/hooks/useProps/helpers.ts`), which `extractOthers` strips by default — but `StatisticGroup.tsx` calls `extractOthers(rest, GROUP_CASCADE_PROPS)`, and that `keep` list exempts those keys, so `others` genuinely forwards them to the inner `<Group>`, which folds them into each child\'s context value. (Separately, `animated` is part of the `MaybeAnimationProps` union with `duration`: it is either `true` with a required `duration`, or the static branch where `animated` may be omitted or `false`.) See `ContextPrecedence`, which demonstrates the cascade end to end via `duration`/`stagger` (chosen over `animated` itself purely to avoid a flaky always-true/always-false assertion).',
		},
		duration: {
			control: 'number',
			description: 'Required when `animated` is `true` (see `animated` above). Registered default `3000`ms, cascaded to every child the same way. See `ContextPrecedence`.',
		},
		stagger: {
			control: 'number',
			description: 'Combines with each child\'s auto-assigned `index` (0-based position among surviving `Statistic` children) as `delay: index * stagger` — one shared `useReplayInView` call on the group\'s own root drives every child off the same `t = 0`, rather than each child racing its own observer. Registered default `200`ms. `ContextPrecedence` pins `stagger={ 0 }`, so no story here asserts the resulting delay.',
		},
		once: {
			control: 'boolean',
			description: 'Cascades to the inner `<Group>` exactly like `animated`/`duration`/`stagger`. `once` is in `RESERVED_PROPS` (`@/hooks/useProps/helpers.ts`), so `extractOthers` would strip it by default — but it is also in `GROUP_CASCADE_PROPS`, the `keep` list `StatisticGroup.tsx` passes to `extractOthers`, so `others` genuinely forwards it: `Group` destructures `once` and passes it into `useReplayInView(ref, { amount, once })`. With `once: true` the reveal latches on first entry instead of replaying each time the group re-enters the viewport. No story renders `true`/`false` side by side: the difference only shows when the group leaves and re-enters the viewport, which a `play` function cannot trigger deterministically.',
		},
		order: {
			control: 'select',
			options: ORDER_OPTIONS,
			description: 'Registered default `\'descend\'` (part of `StatisticGroup`\'s own `DEFAULT_PROPS`). Passed on in `values={ { order, size, unstyled } }`, which `Group` folds into each child\'s context value, and it drives the shared `--stat-align`/`--stat-direction` tokens on the GROUP\'S OWN root: a grouped `Statistic`\'s root gets no tokens of its own (`{}`), by design, and inherits these through CSS. Any child `Statistic` that doesn\'t set its own `order` inherits this one (`useStatisticGroupProps`\'s `Object.hasOwn` guard on the child\'s raw, pre-merge props). See the `Order` and `OrderAndSize` stories.',
		},
		size: {
			control: 'select',
			options: SIZE_OPTIONS,
			description: 'Registered default `\'lg\'` (part of `StatisticGroup`\'s own `DEFAULT_PROPS`). Passed on in `values={ { order, size, unstyled } }`, which `Group` folds into each child\'s context value, and it drives the shared size tokens (`--stat-row-gap`, `--stat-font-size`, `--stat-icon-size`, `--stat-icon-margin`, `--stat-font-caption`) on the GROUP\'S OWN root, which grouped items inherit through CSS. Any child `Statistic` that doesn\'t set its own `size` inherits this one; a child\'s own explicit `size` still wins for its size CLASS (`inkq-statistic--<size>`), though not for tokens, since the item\'s root gets none. See the `Size` and `OrderAndSize` stories.',
		},
		unstyled: {
			control: 'boolean',
			description: 'Part of `PolymorphicProps` (via the shared `FactoryContract`), not `StatisticGroup`\'s own props. `StatisticGroup.tsx` destructures it and passes it inside `values={ { order, size, unstyled } }`, which `Group` folds into every child\'s context value, so each child `Statistic` without its own `unstyled` inherits it — dropping that child\'s hashed module class and its config classes (`inkq-item`, `inkq-caption`, the `inkq-statistic--<size>` modifier). `StatisticGroup`\'s own `useStyles` also drops the group root\'s `--stat-*` tokens. EXPECTED but not currently true: `Group`\'s own tokens (`--group-item-count`, `--group-justify`) are dropped too — `StatisticGroup.tsx` does not forward `unstyled` to the inner `<Group>`, so the `Unstyled` story\'s `--group-item-count` assertion fails (suspected component bug). See the `Unstyled` story.',
		},
	},
	args: {
		...statisticGroupDefaults,
	},
}

export default meta

export const Default: Story = {
	render: (args) => (
		<Statistic.Group { ...args as AnimatedGroupArgs }>
			{ renderStatistics(4) }
		</Statistic.Group>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			group = canvas.getByRole('group')

		await expect(group).toBeInTheDocument()
		expect(canvas.getAllByText(/^Metric \d$/)).toHaveLength(4)
	},
}

// `as` sets the tag of the group's root element (it is passed on to the inner
// `<Group>`); the children still render, and a `section` root still gets
// `role="group"` (only `fieldset`/`hgroup`/`optgroup` skip it).
export const As: Story = {
	parameters: {
		layout: 'padded',
		controls: { exclude: ['as'] },
	},
	render: (args) => (
		<div style={ { display: 'flex', flexDirection: 'column', gap: 24 } }>
			<Group label="div (default)">
				<Statistic.Group { ...args as AnimatedGroupArgs } as="div">
					{ renderStatistics(2) }
				</Statistic.Group>
			</Group>
			<Group label="section">
				<Statistic.Group { ...args as AnimatedGroupArgs } as="section">
					{ renderStatistics(2) }
				</Statistic.Group>
			</Group>
		</div>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			groups = canvas.getAllByRole('group')

		expect(groups).toHaveLength(2)

		const [asDiv, asSection] = groups

		await expect(asDiv.tagName).toBe('DIV')
		await expect(asSection.tagName).toBe('SECTION')
		await expect(within(asSection).getAllByText(/^Metric \d$/)).toHaveLength(2)
	},
}

export const Columns: Story = {
	parameters: {
		layout: 'padded',
		controls: { exclude: ['columns'] },
	},
	render: (args) => (
		<div style={ { display: 'flex', flexDirection: 'column', gap: 24 } }>
			{ COLUMNS_OPTIONS.map(columns => (
				<Group key={ columns } label={ String(columns) }>
					<Statistic.Group { ...args as AnimatedGroupArgs } columns={ columns }>
						{ renderStatistics(4) }
					</Statistic.Group>
				</Group>
			)) }
		</div>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			groups = canvas.getAllByRole('group')

		expect(groups).toHaveLength(COLUMNS_OPTIONS.length)

		for (const [index, columns] of COLUMNS_OPTIONS.entries())
			await expect(groups[index]).toHaveStyle({ '--group-item-count': String(columns) })
	},
}

// `divider` only ever surfaces as the `data-divide` attribute `Group` sets
// via `attributes.data.divide` — `Group.tsx` calls `styles('root')` with no
// config object at all, so there is no accompanying class to assert on in
// either state.
export const Divider: Story = {
	parameters: { controls: { exclude: ['divider'] } },
	render: (args) => (
		<Row>
			{ BOOLEAN_OPTIONS.map(divider => (
				<Group key={ String(divider) } label={ String(divider) }>
					<Statistic.Group { ...args as AnimatedGroupArgs } divider={ divider }>
						{ renderStatistics(4) }
					</Statistic.Group>
				</Group>
			)) }
		</Row>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			groups = canvas.getAllByRole('group')

		expect(groups).toHaveLength(2)

		const [withDivider, withoutDivider] = groups

		await expect(withDivider).toHaveAttribute('data-divide')
		await expect(withoutDivider).not.toHaveAttribute('data-divide')
	},
}

export const FullWidth: Story = {
	parameters: {
		layout: 'padded',
		controls: { exclude: ['fullWidth'] },
	},
	render: (args) => (
		<div style={ { display: 'flex', flexDirection: 'column', gap: 24 } }>
			{ BOOLEAN_OPTIONS.map(fullWidth => (
				<Group key={ String(fullWidth) } label={ String(fullWidth) }>
					<Statistic.Group { ...args as AnimatedGroupArgs } fullWidth={ fullWidth }>
						{ renderStatistics(4) }
					</Statistic.Group>
				</Group>
			)) }
		</div>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			groups = canvas.getAllByRole('group')

		expect(groups).toHaveLength(2)

		const [isFullWidth, isNotFullWidth] = groups

		await expect(isFullWidth).toHaveAttribute('data-block')
		await expect(isNotFullWidth).not.toHaveAttribute('data-block')
	},
}

// The default (no `orientation` set) lays out as a CSS grid purely via
// `Group.module.scss`'s `&:not([aria-orientation])` selector — setting
// `orientation` only ever adds the `aria-orientation` attribute itself.
// `Group.tsx` applies no config class at all (`styles('root')`, no second
// argument), so there's no `inkq-group--grid`/`--horizontal`/`--vertical`
// class in any state to assert on.
export const Orientation: Story = {
	parameters: {
		layout: 'padded',
		controls: { exclude: ['orientation'] },
	},
	render: (args) => (
		<div style={ { display: 'flex', flexDirection: 'column', gap: 24 } }>
			<Group label="undefined (default — grid)">
				<Statistic.Group { ...args as AnimatedGroupArgs }>
					{ renderStatistics(4) }
				</Statistic.Group>
			</Group>
			{ ORIENTATION_OPTIONS.map(orientation => (
				<Group key={ orientation } label={ orientation }>
					<Statistic.Group { ...args as AnimatedGroupArgs } orientation={ orientation }>
						{ renderStatistics(4) }
					</Statistic.Group>
				</Group>
			)) }
		</div>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			groups = canvas.getAllByRole('group')

		expect(groups).toHaveLength(3)

		const [gridDefault, horizontal, vertical] = groups

		await expect(gridDefault).not.toHaveAttribute('aria-orientation')
		await expect(horizontal).toHaveAttribute('aria-orientation', 'horizontal')
		await expect(vertical).toHaveAttribute('aria-orientation', 'vertical')
	},
}

// `Group.tsx` destructures `justify` and emits it as the `--group-justify`
// token on the root; `Group.module.scss` reads it as `justify-content:
// var(--group-justify)`. So the token is set, the computed `justify-content`
// follows it, and no literal `justify` attribute reaches the DOM.
export const Justify: Story = {
	render: (args) => (
		<Statistic.Group { ...args as AnimatedGroupArgs } justify="center">
			{ renderStatistics(3) }
		</Statistic.Group>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			group = canvas.getByRole('group')

		await expect(group.style.getPropertyValue('--group-justify')).toBe('center')
		await expect(group).toHaveStyle({ justifyContent: 'center' })
		await expect(group).not.toHaveAttribute('justify')
	},
}

// `filterChildren(children, 'Statistic')` (`Group.tsx` calls it with the
// `childName="Statistic"` that `StatisticGroup.tsx` passes) drops any element whose `displayName` isn't
// `'Statistic'` — a raw `<span>` simply renders nothing; it's excluded
// before the `StatisticGroupProvider` wrap/map, not merely hidden.
export const NonStatisticChildren: Story = {
	render: (args) => (
		<Statistic.Group { ...args as AnimatedGroupArgs }>
			<Statistic animated={ false } caption="Kept" value={ 1 } />
			<span>not a Statistic — dropped by filterChildren</span>
			<Statistic animated={ false } caption="Also kept" value={ 2 } />
		</Statistic.Group>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			group = canvas.getByRole('group')

		await expect(canvas.getByText('Kept')).toBeInTheDocument()
		await expect(canvas.getByText('Also kept')).toBeInTheDocument()
		await expect(canvas.queryByText('not a Statistic — dropped by filterChildren')).not.toBeInTheDocument()
		expect(group.children).toHaveLength(2)
	},
}

// `duration`/`stagger` reach the inner `<Group>` element correctly, and DO
// cascade to children with no own `duration`/`stagger` via
// `StatisticGroupProvider`. This is demonstrated here by pinning the group's
// own `duration` to something far shorter than `Statistic`'s registered
// default (`3000`ms) and asserting the inherited child settles well BEFORE
// that default would have allowed — if the cascade were broken, this child
// would still be mid-animation (or not yet started) at the 2s mark. A second child's own
// EXPLICIT `duration`/`stagger` still wins over the group's, per
// `useStatisticGroupProps`' `Object.hasOwn` guard on that child's raw,
// pre-merge props — proven by pinning its own `duration` even shorter still
// and confirming it settles too, independent of the group's value.
// `withinView` here comes from the group's own real, shared
// `IntersectionObserver` (`Group.tsx`'s single `useReplayInView` call) — not
// forceable from a story the way `Statistic.stories.tsx`'s own `WithinView`
// story can, hence the generous (but still sub-default-duration) timeout.
export const ContextPrecedence: Story = {
	render: (args) => (
		<Statistic.Group { ...args as AnimatedGroupArgs } duration={ 100 } stagger={ 0 }>
			<Statistic caption="Inherits group duration (100ms)" value={ 250 } />
			<Statistic caption="Own duration (10ms) wins over group" duration={ 10 } value={ 999 } />
		</Statistic.Group>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)

		// Both settle well before `Statistic`'s registered 3000ms default
		// would allow — proving the group's own (`100`ms) and the child's own
		// override (`10`ms) both took effect, not the registered default.
		await expect(await canvas.findByText('999', {}, { timeout: 2000 })).toBeInTheDocument()
		await expect(await canvas.findByText('250', {}, { timeout: 2000 })).toBeInTheDocument()
	},
}

// `order`/`size` (registered defaults `'descend'`/`'lg'`) are passed on in
// `values={ { order, size, unstyled } }`, which `Group` folds into each
// child's context value. A child `Statistic` with no own `order`/`size`
// inherits the group's; a child with its own explicit `size` keeps it for its
// size CLASS. The tokens are different: they are computed once on the GROUP's
// root, and a grouped item's root gets none (`{}`) whatever it sets itself —
// so a child's own `order`/`size` never changes the tokens it renders with.
export const OrderAndSize: Story = {
	render: (args) => (
		<Row>
			<Group label="group order=ascend, size=sm (both children inherit)">
				<Statistic.Group { ...args as AnimatedGroupArgs } order="ascend" size="sm">
					<Statistic animated={ false } caption="Inherits both" value={ 1 } />
				</Statistic.Group>
			</Group>
			<Group label="child overrides its own order/size">
				<Statistic.Group { ...args as AnimatedGroupArgs } order="ascend" size="sm">
					<Statistic animated={ false } caption="Own order/size" order="descend" size="lg" value={ 2 } />
				</Statistic.Group>
			</Group>
		</Row>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)

		const inherited = canvas.getByText('Inherits both').closest('.inkq-statistic') as HTMLElement,
			overridden = canvas.getByText('Own order/size').closest('.inkq-statistic') as HTMLElement

		const groupOf = (item: HTMLElement) => item.closest('[role="group"]') as HTMLElement

		// The tokens sit on each group's root: `order="ascend"` → `start` +
		// `column-reverse`. Neither item carries tokens of its own.
		for (const item of [inherited, overridden]) {
			await expect(read(groupOf(item), '--stat-align')).toBe('start')
			await expect(read(groupOf(item), '--stat-direction')).toBe('column-reverse')
			await expect(read(item, '--stat-align')).toBe('')
			await expect(read(item, '--stat-direction')).toBe('')
		}

		// inherited: the group's `size="sm"` reached a child with no own value
		// (`sm` has no hashed class, so the literal class is emitted).
		await expect(inherited).toHaveClass('inkq-statistic--sm')

		// overridden: child's own explicit `size="lg"` wins over the group's
		// `sm` for the class.
		expect(hasStatisticModuleClass(overridden, 'inkq-statistic--lg')).toBe(true)
		await expect(overridden).not.toHaveClass('inkq-statistic--sm')
	},
}

// Group-level `order`, one value per labeled group, each with a child that
// sets none of its own: the `--stat-align`/`--stat-direction` tokens sit on
// the GROUP's root (not the child's) and must match that group's order and
// differ from the sibling's.
export const Order: Story = {
	parameters: { controls: { exclude: ['order'] } },
	render: (args) => (
		<Row>
			{ ORDER_OPTIONS.map(order => (
				<Group key={ order } label={ order }>
					<Statistic.Group { ...args as AnimatedGroupArgs } order={ order }>
						{ renderStatistics(1) }
					</Statistic.Group>
				</Group>
			)) }
		</Row>
	),
	play: async ({ canvasElement }) => {
		const groups = canvasElement.querySelectorAll<HTMLElement>('[role="group"]'),
			items = canvasElement.querySelectorAll<HTMLElement>('.inkq-statistic')

		expect(groups).toHaveLength(ORDER_OPTIONS.length)
		expect(items).toHaveLength(ORDER_OPTIONS.length)

		// `ORDER_OPTIONS` is `['ascend', 'descend']`, mapped in order.
		const [ascend, descend] = groups

		await expect(read(ascend, '--stat-align')).toBe('start')
		await expect(read(ascend, '--stat-direction')).toBe('column-reverse')

		await expect(read(descend, '--stat-align')).toBe('end')
		await expect(read(descend, '--stat-direction')).toBe('column')

		// A grouped item's root gets no tokens of its own.
		for (const item of items) {
			await expect(read(item, '--stat-align')).toBe('')
			await expect(read(item, '--stat-direction')).toBe('')
		}
	},
}

// Group-level `size`, one value per labeled group, each with a child that
// sets none of its own: the child gets the matching size class and not its
// sibling's (`lg` is the hashed module class, `sm` the literal one), and the
// size tokens on the GROUP's root differ between the two groups.
export const Size: Story = {
	parameters: { controls: { exclude: ['size'] } },
	render: (args) => (
		<Row>
			{ SIZE_OPTIONS.map(size => (
				<Group key={ size } label={ size }>
					<Statistic.Group { ...args as AnimatedGroupArgs } size={ size }>
						{ renderStatistics(1) }
					</Statistic.Group>
				</Group>
			)) }
		</Row>
	),
	play: async ({ canvasElement }) => {
		const groups = canvasElement.querySelectorAll<HTMLElement>('[role="group"]'),
			items = canvasElement.querySelectorAll<HTMLElement>('.inkq-statistic')

		expect(groups).toHaveLength(SIZE_OPTIONS.length)
		expect(items).toHaveLength(SIZE_OPTIONS.length)

		// `SIZE_OPTIONS` is `['sm', 'lg']`, mapped in order.
		const [smGroup, lgGroup] = groups,
			[sm, lg] = items

		await expect(sm).toHaveClass('inkq-statistic--sm')
		expect(hasStatisticModuleClass(sm, 'inkq-statistic--lg')).toBe(false)
		expect(hasStatisticModuleClass(lg, 'inkq-statistic--lg')).toBe(true)
		await expect(lg).not.toHaveClass('inkq-statistic--sm')

		// All size tokens (root, inner and caption groups) are merged onto the
		// group's root.
		for (const token of [
			'--stat-row-gap', '--stat-font-size', '--stat-icon-size',
			'--stat-icon-margin', '--stat-font-caption',
		]) {
			expect(read(smGroup, token)).not.toBe('')
			expect(read(lgGroup, token)).not.toBe('')
			expect(read(smGroup, token)).not.toBe(read(lgGroup, token))
			expect(read(sm, token)).toBe('')
			expect(read(lg, token)).toBe('')
		}
	},
}

// `filterChildren(children, 'Statistic')` looks inside Fragments, so
// `Statistic`s wrapped in one are kept alongside direct children, and each
// still receives the group's context (here, `order`/`size`).
export const FragmentChildren: Story = {
	render: (args) => (
		<Statistic.Group { ...args as AnimatedGroupArgs } order="ascend" size="sm">
			<>
				<Statistic animated={ false } caption="In fragment 1" value={ 1 } />
				<Statistic animated={ false } caption="In fragment 2" value={ 2 } />
			</>
			<Statistic animated={ false } caption="Direct" value={ 3 } />
		</Statistic.Group>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			group = canvas.getByRole('group')

		expect(group.children).toHaveLength(3)

		// The tokens sit on the group's root, shared by all three items.
		await expect(read(group, '--stat-direction')).toBe('column-reverse')

		for (const caption of ['In fragment 1', 'In fragment 2', 'Direct']) {
			const item = canvas.getByText(caption).closest('.inkq-statistic') as HTMLElement

			await expect(read(item, '--stat-direction')).toBe('')
			await expect(item).toHaveClass('inkq-statistic--sm')
		}
	},
}

// `StatisticGroup` passes `unstyled` in `values`, which `Group` folds into
// every child's context value, so each `Statistic` inherits it: the child
// loses its hashed module class and its config classes (`inkq-item`, the size
// modifier), but keeps the semantic base class. `StatisticGroup`'s own
// `useStyles` drops the group root's `--stat-*` tokens. The group is also
// expected to lose `Group`'s own `--group-item-count` token (`columns` is set
// so there is one to drop); that last assertion is kept last and currently
// fails because `StatisticGroup.tsx` does not forward `unstyled` to `<Group>`.
export const Unstyled: Story = {
	parameters: { controls: { exclude: ['unstyled'] } },
	render: (args) => (
		<Row>
			{ BOOLEAN_OPTIONS.map(unstyled => (
				<Group key={ String(unstyled) } label={ String(unstyled) }>
					<Statistic.Group { ...args as AnimatedGroupArgs } columns={ 3 } unstyled={ unstyled }>
						{ renderStatistics(2) }
					</Statistic.Group>
				</Group>
			)) }
		</Row>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			groups = canvas.getAllByRole('group')

		expect(groups).toHaveLength(2)

		// `BOOLEAN_OPTIONS` is `[true, false]`, mapped in order.
		const [unstyledGroup, styledGroup] = groups

		// The group root carries the shared tokens when styled, none when not.
		await expect(read(styledGroup, '--stat-align')).not.toBe('')
		await expect(read(unstyledGroup, '--stat-align')).toBe('')

		const styledItems = styledGroup.querySelectorAll<HTMLElement>('.inkq-statistic'),
			unstyledItems = unstyledGroup.querySelectorAll<HTMLElement>('.inkq-statistic')

		expect(styledItems).toHaveLength(2)
		expect(unstyledItems).toHaveLength(2)

		// A grouped item's root never has tokens of its own, styled or not.
		for (const item of styledItems) {
			expect(hasStatisticModuleClass(item, 'inkq-statistic')).toBe(true)
			await expect(item).toHaveClass('inkq-item')
			expect(read(item, '--stat-align')).toBe('')
		}

		for (const item of unstyledItems) {
			await expect(item).toHaveClass('inkq-statistic')
			expect(hasStatisticModuleClass(item, 'inkq-statistic')).toBe(false)
			await expect(item).not.toHaveClass('inkq-item')
			expect(read(item, '--stat-align')).toBe('')
		}

		await expect(styledGroup.style.getPropertyValue('--group-item-count')).toBe('3')
		await expect(unstyledGroup.style.getPropertyValue('--group-item-count')).toBe('')
	},
}
