import { Fragment } from 'react'
import { expect, within } from 'storybook/test'
import { getDefaultProps } from '@/hooks/useProps'
import { Grid } from './Grid'
import type { ReactNode } from 'react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import moduleClasses from './Grid.module.scss'

// `Grid`'s own props are `{ children, columns, gap }` (plus the polymorphic
// `as`/Box escape hatches). `columns` is a plain `number`, not a fixed enum,
// so there is nothing to move into a shared `options.story.ts` — the
// representative values exercised below (`COLUMN_VALUES`) live locally,
// alongside `Grid`'s own `GAP_OPTIONS` below.
const COLUMN_VALUES = [2, 3, 4] as const

// `gap`'s type (`Grid.tsx`): `Exclude<UnpackArray<GridGapOptions>, 'grid'>`,
// where `GridGapOptions = ConfigOptions<'space', 'grid'>` extracts every
// `theme.space(...)` path tuple that contains the literal `'grid'` from
// `SpaceTokens` (`src/lib/theme/tokens/layout/space.ts`'s `grid: { base, lg }`
// — the commented-out `sm` entry there is dead, not a live option). That
// yields exactly `['grid'] | ['grid', 'lg']`, unpacked to `'grid' | 'lg'`,
// with the `'grid'` bare-default excluded — so `'lg'` is the ONLY valid,
// non-default `gap` value. Only the ELEMENT TYPE (`GridGap`) is derived from
// `Grid.Props['gap']`; the `['lg']` list itself is hand-typed, so it must be
// updated by hand if `SpaceTokens.grid` ever grows a new step (the
// `readonly GridGap[]` annotation only rejects values the type no longer
// allows, it doesn't force new ones in). Single value, but still a real enum
// worth its own story, same treatment as every other enumerable prop.
type GridGap = NonNullable<Grid.Props['gap']>
const GAP_OPTIONS: readonly GridGap[] = ['lg']

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
		<div style={ { display: 'flex', gap: 8, alignItems: 'flex-start', flexWrap: 'wrap' } }>
			{ children }
		</div>
	</div>
)

const tile = (label: string) => (
	<div
		key={ label }
		style={ {
			padding: 16,
			background: 'var(--inkq-background-page)',
			border: '1px dashed currentColor',
			minWidth: 96,
		} }
	>
		{ label }
	</div>
)

// `Grid`'s own root class (`inkq-grid`, always emitted by `getClassName`
// regardless of `unstyled`) is the stable selector used to walk from rendered
// tile text back up to the actual polymorphic root element.
const ROOT_SELECTOR = '.inkq-grid'

// `Grid.Props` (the `declare namespace` export) is just the raw `GridProps`
// interface — it doesn't include `as`/`unstyled`/`attributes`/etc., which
// only exist on the actual accepted prop type, `PolymorphicProps<GridProps, C>`.
// `Parameters<typeof Grid>[0]` reads that real, wrapped type straight off the
// component itself. It fills `C` with its constraint (`ElementType`), not the
// default `'div'`, so `as` is any `ElementType` here.
type GridStoryProps = Parameters<typeof Grid>[0]
type Story = StoryObj<GridStoryProps>

