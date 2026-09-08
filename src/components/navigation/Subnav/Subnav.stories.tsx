import { expect, within } from 'storybook/test'
import { getDefaultProps } from '@/lib/registries'
import { NAV_ROUTES } from '@/utils/navigation'
import { Subnav } from './Subnav'
import type { ReactNode } from 'react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const Row = ({ children }: { children: ReactNode }) => (
	<div style={ { display: 'flex', flexDirection: 'column', gap: 32 } }>
		{ children }
	</div>
)

const Group = ({ label, children }: { label: string, children: ReactNode }) => (
	<div style={ { display: 'flex', flexDirection: 'column', gap: 8 } }>
		<span style={ { font: 'var(--inkq-font-control)', letterSpacing: '.15em', textTransform: 'uppercase', opacity: 0.6 } }>
			{ label }
		</span>
		<div>{ children }</div>
	</div>
)

// `Subnav` renders its root class unconditionally (`getClassName` always pushes
// the kebab-cased, prefixed base class onto the root element's `className`), so
// this is the stable selector used to walk from the rendered label back up to
// the polymorphic root element.
const ROOT_SELECTOR = '.inkq-subnav',
	// Needed because `getByText` matches on `textContent`: when the menu is
	// omitted, the root, the inner wrapper AND the label all have identical
	// text, so an unscoped query would match three elements.
	LABEL_SELECTOR = '.inkq-subnav__label'

// The `routes` allow-list the app shell (`src/app/layout.tsx`) passes.
const COMMUNITY_ROUTES = [
	NAV_ROUTES.COMMUNITY,
	NAV_ROUTES.COMMUNITY_FEED,
	NAV_ROUTES.COMMUNITY_EVENTS,
	NAV_ROUTES.COMMUNITY_SPOTLIGHTS,
]

// `Subnav.Props` (the `declare namespace` export) is just the raw `SubnavProps`
// interface — it doesn't include `as`/`unstyled`/`attributes`/etc., which only
// exist on the actual accepted prop type, `PolymorphicProps<SubnavProps, C>`.
// `Parameters<typeof Subnav>[0]` reads that real, wrapped type straight off the
// component itself — the generic call signature's default `C` resolves to
// `'div'` here, since `SubnavSpecs`'s `default.component` is `'div'`.
type SubnavStoryProps = Parameters<typeof Subnav>[0]
type Story = StoryObj<SubnavStoryProps>

const meta: Meta<SubnavStoryProps> = {
	component: Subnav,
	title: 'Layout/Subnav',
	// Full-bleed bar: centering it in the canvas misrepresents the layout, so
	// every story overrides the global `layout: 'centered'` default.
	parameters: { layout: 'padded' },
	argTypes: {
		label: {
			control: 'text',
			description: 'Required. Rendered as plain text in `inkq-subnav__label`; it is NOT a link and carries no ARIA role.',
		},
		routes: {
			control: 'multi-select',
			options: Object.values(NAV_ROUTES),
			description: 'Required here (unlike `Navbar`, where it is optional). Handed to `filterNavigation(NAVIGATION_DATA, routes)`; an empty array means "no filtering" and renders the entire nav tree, while a non-matching list yields `[]` and the `<Menu>` is skipped entirely.',
		},
		unstyled: {
			control: 'boolean',
			description: 'Part of `PolymorphicProps` (via the shared `SpecsContract`), not `Subnav`\'s own `SubnavProps`. The semantic base classes (`inkq-subnav`, `inkq-subnav__inner`, `inkq-subnav__label`, `inkq-subnav__menu`) are ALWAYS emitted regardless — `unstyled` only suppresses the CSS-module-hashed class normally appended alongside each.',
		},
	},
	args: {
		...getDefaultProps<Subnav.Props>('Subnav'),
		label: 'Community',
		routes: COMMUNITY_ROUTES,
	},
}

export default meta

/**
 * The app shell's real configuration. `filterNavigation` keeps only the
 * `Community` item (its three in-list children survive as its `menu`), and
 * `Subnav` hardcodes `hasDropdowns={ false }` on its `<Menu>` — so `MenuItem`
 * takes its flattening branch: the `Community` parent label never becomes a
 * menu item, its children are hoisted into the menubar directly, and no
 * dropdown trigger is rendered.
 *
 * Note the menu `<ul>` is NOT `.inkq-menu` here: `Subnav` passes
 * `{ ...styles('menu') }` to `<Menu>`, and `Menu` spreads `{ ...rest }` AFTER
 * its own `{ ...styles('root') }`, so the parent's `classNames` replaces
 * `Menu`'s own base class instead of merging with it.
 */
export const Default: Story = {
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			menubar = canvas.getByRole('menubar'),
			items = within(menubar).getAllByRole('menuitem')

		// Always the flattened form.
		await expect(items.map(item => item.textContent)).toEqual([
			'Events', 'Feed', 'Spotlights',
		])
		await expect(within(menubar).queryAllByRole('button')).toHaveLength(0)

		// The label is rendered as text, not as a menu item.
		await expect(canvas.getByText('Community', { selector: LABEL_SELECTOR }))
			.toBeInTheDocument()
		await expect(canvas.queryByRole('menuitem', { name: 'Community' })).not.toBeInTheDocument()

		// Third-level entries (e.g. `Events` → `Your Lineup`) are not recursed
		// into by the flattening branch, and were filtered out by `routes` anyway.
		await expect(canvas.queryByText('Your Lineup')).not.toBeInTheDocument()
	},
}

export const LongLabel: Story = {
	args: {
		label: 'An unusually long subnav label that has to share one grid row with the whole menu',
	},
}

/**
 * Edge case: `routes` that match nothing. `filterNavigation` returns `[]`, and
 * `Subnav` guards the menu with `!!navItems.length`, so only the label renders.
 *
 * `/settings` is a deliberate choice: it exists in `NAV_ROUTES`, but only as a
 * child of the route-less `User` item, which `filterNavigation` drops outright
 * (it keys off `item.route` before ever recursing into `item.menu`).
 */
export const NoMatchingRoutes: Story = {
	args: {
		label: 'Settings',
		routes: [NAV_ROUTES.SETTINGS],
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)

		await expect(canvas.getByText('Settings', { selector: LABEL_SELECTOR }))
			.toBeInTheDocument()
		await expect(canvas.queryByRole('menubar')).not.toBeInTheDocument()
		await expect(canvas.queryAllByRole('menuitem')).toHaveLength(0)
	},
}

/**
 * Unlike `Navbar` (which destructures `as` and then hardcodes `as="nav"`),
 * `Subnav` forwards `as` to its root `<Box>`, so the rendered tag genuinely
 * changes.
 */
export const AsElement: Story = {
	render: (args) => (
		<Row>
			<Group label='as="div" (default)'>
				<Subnav { ...args } />
			</Group>
			<Group label='as="section"'>
				<Subnav { ...args } as="section" />
			</Group>
			<Group label='as="header"'>
				<Subnav { ...args } as="header" />
			</Group>
		</Row>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			labels = canvas.getAllByText('Community', { selector: LABEL_SELECTOR })

		await expect(labels).toHaveLength(3)

		const [asDiv, asSection, asHeader] = labels.map(
			label => label.closest(ROOT_SELECTOR) as HTMLElement
		)

		await expect(asDiv.tagName).toBe('DIV')
		await expect(asSection.tagName).toBe('SECTION')
		await expect(asHeader.tagName).toBe('HEADER')
	},
}
