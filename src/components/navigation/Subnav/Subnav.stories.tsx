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
		<span style={ { font: 'var(--inkq-text-control)', letterSpacing: '.15em', textTransform: 'uppercase', opacity: 0.6 } }>
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
	// omitted, the root and the inner wrapper can share identical text with the
	// label, so an unscoped query would be ambiguous.
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
	title: 'Navigation/Subnav',
	// Full-bleed bar: centering it in the canvas misrepresents the layout, so
	// every story overrides the global `layout: 'centered'` default.
	parameters: { layout: 'padded' },
	argTypes: {
		routes: {
			control: 'multi-select',
			options: Object.values(NAV_ROUTES),
			description: 'Required (unlike `Navbar`, where it is optional). Handed to `filterNavigation(NAVIGATION_DATA, routes)`. There is no separate `label` prop — the visible label (`inkq-subnav__label`) is derived straight from the FIRST filtered item\'s own `label` (`navItems[0].label`), so it is entirely data-driven. When `routes` matches nothing, `filterNavigation` returns `[]` and `Subnav` guards its whole inner block (label AND `<Menu>`) with `!!navItems.length` — neither renders.',
		},
		unstyled: {
			control: 'boolean',
			description: 'Part of `PolymorphicProps` (via the shared `SpecsContract`), not `Subnav`\'s own `SubnavProps`. The semantic base classes (`inkq-subnav`, `inkq-subnav__inner`, `inkq-subnav__label`, `inkq-subnav__menu`) are ALWAYS emitted regardless — `unstyled` only suppresses the CSS-module-hashed class normally appended alongside each.',
		},
	},
	args: {
		...getDefaultProps<Subnav.Props>('Subnav'),
		routes: COMMUNITY_ROUTES,
	},
}

export default meta

/**
 * The app shell's real configuration. `filterNavigation` keeps only the
 * `Community` item (its three in-list children survive as its `menu`), so
 * `navItems[0]` IS that `Community` item — its own `label` ("Community") is
 * what `Subnav` renders as the visible label. `Subnav` hardcodes
 * `hasDropdowns={ false }` on its `<Menu>`, so `MenuItem` takes its
 * flattening branch: the `Community` parent is never itself a menu item, its
 * children are hoisted into the menubar directly, and no dropdown trigger is
 * rendered.
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

		// The label is derived from `navItems[0].label`, rendered as text, not
		// as a menu item.
		await expect(canvas.getByText('Community', { selector: LABEL_SELECTOR }))
			.toBeInTheDocument()
		await expect(canvas.queryByRole('menuitem', { name: 'Community' })).not.toBeInTheDocument()

		// Third-level entries (e.g. `Events` → `Your Lineup`) are not recursed
		// into by the flattening branch, and were filtered out by `routes` anyway.
		await expect(canvas.queryByText('Your Lineup')).not.toBeInTheDocument()
	},
}

/**
 * Edge case: `routes` that match nothing. `filterNavigation` returns `[]`, and
 * `Subnav` guards its entire inner block — the label span AND the `<Menu>` —
 * with a single `!!navItems.length` (`Subnav.tsx`, lines 36–48). Since there
 * is no separate `label` prop anymore (it's derived from `navItems[0].label`),
 * an empty `navItems` means NEITHER renders: the root mounts with an empty
 * inner wrapper.
 *
 * `/settings` is a deliberate choice: it exists in `NAV_ROUTES`, but only as a
 * child of the route-less `User` item, which `filterNavigation` drops outright
 * (it keys off `item.route` before ever recursing into `item.menu`).
 */
export const NoMatchingRoutes: Story = {
	args: { routes: [NAV_ROUTES.SETTINGS] },
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)

		await expect(canvas.queryByRole('menubar')).not.toBeInTheDocument()
		await expect(canvas.queryAllByRole('menuitem')).toHaveLength(0)
		await expect(canvasElement.querySelector(LABEL_SELECTOR)).not.toBeInTheDocument()

		const root = canvasElement.querySelector(ROOT_SELECTOR)
		await expect(root).toBeInTheDocument()
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
