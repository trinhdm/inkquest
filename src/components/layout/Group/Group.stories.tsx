import { createContext, useContext } from 'react'
import { expect, within } from 'storybook/test'
import { getDefaultProps } from '@/hooks/useProps'
import { Group } from './Group'
import { ORIENTATION_OPTIONS, BOOLEAN_OPTIONS } from './options.story'
import type { ReactNode } from 'react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import type { RootProviderFn } from '@/lib/component'
import moduleClasses from './Group.module.scss'

const Row = ({ children }: { children: ReactNode }) => (
	<div style={ { display: 'flex', gap: 24, flexWrap: 'wrap', width: '100%' } }>
		{ children }
	</div>
)

// Named `Labeled` (not `Group`, the usual convention for this local helper
// across the other story files) to avoid shadowing the actual `Group`
// component this file imports.
const Labeled = ({ label, children }: { label: string, children: ReactNode }) => (
	<div style={ { display: 'flex', flexDirection: 'column', gap: 8 } }>
		<span style={ { font: 'var(--inkq-text-control)', letterSpacing: '.15em', textTransform: 'uppercase', opacity: 0.6 } }>
			{ label }
		</span>
		{ children }
	</div>
)

// Detects the REAL compiled CSS-module hash, keyed off the actual
// `Group.module.scss` export map — not a naive "any extra class" heuristic.
// `Group.tsx` calls `styles('root')` with NO `module`/`global`/`selector`
// config at all — unlike `Grid`, it never sets any config-driven modifier
// class. The base class (`inkq-group`) is still real: `.inkq-group`'s SCSS
// block has self-referencing `&:not([data-divide])`/`&:where([data-divide])`
// rules (not just nested descendant selectors like `&__item`), so CSS
// Modules compiles a genuine hash for it.
const hasModuleClass = (el: Element, base: string) => {
	const moduleClass = (moduleClasses as Record<string, string>)[base]
	return !!moduleClass && el.classList.contains(moduleClass)
}

// A component with a DIFFERENT `displayName` from the real `Group.Item` —
// used only as a negative case in the `ChildFiltering` story, to show that
// `filterChildren(children, childName)` drops anything whose own
// `displayName` doesn't match.
const OtherItem = ({ label }: { label: string }) => (
	<div style={ { padding: 16, border: '1px dashed currentColor', borderRadius: 8 } }>
		{ label }
	</div>
)
OtherItem.displayName = 'OtherItem'

// Local debug context — stands in for whatever a real `RootProviderFn`
// consumer would build with `createRootCtx`. `Group` only cares that
// `provider` is a function matching `RootProviderFn<GroupContext>`; this
// one just exposes the per-child `value` it receives on a plain React
// Context, so `DebugItem` can render it back out as inspectable `data-*`
// attributes for assertions.
const DebugContext = createContext<Group.Context | null>(null)

const DebugProvider: RootProviderFn<Group.Context> = ({ children, value }) => (
	<DebugContext value={ value }>{ children }</DebugContext>
)

const DebugItem = ({ label }: { label: string }) => {
	const ctx = useContext(DebugContext)

	return (
		<div
			data-index={ ctx?.index }
			data-animated={ String(!!ctx?.animated) }
			data-duration={ ctx?.duration }
			data-stagger={ ctx?.stagger }
			data-unstyled={ String(!!ctx?.unstyled) }
			style={ { padding: 16, border: '1px dashed currentColor', borderRadius: 8, minWidth: 96, textAlign: 'center' } }
		>
			{ label }
		</div>
	)
}
DebugItem.displayName = 'DebugItem'

// `Group.Props` (the `declare namespace` export) is the raw, UNION-typed
// `GroupProps` interface — it doesn't include `as`/`unstyled`/`attributes`/
// etc., which only exist on the actual accepted prop type, `PolymorphicProps<
// GroupProps, C>`. `Parameters<typeof Group>[0]` reads that real, wrapped
// type straight off the component itself. **Re-verified against the live
// `Group.tsx`**: `GroupSpecs` DOES declare `defaults: { as: typeof TAG }`
// (`TAG = 'div'`) and NOT `isCompound: true` — `Group` genuinely IS
// polymorphic (`Group.tsx` renders `as={ as }`, not a hardcoded tag). See the
// `AsElement` story.
type GroupStoryProps = Parameters<typeof Group>[0]

