import { createContext, useContext } from 'react'
import { expect, within } from 'storybook/test'
import { getDefaultProps } from '@/hooks/useProps'
import { Group } from './Group'
import type { ReactNode } from 'react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import type { RootCxtProviderFn } from '@/lib/component'
import moduleClasses from './Group.module.scss'

const ORIENTATION_OPTIONS: readonly NonNullable<Group.Props['orientation']>[] =
	['horizontal', 'vertical']
const BOOLEAN_OPTIONS = [true, false] as const

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
// `getConfigClasses`/`formatConfigClass` (`getClassName.tsx`) resolve a
// `module`-scoped modifier (`divider`/`grid`, both of which DO have a
// matching SCSS rule) to the compiled HASH when styled and fall back to the
// literal, unhashed base name (`inkq-group--divider`/`inkq-group--grid`)
// only when unstyled — so asserting a literal `toHaveClass('inkq-group--grid')`
// would incorrectly fail in the styled (default) case. `orientation`'s
// `horizontal`/`vertical` modifiers have NO matching SCSS rule at all, so
// those stay literal/unhashed in BOTH states — see the `Orientations` story.
const hasModuleClass = (el: Element, base: string) => {
	const moduleClass = (moduleClasses as Record<string, string>)[base]
	return !!moduleClass && el.classList.contains(moduleClass)
}

// A plain, library-external component with its own `displayName` — the
// contract `Group`'s `childName` filters against (`filterChildren(children,
// childName)`, keyed off `child.type.displayName`). `Group` doesn't export
// its own child/item subcomponent; a consumer supplies whatever component it
// wants filtered.
const GroupItem = ({ label }: { label: string }) => (
	<div style={ { padding: 16, border: '1px dashed currentColor', borderRadius: 8, minWidth: 96, textAlign: 'center' } }>
		{ label }
	</div>
)
GroupItem.displayName = 'GroupItem'

const OtherItem = ({ label }: { label: string }) => (
	<div style={ { padding: 16, border: '1px dashed currentColor', borderRadius: 8 } }>
		{ label }
	</div>
)
OtherItem.displayName = 'OtherItem'

// Local debug context — stands in for whatever a real `RootCxtProviderFn`
// consumer would build with `createRootCxt`. `Group` only cares that
// `provider` is a function matching `RootCxtProviderFn<GroupContext>`; this
// one just exposes the per-child `value` it receives on a plain React
// Context, so `DebugItem` can render it back out as inspectable `data-*`
// attributes for assertions.
const DebugContext = createContext<Group.Context | null>(null)

const DebugProvider: RootCxtProviderFn<Group.Context> = ({ children, value }) => (
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
			data-revealed={ String(!!ctx?.revealed) }
			data-unstyled={ String(!!ctx?.unstyled) }
			style={ { padding: 16, border: '1px dashed currentColor', borderRadius: 8, minWidth: 96, textAlign: 'center' } }
		>
			{ label }
		</div>
	)
}
DebugItem.displayName = 'DebugItem'

// `Group.Props` (the `declare namespace` export) is the raw, UNION-typed
// `GroupProps` interface — it doesn't include `unstyled`/`attributes`/etc.,
// which only exist on the actual accepted prop type, `PolymorphicProps<
// GroupProps, C>`. `Parameters<typeof Group>[0]` reads that real, wrapped
// type straight off the component itself. `Group`'s spec is `isCompound:
// true` with NO `defaults.as`, so `IsPolymorphic<GroupSpecs>` is `false` —
// the generic call signature collapses to a single, non-polymorphic overload
// (`(props: PolymorphicProps<GroupProps, never>) => ReactElement`), which
// resolves `as?: never`: there really is no `as` prop here, matching
// `Group.tsx` hardcoding `as={DEFAULT_TAG}` itself.
type GroupStoryProps = Parameters<typeof Group>[0]

// Mirrors `GroupProps`' own discriminated union (`AnimatedGroupProps`
// requires `{ animated: true; duration: number; stagger? }`,
// `StaticGroupProps` is `{ animated?: never; duration?: never; stagger?:
// never }`) rather than casting through `any` — same pattern
// `Button.stories.tsx` uses for its own `href`/native union.
type StaticGroupArgs = Exclude<GroupStoryProps, { animated: true }>

type Story = StoryObj<GroupStoryProps>

