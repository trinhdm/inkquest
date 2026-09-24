import { expect, within } from 'storybook/test'
import { getDefaultProps } from '@/hooks/useProps'
import { Table } from './Table'
import type { ReactNode } from 'react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import moduleClasses from './Table.module.scss'

// `Table` has no enum-valued or boolean props of its own — just `children`
// (plus the polymorphic `as`/Box escape hatches) — so there is nothing to
// move into a shared `options.story.ts`.

const Row = ({ children }: { children: ReactNode }) => (
	<div style={ { display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'flex-start' } }>
		{ children }
	</div>
)

const Group = ({ label, children }: { label: string, children: ReactNode }) => (
	<div style={ { display: 'flex', flexDirection: 'column', gap: 8 } }>
		<span style={ { font: 'var(--inkq-text-control)', letterSpacing: '.15em', textTransform: 'uppercase', opacity: 0.6 } }>
			{ label }
		</span>
		{ children }
	</div>
)

// `Table`'s own semantic base class (`inkq-table`, always emitted by
// `getClassName` regardless of `unstyled`) is the stable selector used to walk
// from rendered cell text back up to the actual polymorphic root element.
// `Table.module.scss`'s `.inkq-table` rule has direct declarations
// (`display: flex; flex-direction: column;`), so it DOES get a real
// CSS-module hash — see the `Unstyled` story.
const ROOT_SELECTOR = '.inkq-table'

// `Table.Props` (the `declare namespace` export) is just the raw `TableProps`
// interface — it doesn't include `as`/`unstyled`/`attributes`/etc., which only
// exist on the actual accepted prop type, `PolymorphicProps<TableProps, C>`.
// `Parameters<typeof Table>[0]` reads that real, wrapped type straight off the
// component itself — the generic call signature's default `C` resolves to
// `'table'` here, since `TableSpecs`'s `defaults.as` is `'table'` (`Table.tsx`'s
// local `TAG` constant), and `Table.setDefaults({ props: DEFAULT_PROPS })`
// (where `DEFAULT_PROPS = { as: TAG }`) registers that same `'table'` as the
// actual runtime default — so `meta.args` (via `getDefaultProps`) already
// carries `as: 'table'` before any story overrides it. See the `AsElement`
// story.
type TableStoryProps = Parameters<typeof Table>[0]
type Story = StoryObj<TableStoryProps>

const meta: Meta<TableStoryProps> = {
	component: Table,
	title: 'Data/Table',
	argTypes: {
		as: {
			control: 'text',
			description: '`Table` is polymorphic — `TableSpecs`\'s `defaults.as` is `\'table\'` (`Table.tsx`\'s local `TAG`), so `IsPolymorphic<S>` resolves `true` and `as` accepts any element type, registered via `Table.setDefaults({ props: DEFAULT_PROPS })`. Overriding it away from `\'table\'` still renders the same hardcoded `<tbody>` wrapper underneath — invalid table markup, but a deliberate, documented quirk (see `Table.test.tsx`). See the `AsElement` story.',
		},
		children: {
			control: false,
			description: 'Rendered as the single child of a hardcoded `<tbody>` — `Table.tsx` always renders `<Box as={as} {...styles(\'root\')}><tbody>{children}</tbody></Box>`, regardless of `as`. Pass `Table.Row` elements here. See the `TbodyWrapping` story for the resulting DOM shape.',
		},
		unstyled: {
			control: 'boolean',
			description: 'Part of `PolymorphicProps` (via the shared `SpecsContract`), not `Table`\'s own `TableProps`. The semantic base class (`inkq-table`) is ALWAYS emitted regardless of this prop — `unstyled` only suppresses the CSS-module-hashed class normally appended alongside it. See the `Unstyled` story.',
		},
	},
	args: {
		...getDefaultProps<Table.Props>('Table'),
	},
}

export default meta

/**
 * A realistic composed table: `Table` > `Table.Row` > `Table.Cell`.
 */
export const Default: Story = {
	args: {
		children: (
			<>
				<Table.Row>
					<Table.Cell>Row 1, Cell A</Table.Cell>
					<Table.Cell>Row 1, Cell B</Table.Cell>
				</Table.Row>
				<Table.Row>
					<Table.Cell>Row 2, Cell A</Table.Cell>
					<Table.Cell>Row 2, Cell B</Table.Cell>
				</Table.Row>
			</>
		),
	},
	parameters: { layout: 'padded' },
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			root = canvas.getByText('Row 1, Cell A').closest(ROOT_SELECTOR) as HTMLElement

		await expect(root).toBeInTheDocument()
		await expect(root.tagName).toBe('TABLE')
		await expect(root.querySelectorAll('tr')).toHaveLength(2)
		await expect(root.querySelectorAll('td')).toHaveLength(4)
	},
}

