import { createContext, useContext } from 'react'
import { expect, within } from 'storybook/test'
import { getDefaultProps } from '@/hooks/useProps'
import { Group } from './Group'
import { ORIENTATION_OPTIONS, BOOLEAN_OPTIONS } from './options.story'
import type { ReactNode } from 'react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import type { RootProviderFn } from '@/lib/component/context'
import moduleClasses from './Group.module.scss'

// Local to this file (`Group/options.story.ts` is shared with `Group.Item`,
// which has neither prop). `justify` is typed `CSSProperties['justifyContent']`,
// an open string set, so these are representative values, not an exhaustive
// enum. `ROLE_TAGS` is the renderable subset of `Group.tsx`'s non-exported
// `GROUP_TAGS` (`fieldset`, `hgroup`; `optgroup` can't hold `Group.Item`s),
// which get no explicit `role`, plus `div` as the contrast case.
const JUSTIFY_OPTIONS = ['start', 'center', 'end', 'space-between'] as const
const ROLE_TAGS = ['fieldset', 'hgroup', 'div'] as const

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
// consumer would build with `createCompoundCtx`. `Group` only cares that
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
// `childName`/`provider`/`values` union no longer plays into the
// `animated` narrowing at all — that comes solely from the shared
// `MaybeAnimationProps` union.
type StaticGroupArgs = Exclude<GroupStoryProps, { animated: true }>

type Story = StoryObj<GroupStoryProps>

