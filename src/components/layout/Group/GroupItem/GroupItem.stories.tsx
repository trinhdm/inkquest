import { Component } from 'react'
import { expect, within } from 'storybook/test'
import { getDefaultProps } from '@/hooks/useProps'
import { Group } from '../Group'
import type { ReactNode } from 'react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import moduleClasses from '../Group.module.scss'

// `Group.Item` has no enum-valued or boolean props of its own — just
// `children` (plus the polymorphic `as`/Box escape hatches) — so there is
// nothing to move into the shared `Group/options.story.ts`.

const Row = ({ children }: { children: ReactNode }) => (
	<div style={ { display: 'flex', gap: 24, flexWrap: 'wrap' } }>
		{ children }
	</div>
)

// A plain label wrapper — `Group.Item` DOES require real context
// (`useGroupCtx`, a REQUIRED `createRootCtx` reader), so every story except
// `RequiresGroupParent` mounts it as a literal, direct JSX child of a real
// `<Group>`, matching the default `childName`/`provider` pair `Group`
// registers (`GroupItem.displayName` / `GroupProvider`).
const Labeled = ({ label, children }: { label: string, children: ReactNode }) => (
	<div style={ { display: 'flex', flexDirection: 'column', gap: 8 } }>
		<span style={ { font: 'var(--inkq-text-control)', letterSpacing: '.15em', textTransform: 'uppercase', opacity: 0.6 } }>
			{ label }
		</span>
		<Group>{ children }</Group>
	</div>
)

// `Group.Item`'s own base class. `GroupItem.tsx` calls `useGroupCtx(NAME)` to
// read `{ baseName, rootName }` off `Group`'s `createRootCtx`, then renders
// `styles(rootName, { classes, props })` with `styles(baseName, true)` for
// the root selector — `rootName` is `'Group'` (the enclosing `<Group>`'s own
// name, or its `rootName` override) and `baseName` is derived by stripping
// that rootName off `Group.Item`'s own dotted `NAME` (`'Group.Item'` →
// `'.Item'` → `'item'`, lowercased). `nameClassBase` then composes
// `inkq-group__item` — a real, hashed selector (`Group.module.scss`'s
// `&__item` block has its own declarations).
const ROOT_SELECTOR = '.inkq-group__item'

// `Group.Item.Props` (the `declare namespace` export) is just the raw
// `GroupItemProps` interface — it doesn't include `as`/`unstyled`/
// `attributes`/etc., which only exist on the actual accepted prop type,
// `PolymorphicProps<GroupItemProps, C>`. `Parameters<typeof Group.Item>[0]`
// reads that real, wrapped type straight off the component itself.
// `GroupItemSpecs` declares `isCompound: true` with no `defaults.as`, so the
// generic call signature's non-polymorphic branch types `as` as `never`, and
// `GroupItem.setDefaults({})` registers no defaults at all.
type GroupItemStoryProps = Parameters<typeof Group.Item>[0]
type Story = StoryObj<GroupItemStoryProps>

// Local, stories-file-only error boundary — mirrors the `RenderErrorBoundary`
// pattern used elsewhere in this codebase for a REQUIRED `createRootCtx`
// reader (`useRootCtx`, not `useSafeRootCtx`). `useGroupCtx` throws
// synchronously during render when there's no enclosing `<Group>`, so only
// the misuse case in `RequiresGroupParent` needs to be wrapped in it.
interface BoundaryState {
	error: Error | null
}

class RenderErrorBoundary extends Component<{ children: ReactNode }, BoundaryState> {
	state: BoundaryState = { error: null }

	static getDerivedStateFromError(error: Error): BoundaryState {
		return { error }
	}

	render() {
		if (this.state.error)
			return <div role="alert">{ this.state.error.message }</div>

		return this.props.children
	}
}

const meta: Meta<GroupItemStoryProps> = {
	component: Group.Item,
	title: 'Layout/Group/Group.Item',
	render: (args) => <Group><Group.Item { ...args } /></Group>,
	argTypes: {
		as: {
			control: false,
			description: 'NOT part of `Group.Item`\'s accepted props. `GroupItemSpecs` declares `isCompound: true` with no `defaults.as`, which is the codebase-wide signal for a compound part with a fixed tag — `polymorphic()`\'s non-polymorphic call-signature branch then types `as` as `never`, so only `undefined` is assignable and passing a tag is a type error. `GroupItem` correspondingly hardcodes `as="div"` on its `Box` and takes only `{ others }` from `extractOtherProps`. This is the same deliberate contract used by `Grid.Item`, `Timeline.Item`, `Table.Row`/`Table.Cell`, `Button.Section` and the `Accordion` parts — not an oversight. See the `FixedTag` story.',
		},
		unstyled: {
			control: 'boolean',
			description: 'Part of `PolymorphicProps` (via the shared `SpecsContract`), not `Group.Item`\'s own props. The semantic base class (`inkq-group__item`) is ALWAYS emitted regardless of this prop — `unstyled` only suppresses the CSS-module-hashed class normally appended alongside it. See the `Unstyled` story.',
		},
	},
	args: {
		...getDefaultProps<Group.Item.Props>('Group.Item'),
	},
}