// Mirrors `MaybeAnimationProps`'s own discriminated union
// (`src/hooks/animation/constants.ts`) — `AnimatedComponentProps` requires
// `{ animated: true; duration: number; stagger?; amount?; once?; lead?;
// margin? }`, `StaticComponentProps` sets all of those to `never` — rather
// than casting through `any`, same pattern `Button.stories.tsx` uses for its
// own `href`/native union. `GroupProps` itself is `BaseGroupProps &
// (CompoundGroupProps | NamedGroupProps) & MaybeAnimationProps` — the
// `childName`/`provider`/`valuesCtx` union no longer plays into the
// `animated` narrowing at all (that used to be conflated under one
// `AnimatedGroupProps`/`StaticGroupProps` pair declared directly on
// `GroupProps`; it's since moved out to the shared `MaybeAnimationProps`).
type StaticGroupArgs = Exclude<GroupStoryProps, { animated: true }>

type Story = StoryObj<GroupStoryProps>

const meta: Meta<GroupStoryProps> = {
	component: Group,
	title: 'Layout/Group',
	argTypes: {
		as: {
			control: 'text',
			description: 'Polymorphic escape hatch via the shared `Box` contract. `GroupSpecs` declares `defaults: { as: \'div\' }`, so — unlike `GridItem`/`Section`, whose `as` is silently ignored — `Group` genuinely forwards it: `Group.tsx` destructures `{ as, others } = extractOtherProps(rest)` and renders `<Box ... as={ as }>`. See the `AsElement` story.',
		},
		childName: {
			control: 'text',
			description: 'Required (`NamedGroupProps`) unless `Group` is used in its compound form (`CompoundGroupProps`, where `childName`/`provider`/`valuesCtx` are all `never`). Drives `filterChildren(children, childName)` — any child whose own `displayName` static property doesn\'t match is silently DROPPED (not rendered at all); a plain string/number child bypasses the check entirely (not a React element). The registered default is `GroupItem.displayName` (`\'Group.Item\'`), matching the real `Group.Item` subcomponent used throughout this file. See the `ChildFiltering` story.',
		},
		orientation: {
			control: 'select',
			options: ORIENTATION_OPTIONS,
			description: 'Feeds `aria-orientation` directly on the root (`attributes.aria.orientation`) — **re-verified against the live `Group.tsx`**: it does NOT add any `inkq-group--*` modifier class; `Group.tsx` calls `styles(\'root\')` with no `module`/`global`/`selector` config at all. `orientation` also participates in the `--group-item-count` token calculation when `columns` is unset (see `columns` below). See the `Orientations` story.',
		},
		divider: {
			control: 'boolean',
			description: 'Adds a `data-divide` attribute to the root (`data: { divide: !!divider || null }`) — no class of any kind (`Group.module.scss` has no `&--divider` rule; the `box-shadow` divider styling lives entirely on the self-referencing `&:where([data-divide])` selector). See the `Divider` story.',
		},
		fullWidth: {
			control: 'boolean',
			description: 'Adds a `data-block` attribute to the root (`data: { block: !!fullWidth || null }`) — no class of its own. See the `FullWidth` story.',
		},
		columns: {
			control: 'number',
			description: 'Feeds a `--group-item-count` CSS custom property on the root via an inline style (`setThemeCSS`\'s `tokens`), NOT a class — `--group-cols` (referenced by `Group.module.scss`\'s `grid-template-columns`) is a STYLESHEET-INTERNAL value composed FROM `--group-item-count`; it is never itself set inline. When `columns` is a positive number, `--group-item-count` is set to it directly. When `columns` is unset AND `orientation` is set, `--group-item-count` is instead computed from `Children.count(children)` (`count > 1 ? count - 1 : count`). When both are unset, the property is absent entirely and `Group.module.scss`\'s own base rule (`--group-item-count: auto-fit`) applies. See the `Columns` and `Orientations` stories.',
		},
		justify: {
			control: 'text',
			description: '**Probable source bug, verified against the live `Group.tsx`**: declared on `BaseGroupProps` (typed as `CSSProperties[\'justifyContent\']`) but never destructured or applied to any inline style — `extractOtherProps` only pulls out `as`/`childName`/`children`/`displayName`/`loading`/`revealFrom`/`withinView` plus the style-alias fields (`className`/`classNames`/`style`/`styles`); `justify` falls straight through into `others` and lands as a raw `justify="..."` DOM attribute instead of `justifyContent` in the root\'s `style`. (It\'s all-lowercase, so React forwards it to the DOM without a console warning — which is why this is easy to miss.) No story exercises it beyond this doc note.',
		},
		provider: {
			control: false,
			description: 'A `RootProviderFn<GroupContext>` that receives a per-child context value via `withProvider` (`@/lib/component`). The value handed to each child is `{ animated, duration, index, stagger, unstyled, withinView, ...valuesCtx }` — `valuesCtx` is spread LAST, so it can override any of the auto-computed fields. Without a `provider`, filtered children render unwrapped in a plain `Fragment` instead — no context is published at all. See the `AnimatedState`/`ValuesCtx` stories.',
		},
		valuesCtx: {
			control: 'object',
			description: 'Extra fields spread into every child\'s context value AFTER the auto-computed ones (`{ animated, duration, index, stagger, unstyled, withinView, ...valuesCtx }`), so `valuesCtx` can override any of them per-`Group`. Registered default is `{}`. Only meaningful paired with a custom `provider` — the default `GroupProvider`/`GroupContext` shape only reads the animation-related keys. See the `ValuesCtx` story.',
		},
		amount: {
			control: false,
			description: 'Forwarded verbatim into `useReplayInView(ref, { amount, once })` as the `IntersectionObserver` trigger threshold. Not asserted directly in any story here — `withinView`\'s timing is environment-dependent (framer-motion\'s `useInView`) and unsafe to assert on without `waitFor`, per the same caveat noted on the `AnimatedState` story.',
		},
		once: {
			control: 'boolean',
			description: 'Forwarded verbatim into `useReplayInView(ref, { amount, once })` — controls whether the group\'s reveal-trigger observer disarms once no part of the element is on screen, or stays armed for replay. Not asserted directly, same `withinView` timing caveat as `amount`.',
		},
		lead: {
			control: false,
			description: 'Accepted by the type but NOT wired to the observer. `lead` reaches `GroupProps` through `MaybeAnimationProps` → `AnimatedComponentProps extends ReplayInViewOptions` (so it only typechecks alongside `animated: true`), and `useReplayInView` does consume it — `triggerMargin = margin ?? (amount === undefined ? revealMargin(lead) : undefined)`. But `Group.tsx`\'s own destructure never names `lead`, and it passes only `{ amount, once }` to `useReplayInView`, so the hook always falls back to `revealMargin(undefined)` → the `REVEAL_LEAD` constant (`-4`). The passed value instead survives into `others` and lands as a `lead="..."` DOM attribute on the root. `margin` has the same shape. Note this is invisible in practice: nothing in the codebase passes `lead` to a `Group`, and React forwards the all-lowercase attribute without a console warning — so the only symptom is that tuning `lead` on a `Group` silently does nothing. No story exercises it beyond this doc note.',
		},
		animated: {
			control: 'boolean',
			description: 'Discriminates `MaybeAnimationProps`: `animated: true` REQUIRES `duration` (and allows `stagger`/`amount`/`once`/`lead`/`margin`); leaving `animated` unset means `duration`/`stagger`/etc. must also be unset. Published into each child\'s context value. See the `AnimatedState` story.',
		},
		duration: {
			control: 'number',
			description: 'Only valid alongside `animated: true` (see `MaybeAnimationProps`). Published into each child\'s context value.',
		},
		stagger: {
			control: 'number',
			description: 'Only valid alongside `animated: true` (see `MaybeAnimationProps`). Published into each child\'s context value.',
		},
		unstyled: {
			control: 'boolean',
			description: 'Part of `PolymorphicProps`, not `Group`\'s own `GroupProps`. The semantic base class (`inkq-group`) is ALWAYS emitted regardless of this prop — it only suppresses the CSS-module-hashed class normally appended alongside it. See the `Unstyled` story.',
		},
	},
	args: {
		...getDefaultProps<Group.Props>('Group'),
		children: (
			<>
				<Group.Item>Item 1</Group.Item>
				<Group.Item>Item 2</Group.Item>
				<Group.Item>Item 3</Group.Item>
			</>
		),
	},
}

