import { expect, within } from 'storybook/test'
import { getDefaultProps } from '@/hooks/useProps'
import { Grid } from '../Grid'
import type { ReactNode } from 'react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import moduleClasses from '../Grid.module.scss'

// `GridItem` has no enum-valued or boolean props of its own — just `children`
// (plus the polymorphic `as`/Box escape hatches) — so there is nothing to move
// into a shared `options.story.ts`.

const Row = ({ children }: { children: ReactNode }) => (
	<div style={ { display: 'flex', gap: 24, flexWrap: 'wrap' } }>
		{ children }
	</div>
)

// A plain label wrapper ONLY — never a direct JSX child of `<Grid>` (see the
// `GridItem` mounting note below). Each `Group` wraps its OWN separate
// `<Grid>` internally so the actual `GridItem` stays a literal, direct child
// of a `Grid` for `filterChildren` to recognize.
const Group = ({ label, children }: { label: string, children: ReactNode }) => (
	<div style={ { display: 'flex', flexDirection: 'column', gap: 8 } }>
		<span style={ { font: 'var(--inkq-text-control)', letterSpacing: '.15em', textTransform: 'uppercase', opacity: 0.6 } }>
			{ label }
		</span>
		<Grid>{ children }</Grid>
	</div>
)

// `GridItem`'s own base class (`inkq-grid-item`, always emitted by
// `getClassName` regardless of `unstyled`) is the stable selector used to walk
// from rendered content back up to the actual polymorphic root element.
const ROOT_SELECTOR = '.inkq-grid-item'

// `GridItem.Props` (the `declare namespace` export) is just the raw
// `GridItemProps` interface — it doesn't include `as`/`unstyled`/`attributes`/
// etc., which only exist on the actual accepted prop type,
// `PolymorphicProps<GridItemProps, C>`. `Parameters<typeof Grid.Item>[0]` reads
// that real, wrapped type straight off the component itself. `GridItemSpecs`
// declares no `defaults.as`, so the generic call signature's default
// `C` resolves to `'div'` (`polymorphic`'s own fallback), and
// `GridItem.setDefaults({})` registers no defaults at all — `as` is left
// entirely up to the caller.
type GridItemStoryProps = Parameters<typeof Grid.Item>[0]
type Story = StoryObj<GridItemStoryProps>

// `GridItem` is a compound part (`isCompound: true`), so every story
// mounts it as a literal, DIRECT JSX child of a real `<Grid>` — NOT via a
// meta-level `decorators` wrapper. `Grid.tsx` calls
// `filterChildren(children, 'GridItem')`, which checks `child.type.displayName`
// on each of ITS OWN direct `children`; a Storybook `decorators` wrapper
// renders `<Story />` (Storybook's own internal story-renderer component) as
// that direct child instead of `GridItem` itself, so the displayName check
// fails and `Grid` silently drops it — the canvas ends up completely empty.
// Verified: this is exactly what happened before this fix (every story in
// this file rendered nothing).
const meta: Meta<GridItemStoryProps> = {
	component: Grid.Item,
	title: 'Layout/Grid/Grid.Item',
	render: (args) => <Grid><Grid.Item { ...args } /></Grid>,
	argTypes: {
		as: {
			control: 'text',
			description: '**Source bug, verified against the live `GridItem.tsx`**: accepted by the polymorphic contract, but SILENTLY IGNORED at runtime. `extractOtherProps(rest)` (`hooks/useProps/helpers.ts`) splits its return into `{ as, others }` — `GridItem` destructures only `{ others }` from that call and never reads the sibling `as` value, so it never reaches `Box`. `GridItem` always renders a `div` regardless of what `as` is set to. See the `AsPropIgnored` story.',
		},
		unstyled: {
			control: 'boolean',
			description: 'Part of `PolymorphicProps` (via the shared `SpecsContract`), not `GridItem`\'s own props. The semantic base class (`inkq-grid-item`) is ALWAYS emitted regardless of this prop — `unstyled` only suppresses the CSS-module-hashed class normally appended alongside it.',
		},
	},
	args: {
		...getDefaultProps<Grid.Item.Props>('Grid.Item'),
	},
}