const meta: Meta<GridStoryProps> = {
	component: Grid,
	title: 'Layout/Grid',
	argTypes: {
		as: {
			control: 'text',
			description: 'Polymorphic escape hatch via the shared `Box` contract. `GridSpecs` declares `defaults: { as: \'div\' }` and `Grid.tsx` destructures `as` and forwards it to its root `<Box>`, so it sets the root element\'s tag. See the `AsElement` story.',
		},
		children: {
			control: false,
			description: 'Rendered completely as-is — `Grid.tsx` spreads `{ children }` directly into its root `<Box>` with NO flattening or filtering applied, and `Grid.tsx` doesn\'t import `filterChildren` at all. Every child is preserved verbatim regardless of whether it\'s a `Grid.Item`, a plain element, a `Fragment`, or a bare string. See the `RawChildren` story.',
		},
		columns: {
			control: 'number',
			description: 'Feeds a `--grid-cols` CSS custom property on the root via an inline style (the `tokens` function built with `defineTokens`), NOT a class — `Grid.tsx` calls `styles(\'root\')` with no `module`/`global`/`selector` config at all, so `columns` never produces any `inkq-grid--*` modifier class. `--grid-cols` is only set inline when `columns` is a positive number (`!!(columns && columns > 0)`); otherwise it is absent from the inline style, and `Grid.module.scss`\'s `grid-template-columns` rule falls back to `auto-fit` (the fallback of `var(--grid-cols, auto-fit)`; it is not a declaration). See the `Columns` story.',
		},
		gap: {
			control: 'select',
			options: GAP_OPTIONS,
			description: 'Feeds a `--grid-gap` CSS custom property on the root (the `tokens` function built with `defineTokens`, via `theme.space(...gridGap)` where `gridGap` starts as `[\'grid\']` and pushes `gap` when set) — NOT a class. `\'lg\'` is the only valid, non-default value (`Grid.Props[\'gap\']` resolves to exactly `\'lg\'` — see the type note above); leaving it unset resolves `--grid-gap` to `var(--inkq-space-grid)` (the semantic `space.grid.base` token), while `gap="lg"` resolves it to `var(--inkq-space-grid-lg)` (`space.grid.lg`). `Grid` destructures `gap` out of its props, so it is not forwarded to the DOM as a `gap` attribute. See the `Gap` story.',
		},
		unstyled: {
			control: 'boolean',
			description: 'Part of the factory\'s `FactoryContract` (`_PolymorphicContract.unstyled`), not `Grid`\'s own `GridProps`. The semantic base class (`inkq-grid`) is emitted regardless of this prop (`namespace ?? baseName`). When `unstyled` is true, `Grid` loses the CSS-module-hashed class and the inline `--grid-cols`/`--grid-gap` tokens (`getStyle` returns only inherited styles); it has no config classes. `Grid` forwards `unstyled` to its `Box` via `others` but sets no `data-*`.',
		},
	},
	args: {
		...getDefaultProps<Grid.Props>('Grid'),
	},
}

export default meta

// NOTE: `Grid`'s BASE rule in `Grid.module.scss` is
// `grid-template-columns: repeat(var(--grid-cols, auto-fit), var(--grid-width, minmax(0, 1fr)))`.
// Both custom properties have fallbacks, so the rule is valid whether or not
// `columns` is set. `--grid-width` is not set by `Grid` itself. With `columns`
// set, the computed `grid-template-columns` should resolve to that many
// tracks, which the `Columns` story asserts.
export const Default: Story = {
	args: {
		children: (
			<>
				<Grid.Item>{ tile('Item 1') }</Grid.Item>
				<Grid.Item>{ tile('Item 2') }</Grid.Item>
				<Grid.Item>{ tile('Item 3') }</Grid.Item>
			</>
		),
	},
	parameters: { layout: 'padded' },
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			root = canvas.getByText('Item 1').closest(ROOT_SELECTOR) as HTMLElement

		await expect(root).toBeInTheDocument()
		await expect(root.querySelectorAll('.inkq-grid-item')).toHaveLength(3)
	},
}

/**
 * All three representative `columns` values, side by side. `Grid.tsx` (via
 * the `tokens` function built with `defineTokens`) sets an inline `--grid-cols` custom property on
 * the root whenever `columns` is a positive number — there is no
 * `inkq-grid--{n}-col` modifier CLASS at all (`Grid.tsx` calls `styles('root')`
 * with no `module` config), so only the inline style is asserted below.
 */
export const Columns: Story = {
	parameters: {
		layout: 'padded',
		controls: { exclude: ['columns'] },
	},
	render: (args) => (
		<Row>
			{ COLUMN_VALUES.map(columns => (
				<Group key={ columns } label={ String(columns) }>
					<Grid { ...args } columns={ columns }>
						<Grid.Item>{ tile(`col-${columns}-a`) }</Grid.Item>
						<Grid.Item>{ tile(`col-${columns}-b`) }</Grid.Item>
					</Grid>
				</Group>
			)) }
		</Row>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			rootFor = (columns: number) =>
				canvas.getByText(`col-${columns}-a`).closest(ROOT_SELECTOR) as HTMLElement

		const root2 = rootFor(2),
			root3 = rootFor(3),
			root4 = rootFor(4)

		await expect(root2.style.getPropertyValue('--grid-cols')).toBe('2')
		await expect(root3.style.getPropertyValue('--grid-cols')).toBe('3')
		await expect(root4.style.getPropertyValue('--grid-cols')).toBe('4')

		// `repeat(var(--grid-cols), ...)` resolves to one track per column.
		for (const [root, columns] of [[root2, 2], [root3, 3], [root4, 4]] as const) {
			const tracks = getComputedStyle(root).gridTemplateColumns.split(' ')
			await expect(tracks).toHaveLength(columns)
		}

		// No `inkq-grid--*` modifier class exists for any value — `Grid` never
		// passes a `module`/`global`/`selector` config to `styles('root')`.
		for (const root of [root2, root3, root4]) {
			const modifiers = Array.from(root.classList).filter(c => /--\d+/.test(c))
			await expect(modifiers).toHaveLength(0)
		}
	},
}