export default meta

export const Default: Story = {}

/**
 * All `orientation` values, side by side, plus the `undefined` fallback.
 * **Re-verified against the live `Group.tsx`**: `orientation` toggles
 * `aria-orientation` only — there is NO `inkq-group--grid`/`--horizontal`/
 * `--vertical` modifier class (`Group.tsx` calls `styles('root')` with no
 * `module` config at all). Separately, `orientation` participates in the
 * `--group-item-count` token: with `columns` unset and `orientation` set,
 * `Group` computes the count from `Children.count(children)` via
 * `count > 1 ? count - 1 : count`.
 *
 * NOTE the gotcha this story pins down: `meta.args.children` is a SINGLE
 * fragment (`<>…</>`) wrapping the three `Group.Item`s, and `Children.count`
 * counts top-level nodes — a fragment is one node. So the count is `1`, not
 * `3`, and the token resolves to `1` rather than the `2` you'd expect from
 * three items. Passing the items as an array instead would yield `2`.
 */
export const Orientations: Story = {
	parameters: { layout: 'padded' },
	render: (args) => (
		<Row>
			<Labeled label="undefined">
				<Group { ...args as StaticGroupArgs } orientation={ undefined } />
			</Labeled>
			{ ORIENTATION_OPTIONS.map(orientation => (
				<Labeled key={ orientation } label={ orientation }>
					<Group { ...args as StaticGroupArgs } orientation={ orientation } />
				</Labeled>
			)) }
		</Row>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			groups = canvas.getAllByRole('group')

		await expect(groups).toHaveLength(3)

		const [unset, horizontal, vertical] = groups

		await expect(unset).not.toHaveAttribute('aria-orientation')
		// `columns` and `orientation` are BOTH unset here, so `--group-item-count`
		// is absent entirely — `Group.module.scss`'s own base rule applies.
		expect(unset.style.getPropertyValue('--group-item-count')).toBe('')

		// `1`, not `2` — the fragment counts as a single child. See the note above.
		await expect(horizontal).toHaveAttribute('aria-orientation', 'horizontal')
		expect(horizontal.style.getPropertyValue('--group-item-count')).toBe('1')

		await expect(vertical).toHaveAttribute('aria-orientation', 'vertical')
		expect(vertical.style.getPropertyValue('--group-item-count')).toBe('1')

		// No `inkq-group--*` modifier class exists for any value.
		for (const root of [unset, horizontal, vertical]) {
			const modifiers = Array.from(root.classList).filter(c => c.includes('--'))
			await expect(modifiers).toHaveLength(0)
		}
	},
}