const meta: Meta<GroupStoryProps> = {
	component: Group,
	title: 'Layout/Group',
	argTypes: {
		childName: {
			control: 'text',
			description: 'Required. Drives `filterChildren(children, childName)` — any child whose own `displayName` static property doesn\'t match is silently DROPPED (not rendered at all); a plain string/number child bypasses the check entirely (not a React element). See the `ChildFiltering` story.',
		},
		orientation: {
			control: 'select',
			options: ORIENTATION_OPTIONS,
			description: 'Feeds `aria-orientation` directly, and also the root modifier class via `module: { grid: !orientation, [orientation]: !!orientation }` — when `orientation` is entirely UNSET, the group falls back to a CSS-grid layout (`--grid`) instead of an orientation-specific class. See the `Orientations` story.',
		},
		divider: {
			control: 'boolean',
			description: 'Adds the `--divider` modifier class (a `box-shadow` divider between children). See the `Divider` story.',
		},
		fullWidth: {
			control: 'boolean',
			description: 'Adds a `data-block` attribute to the root (`data: { block: !!fullWidth || null }`) — no class of its own. See the `FullWidth` story.',
		},
		columns: {
			control: 'number',
			description: 'Feeds a `--group-cols` CSS custom property on the root via an inline style (`setThemeCSS`\'s `tokens`), NOT a class — absent entirely from the root\'s inline style when unset. See the `Columns` story.',
		},
		justify: {
			control: 'text',
			description: '**Probable source bug, verified against the live `Group.tsx`**: declared on `BaseGroupProps` (typed as `CSSProperties[\'justifyContent\']`) but never destructured or applied to any inline style — `extractOtherProps` only pulls out `as`/`withinView` plus the style-alias fields (`className`/`classNames`/`style`/`styles`); `justify` falls straight through into `others` and lands as a raw, invalid `justify="..."` DOM attribute instead of `justifyContent` in the root\'s `style`. No story exercises it beyond this doc note.',
		},
		revealed: {
			control: 'boolean',
			description: 'Not used by `Group`\'s own rendering at all — passed straight through into each child\'s context value (`GroupContext.revealed`) via the optional `provider`. See the `Revealed` story.',
		},
		provider: {
			control: false,
			description: 'A `RootCxtProviderFn<GroupContext>` that receives a per-child context value (`{ animated, duration, index, revealed, stagger, unstyled, withinView }`) via `renderWithProvider`. Without it, filtered children render unwrapped (plain `Fragment`s) — no context is published at all. See the `AnimatedState`/`Revealed` stories.',
		},
		animated: {
			control: 'boolean',
			description: 'Discriminates the props union: `animated: true` REQUIRES `duration` (and allows `stagger`); leaving `animated` unset means `duration`/`stagger` must also be unset (`StaticGroupProps`). See the `AnimatedState` story.',
		},
		duration: {
			control: 'number',
			description: 'Only valid alongside `animated: true` (see `AnimatedGroupProps`). Published into each child\'s context value.',
		},
		stagger: {
			control: 'number',
			description: 'Only valid alongside `animated: true` (see `AnimatedGroupProps`). Published into each child\'s context value.',
		},
		unstyled: {
			control: 'boolean',
			description: 'Part of `PolymorphicProps`, not `Group`\'s own `GroupProps`. The semantic base class (`inkq-group`) is ALWAYS emitted regardless of this prop — it only suppresses the CSS-module-hashed class normally appended alongside it. See the `Unstyled` story.',
		},
	},
	args: {
		...getDefaultProps<Group.Props>('Group'),
		childName: 'GroupItem',
		children: (
			<>
				<GroupItem label="Item 1" />
				<GroupItem label="Item 2" />
				<GroupItem label="Item 3" />
			</>
		),
	},
}

export default meta

export const Default: Story = {}

