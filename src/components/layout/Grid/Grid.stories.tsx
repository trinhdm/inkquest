import { Fragment } from 'react'
import { expect, within } from 'storybook/test'
import { getDefaultProps } from '@/lib/registries'
import { Grid } from './Grid'
import type { ReactNode } from 'react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

// `Grid`'s own props are `{ children, columns }` (plus the polymorphic
// `as`/Box escape hatches). `columns` is a plain `number`, not a fixed enum,
// so there is nothing to move into a shared `options.story.ts` — the
// representative values exercised below (`COLUMN_VALUES`) live locally,
// same precedent as `Button`/`Badge`/`Container`/`Section`.
const COLUMN_VALUES = [2, 3, 4] as const

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
// component itself — the generic call signature's default `C` resolves to
// `'div'` here, since `GridSpecs`'s `default.component` is `'div'`.
type GridStoryProps = Parameters<typeof Grid>[0]
type Story = StoryObj<GridStoryProps>

const meta: Meta<GridStoryProps> = {
	component: Grid,
	title: 'Layout/Grid',
	argTypes: {
		children: {
			control: false,
			description: 'Rendered completely as-is — `Grid.tsx` spreads `{ children }` directly into its root `<Box>` with NO flattening or filtering applied. `filterChildren` is still imported but its call site is commented out (`Grid.tsx` line 42); it is dead code. Every child is preserved verbatim regardless of whether it\'s a `Grid.Item`, a plain element, a `Fragment`, or a bare string. See the `RawChildren` story.',
		},
		columns: {
			control: 'number',
			description: 'Adds an `inkq-grid--{n}-col` modifier class when set to a positive number — `Grid.tsx` builds a `clsx = { [\`${NAME}--${columns}-col\`]: !!(columns && columns > 0) }` object and passes it as `styles(\'root\', { clsx })`; falsy or non-positive values compute to `false` and add no modifier at all. Only `columns={3}` has a matching rule in `Grid.module.scss` (`&--3-col`, hardcoding `repeat(3, 1fr)`) — any other value still lands its own literal `inkq-grid--{n}-col` class on the root (verified against `getClassName.tsx`\'s `outputExtraClasses`, which falls back to the raw, unhashed class name whenever no matching CSS-module rule exists for it), it just has no accompanying `grid-template-columns` rule behind it. See the `Columns` story.',
		},
		unstyled: {
			control: 'boolean',
			description: 'Part of `PolymorphicProps` (via the shared `SpecsContract`), not `Grid`\'s own `GridProps`. The semantic base class (`inkq-grid`) is ALWAYS emitted regardless of this prop — `unstyled` only suppresses the CSS-module-hashed class normally appended alongside it.',
		},
	},
	args: {
		...getDefaultProps<Grid.Props>('Grid'),
	},
}

export default meta

// NOTE: `Grid`'s BASE rule — `grid-template-columns: repeat(auto-fit,
// minmax(var(--inkq-breakpoint-min), 1fr))` in `Grid.module.scss`, which
// applies whenever `columns` is unset/falsy/non-positive — references
// `--inkq-breakpoint-min`, which is defined nowhere in the repo, so that
// `minmax()` argument is invalid and the browser falls back to a single
// column. This is a source-side gap: no COMPUTED-layout assertions (actual
// column count/widths) are made anywhere in this file, for the base rule OR
// the `columns` modifier below — only class-presence, which IS reliably
// verifiable regardless of whether the underlying CSS value resolves.
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
 * All three representative `columns` values, side by side. `Grid.tsx` only
 * ever adds an `inkq-grid--{n}-col` modifier class for a positive `columns`
 * — it never touches `filterChildren`'s own behavior. `columns={3}` is the
 * only value with a matching rule in `Grid.module.scss` (`&--3-col`), so it
 * resolves to a CSS-MODULE HASH rather than the literal class (per
 * `getClassName.tsx`'s `outputExtraClasses`), while `columns={2}`/`{4}` have
 * no matching rule and fall back to the raw, unhashed class name. Only class
 * presence is asserted below — see the `NOTE` above `Default` for why
 * computed `grid-template-columns` is out of scope.
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

		// `columns={3}` matches `Grid.module.scss`'s `&--3-col` rule, so the
		// module resolves it to a CSS-module HASH (not the literal class name)
		// — assert via `className` substring matching rather than
		// `toHaveClass`'s exact-token match, same pattern as `Section`'s
		// `Layout` story.
		await expect(root3.className).toMatch('inkq-grid--3-col')

		// `columns={2}`/`columns={4}` have no matching rule in the stylesheet,
		// so `outputExtraClasses` falls back to emitting the literal, unhashed
		// class name verbatim — a genuine, exact class token.
		await expect(root2).toHaveClass('inkq-grid--2-col')
		await expect(root4).toHaveClass('inkq-grid--4-col')

		// A non-positive/absent `columns` never receives ANY `--{n}-col`
		// modifier at all (`Grid.tsx`'s `!!(columns && columns > 0) && ...`).
		for (const root of [root2, root3, root4]) {
			const modifiers = Array.from(root.classList).filter(c => /--\d+-col/.test(c))
			await expect(modifiers).toHaveLength(1)
		}
	},
}

/**
 * **Re-verified against the LIVE `Grid.tsx`**: `Grid` no longer calls
 * `filterChildren` at all — the call is present in source but commented out
 * (`Grid.tsx` line 42, `{/* { filterChildren(children, 'GridItem').map(...) } *\/}`),
 * and the actual render is a bare `{ children }` spread (line 41). There is
 * NO flattening and NO filtering anymore: `Fragment`s are not unwrapped (React
 * renders their contents natively either way, so this makes no visible
 * difference), and — the behavioral change that matters — a plain ELEMENT
 * child that isn't a `Grid.Item` is NO LONGER dropped; it renders straight
 * through, unwrapped by any `.inkq-grid-item`, exactly like the bare string
 * child already did. `filterChildren` (`src/utils/helpers/children.ts`) is
 * still imported by `Grid.tsx` but is now dead code — worth flagging as an
 * unused import, separate from the filtering behavior change itself.
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
// `getClassName.tsx` the base class is now ALWAYS emitted. It only suppresses
// the CSS-module-hashed class normally appended alongside it. `Grid` makes
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

		const hasModuleClass = (el: Element, base: string) =>
			Array.from(el.classList).some(c => c !== base)

		await expect(styledRoot).toHaveClass('inkq-grid')
		await expect(unstyledRoot).toHaveClass('inkq-grid')
		expect(hasModuleClass(styledRoot, 'inkq-grid')).toBe(true)
		expect(hasModuleClass(unstyledRoot, 'inkq-grid')).toBe(false)
	},
}