export const Divider: Story = {
	parameters: { controls: { exclude: ['divider'] } },
	render: (args) => (
		<Row>
			{ BOOLEAN_OPTIONS.map(divider => (
				<Labeled key={ String(divider) } label={ String(divider) }>
					<Group { ...args as StaticGroupArgs } divider={ divider } />
				</Labeled>
			)) }
		</Row>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			groups = canvas.getAllByRole('group')

		await expect(groups).toHaveLength(2)

		const [withDivider, withoutDivider] = groups

		// `Group.module.scss` has no `&--divider` rule at all — divider styling
		// lives on the self-referencing `&:where([data-divide])` selector
		// instead, and `Group.tsx` never applies any `module`/`global`/`selector`
		// config to `styles('root')`. The real, observable toggle is the
		// `data-divide` attribute `Group` sets via `attributes.data.divide`.
		await expect(withDivider).toHaveAttribute('data-divide')
		await expect(withoutDivider).not.toHaveAttribute('data-divide')

		for (const root of [withDivider, withoutDivider]) {
			const modifiers = Array.from(root.classList).filter(c => c.includes('--'))
			await expect(modifiers).toHaveLength(0)
		}
	},
}

export const FullWidth: Story = {
	parameters: { layout: 'padded', controls: { exclude: ['fullWidth'] } },
	render: (args) => (
		<Row>
			{ BOOLEAN_OPTIONS.map(fullWidth => (
				<Labeled key={ String(fullWidth) } label={ String(fullWidth) }>
					<Group { ...args as StaticGroupArgs } fullWidth={ fullWidth } />
				</Labeled>
			)) }
		</Row>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			groups = canvas.getAllByRole('group')

		await expect(groups).toHaveLength(2)

		const [isFullWidth, isNotFullWidth] = groups

		await expect(isFullWidth).toHaveAttribute('data-block')
		await expect(isNotFullWidth).not.toHaveAttribute('data-block')
	},
}