// `module: { divider, grid: !orientation, [orientation]: !!orientation }` —
// the "undefined" group below demonstrates the non-obvious `grid: !orientation`
// fallback: with `orientation` entirely unset, `Group` renders as a CSS grid
// rather than picking an orientation-specific modifier.
export const Orientations: Story = {
	parameters: { layout: 'padded' },
	render: (args) => (
		<Row>
			<Labeled label="undefined (grid fallback)">
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

		const [gridFallback, horizontal, vertical] = groups

		await expect(gridFallback).not.toHaveAttribute('aria-orientation')
		expect(hasModuleClass(gridFallback, 'inkq-group--grid')).toBe(true)

		await expect(horizontal).toHaveAttribute('aria-orientation', 'horizontal')
		// No matching SCSS rule for `--horizontal`, so this stays a literal,
		// unhashed class — unlike `--grid`/`--divider` above/below.
		await expect(horizontal).toHaveClass('inkq-group--horizontal')
		expect(hasModuleClass(horizontal, 'inkq-group--grid')).toBe(false)

		await expect(vertical).toHaveAttribute('aria-orientation', 'vertical')
		await expect(vertical).toHaveClass('inkq-group--vertical')
		expect(hasModuleClass(vertical, 'inkq-group--grid')).toBe(false)
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

		// `.inkq-group--divider` has a real declaration in `Group.module.scss`,
		// so the DOM class is the compiled HASH, not the literal token here —
		// assert via the real compiled export map, not `toHaveClass`.
		expect(hasModuleClass(withDivider, 'inkq-group--divider')).toBe(true)
		expect(hasModuleClass(withoutDivider, 'inkq-group--divider')).toBe(false)
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

// `columns` feeds `--group-cols` as an inline CSS custom property
// (`setThemeCSS`'s `tokens`), not a class — assert `style`, not `className`.
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

		expect(unset.style.getPropertyValue('--group-cols')).toBe('')
		expect(withColumns.style.getPropertyValue('--group-cols')).toBe('3')
	},
}

// `filterChildren(children, childName)` keeps only elements whose `type`
// carries a matching `displayName` static property. A component with a
// DIFFERENT `displayName`, a raw host element (`<div>`, whose `type` is the
// string `'div'` — strings have no `displayName` property, so it's treated
// as unnamed and dropped), and a matching component are all mixed together
// here; a plain string child isn't a React element at all, so it skips the
// check entirely and always survives.
export const ChildFiltering: Story = {
	parameters: { layout: 'padded' },
	args: {
		childName: 'GroupItem',
		children: (
			<>
				<GroupItem label="Kept 1" />
				<OtherItem label="Dropped (wrong displayName)" />
				<div>Dropped (host element, no displayName)</div>
				{ 'Kept (plain string, not a React element)' }
				<GroupItem label="Kept 2" />
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

// The discriminated union in practice: `animated` unset (`StaticGroupProps`)
// vs. `animated: true` with `duration`/`stagger` (`AnimatedGroupProps`) — a
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

// `revealed` has no rendering effect on `Group` itself — it's only readable
// by children through the `provider`-published context value.
export const Revealed: Story = {
	parameters: { layout: 'padded', controls: { exclude: ['revealed'] } },
	render: () => (
		<Row>
			{ BOOLEAN_OPTIONS.map(revealed => (
				<Labeled key={ String(revealed) } label={ String(revealed) }>
					<Group childName="DebugItem" provider={ DebugProvider } revealed={ revealed }>
						<DebugItem label="Item" />
					</Group>
				</Labeled>
			)) }
		</Row>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			items = canvas.getAllByText('Item')

		await expect(items).toHaveLength(2)

		const [isRevealed, isNotRevealed] = items

		await expect(isRevealed).toHaveAttribute('data-revealed', 'true')
		await expect(isNotRevealed).toHaveAttribute('data-revealed', 'false')
	},
}

// `unstyled` does NOT remove `Group`'s own semantic base class (`inkq-group`)
// — it's always emitted, though `.inkq-group { $name: &; }` in
// `Group.module.scss` has NO declarations of its own (only nested
// `&--divider`/`&--grid` rules), so CSS Modules compiles no hash for the root
// AT ALL — same shape as `Container`'s root. The root therefore never carries
// a module hash, styled or unstyled alike. Config/modifier classes (here, the
// default `grid` modifier, since `orientation` is unset) ARE independently
// hashed, since `.inkq-group--grid` DOES have its own declaration — emitted
// by `getConfigClasses` regardless of `unstyled` (`check.isUnstyled` only
// gates the base-class hash lookup, not modifier classes), falling back from
// a hash to the literal `inkq-group--grid` token specifically in the
// unstyled case (see `getStyleClass`'s own `check.isUnstyled` guard, reused
// by `formatConfigClass`).
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
		// `.inkq-group` has no own SCSS declaration — only the nested
		// `&--divider`/`&--grid` rules — so CSS Modules compiles no hash for it
		// at all. The root NEVER carries a module-hashed class, styled or
		// unstyled.
		expect(hasModuleClass(styled, 'inkq-group')).toBe(false)
		expect(hasModuleClass(unstyledGroup, 'inkq-group')).toBe(false)

		expect(hasModuleClass(styled, 'inkq-group--grid')).toBe(true)
		expect(hasModuleClass(unstyledGroup, 'inkq-group--grid')).toBe(false)
		// Falls back to the literal token once unstyled removes the hash.
		await expect(unstyledGroup).toHaveClass('inkq-group--grid')
	},
}
