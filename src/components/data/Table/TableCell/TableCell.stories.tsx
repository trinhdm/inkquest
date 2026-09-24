import { expect, within } from 'storybook/test'
import { getDefaultProps } from '@/hooks/useProps'
import { Table } from '../Table'
import type { ReactNode } from 'react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import moduleClasses from '../Table.module.scss'

// `Table.Cell` has no enum-valued or boolean props of its own — just
// `children` (plus the polymorphic `as`/Box escape hatches) — so there is
// nothing to move into a shared `options.story.ts`.

const Row = ({ children }: { children: ReactNode }) => (
	<div style={ { display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'flex-start' } }>
		{ children }
	</div>
)

// A plain label wrapper. `Table.Cell` (`TableCellSpecs`'s `isCompound: true`)
// has no context dependency of its own — it doesn't call any `useRootCtx`/
// `useSafeRootCtx` reader — so it renders identically whether or not it's
// mounted inside a real `<Table>`. It's still wrapped in a full `Table` >
// `Table.Row` chain here purely as a realistic usage example, matching valid
// HTML (`<td>` needs a `<tr>` ancestor to be valid markup). See the
// `StandaloneCell` story for the no-parent case.
const Group = ({ label, children }: { label: string, children: ReactNode }) => (
	<div style={ { display: 'flex', flexDirection: 'column', gap: 8 } }>
		<span style={ { font: 'var(--inkq-text-control)', letterSpacing: '.15em', textTransform: 'uppercase', opacity: 0.6 } }>
			{ label }
		</span>
		<Table><Table.Row>{ children }</Table.Row></Table>
	</div>
)

// `Table.Cell`'s own base class (`nameClassBase` kebab-cases the dotted
// `NAME`, `'Table.Cell'` → `'table-cell'`, then prefixes it: `inkq-table-cell`)
// is the stable selector used to walk from rendered content back up to the
// actual polymorphic root element.
//
// **Verified against the LIVE `Table.module.scss`**: unlike `.inkq-table` and
// `.inkq-table-row`, there is NO `.inkq-table-cell` rule declared anywhere in
// the stylesheet — only a commented-out `// &__cell {}` placeholder nested
// under `.inkq-table`, which produces no CSS-module export at all.
// `getStyleClass()` (`getClassName.tsx`) looks up the exact key
// `inkq-table-cell` in the compiled `classes` map and finds nothing, so it
// returns `undefined` REGARDLESS of `unstyled` — `Table.Cell`'s root never
// carries a CSS-module hash, styled or unstyled alike. See the `Unstyled`
// story, which asserts this directly instead of a hash-suppression toggle
// that has nothing to suppress.
const ROOT_SELECTOR = '.inkq-table-cell'

// `Table` does NOT re-export a nested `Cell` namespace the way `Grid`/`Group`
// re-export `Item` (`Grid.tsx`/`Group.tsx` both declare `export namespace Item
// { export type Props = ... }` inside their `declare namespace`; `Table.tsx`
// declares only `Props`/`Specs` for itself) — so `Table.Cell.Props` doesn't
// resolve as a type. `Parameters<typeof Table.Cell>[0]` reads the real,
// wrapped prop type straight off the component value instead, which works
// regardless of that gap and is what both `getDefaultProps` below and the
// `Story` type use. `TableCellSpecs` declares `isCompound: true` with no
// `defaults.as`, so the generic call signature's non-polymorphic branch types
// `as` as `never`, and `TableCell.setDefaults({})` registers no defaults at
// all.
type TableCellStoryProps = Parameters<typeof Table.Cell>[0]
type Story = StoryObj<TableCellStoryProps>

const meta: Meta<TableCellStoryProps> = {
	component: Table.Cell,
	title: 'Data/Table/Table.Cell',
	render: (args) => <Table><Table.Row><Table.Cell { ...args } /></Table.Row></Table>,
	argTypes: {
		as: {
			control: false,
			description: 'NOT part of `Table.Cell`\'s accepted props. `TableCellSpecs` declares `isCompound: true` with no `defaults.as`, which is the codebase-wide signal for a compound part with a fixed tag — `polymorphic()`\'s non-polymorphic call-signature branch then types `as` as `never`, so only `undefined` is assignable and passing a tag is a type error. `Table.Cell` correspondingly hardcodes `as="td"` on its `Box` and takes only `{ others }` from `extractOtherProps`. This is the same deliberate contract used by `Grid.Item`, `Group.Item`, `Timeline.Item`, `Table.Row`, `Button.Section` and the `Accordion` parts (see `Table.test.tsx`, which asserts it directly) — not an oversight. See the `FixedTag` story.',
		},
		unstyled: {
			control: 'boolean',
			description: 'Part of `PolymorphicProps` (via the shared `SpecsContract`), not `Table.Cell`\'s own props. Unlike most components in this codebase, `unstyled` has NO visible effect here: `Table.module.scss` declares no `.inkq-table-cell` rule at all, so `Table.Cell`\'s root never carries a CSS-module hash to begin with — styled or unstyled. See the `Unstyled` story.',
		},
	},
	args: {
		...getDefaultProps<TableCellStoryProps>('Table.Cell'),
	},
}