export default meta

export const Default: Story = {
	args: {
		children: 'Grid item content',
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			root = canvas.getByText('Grid item content').closest(ROOT_SELECTOR) as HTMLElement

		await expect(root).toBeInTheDocument()
		await expect(root.tagName).toBe('DIV')
	},
}

/**
 * **Source bug, verified against the live `GridItem.tsx` and
 * `extractOtherProps`**: `extractOtherProps(rest)` returns `{ as, others }`
 * as two SEPARATE keys — `GridItem` destructures only `{ others } =
 * extractOtherProps(rest)`, so the `as` value it also returns is silently
 * discarded and never reaches the underlying `Box`. Unlike `Grid`/`Section`/
 * `MenuItem` (which each forward or otherwise account for their own `as`),
 * `GridItem` — a compound part accepting an `as` prop via the shared
 * polymorphic contract — has NO working way to change its rendered tag: it's
 * always a `div`, regardless of what `as` is set to. Flagged as a real
 * source-side gap, not "fixed" here.
 *
 * NOTE: `GridItemSpecs` declares no `defaults.as`, so `polymorphic()`'s
 * non-polymorphic call-signature branch types `as` as `never` (only
 * `undefined` is assignable) — consistent with the fact that it's genuinely
 * inert at runtime too. The `as={ 'article' as never }` cast below is the
 * narrowest possible escape hatch for that one value, scoped to this single
 * JSX attribute.
 */
export const AsPropIgnored: Story = {
	render: (args) => (
		<Row>
			<Group label='as="div" (default)'>
				<Grid.Item { ...args }>div item</Grid.Item>
			</Group>
			<Group label='as="article" (ignored)'>
				<Grid.Item { ...args } as={ 'article' as never }>article item</Grid.Item>
			</Group>
		</Row>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			asDiv = canvas.getByText('div item').closest(ROOT_SELECTOR) as HTMLElement,
			asArticle = canvas.getByText('article item').closest(ROOT_SELECTOR) as HTMLElement

		// Both render as `div` — `as="article"` has no effect.
		await expect(asDiv.tagName).toBe('DIV')
		await expect(asArticle.tagName).toBe('DIV')
	},
}

// `unstyled` does NOT remove `GridItem`'s semantic base class (`inkq-grid-item`)
// — per `getClassName.tsx` the base class is now ALWAYS emitted. It only
// suppresses the CSS-module-hashed class normally appended alongside it.
// `GridItem` makes exactly one `styles(...)` call (`root`), so the root
// element is the only one to check here.
export const Unstyled: Story = {
	parameters: { controls: { exclude: ['unstyled'] } },
	render: (args) => (
		<Row>
			{ ([true, false] as const).map(unstyled => (
				<Group key={ String(unstyled) } label={ String(unstyled) }>
					<Grid.Item { ...args } unstyled={ unstyled }>{ `unstyled=${unstyled}` }</Grid.Item>
				</Group>
			)) }
		</Row>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			unstyledRoot = canvas.getByText('unstyled=true').closest(ROOT_SELECTOR) as HTMLElement,
			styledRoot = canvas.getByText('unstyled=false').closest(ROOT_SELECTOR) as HTMLElement

		// Detect the REAL compiled CSS-module hash, keyed off the actual
		// `Grid.module.scss` export map (`GridItem` shares that stylesheet with
		// `Grid`) — not a naive "any extra class" heuristic, which can't
		// distinguish a module hash from an unrelated config/global modifier
		// class.
		const hasModuleClass = (el: Element, base: string) => {
			const moduleClass = (moduleClasses as Record<string, string>)[base]
			return !!moduleClass && el.classList.contains(moduleClass)
		}

		await expect(styledRoot).toHaveClass('inkq-grid-item')
		await expect(unstyledRoot).toHaveClass('inkq-grid-item')
		expect(hasModuleClass(styledRoot, 'inkq-grid-item')).toBe(true)
		expect(hasModuleClass(unstyledRoot, 'inkq-grid-item')).toBe(false)
	},
}
