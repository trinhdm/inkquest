import { expect, within } from 'storybook/test'
import { getDefaultProps } from '@/hooks/useProps'
import { Table } from '../Table'
import type { ReactNode } from 'react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import moduleClasses from '../Table.module.scss'

// `Table.Row` has no enum-valued or boolean props of its own — just
// `children` (plus the polymorphic `as`/Box escape hatches) — so there is
// nothing to move into a shared `options.story.ts`.

const Row = ({ children }: { children: ReactNode }) => (
	<div style={ { display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'flex-start' } }>
		{ children }
	</div>
)

// A plain label wrapper. `Table.Row` (`TableRowSpecs`'s `isCompound: true`)
// has no context dependency of its own — it doesn't call any `useRootCtx`/
// `useSafeRootCtx` reader, unlike e.g. `Group.Item` — so it renders
// identically whether or not it's mounted inside a real `<Table>`. It's
// still wrapped in one here purely as a realistic usage example, matching
// valid HTML (`<tr>` needs a `<table>`/`<tbody>` ancestor to be valid
// markup). See the `StandaloneRow` story for the no-parent case.
const Group = ({ label, children }: { label: string, children: ReactNode }) => (
	<div style={ { display: 'flex', flexDirection: 'column', gap: 8 } }>
		<span style={ { font: 'var(--inkq-text-control)', letterSpacing: '.15em', textTransform: 'uppercase', opacity: 0.6 } }>
			{ label }
		</span>
		<Table>{ children }</Table>
	</div>
)

// `Table.Row`'s own base class. `nameClassBase` kebab-cases the dotted `NAME`
// (`'Table.Row'` → `'table-row'`, the dot is dropped, not converted to a
// separator) and prefixes it, giving `inkq-table-row` — `Table.module.scss`'s
// `.inkq-table-row` rule has direct declarations of its own, so it DOES get a
// real CSS-module hash. See the `Unstyled` story.
const ROOT_SELECTOR = '.inkq-table-row'

// `Table` does NOT re-export a nested `Row` namespace the way `Grid`/`Group`
// re-export `Item` (`Grid.tsx`/`Group.tsx` both declare `export namespace Item
// { export type Props = ... }` inside their `declare namespace`; `Table.tsx`
// declares only `Props`/`Specs` for itself) — so `Table.Row.Props` doesn't
// resolve as a type. `Parameters<typeof Table.Row>[0]` reads the real,
// wrapped prop type straight off the component value instead, which works
// regardless of that gap and is what both `getDefaultProps` below and the
// `Story` type use. `TableRowSpecs` declares `isCompound: true` with no
// `defaults.as`, so the generic call signature's non-polymorphic branch types
// `as` as `never`, and `TableRow.setDefaults({})` registers no defaults at
// all.
type TableRowStoryProps = Parameters<typeof Table.Row>[0]
type Story = StoryObj<TableRowStoryProps>

const meta: Meta<TableRowStoryProps> = {
	component: Table.Row,
	title: 'Data/Table/Table.Row',
	render: (args) => <Table><Table.Row { ...args } /></Table>,
	argTypes: {
		as: {
			control: false,
			description: 'NOT part of `Table.Row`\'s accepted props. `TableRowSpecs` declares `isCompound: true` with no `defaults.as`, which is the codebase-wide signal for a compound part with a fixed tag — `polymorphic()`\'s non-polymorphic call-signature branch then types `as` as `never`, so only `undefined` is assignable and passing a tag is a type error. `Table.Row` correspondingly hardcodes `as="tr"` on its `Box` and takes only `{ others }` from `extractOtherProps`. This is the same deliberate contract used by `Grid.Item`, `Group.Item`, `Timeline.Item`, `Table.Cell`, `Button.Section` and the `Accordion` parts (see `Table.test.tsx`, which asserts it directly) — not an oversight. See the `FixedTag` story.',
		},
		unstyled: {
			control: 'boolean',
			description: 'Part of `PolymorphicProps` (via the shared `SpecsContract`), not `Table.Row`\'s own props. The semantic base class (`inkq-table-row`) is ALWAYS emitted regardless of this prop — `unstyled` only suppresses the CSS-module-hashed class normally appended alongside it. See the `Unstyled` story.',
		},
	},
	args: {
		...getDefaultProps<TableRowStoryProps>('Table.Row'),
	},
}

export default meta

export const Default: Story = {
	args: {
		children: (
			<>
				<Table.Cell>Cell A</Table.Cell>
				<Table.Cell>Cell B</Table.Cell>
			</>
		),
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			root = canvas.getByText('Cell A').closest(ROOT_SELECTOR) as HTMLElement

		await expect(root).toBeInTheDocument()
		await expect(root.tagName).toBe('TR')
	},
}

