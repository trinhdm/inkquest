import { Fragment } from 'react'
import { expect, within } from 'storybook/test'
import { getDefaultProps } from '@/hooks/useProps'
import { Grid } from './Grid'
import type { ReactNode } from 'react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import moduleClasses from './Grid.module.scss'

// `Grid`'s own props are `{ children, columns, equalWidth, gap, layout }`
// (plus the polymorphic `as`/Box escape hatches). `columns` is a column count
// or a full CSS track list (`CSSProperties['gridTemplateColumns']`), not a
// fixed enum, so there is nothing to move into a shared `options.story.ts` —
// the representative values exercised below (`COLUMN_VALUES`) live locally,
// alongside `Grid`'s own `GAP_OPTIONS` and `LAYOUT_OPTIONS` below.
const COLUMN_VALUES = [2, 3, 4] as const

const BOOLEAN_OPTIONS = [true, false] as const

// `gap`'s type (`Grid.tsx`): `Exclude<UnpackArray<GridGapOptions>, 'grid'>`,
// where `GridGapOptions = ConfigOptions<'space', 'grid'>` extracts every
// `theme.space(...)` path tuple that contains the literal `'grid'` from
// `SpaceTokens` (`src/lib/theme/tokens/layout/space.ts`'s `grid`, a
// `TokenSizeShape` of `sm`/`md`/`lg` plus `base` and `xl`). The bare `['grid']`
// path is the default (the unset case), so the non-default values are
// `sm | md | lg | xl`. Only the ELEMENT TYPE (`GridGap`) is derived from
// `Grid.Props['gap']`; the list itself is hand-typed, so it must be updated by
// hand if `SpaceTokens.grid` ever grows a new step (the `readonly GridGap[]`
// annotation only rejects values the type no longer allows, it doesn't force
// new ones in).
type GridGap = NonNullable<Grid.Props['gap']>
const GAP_OPTIONS: readonly GridGap[] = ['sm', 'md', 'lg', 'xl']

// `layout`: `'default'` (the columns/equalWidth/gap grid) or `'sidebar'`
// (`SidebarGridProps`, which forbids `columns`/`equalWidth`/`gap`).
type GridLayout = NonNullable<Grid.Props['layout']>
const LAYOUT_OPTIONS: readonly GridLayout[] = ['default', 'sidebar']

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
const ITEM_SELECTOR = '.inkq-grid-item'

// `Grid.Props` (the `declare namespace` export) is just the raw `GridProps`
// type — it doesn't include `as`/`unstyled`/`attributes`/etc., which
// only exist on the actual accepted prop type, `PolymorphicProps<GridProps, C>`.
// `Parameters<typeof Grid>[0]` reads that real, wrapped type straight off the
// component itself. It fills `C` with its constraint (`ElementType`), not the
// default `'div'`, so `as` is any `ElementType` here. `GridProps` is
// `BaseGridProps & (ColumnsGridProps | SidebarGridProps)`: the `layout:
// 'sidebar'` branch forbids `columns`/`equalWidth`/`gap`, so the `Layout`
// story passes explicit minimal props for it instead of spreading `args`.
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
			description: 'Feeds the `--grid-cols` CSS custom property on the root via an inline style (the `tokens` function built with `defineTokens`), NOT a class. `--grid-cols` is always set: a positive number gives `repeat(N, minmax(0, 1fr))` (with the default `equalWidth`); a non-blank string is a full track list used as is (e.g. `\'1fr 2fr\'`); anything else (unset, blank, non-positive) falls back to `repeat(auto-fit, minmax(0, 1fr))`. `never` when `layout: \'sidebar\'`, which uses `repeat(4, minmax(0, 1fr))`. The control only offers numbers; see the `TrackList` story for a string. `Grid.module.scss` reads it as `grid-template-columns: var(--grid-cols, ...)`. See the `Columns` story.',
		},
		equalWidth: {
			control: 'boolean',
			description: 'Registered default is `true`. Only applies to a numeric `columns`: `true` gives equal tracks, `repeat(N, minmax(0, 1fr))`; `false` sizes each track to its content, `repeat(N, auto)`. Has no effect on a string `columns` or on the `auto-fit` fallback (`auto-fit` needs a fixed track size). `never` when `layout: \'sidebar\'`. `Grid` destructures it, so it is not forwarded to the DOM. See the `EqualWidth` story.',
		},
		gap: {
			control: 'select',
			options: GAP_OPTIONS,
			description: 'Feeds the `--grid-gap` CSS custom property on the root (the `tokens` function built with `defineTokens`, via `theme.space(...gridGap)` where `gridGap` starts as `[\'grid\']` and pushes `gap` when set) — NOT a class. Valid non-default values are `\'sm\' | \'md\' | \'lg\' | \'xl\'` (see the type note above); leaving it unset resolves `--grid-gap` to `var(--inkq-space-grid)` (the semantic `space.grid.base` token), while `gap="lg"` resolves it to `var(--inkq-space-grid-lg)`, and so on. `never` when `layout: \'sidebar\'`, which always uses `xl`. `Grid` destructures `gap` out of its props, so it is not forwarded to the DOM as a `gap` attribute. See the `Gap` story.',
		},
		layout: {
			control: 'select',
			options: LAYOUT_OPTIONS,
			description: '`\'default\'` or `\'sidebar\'`; not part of the registered defaults. `\'sidebar\'` (`SidebarGridProps`) forbids `columns`/`equalWidth`/`gap` and instead sets `--grid-cols` to `repeat(4, minmax(0, 1fr))` and `--grid-gap` to `var(--inkq-space-grid-xl)`, and adds the `inkq-grid--sidebar` modifier class (a `selector` config; hashed by `Grid.module.scss`\'s `&--sidebar` rule, so the DOM token contains that name). When the root has exactly two children and one is an `<aside>`, the stylesheet spans the `<aside>` over 1 column and the other child over 3. Any other value except `\'default\'` would add a modifier of the same shape. See the `Layout` story.',
		},
		unstyled: {
			control: 'boolean',
			description: 'Part of the factory\'s `FactoryContract` (`_PolymorphicContract.unstyled`), not `Grid`\'s own `GridProps`. The semantic base class (`inkq-grid`) is emitted regardless of this prop (`namespace ?? baseName`). When `unstyled` is true, `Grid` loses the CSS-module-hashed class, the `selector` config class (`inkq-grid--sidebar`) and the inline `--grid-cols`/`--grid-gap` tokens (`getStyle` returns only inherited styles). `Grid` forwards `unstyled` to its `Box` via `others` but sets no `data-*`.',
		},
	},
	args: {
		...getDefaultProps<Grid.Props>('Grid'),
	},
}