// `columns` feeds `--group-item-count` as an inline CSS custom property
// (`setThemeCSS`'s `tokens`), not a class — assert `style`, not `className`.
// `--group-cols` (referenced by `grid-template-columns`) stays a
// stylesheet-internal value COMPOSED FROM `--group-item-count`; it's never
// itself set inline.
export const Columns: Story = {
	parameters: { controls: { exclude: ['columns'] } },
	render: (args) => (
		<Row>
			<Labeled label="unset">
				<Group { ...args as StaticGroupArgs } columns={ undefined } />
			</Labeled>
			<Labeled label="3">
				<Group { ...args as StaticGroupArgs } columns={ 3 } />
			</Labeled>
		</Row>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			groups = canvas.getAllByRole('group')

		await expect(groups).toHaveLength(2)

		const [unset, withColumns] = groups

		// `orientation` is unset here too, so the unset group's
		// `--group-item-count` is absent entirely (not computed from children).
		expect(unset.style.getPropertyValue('--group-item-count')).toBe('')
		expect(withColumns.style.getPropertyValue('--group-item-count')).toBe('3')
	},
}

// `filterChildren(children, childName)` keeps only elements whose `type`
// carries a matching `displayName` static property. A component with a
// DIFFERENT `displayName`, a raw host element (`<div>`, whose `type` is the
// string `'div'` — strings have no `displayName` property, so it's treated
// as unnamed and dropped), and a matching `Group.Item` are all mixed
// together here; a plain string child isn't a React element at all, so it
// skips the check entirely and always survives.
export const ChildFiltering: Story = {
	parameters: { layout: 'padded' },
	args: {
		children: (
			<>
				<Group.Item>Kept 1</Group.Item>
				<OtherItem label="Dropped (wrong displayName)" />
				<div>Dropped (host element, no displayName)</div>
				{ 'Kept (plain string, not a React element)' }
				<Group.Item>Kept 2</Group.Item>
			</>
		),
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)

		await expect(canvas.getByText('Kept 1')).toBeInTheDocument()
		await expect(canvas.getByText('Kept 2')).toBeInTheDocument()
		await expect(canvas.getByText('Kept (plain string, not a React element)')).toBeInTheDocument()
		await expect(canvas.queryByText('Dropped (wrong displayName)')).not.toBeInTheDocument()
		await expect(canvas.queryByText('Dropped (host element, no displayName)')).not.toBeInTheDocument()
	},
}

// The discriminated union in practice: `animated` unset (`StaticComponentProps`)
// vs. `animated: true` with `duration`/`stagger` (`AnimatedComponentProps`) — a
// `DebugProvider` publishes each branch's context values back out as
// `data-*` attributes on `DebugItem`, since `animated`/`duration`/`stagger`
// otherwise have no visible DOM effect of their own on `Group`. Assertions
// stick to `index`/`animated`/`duration`/`stagger` — NOT `withinView`, whose
// `IntersectionObserver`-driven timing is environment-dependent (framer-
// motion's `useInView`) and unsafe to assert on without `waitFor`.
export const AnimatedState: Story = {
	parameters: { layout: 'padded' },
	render: () => (
		<Row>
			<Labeled label="static (animated unset)">
				<Group childName="DebugItem" provider={ DebugProvider }>
					<DebugItem label="Item 1" />
					<DebugItem label="Item 2" />
				</Group>
			</Labeled>
			<Labeled label="animated (duration, stagger)">
				<Group
					childName="DebugItem"
					provider={ DebugProvider }
					animated
					duration={ 0.6 }
					stagger={ 0.1 }
				>
					<DebugItem label="Item 1" />
					<DebugItem label="Item 2" />
				</Group>
			</Labeled>
		</Row>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			items = canvas.getAllByText(/^Item /)

		await expect(items).toHaveLength(4)

		const [staticItem1, staticItem2, animatedItem1, animatedItem2] = items

		await expect(staticItem1).toHaveAttribute('data-animated', 'false')
		await expect(staticItem1).toHaveAttribute('data-index', '0')
		await expect(staticItem2).toHaveAttribute('data-index', '1')
		await expect(staticItem1).not.toHaveAttribute('data-duration')
		await expect(staticItem1).not.toHaveAttribute('data-stagger')

		await expect(animatedItem1).toHaveAttribute('data-animated', 'true')
		await expect(animatedItem1).toHaveAttribute('data-duration', '0.6')
		await expect(animatedItem1).toHaveAttribute('data-index', '0')
		await expect(animatedItem2).toHaveAttribute('data-stagger', '0.1')
	},
}