/**
 * `Table.Row` is a COMPOUND part: `TableRowSpecs` sets `isCompound: true` and
 * declares no `defaults.as`, so `polymorphic()` types `as` as `never` and the
 * component hardcodes `as="tr"` on its `Box`. The rendered tag is part of the
 * contract, not a caller decision — `<Table.Row as="div">` doesn't "get
 * ignored", it doesn't typecheck. `Table.test.tsx` asserts this directly.
 *
 * This story pins that fixed tag so a future refactor can't quietly change it.
 * The same contract governs `Grid.Item`, `Group.Item`, `Timeline.Item`,
 * `Table.Cell`, `Button.Section` and the `Accordion` parts.
 */
export const FixedTag: Story = {
	render: (args) => (
		<Row>
			<Group label="tr (fixed)">
				<Table.Row { ...args }><Table.Cell>tr row</Table.Cell></Table.Row>
			</Group>
		</Row>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			asTr = canvas.getByText('tr row').closest(ROOT_SELECTOR) as HTMLElement

		await expect(asTr.tagName).toBe('TR')
	},
}

// `unstyled` does NOT remove `Table.Row`'s semantic base class
// (`inkq-table-row`) — per `getClassName.tsx` the base class is now ALWAYS
// emitted. It only suppresses the CSS-module-hashed class normally appended
// alongside it. `Table.Row` makes exactly one `styles(...)` call (`root`), so
// the root element is the only one to check here.
export const Unstyled: Story = {
	parameters: { controls: { exclude: ['unstyled'] } },
	render: (args) => (
		<Row>
			{ ([true, false] as const).map(unstyled => (
				<Group key={ String(unstyled) } label={ String(unstyled) }>
					<Table.Row { ...args } unstyled={ unstyled }>
						<Table.Cell>{ `unstyled=${unstyled}` }</Table.Cell>
					</Table.Row>
				</Group>
			)) }
		</Row>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			unstyledRoot = canvas.getByText('unstyled=true').closest(ROOT_SELECTOR) as HTMLElement,
			styledRoot = canvas.getByText('unstyled=false').closest(ROOT_SELECTOR) as HTMLElement

		// Detect the REAL compiled CSS-module hash, keyed off the actual
		// `Table.module.scss` export map (`Table.Row` shares that stylesheet
		// with `Table`/`Table.Cell`) — not a naive "any extra class"
		// heuristic, which can't distinguish a module hash from an unrelated
		// config/global modifier class.
		const hasModuleClass = (el: Element, base: string) => {
			const moduleClass = (moduleClasses as Record<string, string>)[base]
			return !!moduleClass && el.classList.contains(moduleClass)
		}

		await expect(styledRoot).toHaveClass('inkq-table-row')
		await expect(unstyledRoot).toHaveClass('inkq-table-row')
		expect(hasModuleClass(styledRoot, 'inkq-table-row')).toBe(true)
		expect(hasModuleClass(unstyledRoot, 'inkq-table-row')).toBe(false)
	},
}

/**
 * A `Table.Row` with a single `Table.Cell` vs. several — `Table.Row` renders
 * `children` completely as-is, with no minimum/maximum cell count enforced.
 */
export const CellCounts: Story = {
	parameters: { layout: 'padded' },
	render: (args) => (
		<Row>
			<Group label="single cell">
				<Table.Row { ...args }>
					<Table.Cell>Only cell</Table.Cell>
				</Table.Row>
			</Group>
			<Group label="several cells">
				<Table.Row { ...args }>
					<Table.Cell>Cell 1</Table.Cell>
					<Table.Cell>Cell 2</Table.Cell>
					<Table.Cell>Cell 3</Table.Cell>
				</Table.Row>
			</Group>
		</Row>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			singleRoot = canvas.getByText('Only cell').closest(ROOT_SELECTOR) as HTMLElement,
			severalRoot = canvas.getByText('Cell 1').closest(ROOT_SELECTOR) as HTMLElement

		await expect(singleRoot.querySelectorAll('td')).toHaveLength(1)
		await expect(severalRoot.querySelectorAll('td')).toHaveLength(3)
	},
}

/**
 * `Table.Row` doesn't read any context — unlike e.g. `Group.Item`'s required
 * `useGroupCtx`, `TableRow.tsx` calls only `useProps`/`useStyles` — so it
 * renders standalone without throwing, even outside a `<Table>`. Mounted here
 * inside the minimal valid ancestor chain a bare `<tr>` needs
 * (`<table><tbody>...`) rather than inside a real `<Table>`, so the markup
 * stays valid for the real headless-Chromium browser this test runs in.
 */
export const StandaloneRow: Story = {
	render: (args) => (
		<table>
			<tbody>
				<Table.Row { ...args }><Table.Cell>Standalone row</Table.Cell></Table.Row>
			</tbody>
		</table>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			root = canvas.getByText('Standalone row').closest(ROOT_SELECTOR) as HTMLElement

		await expect(root).toBeInTheDocument()
		await expect(root.tagName).toBe('TR')
	},
}