export default meta

// NOTE: `Grid`'s BASE rule in `Grid.module.scss` is
// `grid-template-columns: var(--grid-cols, repeat(auto-fit, minmax(0, 1fr)))`,
// and `Grid` always sets `--grid-cols` inline (see `tokens` in `Grid.tsx`), so
// the fallback is a safety net. With `columns` set, the computed
// `grid-template-columns` resolves to that many tracks, which the `Columns`
// story asserts.
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
		await expect(root.querySelectorAll(ITEM_SELECTOR)).toHaveLength(3)

		// `columns` is unset, so the token falls back to `auto-fit`; `equalWidth`
		// is on by default, which wraps it in `repeat()`.
		await expect(root.style.getPropertyValue('--grid-cols')).toBe('repeat(auto-fit, minmax(0, 1fr))')
	},
}

/**
 * All three representative `columns` values, side by side. `Grid.tsx` (via
 * the `tokens` function built with `defineTokens`) sets an inline `--grid-cols`
 * custom property on the root — `repeat(N, minmax(0, 1fr))` for a positive
 * `columns`, since `equalWidth` defaults to `true`. There is no
 * `inkq-grid--{n}-col` modifier CLASS at all (`Grid.tsx`'s `selector` config
 * only ever carries `layout`), so only the inline style is asserted below.
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

		await expect(root2.style.getPropertyValue('--grid-cols')).toBe('repeat(2, minmax(0, 1fr))')
		await expect(root3.style.getPropertyValue('--grid-cols')).toBe('repeat(3, minmax(0, 1fr))')
		await expect(root4.style.getPropertyValue('--grid-cols')).toBe('repeat(4, minmax(0, 1fr))')

		// `repeat(N, ...)` resolves to one track per column.
		for (const [root, columns] of [[root2, 2], [root3, 3], [root4, 4]] as const) {
			const tracks = getComputedStyle(root).gridTemplateColumns.split(' ')
			await expect(tracks).toHaveLength(columns)
		}

		// No `inkq-grid--*` column modifier class exists for any value.
		for (const root of [root2, root3, root4]) {
			const modifiers = Array.from(root.classList).filter(c => /--\d+/.test(c))
			await expect(modifiers).toHaveLength(0)
		}
	},
}

/**
 * `equalWidth: true` vs. `false`, side by side, with `columns: 3`. `true`
 * (the registered default) gives equal tracks, `repeat(3, minmax(0, 1fr))`;
 * `false` sizes each track to its content, `repeat(3, auto)`. Both resolve to
 * 3 tracks.
 */
