import { expect, within } from 'storybook/test'
import { getDefaultProps } from '@/hooks/useProps'
import { Statistic } from '../Statistic'
import { BOOLEAN_OPTIONS, COLUMNS_OPTIONS, ORDER_OPTIONS, ORIENTATION_OPTIONS, SIZE_OPTIONS } from '../options.story'
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
// straight off the component itself — `StatisticGroupSpecs`'s
// `isCompound: true` makes `as` resolve to `never` (compound components
// don't take a tag override), so this also correctly excludes `as` from the
// story's own controls.
type StatisticGroupStoryProps = Parameters<typeof Statistic.Group>[0]

// Still `BaseGroupProps & (AnimatedGroupProps | StaticGroupProps)` under the
// hood (inherited from `layout/Group`'s own discriminated union) — same
// conditional shape `Group.tsx` itself never has to narrow by hand (it just
// destructures all three fields optimistically), but a story spreading a
// single `args` object onto the component needs to pick a lane. Every story
// here uses the (default-registered) animated branch, so exclude the static
// one — mirroring `Button.stories.tsx`'s `NativeButtonArgs` exclusion of the
// link branch.
type AnimatedGroupArgs = Exclude<StatisticGroupStoryProps, { animated?: never }>

type Story = StoryObj<StatisticGroupStoryProps>

const hasStatisticModuleClass = (el: Element, base: string) => {
	const moduleClass = (statisticModuleClasses as Record<string, string>)[base]
	return !!moduleClass && el.classList.contains(moduleClass)
}

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
		columns: {
			control: 'number',
			description: 'Fed straight into a `--group-item-count` CSS custom property on the root element via `setThemeCSS` (`tokens.root`) — no clamping/validation. `--group-cols` (the property `Group.module.scss`\'s `grid-template-columns` actually reads) is computed FROM `--group-item-count` inside the stylesheet itself and is never set inline, so it isn\'t something a story can assert on directly. Rendered as an inline style, not a class. See the `Columns` story.',
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
			description: '**Probable source bug, verified against the live `Group.tsx`**: declared on `BaseGroupProps` but NOT destructured anywhere in `Group`\'s own render — it falls through `...rest` and is spread onto the root element as a literal, unrecognized `justify="..."` DOM attribute, with no effect on actual `justify-content`. Identical pattern to `Button.Group`\'s own `justify` bug. See the `Justify` story.',
		},
		animated: {
			control: 'boolean',
			description: 'Cascades correctly to every child `Statistic` that doesn\'t set its own `animated` — `extractOtherProps` (`@/hooks/useProps/helpers.ts`) only strips `as`/`childName`/`children`/`className`/`classNames`/`displayName`/`loading`/`revealFrom`/`style`/`styles`/`withinView`; `animated` (along with `duration`/`stagger`/`once`) is NOT in that list, so `StatisticGroup.tsx`\'s `others` spread genuinely forwards it to the inner `<Group>`, which folds it into each child\'s context value. (Separately, `animated` is also part of a discriminated union with `duration`: TypeScript only allows `true` or entirely-absent, never an explicit `false`, on `Group`/`Statistic.Group`.) See `ContextPrecedence`, which demonstrates the cascade end to end via `duration`/`stagger` (chosen over `animated` itself purely to avoid a flaky always-true/always-false assertion).',
		},
		duration: {
			control: 'number',
			description: 'Required when `animated` is `true` (see `animated` above). Registered default `3000`ms, cascaded to every child the same way. See `ContextPrecedence`.',
		},
		stagger: {
			control: 'number',
			description: 'Combines with each child\'s auto-assigned `index` (0-based position among surviving `Statistic` children) as `delay: index * stagger` — one shared `IntersectionObserver` on the group\'s own root drives every child off the same `t = 0`, rather than each child racing its own observer. Registered default `200`ms. See `ContextPrecedence`.',
		},
		once: {
			control: 'boolean',
			description: 'Cascades to the inner `<Group>` exactly like `animated`/`duration`/`stagger`. `once` was previously in `extractOtherProps`\' hard-coded strip list (`@/hooks/useProps/helpers.ts`), which meant `Statistic.Group`\'s registered `once: false` — and any explicit override — never reached `Group`\'s `useReplayInView` call. It has since been removed from that list, so `others` now genuinely forwards it: `Group` destructures `once` and passes it into `useReplayInView(ref, { amount, once })`. With `once: true` the reveal latches on first entry instead of replaying each time the group re-enters the viewport.',
		},
		order: {
			control: 'select',
			options: ORDER_OPTIONS,
			description: 'Not part of `StatisticGroup`\'s own `DEFAULT_PROPS` (no registered default at the group level) — passed straight through to `valuesCtx={ { order, size } }`, which `Group` folds into each child\'s context value. Any child `Statistic` that doesn\'t set its own `order` inherits this one (`useStatisticGroupProps`\'s `Object.hasOwn` guard on the child\'s raw, pre-merge props); a child\'s own explicit `order` still wins. See the `OrderAndSize` story.',
		},
		size: {
			control: 'select',
			options: SIZE_OPTIONS,
			description: 'Not part of `StatisticGroup`\'s own `DEFAULT_PROPS` (no registered default at the group level) — passed straight through to `valuesCtx={ { order, size } }`, which `Group` folds into each child\'s context value. Any child `Statistic` that doesn\'t set its own `size` inherits this one; a child\'s own explicit `size` still wins. See the `OrderAndSize` story.',
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

// `justify` is declared on `Group.Props` but never destructured in
// `Group.tsx`'s own render — it falls through `...rest` and lands as a
// literal, unrecognized DOM attribute, with no actual effect on layout.
export const Justify: Story = {
	render: (args) => (
		<Statistic.Group { ...args as AnimatedGroupArgs } justify="center">
			{ renderStatistics(3) }
		</Statistic.Group>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			group = canvas.getByRole('group')

		await expect(group).toHaveAttribute('justify', 'center')
		await expect(group).not.toHaveStyle({ justifyContent: 'center' })
	},
}

// `filterChildren(children, 'Statistic')` (via `Group.tsx`'s own
// `childName="Statistic"`) drops any element whose `displayName` isn't
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
// `IntersectionObserver` (`Group.tsx`'s single `useInView` call) — not
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

// `order`/`size` aren't part of `StatisticGroup`'s own registered defaults —
// they're passed straight through to `valuesCtx={ { order, size } }`, which
// `Group` folds into each child's context value. A child `Statistic` with no
// own `order`/`size` inherits the group's; a child with its own explicit
// value keeps it regardless of the group's setting.
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

		// inherited: group's `order="ascend"`/`size="sm"` took effect on a
		// child with no own value.
		await expect(inherited).toHaveStyle({
			'--statistic-align': 'flex-end',
			'--statistic-direction': 'column-reverse',
		})
		expect(hasStatisticModuleClass(inherited, 'inkq-statistic--sm')).toBe(true)

		// overridden: child's own explicit `order="descend"`/`size="lg"` wins
		// over the group's `ascend`/`sm`.
		await expect(overridden).toHaveStyle({
			'--statistic-align': 'flex-start',
			'--statistic-direction': 'column',
		})
		expect(hasStatisticModuleClass(overridden, 'inkq-statistic--lg')).toBe(true)
	},
}