// `valuesCtx` is spread LAST into each child's context value (`{ animated,
// duration, index, stagger, unstyled, withinView, ...valuesCtx }`), so it can
// override any of the auto-computed fields — here it overrides `index` (which
// would otherwise auto-number from `0`) to a fixed, shared value on every
// child.
export const ValuesCtx: Story = {
	parameters: { layout: 'padded' },
	render: () => (
		<Group childName="DebugItem" provider={ DebugProvider } valuesCtx={ { index: 99 } }>
			<DebugItem label="Item 1" />
			<DebugItem label="Item 2" />
		</Group>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			items = canvas.getAllByText(/^Item /)

		await expect(items).toHaveLength(2)

		// Both children get the SAME overridden `index`, not the auto-computed
		// `0`/`1` — `valuesCtx` wins because it's spread after the auto fields.
		await expect(items[0]).toHaveAttribute('data-index', '99')
		await expect(items[1]).toHaveAttribute('data-index', '99')
	},
}

// `GroupSpecs` declares `defaults: { as: 'div' }` — `Group` genuinely IS
// polymorphic (`Group.tsx` renders `as={ as }`), unlike `GridItem`/`Section`
// where the same prop is silently ignored at runtime.
export const AsElement: Story = {
	parameters: { controls: { exclude: ['as'] } },
	render: (args) => (
		<Row>
			<Labeled label='as="div" (default)'>
				<Group { ...args as StaticGroupArgs } as="div" />
			</Labeled>
			<Labeled label='as="ul"'>
				<Group { ...args as StaticGroupArgs } as="ul" />
			</Labeled>
		</Row>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			groups = canvas.getAllByRole('group')

		await expect(groups).toHaveLength(2)

		const [divGroup, ulGroup] = groups

		await expect(divGroup.tagName).toBe('DIV')
		await expect(ulGroup.tagName).toBe('UL')
	},
}

/**
 * `unstyled` does NOT remove `Group`'s own semantic base class (`inkq-group`)
 * — it's always emitted. `.inkq-group`'s SCSS block DOES compile its own
 * hash: `&:not([data-divide])`/`&:where([data-divide])` are self-referencing
 * rules (not just nested descendant selectors like `&__item`), so CSS
 * Modules generates a real hash for the base class itself — suppressed when
 * `unstyled`, present when styled, same as every other hashed selector.
 * **Re-verified against the live `Group.tsx`**: there is NO modifier class of
 * any kind (`grid`/`divider`/`horizontal`/`vertical`) to check alongside it —
 * `styles('root')` is called with no `module`/`global`/`selector` config at
 * all, so the base class is the only thing `unstyled` has any effect on here.
 */
export const Unstyled: Story = {
	parameters: { controls: { exclude: ['unstyled'] } },
	render: (args) => (
		<Row>
			{ BOOLEAN_OPTIONS.map(unstyled => (
				<Labeled key={ String(unstyled) } label={ String(unstyled) }>
					<Group { ...args as StaticGroupArgs } unstyled={ unstyled } />
				</Labeled>
			)) }
		</Row>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			groups = canvas.getAllByRole('group')

		await expect(groups).toHaveLength(2)

		// `BOOLEAN_OPTIONS` is `[true, false]`, so the FIRST rendered group is
		// `unstyled` and the SECOND is styled — matches the render order above.
		const [unstyledGroup, styled] = groups

		await expect(styled).toHaveClass('inkq-group')
		await expect(unstyledGroup).toHaveClass('inkq-group')
		expect(hasModuleClass(styled, 'inkq-group')).toBe(true)
		expect(hasModuleClass(unstyledGroup, 'inkq-group')).toBe(false)
	},
}