export default meta

export const Default: Story = {
	args: {
		children: 'Group item content',
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			root = canvas.getByText('Group item content').closest(ROOT_SELECTOR) as HTMLElement

		await expect(root).toBeInTheDocument()
		await expect(root.tagName).toBe('DIV')
	},
}

/**
 * `Group.Item` is a COMPOUND part: `GroupItemSpecs` sets `isCompound: true`
 * and declares no `defaults.as`, so `polymorphic()` types `as` as `never` and
 * the component hardcodes `as="div"` on its `Box`. The rendered tag is part of
 * the contract, not a caller decision — `<Group.Item as="article">` doesn't
 * "get ignored", it doesn't typecheck.
 *
 * This story pins that fixed tag so a future refactor can't quietly change it.
 * The same contract governs `Grid.Item`, `Timeline.Item`, `Table.Row`/
 * `Table.Cell`, `Button.Section` and the `Accordion` parts.
 */
export const FixedTag: Story = {
	render: (args) => (
		<Row>
			<Labeled label="div (fixed)">
				<Group.Item { ...args }>div item</Group.Item>
			</Labeled>
		</Row>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			asDiv = canvas.getByText('div item').closest(ROOT_SELECTOR) as HTMLElement

		await expect(asDiv.tagName).toBe('DIV')
	},
}

// `unstyled` does NOT remove `Group.Item`'s semantic base class
// (`inkq-group__item`) — per `getClassName.tsx` the base class is always
// emitted. It only suppresses the CSS-module-hashed class normally appended
// alongside it. `Group.Item` makes exactly one `styles(...)` call, so the
// root element is the only one to check here.
export const Unstyled: Story = {
	parameters: { controls: { exclude: ['unstyled'] } },
	render: (args) => (
		<Row>
			{ ([true, false] as const).map(unstyled => (
				<Labeled key={ String(unstyled) } label={ String(unstyled) }>
					<Group.Item { ...args } unstyled={ unstyled }>{ `unstyled=${unstyled}` }</Group.Item>
				</Labeled>
			)) }
		</Row>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			unstyledRoot = canvas.getByText('unstyled=true').closest(ROOT_SELECTOR) as HTMLElement,
			styledRoot = canvas.getByText('unstyled=false').closest(ROOT_SELECTOR) as HTMLElement

		// Detect the REAL compiled CSS-module hash, keyed off the actual
		// `Group.module.scss` export map — not a naive "any extra class"
		// heuristic, which can't distinguish a module hash from an unrelated
		// config/global modifier class.
		const hasModuleClass = (el: Element, base: string) => {
			const moduleClass = (moduleClasses as Record<string, string>)[base]
			return !!moduleClass && el.classList.contains(moduleClass)
		}

		await expect(styledRoot).toHaveClass('inkq-group__item')
		await expect(unstyledRoot).toHaveClass('inkq-group__item')
		expect(hasModuleClass(styledRoot, 'inkq-group__item')).toBe(true)
		expect(hasModuleClass(unstyledRoot, 'inkq-group__item')).toBe(false)
	},
}

/**
 * `Group.Item` reads `Group`'s context via `useGroupCtx(NAME)` —
 * `createRootCtx`'s REQUIRED reader (`useRootCtx`, not `useSafeRootCtx`) —
 * which throws synchronously during render when there's no enclosing
 * `<Group>`: `` `<${componentName} /> must be rendered inside <${name}>` ``,
 * i.e. exactly `<Group.Item /> must be rendered inside <Group>` (`NAME` is
 * `'Group.Item'`, the context's own registered `name` is `'Group'`). Only
 * this story renders `Group.Item` standalone — every other story in this
 * file wraps it in a real `<Group>` — and only the misuse case itself is
 * wrapped in the local `RenderErrorBoundary`, so the uncaught throw doesn't
 * take down the rest of the story.
 */
export const RequiresGroupParent: Story = {
	render: () => (
		<RenderErrorBoundary>
			<Group.Item>Standalone item</Group.Item>
		</RenderErrorBoundary>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			alert = await canvas.findByRole('alert')

		await expect(alert).toHaveTextContent('<Group.Item /> must be rendered inside <Group>')
	},
}
