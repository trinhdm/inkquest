import { expect, within } from 'storybook/test'
import { getDefaultProps } from '@/hooks/useProps'
import { Grid } from '../Grid'
import type { ReactNode } from 'react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import moduleClasses from '../Grid.module.scss'

// `GridItem`'s own props are `{ children, span }` (plus the polymorphic Box
// escape hatches). `span` is a plain `number`, not an enum, and there are no
// boolean props of its own — so there is nothing to move into a shared
// `options.story.ts`; `SPAN_VALUES` below stays local.

const Row = ({ children }: { children: ReactNode }) => (
	<div style={ { display: 'flex', gap: 24, flexWrap: 'wrap' } }>
		{ children }
	</div>
)

// A plain label wrapper. `GridItem` has no context dependency of its own — it doesn't call any `useRootCtx`/
// `useSafeRootCtx` reader — so it renders identically whether or not it's
// mounted inside a real `<Grid>`. It's still wrapped in one here purely as a
// realistic usage example: `Grid.tsx` renders `{ children }` as-is with no
// child filtering at all (see `Grid.stories.tsx`), so `Grid` doesn't require —
// or even recognize — `GridItem` as a special child type.
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
// declares `defaults: { as: 'div' }` (`DEFAULT_PROPS = { as: TAG }`), so it is
// polymorphic: `GridItem` destructures `as` and forwards it to its `Box`.
// `GridItem.set({ defaultProps: DEFAULT_PROPS, ... })` registers that same
// `div` default, so `meta.args` (via `getDefaultProps`) carries `as: 'div'`.
type GridItemStoryProps = Parameters<typeof Grid.Item>[0]
type Story = StoryObj<GridItemStoryProps>

const meta: Meta<GridItemStoryProps> = {
	component: Grid.Item,
	title: 'Layout/Grid/Grid.Item',
	render: (args) => <Grid><Grid.Item { ...args } /></Grid>,
	argTypes: {
		as: {
			control: 'text',
			description: 'Polymorphic escape hatch via the shared `Box` contract. `GridItemSpecs` declares `defaults: { as: \'div\' }` (registered via `GridItem.set({ defaultProps })`), and `GridItem` destructures `as` and renders `<Box ... as={ as }>`, so it sets the item\'s tag. See the `AsElement` story.',
		},
		span: {
			control: 'number',
			description: 'Number of grid columns this item spans. Feeds an inline `--grid-span-col` custom property formatted `span N` (the `tokens` function built with `defineTokens`), which `Grid.module.scss`\'s item rule reads via `grid-column: var(--grid-span-col)`. When `span` is `0` or unset, the property is not set at all. `GridItem` destructures `span` out of its props, so it is not forwarded to the DOM as a `span` attribute. See the `Span` story.',
		},
		unstyled: {
			control: 'boolean',
			description: 'Part of the factory\'s `FactoryContract` (`_PolymorphicContract.unstyled`), not `GridItem`\'s own props. The semantic base class (`inkq-grid-item`) is emitted regardless of this prop (`namespace ?? baseName`). When `unstyled` is true, `Grid.Item` loses the CSS-module-hashed class and the inline `--grid-span-col` token (`getStyle` returns only inherited styles); it has no config classes.',
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

const SPAN_VALUES: readonly (number | undefined)[] = [undefined, 0, 1, 2, 3]

/**
 * `span` side by side: unset, `0`, and positive values. A positive `span`
 * sets the inline `--grid-span-col` custom property to `span N`; `0` and unset
 * leave it off the inline style entirely.
 */
export const Span: Story = {
	parameters: {
		layout: 'padded',
		controls: { exclude: ['span'] },
	},
	render: (args) => (
		<Row>
			{ SPAN_VALUES.map(span => {
				const label = String(span)
				return (
					<Group key={ label } label={ label }>
						<Grid.Item { ...args } span={ span }>{ `span=${label}` }</Grid.Item>
					</Group>
				)
			}) }
		</Row>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			rootFor = (span: number | undefined) =>
				canvas.getByText(`span=${span}`).closest(ROOT_SELECTOR) as HTMLElement

		await expect(rootFor(undefined).style.getPropertyValue('--grid-span-col')).toBe('')
		await expect(rootFor(0).style.getPropertyValue('--grid-span-col')).toBe('')
		await expect(rootFor(1).style.getPropertyValue('--grid-span-col')).toBe('span 1')
		await expect(rootFor(2).style.getPropertyValue('--grid-span-col')).toBe('span 2')
		await expect(rootFor(3).style.getPropertyValue('--grid-span-col')).toBe('span 3')

		// Regression: `span` is consumed by the component, never a DOM attribute.
		for (const span of SPAN_VALUES)
			await expect(rootFor(span)).not.toHaveAttribute('span')
	},
}

/**
 * `Grid.Item` is polymorphic: `GridItemSpecs` declares `defaults: { as:
 * 'div' }` and the component forwards `as` to its `Box`. The registered
 * default (`div`) vs. an explicit `li` override, side by side. (The `li` sits
 * in a `div` `Grid` here, which is fine for asserting the tag.)
 */
export const AsElement: Story = {
	parameters: { controls: { exclude: ['as'] } },
	render: (args) => (
		<Row>
			<Group label='as="div" (default)'>
				<Grid.Item { ...args }>div item</Grid.Item>
			</Group>
			<Group label='as="li"'>
				<Grid.Item { ...args } as="li">li item</Grid.Item>
			</Group>
		</Row>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			asDiv = canvas.getByText('div item').closest(ROOT_SELECTOR) as HTMLElement,
			asLi = canvas.getByText('li item').closest(ROOT_SELECTOR) as HTMLElement

		await expect(asDiv.tagName).toBe('DIV')
		await expect(asLi.tagName).toBe('LI')
	},
}

// `unstyled` does NOT remove `GridItem`'s semantic base class (`inkq-grid-item`)
// — per `getClassName.tsx` the base class (`namespace ?? baseName`) is emitted
// regardless. It also suppresses the CSS-module-hashed class normally appended
// alongside it and the inline `--grid-span-col` token; this story asserts only
// the hash.
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