const meta: Meta<GroupStoryProps> = {
	component: Group,
	title: 'Layout/Group',
	argTypes: {
		as: {
			control: 'text',
			description: 'Polymorphic escape hatch via the shared `Box` contract. `GroupSpecs` declares `defaults: { as: \'div\' }`, so — unlike `Grid.Item`/`Section`, whose `as` is typed `never` — `Group` genuinely forwards it: `Group.tsx` destructures `as` from `props`, builds `others = extractOthers(rest)` from the remainder, and renders `<Box ... as={ as }>`. The root gets `role="group"` unless `as` is one of `GROUP_TAGS` (`fieldset`, `hgroup`, `optgroup`), which get no explicit `role` attribute (the source relies on the built-in semantics of those tags). See the `AsElement` and `RoleByTag` stories.',
		},
		childName: {
			control: 'text',
			description: 'Required (`NamedGroupProps`) unless `Group` is used in its compound form (`CompoundGroupProps`, where `childName`/`provider`/`values` are all `never`). Drives `filterChildren(children, childName)` — any child whose own `displayName` static property doesn\'t match is silently DROPPED (not rendered at all), and so is a plain string or number child. Children nested in a `Fragment` are inspected too. The registered default is `GroupItem.displayName` (`\'Group.Item\'`), matching the real `Group.Item` subcomponent used throughout this file. See the `ChildFiltering` story.',
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
			description: 'Feeds a `--group-item-count` CSS custom property on the root via an inline style (the `tokens` function built with `defineTokens`), NOT a class — `--group-cols` (referenced by `Group.module.scss`\'s `grid-template-columns`) is a STYLESHEET-INTERNAL value composed FROM `--group-item-count`; it is never itself set inline. When `columns` is a positive number, `--group-item-count` is set to it directly. When `columns` is unset AND `orientation` is set, `--group-item-count` is instead computed from `countChildren(children, childName)` (`count > 1 ? count - 1 : count`) — that count recurses into Fragments and includes only elements whose `displayName` matches `childName`; text and non-matching elements are not counted. See the `ChildCount` story. When both are unset, the property is absent entirely and `Group.module.scss`\'s own base rule (`--group-item-count: auto-fit`) applies. See the `Columns` and `Orientations` stories.',
		},
		justify: {
			control: 'text',
			description: 'Typed as `CSSProperties[\'justifyContent\']`. `Group.tsx` destructures it (so it never reaches `others` or the DOM as a `justify` attribute) and the `tokens` function emits it as the inline `--group-justify` custom property on the root (`justify ?? undefined`, so absent when unset); `Group.module.scss` applies it with `justify-content: var(--group-justify)`. Like the other tokens, it is dropped when `unstyled`. See the `Justify` story.',
		},
		header: {
			control: false,
			description: 'Optional `ReactNode` (`BaseGroupProps.header`), rendered inside the root BEFORE the items. It is destructured out of `props` and rendered directly, so it is not passed through `filterChildren`/`childName` and receives no per-child context. See the `Header` story.',
		},
		provider: {
			control: false,
			description: 'A `RootProviderFn<GroupContext>` that receives a per-child context value via `withProvider` (`@/lib/component/context`). The value handed to each child is `{ animated, duration, index, stagger, unstyled, withinView, ...values }` — `values` is spread LAST, so it can override any of the auto-computed fields. `provider` has a registered default (`GroupProvider`), and `useProps` ignores an incoming `undefined`, so a `Group` always has a provider — there is no reachable provider-less path through `Group` itself. See the `AnimatedState`/`values` stories.',
		},
		values: {
			control: 'object',
			description: 'Extra fields spread into every child\'s context value AFTER the auto-computed ones (`{ animated, duration, index, stagger, unstyled, withinView, ...values }`), so `values` can override any of them per-`Group`. Registered default is `{}`. Only meaningful paired with a custom `provider` — the default `GroupProvider`/`GroupContext` shape only reads the animation-related keys. See the `values` story.',
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
			description: 'Accepted by the type but NOT wired to the observer. `lead` reaches `GroupProps` through `MaybeAnimationProps` → `AnimatedComponentProps extends ReplayInViewConfig` (so it only typechecks alongside `animated: true`), and `useReplayInView` does consume it — `triggerMargin = margin ?? (amount === undefined ? revealMargin(lead) : undefined)`. But `Group.tsx`\'s own destructure never names `lead`, and it passes only `{ amount, once }` to `useReplayInView`, so the hook always falls back to `revealMargin(undefined)` → the `REVEAL_LEAD` constant (`-4`). Both `lead` and `margin` are in `RESERVED_PROPS` (`src/hooks/useProps/helpers.ts`), so `extractOthers(rest)` strips them: the passed value is silently dropped and does NOT land on the DOM. `margin` has the same shape. The only symptom is that tuning `lead` on a `Group` silently does nothing. No story exercises it beyond this doc note.',
		},
		animated: {
			control: 'boolean',
			description: 'Discriminates `MaybeAnimationProps`: `animated: true` REQUIRES `duration` (and allows `stagger`/`amount`/`once`/`lead`/`margin`); leaving `animated` unset or `false` means `duration`/`stagger`/etc. must be unset. Published into each child\'s context value. See the `AnimatedState` story.',
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
			description: 'Part of the factory\'s `FactoryContract` (`_PolymorphicContract.unstyled`), not `Group`\'s own `GroupProps`. The semantic base class (`inkq-group`) is emitted regardless of this prop (`namespace ?? baseName`). When `unstyled` is true, `Group` loses the CSS-module-hashed class and the inline `--group-item-count` token (`getStyle` returns only inherited styles); it has no config classes. `Group` destructures `unstyled` (it is published into each child\'s context value), so it is NOT forwarded to the root `Box`, and `data-divide`/`data-block` are kept. See the `Unstyled` story.',
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
 * `Group` computes the count from `countChildren(children, childName)` via
 * `count > 1 ? count - 1 : count`. `meta.args.children` is a single fragment
 * (`<>…</>`) wrapping three `Group.Item`s; `countChildren` recurses into
 * fragments, so the count is `3` and the token resolves to `2`.
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

		// `2` — three `Group.Item`s inside the fragment are counted, then `- 1`.
		await expect(horizontal).toHaveAttribute('aria-orientation', 'horizontal')
		await expect(horizontal).not.toHaveAttribute('aria-orientation', 'vertical')
		expect(horizontal.style.getPropertyValue('--group-item-count')).toBe('2')

		await expect(vertical).toHaveAttribute('aria-orientation', 'vertical')
		await expect(vertical).not.toHaveAttribute('aria-orientation', 'horizontal')
		expect(vertical.style.getPropertyValue('--group-item-count')).toBe('2')

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
// (the `tokens` function built with `defineTokens`), not a class — assert `style`, not `className`.
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
// as unnamed and dropped), a plain string child (not a React element, so
// `filterChildren` drops it too), and matching `Group.Item`s are all mixed
// together here. The children sit inside a `Fragment`, which `filterChildren`
// looks into.
export const ChildFiltering: Story = {
	parameters: { layout: 'padded' },
	args: {
		children: (
			<>
				<Group.Item>Kept 1</Group.Item>
				<OtherItem label="Dropped (wrong displayName)" />
				<div>Dropped (host element, no displayName)</div>
				{ 'Dropped (plain string, not a React element)' }
				<Group.Item>Kept 2</Group.Item>
			</>
		),
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)

		await expect(canvas.getByText('Kept 1')).toBeInTheDocument()
		await expect(canvas.getByText('Kept 2')).toBeInTheDocument()
		await expect(canvas.queryByText('Dropped (plain string, not a React element)')).not.toBeInTheDocument()
		await expect(canvas.queryByText('Dropped (wrong displayName)')).not.toBeInTheDocument()
		await expect(canvas.queryByText('Dropped (host element, no displayName)')).not.toBeInTheDocument()
	},
}

/**
 * Regression for the `--group-item-count` calculation (`orientation` set,
 * `columns` unset): `countChildren(children, childName)` counts only
 * `Group.Item`s (recursing into fragments); stray text, a host `<span>` and a
 * differently-named component add nothing. The first group has three
 * `Group.Item`s (one inside a fragment) plus three strays, so the token is
 * `3 - 1 = 2`; the second has two plus the strays, so `2 - 1 = 1`. If strays
 * were counted the values would be larger.
 */
export const ChildCount: Story = {
	parameters: { layout: 'padded' },
	render: (args) => (
		<Row>
			<Labeled label="3 items + 3 strays">
				<Group { ...args as StaticGroupArgs } orientation="horizontal">
					<Group.Item>Three A</Group.Item>
					<span>Stray span</span>
					<>
						<Group.Item>Three B</Group.Item>
						<OtherItem label="Stray other item" />
					</>
					{ 'Stray text' }
					<Group.Item>Three C</Group.Item>
				</Group>
			</Labeled>
			<Labeled label="2 items + 3 strays">
				<Group { ...args as StaticGroupArgs } orientation="horizontal">
					<Group.Item>Two A</Group.Item>
					<span>Stray span two</span>
					<OtherItem label="Stray other item two" />
					{ 'Stray text two' }
					<Group.Item>Two B</Group.Item>
				</Group>
			</Labeled>
		</Row>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			[three, two] = canvas.getAllByRole('group')

		expect(three.style.getPropertyValue('--group-item-count')).toBe('2')
		expect(two.style.getPropertyValue('--group-item-count')).toBe('1')
	},
}

/**
 * `justify` feeds the inline `--group-justify` token on the root, which
 * `Group.module.scss` applies as `justify-content`. Per value this asserts the
 * token, the computed `justify-content`, that no sibling's value shows up, and
 * that no `justify` attribute reaches the DOM. The unset group has no token
 * and falls back to the initial `normal`.
 */
export const Justify: Story = {
	parameters: { layout: 'padded', controls: { exclude: ['justify'] } },
	render: (args) => (
		<Row>
			<Labeled label="undefined">
				<Group { ...args as StaticGroupArgs } justify={ undefined } />
			</Labeled>
			{ JUSTIFY_OPTIONS.map(justify => (
				<Labeled key={ justify } label={ justify }>
					<Group { ...args as StaticGroupArgs } justify={ justify } />
				</Labeled>
			)) }
		</Row>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			[unset, ...roots] = canvas.getAllByRole('group')

		await expect(roots).toHaveLength(JUSTIFY_OPTIONS.length)

		expect(unset.style.getPropertyValue('--group-justify')).toBe('')
		expect(getComputedStyle(unset).justifyContent).toBe('normal')
		await expect(unset).not.toHaveAttribute('justify')

		roots.forEach((root, i) => {
			const value = JUSTIFY_OPTIONS[i]

			expect(root.style.getPropertyValue('--group-justify')).toBe(value)
			expect(getComputedStyle(root).justifyContent).toBe(value)
			expect(root).not.toHaveAttribute('justify')

			for (const other of JUSTIFY_OPTIONS.filter(o => o !== value))
				expect(root.style.getPropertyValue('--group-justify')).not.toBe(other)
		})
	},
}

/**
 * `header` renders inside the root before the items, and is not subject to
 * `childName` filtering: it is an `<h3>` that no `Group.Item` filter would
 * keep, yet it is present and is the root's first child, followed by the
 * three items.
 */
export const Header: Story = {
	parameters: { layout: 'padded' },
	render: (args) => (
		<Group { ...args as StaticGroupArgs } header={ <h3>Group header</h3> } />
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			root = canvas.getByRole('group'),
			header = canvas.getByRole('heading', { name: 'Group header' })

		await expect(root.firstElementChild).toBe(header)
		await expect(root.children).toHaveLength(4)
		await expect(root.children[1]).toHaveTextContent('Item 1')
	},
}

/**
 * The root gets an explicit `role="group"` unless `as` is one of `GROUP_TAGS`
 * (`fieldset`, `hgroup`, `optgroup`); the source omits the attribute for those
 * tags because it relies on their built-in semantics. `optgroup` is in
 * `GROUP_TAGS` but can't be shown here: it may only contain `<option>`s, not
 * `Group.Item`s. So: `fieldset` and `hgroup`, plus `div` as the contrast. The
 * `div` carries `role="group"`, the other two have no `role` attribute, and
 * `getByRole('group')` finds the `fieldset` and the `div`.
 */
export const RoleByTag: Story = {
	parameters: { layout: 'padded', controls: { exclude: ['as'] } },
	render: (args) => (
		<Row>
			{ ROLE_TAGS.map(tag => (
				<Labeled key={ tag } label={ tag }>
					<Group { ...args as StaticGroupArgs } as={ tag } />
				</Labeled>
			)) }
		</Row>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			// each root is the parent of its first `Group.Item`, in render order
			roots = canvas.getAllByText('Item 1').map(item => item.parentElement as HTMLElement)

		await expect(roots).toHaveLength(ROLE_TAGS.length)

		roots.forEach((root, i) => {
			const tag = ROLE_TAGS[i]

			expect(root.tagName).toBe(tag.toUpperCase())

			if (tag === 'div') expect(root).toHaveAttribute('role', 'group')
			else expect(root).not.toHaveAttribute('role')
		})

		// `getByRole('group')` finds the `div` (explicit role) and the `fieldset`
		// (built-in role) — and only those two.
		const found = canvas.getAllByRole('group')
		await expect(found).toHaveLength(2)
		await expect(found.map(el => el.tagName)).toEqual(['FIELDSET', 'DIV'])
	},
}

// The discriminated union in practice: `animated: false` (`StaticComponentProps`)
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
			<Labeled label="false">
				<Group childName="DebugItem" provider={ DebugProvider } animated={ false }>
					<DebugItem label="Item 1" />
					<DebugItem label="Item 2" />
				</Group>
			</Labeled>
			<Labeled label="true">
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
		await expect(staticItem2).toHaveAttribute('data-animated', 'false')
		await expect(staticItem1).not.toHaveAttribute('data-duration')
		await expect(staticItem1).not.toHaveAttribute('data-stagger')
		await expect(staticItem2).not.toHaveAttribute('data-duration')
		await expect(staticItem2).not.toHaveAttribute('data-stagger')

		await expect(animatedItem1).toHaveAttribute('data-animated', 'true')
		await expect(animatedItem2).toHaveAttribute('data-animated', 'true')
		await expect(animatedItem1).toHaveAttribute('data-duration', '0.6')
		await expect(animatedItem2).toHaveAttribute('data-duration', '0.6')
		await expect(animatedItem1).toHaveAttribute('data-index', '0')
		await expect(animatedItem2).toHaveAttribute('data-index', '1')
		await expect(animatedItem1).toHaveAttribute('data-stagger', '0.1')
		await expect(animatedItem2).toHaveAttribute('data-stagger', '0.1')
	},
}