export default meta

export const Default: Story = {
	args: {
		children: 'Cell content',
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			root = canvas.getByText('Cell content').closest(ROOT_SELECTOR) as HTMLElement

		await expect(root).toBeInTheDocument()
		await expect(root.tagName).toBe('TD')
	},
}

/**
 * `Table.Cell` is a COMPOUND part: `TableCellSpecs` sets `isCompound: true`
 * and declares no `defaults.as`, so `polymorphic()` types `as` as `never` and
 * the component hardcodes `as="td"` on its `Box`. The rendered tag is part of
 * the contract, not a caller decision — `<Table.Cell as="div">` doesn't "get
 * ignored", it doesn't typecheck. `Table.test.tsx` asserts this directly.
 *
 * This story pins that fixed tag so a future refactor can't quietly change it.
 * The same contract governs `Grid.Item`, `Group.Item`, `Timeline.Item`,
 * `Table.Row`, `Button.Section` and the `Accordion` parts.
 */
export const FixedTag: Story = {
	render: (args) => (
		<Row>
			<Group label="td (fixed)">
				<Table.Cell { ...args }>td cell</Table.Cell>
			</Group>
		</Row>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			asTd = canvas.getByText('td cell').closest(ROOT_SELECTOR) as HTMLElement

		await expect(asTd.tagName).toBe('TD')
	},
}

/**
 * `unstyled` does NOT change `Table.Cell`'s rendered class at all — its base
 * class (`inkq-table-cell`) is ALWAYS emitted (per `getClassName.tsx`), AND,
 * unlike `Table`/`Table.Row`, there is no `.inkq-table-cell` rule in
 * `Table.module.scss` for CSS Modules to hash in the first place — only a
 * commented-out `// &__cell {}` placeholder. `getStyleClass()` finds no
 * matching key and returns `undefined` regardless of `unstyled`, so the two
 * groups below render byte-identical classes.
 */
export const Unstyled: Story = {
	parameters: { controls: { exclude: ['unstyled'] } },
	render: (args) => (
		<Row>
			{ ([true, false] as const).map(unstyled => (
				<Group key={ String(unstyled) } label={ String(unstyled) }>
					<Table.Cell { ...args } unstyled={ unstyled }>
						{ `unstyled=${unstyled}` }
					</Table.Cell>
				</Group>
			)) }
		</Row>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			unstyledRoot = canvas.getByText('unstyled=true').closest(ROOT_SELECTOR) as HTMLElement,
			styledRoot = canvas.getByText('unstyled=false').closest(ROOT_SELECTOR) as HTMLElement

		// Detect the REAL compiled CSS-module hash, keyed off the actual
		// `Table.module.scss` export map (`Table.Cell` shares that stylesheet
		// with `Table`/`Table.Row`) — not a naive "any extra class" heuristic,
		// which can't distinguish a module hash from an unrelated
		// config/global modifier class.
		const hasModuleClass = (el: Element, base: string) => {
			const moduleClass = (moduleClasses as Record<string, string>)[base]
			return !!moduleClass && el.classList.contains(moduleClass)
		}

		await expect(styledRoot).toHaveClass('inkq-table-cell')
		await expect(unstyledRoot).toHaveClass('inkq-table-cell')

		// No hash exists for either state — `unstyled` has nothing to suppress.
		expect(hasModuleClass(styledRoot, 'inkq-table-cell')).toBe(false)
		expect(hasModuleClass(unstyledRoot, 'inkq-table-cell')).toBe(false)
		await expect(styledRoot.className).toBe(unstyledRoot.className)
	},
}

/**
 * `Table.Cell` doesn't read any context — unlike e.g. `Group.Item`'s
 * required `useGroupCtx`, `TableCell.tsx` calls only
 * `useProps`/`useStyles` — so it renders standalone without throwing, even
 * outside a `<Table>`/`<Table.Row>`. Mounted here inside the minimal valid
 * ancestor chain a bare `<td>` needs (`<table><tbody><tr>...`) rather than
 * inside a real `<Table>`/`<Table.Row>`, so the markup stays valid for the
 * real headless-Chromium browser this test runs in.
 */
export const StandaloneCell: Story = {
	render: (args) => (
		<table>
			<tbody>
				<tr>
					<Table.Cell { ...args }>Standalone cell</Table.Cell>
				</tr>
			</tbody>
		</table>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			root = canvas.getByText('Standalone cell').closest(ROOT_SELECTOR) as HTMLElement

		await expect(root).toBeInTheDocument()
		await expect(root.tagName).toBe('TD')
	},
}