/**
 * `Table` is polymorphic: `TableSpecs`'s `defaults.as` is `'table'`
 * (`Table.tsx`'s local `TAG`), registered as the actual runtime default via
 * `Table.setDefaults({ props: DEFAULT_PROPS })`. `as` can be overridden to
 * render a different tag — mirrors `Table.test.tsx`'s own
 * `as="section"` coverage, using plain text content (not `Table.Row`/
 * `Table.Cell`) since `Table.tsx` ALWAYS wraps `children` in a literal
 * `<tbody>` regardless of `as`; overriding away from `table` therefore nests a
 * `<tbody>` outside a `<table>`, which is invalid table markup (an expected,
 * documented quirk — `Table.test.tsx` calls it out explicitly — not something
 * this story needs `Table.Row`/`Table.Cell` children to demonstrate).
 */
export const AsElement: Story = {
	parameters: { layout: 'padded' },
	render: (args) => (
		<Row>
			<Group label='as="table" (default)'>
				<Table { ...args as TableStoryProps }>table content</Table>
			</Group>
			<Group label='as="section"'>
				<Table { ...args as TableStoryProps } as="section">section content</Table>
			</Group>
		</Row>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			asTable = canvas.getByText('table content').closest(ROOT_SELECTOR) as HTMLElement,
			asSection = canvas.getByText('section content').closest(ROOT_SELECTOR) as HTMLElement

		// `meta.args` already carries the REGISTERED default (`as: 'table'`, via
		// `getDefaultProps`/`Table.setDefaults`) — leaving `as` unset here
		// renders `table`, not any other tag.
		await expect(asTable.tagName).toBe('TABLE')
		await expect(asSection.tagName).toBe('SECTION')
	},
}

/**
 * `Table.tsx` always wraps `children` in a hardcoded, literal `<tbody>` —
 * regardless of how many `Table.Row`s are passed, or whether `as` is
 * overridden — pinning that DOM shape directly (`Table.test.tsx` asserts the
 * same thing).
 */
export const TbodyWrapping: Story = {
	args: {
		children: <Table.Row><Table.Cell>Cell</Table.Cell></Table.Row>,
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			root = canvas.getByText('Cell').closest(ROOT_SELECTOR) as HTMLElement

		await expect(root.tagName).toBe('TABLE')
		await expect(root.querySelector(':scope > tbody')).toBeInTheDocument()
	},
}

// `unstyled` does NOT remove `Table`'s semantic base class (`inkq-table`) —
// per `getClassName.tsx` the base class is now ALWAYS emitted. It only
// suppresses the CSS-module-hashed class normally appended alongside it.
// `Table` makes exactly one `styles(...)` call (`root`), so the root element
// is the only one to check here.
export const Unstyled: Story = {
	parameters: {
		layout: 'padded',
		controls: { exclude: ['unstyled'] },
	},
	render: (args) => (
		<Row>
			{ ([true, false] as const).map(unstyled => (
				<Group key={ String(unstyled) } label={ String(unstyled) }>
					<Table { ...args as TableStoryProps } unstyled={ unstyled }>
						<Table.Row><Table.Cell>{ `unstyled=${unstyled}` }</Table.Cell></Table.Row>
					</Table>
				</Group>
			)) }
		</Row>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			unstyledRoot = canvas.getByText('unstyled=true').closest(ROOT_SELECTOR) as HTMLElement,
			styledRoot = canvas.getByText('unstyled=false').closest(ROOT_SELECTOR) as HTMLElement

		// Detect the REAL compiled CSS-module hash, keyed off the actual
		// `Table.module.scss` export map — not a naive "any extra class"
		// heuristic, which can't distinguish a module hash from an unrelated
		// config/global modifier class.
		const hasModuleClass = (el: Element, base: string) => {
			const moduleClass = (moduleClasses as Record<string, string>)[base]
			return !!moduleClass && el.classList.contains(moduleClass)
		}

		await expect(styledRoot).toHaveClass('inkq-table')
		await expect(unstyledRoot).toHaveClass('inkq-table')
		expect(hasModuleClass(styledRoot, 'inkq-table')).toBe(true)
		expect(hasModuleClass(unstyledRoot, 'inkq-table')).toBe(false)
	},
}
