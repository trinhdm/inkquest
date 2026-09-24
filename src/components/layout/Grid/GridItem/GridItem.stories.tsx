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

// A plain label wrapper. `GridItem` (`GridItemSpecs`'s `isCompound: true`)
// has no context dependency of its own — it doesn't call any `useRootCtx`/
// `useSafeRootCtx` reader — so it renders identically whether or not it's
// mounted inside a real `<Grid>`. It's still wrapped in one here purely as a
// realistic usage example: `Grid.tsx`'s own `filterChildren(children,
// 'GridItem')` call is commented out (dead code, see `Grid.stories.tsx`), so
// `Grid` no longer requires — or even recognizes — `GridItem` as a special
// child type; every child renders through as-is regardless.
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

const meta: Meta<GridItemStoryProps> = {
	component: Grid.Item,
	title: 'Layout/Grid/Grid.Item',
	render: (args) => <Grid><Grid.Item { ...args } /></Grid>,
	argTypes: {
		as: {
			control: 'text',
			description: 'NOT part of `Grid.Item`\'s accepted props. `GridItemSpecs` declares `isCompound: true` with no `defaults.as`, which is the codebase-wide signal for a compound part with a fixed tag — `polymorphic()`\'s non-polymorphic call-signature branch then types `as` as `never`, so only `undefined` is assignable and passing a tag is a type error. `GridItem` correspondingly hardcodes `as="div"` on its `Box` and takes only `{ others }` from `extractOtherProps`. This is the same deliberate contract used by `Group.Item`, `Timeline.Item`, `Table.Row`/`Table.Cell`, `Button.Section` and the `Accordion` parts (see `Grid.test.tsx` and `Table.test.tsx`, which assert it directly) — not an oversight. See the `FixedTag` story.',
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
 * `Grid.Item` is a COMPOUND part: `GridItemSpecs` sets `isCompound: true` and
 * declares no `defaults.as`, so `polymorphic()` types `as` as `never` and the
 * component hardcodes `as="div"` on its `Box`. The rendered tag is part of the
 * contract, not a caller decision — `<Grid.Item as="article">` doesn't "get
 * ignored", it doesn't typecheck. `Grid.test.tsx` asserts this directly.
 *
 * This story pins that fixed tag so a future refactor can't quietly change it.
 * The same contract governs `Group.Item`, `Timeline.Item`, `Table.Row`/
 * `Table.Cell`, `Button.Section` and the `Accordion` parts.
 */
export const FixedTag: Story = {
	render: (args) => (
		<Row>
			<Group label="div (fixed)">
				<Grid.Item { ...args }>div item</Grid.Item>
			</Group>
		</Row>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			asDiv = canvas.getByText('div item').closest(ROOT_SELECTOR) as HTMLElement

		await expect(asDiv.tagName).toBe('DIV')
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