// `values` is spread LAST into each child's context value (`{ animated,
// duration, index, stagger, unstyled, withinView, ...values }`), so it can
// override any of the auto-computed fields — here it overrides `index` (which
// would otherwise auto-number from `0`) to a fixed, shared value on every
// child.
export const Values: Story = {
	parameters: { layout: 'padded' },
	render: () => (
		<Group childName="DebugItem" provider={ DebugProvider } values={ { index: 99 } }>
			<DebugItem label="Item 1" />
			<DebugItem label="Item 2" />
		</Group>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			items = canvas.getAllByText(/^Item /)

		await expect(items).toHaveLength(2)

		// Both children get the SAME overridden `index`, not the auto-computed
		// `0`/`1` — `values` wins because it's spread after the auto fields.
		await expect(items[0]).toHaveAttribute('data-index', '99')
		await expect(items[1]).toHaveAttribute('data-index', '99')
	},
}

// `GroupSpecs` declares `defaults: { as: 'div' }` — `Group` genuinely IS
// polymorphic (`Group.tsx` renders `as={ as }`), unlike `Grid.Item`/`Section`
// where `as` is typed `never`.
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
 * — the base class (`namespace ?? baseName`) is emitted regardless. Beyond
 * the hash below, `unstyled` also drops the inline `--group-item-count`
 * token (not asserted here). `.inkq-group`'s SCSS block DOES compile its own
 * hash: `&:not([data-divide])`/`&:where([data-divide])` are self-referencing
 * rules (not just nested descendant selectors like `&__item`), so CSS
 * Modules generates a real hash for the base class itself — suppressed when
 * `unstyled`, present when styled, same as every other hashed selector.
 * **Re-verified against the live `Group.tsx`**: there is NO modifier class of
 * any kind (`grid`/`divider`/`horizontal`/`vertical`) to check alongside it —
 * `styles('root')` is called with no `module`/`global`/`selector` config at
 * all, so the hash (and the token above) are all `unstyled` affects here.
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