export const EqualWidth: Story = {
	parameters: {
		layout: 'padded',
		controls: { exclude: ['equalWidth'] },
	},
	render: (args) => (
		<Row>
			{ BOOLEAN_OPTIONS.map(equalWidth => (
				<Group key={ String(equalWidth) } label={ String(equalWidth) }>
					<Grid { ...args } columns={ 3 } equalWidth={ equalWidth }>
						<Grid.Item>{ tile(`equal-${equalWidth}-a`) }</Grid.Item>
						<Grid.Item>{ tile(`equal-${equalWidth}-b`) }</Grid.Item>
					</Grid>
				</Group>
			)) }
		</Row>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			equalRoot = canvas.getByText('equal-true-a').closest(ROOT_SELECTOR) as HTMLElement,
			looseRoot = canvas.getByText('equal-false-a').closest(ROOT_SELECTOR) as HTMLElement

		await expect(equalRoot.style.getPropertyValue('--grid-cols')).toBe('repeat(3, minmax(0, 1fr))')
		await expect(looseRoot.style.getPropertyValue('--grid-cols')).toBe('repeat(3, auto)')

		for (const root of [equalRoot, looseRoot]) {
			await expect(getComputedStyle(root).gridTemplateColumns.split(' ')).toHaveLength(3)

			// `equalWidth` is consumed by `Grid`, never a DOM attribute.
			await expect(root).not.toHaveAttribute('equalwidth')
		}
	},
}

/**
 * A string `columns` is a full track list, used as is: `'1fr 2fr'` resolves to
 * two tracks, the second twice as wide as the first. `equalWidth` has no
 * effect on it, so both groups get the same token.
 */
export const TrackList: Story = {
	parameters: {
		layout: 'padded',
		controls: { exclude: ['columns', 'equalWidth'] },
	},
	render: (args) => (
		<Row>
			{ BOOLEAN_OPTIONS.map(equalWidth => (
				<Group key={ String(equalWidth) } label={ String(equalWidth) }>
					<div style={ { width: 600 } }>
						<Grid { ...args } columns="1fr 2fr" equalWidth={ equalWidth }>
							<Grid.Item>{ tile(`track-${equalWidth}-a`) }</Grid.Item>
							<Grid.Item>{ tile(`track-${equalWidth}-b`) }</Grid.Item>
						</Grid>
					</div>
				</Group>
			)) }
		</Row>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)

		for (const equalWidth of BOOLEAN_OPTIONS) {
			const root = canvas.getByText(`track-${equalWidth}-a`).closest(ROOT_SELECTOR) as HTMLElement,
				tracks = getComputedStyle(root).gridTemplateColumns.split(' ').map(parseFloat)

			await expect(root.style.getPropertyValue('--grid-cols')).toBe('1fr 2fr')
			await expect(tracks).toHaveLength(2)
			await expect(tracks[1] / tracks[0]).toBeCloseTo(2, 1)
		}
	},
}

/**
 * `gap: undefined` vs. every non-default `gap`, side by side. Feeds
 * `--grid-gap` on the root via `theme.space(...gridGap)` (the `tokens`
 * function built with `defineTokens`), where `gridGap` starts as `['grid']` and
 * pushes `gap` onto it when set — resolving to the semantic token path
 * `space.grid.base` (unset) or `space.grid.<gap>`. No class of any kind is
 * involved for `gap`, so only the inline custom property is asserted below.
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
			unsetRoot = canvas.getByText('gap-unset-a').closest(ROOT_SELECTOR) as HTMLElement

		// `theme.space(...)` resolves to a `var(--inkq-space-...)` reference, not
		// a raw pixel value — `space.grid.base` (unset `gap`) vs. `space.grid.<gap>`,
		// formatted by `formatToken` (`src/lib/theme/format/tokenName.ts`).
		await expect(unsetRoot.style.getPropertyValue('--grid-gap')).toBe('var(--inkq-space-grid)')

		const gapRoots = GAP_OPTIONS.map(gap => ({
			gap,
			root: canvas.getByText(`gap-${gap}-a`).closest(ROOT_SELECTOR) as HTMLElement,
		}))

		for (const { gap, root } of gapRoots)
			await expect(root.style.getPropertyValue('--grid-gap')).toBe(`var(--inkq-space-grid-${gap})`)

		// No `inkq-grid--*` modifier class exists for either value, and — since
		// `Grid` destructures `gap` out of its props — no `gap` DOM attribute.
		for (const root of [unsetRoot, ...gapRoots.map(({ root }) => root)]) {
			const modifiers = Array.from(root.classList).filter(c => c.includes('--'))
			await expect(modifiers).toHaveLength(0)
			await expect(root).not.toHaveAttribute('gap')
		}
	},
}

/**
 * `layout: 'default'` vs. `layout: 'sidebar'`, side by side. `'sidebar'`
 * (`SidebarGridProps`) forbids `columns`/`equalWidth`/`gap`, so that group
 * passes explicit minimal props instead of spreading `args`. It sets
 * `--grid-cols` to `repeat(4, minmax(0, 1fr))` and `--grid-gap` to the `xl`
 * step, adds the `inkq-grid--sidebar` modifier, and — with exactly two
 * children, one an `<aside>` — the stylesheet spans the `<aside>` over 1
 * column and the other child over 3.
 */