/**
 * `gap: undefined` vs. `gap: 'lg'`, side by side. Feeds `--grid-gap` on the
 * root via `theme.space(...gridGap)` (the `tokens` function built with `defineTokens`), where
 * `gridGap` starts as `['grid']` and pushes `gap` onto it when set — resolving
 * to the semantic token path `space.grid.base` (unset) or `space.grid.lg`
 * (`'lg'`). No class of any kind is involved (`Grid.tsx` calls `styles('root')`
 * with no `module`/`global`/`selector` config), so only the inline custom
 * property is asserted below.
 */
export const Gap: Story = {
	parameters: {
		layout: 'padded',
		controls: { exclude: ['gap'] },
	},
	render: (args) => (
		<Row>
			<Group label="undefined">
				<Grid { ...args } gap={ undefined }>
					<Grid.Item>{ tile('gap-unset-a') }</Grid.Item>
					<Grid.Item>{ tile('gap-unset-b') }</Grid.Item>
				</Grid>
			</Group>
			{ GAP_OPTIONS.map(gap => (
				<Group key={ gap } label={ gap }>
					<Grid { ...args } gap={ gap }>
						<Grid.Item>{ tile(`gap-${gap}-a`) }</Grid.Item>
						<Grid.Item>{ tile(`gap-${gap}-b`) }</Grid.Item>
					</Grid>
				</Group>
			)) }
		</Row>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			unsetRoot = canvas.getByText('gap-unset-a').closest(ROOT_SELECTOR) as HTMLElement,
			lgRoot = canvas.getByText('gap-lg-a').closest(ROOT_SELECTOR) as HTMLElement

		// `theme.space(...)` resolves to a `var(--inkq-space-...)` reference, not
		// a raw pixel value — `space.grid.base` (unset `gap`) vs. `space.grid.lg`
		// (`gap="lg"`), formatted by `formatToken` (`src/lib/theme/format/tokenName.ts`).
		await expect(unsetRoot.style.getPropertyValue('--grid-gap')).toBe('var(--inkq-space-grid)')
		await expect(lgRoot.style.getPropertyValue('--grid-gap')).toBe('var(--inkq-space-grid-lg)')

		// No `inkq-grid--*` modifier class exists for either value, and — since
		// `Grid` destructures `gap` out of its props — no `gap` DOM attribute.
		for (const root of [unsetRoot, lgRoot]) {
			const modifiers = Array.from(root.classList).filter(c => c.includes('--'))
			await expect(modifiers).toHaveLength(0)
			await expect(root).not.toHaveAttribute('gap')
		}
	},
}

/**
 * `as` is forwarded to the root `<Box>`: the registered default (`div`) vs.
 * an explicit `section` override, side by side.
 */
export const AsElement: Story = {
	parameters: {
		layout: 'padded',
		controls: { exclude: ['as'] },
	},
	render: (args) => (
		<Row>
			<Group label='as="div" (default)'>
				<Grid { ...args }>
					<Grid.Item>{ tile('as-default') }</Grid.Item>
				</Grid>
			</Group>
			<Group label='as="section"'>
				<Grid { ...args } as="section">
					<Grid.Item>{ tile('as-section') }</Grid.Item>
				</Grid>
			</Group>
		</Row>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			defaultRoot = canvas.getByText('as-default').closest(ROOT_SELECTOR) as HTMLElement,
			sectionRoot = canvas.getByText('as-section').closest(ROOT_SELECTOR) as HTMLElement

		await expect(defaultRoot.tagName).toBe('DIV')
		await expect(sectionRoot.tagName).toBe('SECTION')
	},
}

/**
 * **Re-verified against the LIVE `Grid.tsx`**: `Grid` doesn't import or call
 * `filterChildren`; its render is a bare `{ children }` spread into the root
 * `Box`. There is NO flattening and NO filtering: `Fragment`s are not
 * unwrapped (React renders their contents natively anyway), a plain ELEMENT
 * child that isn't a `Grid.Item` renders straight through unwrapped by any
 * `.inkq-grid-item`, and a bare string child renders as-is too.
 */
export const RawChildren: Story = {
	args: {
		children: (
			<>
				<Grid.Item>{ tile('Direct child') }</Grid.Item>
				<Fragment>
					<Grid.Item>{ tile('Fragment child A') }</Grid.Item>
					<Grid.Item>{ tile('Fragment child B') }</Grid.Item>
				</Fragment>
				<div>Not a GridItem — rendered as-is, not dropped</div>
				{ 'A bare string child, rendered as-is' }
			</>
		),
	},
	parameters: { layout: 'padded' },
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			root = canvas.getByText('Direct child').closest(ROOT_SELECTOR) as HTMLElement

		// The 3 genuine `Grid.Item`s (direct + 2 Fragment-wrapped) still render
		// as `.inkq-grid-item`s — `Grid.Item` itself is unaffected by this change.
		await expect(root.querySelectorAll('.inkq-grid-item')).toHaveLength(3)
		await expect(canvas.getByText('Fragment child A')).toBeInTheDocument()
		await expect(canvas.getByText('Fragment child B')).toBeInTheDocument()

		// A non-`Grid.Item` ELEMENT child is no longer dropped — it renders
		// through, present in the DOM.
		await expect(canvas.getByText('Not a GridItem — rendered as-is, not dropped')).toBeInTheDocument()

		// A bare string child was always kept, before and after this change.
		await expect(canvas.getByText('A bare string child, rendered as-is')).toBeInTheDocument()
	},
}

// A single `GridItem` renders as the sole child — no special casing needed,
// with or without flattening.
export const SingleItem: Story = {
	args: {
		children: <Grid.Item>{ tile('Only item') }</Grid.Item>,
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			root = canvas.getByText('Only item').closest(ROOT_SELECTOR) as HTMLElement

		await expect(root.querySelectorAll('.inkq-grid-item')).toHaveLength(1)
	},
}

// No children at all (`null`) — `Grid` spreads `{ children }` directly with
// no flattening/filtering step to fall back on, so this is the only way to
// get a genuinely empty root: React renders `null` as nothing.
export const EmptyGrid: Story = {
	args: { children: null },
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			root = canvasElement.querySelector(ROOT_SELECTOR) as HTMLElement

		await expect(root).toBeInTheDocument()
		await expect(root).toBeEmptyDOMElement()
	},
}

// `unstyled` does NOT remove `Grid`'s semantic base class (`inkq-grid`) — per
// `getClassName.tsx` the base class (`namespace ?? baseName`) is emitted
// regardless. It also suppresses the CSS-module-hashed class normally appended
// alongside it and the inline `--grid-cols`/`--grid-gap` tokens (`getStyle`
// returns only inherited styles); this story asserts only the hash. `Grid` makes
// exactly one `styles(...)` call (`root`), so the root element is the only
// one to check here.
export const Unstyled: Story = {
	parameters: {
		layout: 'padded',
		controls: { exclude: ['unstyled'] },
	},
	render: (args) => (
		<Row>
			{ ([true, false] as const).map(unstyled => (
				<Group key={ String(unstyled) } label={ String(unstyled) }>
					<Grid { ...args } unstyled={ unstyled }>
						<Grid.Item>{ tile(`unstyled=${unstyled}`) }</Grid.Item>
					</Grid>
				</Group>
			)) }
		</Row>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			unstyledRoot = canvas.getByText('unstyled=true').closest(ROOT_SELECTOR) as HTMLElement,
			styledRoot = canvas.getByText('unstyled=false').closest(ROOT_SELECTOR) as HTMLElement

		// Detect the REAL compiled CSS-module hash, keyed off the actual
		// `Grid.module.scss` export map — not a naive "any extra class"
		// heuristic, which can't distinguish a module hash from an unrelated
		// config/global modifier class.
		const hasModuleClass = (el: Element, base: string) => {
			const moduleClass = (moduleClasses as Record<string, string>)[base]
			return !!moduleClass && el.classList.contains(moduleClass)
		}

		await expect(styledRoot).toHaveClass('inkq-grid')
		await expect(unstyledRoot).toHaveClass('inkq-grid')
		expect(hasModuleClass(styledRoot, 'inkq-grid')).toBe(true)
		expect(hasModuleClass(unstyledRoot, 'inkq-grid')).toBe(false)
	},
}