export const Layout: Story = {
	parameters: {
		layout: 'padded',
		controls: { exclude: ['layout'] },
	},
	render: (args) => (
		<Row>
			{ LAYOUT_OPTIONS.map(layout => (
				<Group key={ layout } label={ layout }>
					<div style={ { width: 480 } }>
						{ layout === 'sidebar' ? (
							<Grid layout="sidebar">
								<Grid.Item as="aside">{ tile('layout-sidebar-aside') }</Grid.Item>
								<Grid.Item>{ tile('layout-sidebar-main') }</Grid.Item>
							</Grid>
						) : (
							<Grid { ...args } layout="default">
								<Grid.Item as="aside">{ tile('layout-default-aside') }</Grid.Item>
								<Grid.Item>{ tile('layout-default-main') }</Grid.Item>
							</Grid>
						) }
					</div>
				</Group>
			)) }
		</Row>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			defaultRoot = canvas.getByText('layout-default-aside').closest(ROOT_SELECTOR) as HTMLElement,
			sidebarRoot = canvas.getByText('layout-sidebar-aside').closest(ROOT_SELECTOR) as HTMLElement

		// The `selector` modifier is hashed (`Grid.module.scss` has a `&--sidebar`
		// rule), but the hash keeps the name as a substring.
		await expect(sidebarRoot.className).toMatch('inkq-grid--sidebar')
		await expect(defaultRoot.className).not.toMatch('inkq-grid--')

		await expect(sidebarRoot.style.getPropertyValue('--grid-cols')).toBe('repeat(4, minmax(0, 1fr))')
		await expect(sidebarRoot.style.getPropertyValue('--grid-gap')).toBe('var(--inkq-space-grid-xl)')

		// The default layout keeps the columns/gap defaults.
		await expect(defaultRoot.style.getPropertyValue('--grid-cols')).toBe('repeat(auto-fit, minmax(0, 1fr))')
		await expect(defaultRoot.style.getPropertyValue('--grid-gap')).toBe('var(--inkq-space-grid)')

		// Two children, one an `<aside>`: the aside spans 1 column, the main
		// item spans 3 (`&--sidebar:has(...)` in `Grid.module.scss`).
		const aside = canvas.getByText('layout-sidebar-aside').closest('aside') as HTMLElement,
			main = canvas.getByText('layout-sidebar-main').closest(ITEM_SELECTOR) as HTMLElement

		await expect(aside.tagName).toBe('ASIDE')
		await expect(getComputedStyle(aside).gridColumnStart).toBe('span 1')
		await expect(getComputedStyle(main).gridColumnStart).toBe('span 3')
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
 * `Grid` doesn't import or call `filterChildren`; its render is a bare
 * `{ children }` spread into the root `Box`. There is NO flattening and NO
 * filtering: `Fragment`s are not unwrapped (React renders their contents
 * natively anyway), a plain ELEMENT child that isn't a `Grid.Item` renders
 * straight through unwrapped by any `.inkq-grid-item`, and a bare string child
 * renders as-is too.
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
		// as `.inkq-grid-item`s.
		await expect(root.querySelectorAll(ITEM_SELECTOR)).toHaveLength(3)
		await expect(canvas.getByText('Fragment child A')).toBeInTheDocument()
		await expect(canvas.getByText('Fragment child B')).toBeInTheDocument()

		// A non-`Grid.Item` ELEMENT child is not dropped — it renders through,
		// present in the DOM.
		await expect(canvas.getByText('Not a GridItem — rendered as-is, not dropped')).toBeInTheDocument()

		// A bare string child is kept too.
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

		await expect(root.querySelectorAll(ITEM_SELECTOR)).toHaveLength(1)
	},
}

// No children at all (`null`) — `Grid` spreads `{ children }` directly with
// no flattening/filtering step to fall back on, so this is the only way to
// get a genuinely empty root: React renders `null` as nothing.
export const EmptyGrid: Story = {
	args: { children: null },
	play: async ({ canvasElement }) => {
		const root = canvasElement.querySelector(ROOT_SELECTOR) as HTMLElement

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
			{ BOOLEAN_OPTIONS.map(unstyled => (
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
