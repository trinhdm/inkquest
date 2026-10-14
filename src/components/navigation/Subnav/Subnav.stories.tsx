import { expect, within } from 'storybook/test'
import { getDefaultProps } from '@/hooks/useProps'
import { NavRoutes, type NavRoute } from '@/utils/navigation'
import { Subnav } from './Subnav'
import type { ReactNode } from 'react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import moduleClasses from './Subnav.module.scss'

const BOOLEAN_OPTIONS = [true, false] as const

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

// An explicit 4-route `/community` allow-list. The app shell does NOT pass this:
// `src/app/community/layout.tsx` passes `routes: ['/community']` (the 4-route list is
// only a comment there). Because `Subnav` uses the `'breadcrumbs'` layout, both lists
// render the same result — see `Default`.
const COMMUNITY_ROUTES = [
	NavRoutes.COMMUNITY,
	NavRoutes.COMMUNITY_FEED,
	NavRoutes.COMMUNITY_EVENTS,
	NavRoutes.COMMUNITY_SPOTLIGHTS,
]

// A route that appears NOWHERE in `NAVIGATION_DATA` — unlike every real `NavRoute`
// (all of them are used somewhere in the tree, several only as a child of a
// route-less parent like `User`, which still surfaces via `filterNavigation`'s
// flattening branch; see the `NoMatchingRoutes` story below), this one guarantees a
// genuinely empty filtered result. Cast because `NavRoute` is a closed union of the
// real app routes.
const UNMATCHED_ROUTE = '/does-not-exist' as NavRoute

// `Subnav.Props` (the `declare namespace` export) is just the raw `SubnavProps`
// interface — it doesn't include `as`/`unstyled`/`attributes`/etc., which only
// exist on the actual accepted prop type, `PolymorphicProps<SubnavProps, C>`.
// `Parameters<typeof Subnav>[0]` reads that real, wrapped type straight off the
// component itself. It fills `C` with its constraint (`ElementType`), not the
// default `'div'`, so `as` is any `ElementType` here.
type SubnavStoryProps = Parameters<typeof Subnav>[0]
type Story = StoryObj<SubnavStoryProps>

const meta: Meta<SubnavStoryProps> = {
	component: Subnav,
	title: 'Navigation/Subnav',
	// Full-bleed bar: centering it in the canvas misrepresents the layout, so
	// every story overrides the global `layout: 'centered'` default.
	parameters: { layout: 'padded' },
	argTypes: {
		category: {
			control: 'text',
			description: 'Optional (`SubnavProps` extends `NavigationGroup`). Overrides the visible label: `Subnav.tsx` renders `category ?? navitems[0].label`. See the `Category` story.',
		},
		routes: {
			control: 'multi-select',
			options: Object.values(NavRoutes),
			description: 'Required (unlike `Navbar`, where it is optional). Handed to `filterNavigation(routes, \'breadcrumbs\')`. The visible label (`inkq-subnav__label`) is `category ?? navitems[0].label` — the `category` prop when given, otherwise the FIRST filtered item\'s own `label`. When `routes` matches nothing, `filterNavigation` returns `[]` and `Subnav` returns `null` (`if (!navitems.length) return null`) — nothing renders, root element included (see `NoMatchingRoutes`).',
		},
		unstyled: {
			control: 'boolean',
			description: 'Comes from `FactoryContract` (via `_PolymorphicContract`), not `Subnav`\'s own `SubnavProps`. The semantic classes (`inkq-subnav`, `inkq-subnav__inner`, `inkq-subnav__label`, `inkq-subnav__menu`) are still emitted regardless; for the plain `styles(selector)` calls (no config) `unstyled` drops the CSS-module-hashed class normally appended alongside each (`Subnav` defines no tokens, so there are none to drop). Via `others` it reaches the root `<Box>`, where it would drop non-state `data-*` attributes (`Subnav` sets none); it is not forwarded to the nested `Menu`. The `wrapper` selector\'s `styles(\'wrapper\', true)` boolean-shorthand config is different: `getConfigClasses` now checks `check.isUnstyled` FIRST, before the boolean-shorthand branch, so its literal `inkq-wrapper` class is ALSO suppressed entirely when `unstyled`, not just the (non-existent, for `wrapper`) module hash. See the `Unstyled` story.',
		},
	},
	args: {
		...getDefaultProps<Subnav.Props>('Subnav'),
		routes: COMMUNITY_ROUTES,
	},
}

export default meta

/**
 * An explicit 4-route `/community` configuration (the app's own
 * `src/app/community/layout.tsx` passes just `['/community']`; the result here is the
 * same). In `'breadcrumbs'` layout `filterNavigation` keeps the matched `Community`
 * item with its ORIGINAL `menu` (only the `'dropdown'` layout replaces it with the
 * filtered one), so `navitems[0]` IS that `Community` item — its own `label`
 * ("Community") is what `Subnav` renders as the visible label. `Subnav` hardcodes
 * `hasDropdowns={ false }` on its `<Menu>`, so `MenuItem` takes its
 * flattening branch: the `Community` parent is never itself a menu item, its
 * children are hoisted into the menubar directly, and no dropdown trigger is
 * rendered.
 *
 * Note: `Subnav` passes `{ ...styles('menu') }` (a `className`/`style` pair)
 * to `<Menu>`. `Menu.tsx` destructures `className` out of its own props
 * (so it isn't spread onto the root through `others`), but hands its full props to
 * `useStyles`, so the root `<ul>`'s own `inkq-menu` class is replaced by
 * `inkq-subnav__menu`. `className` is also forwarded as the `className` prop
 * of every top-level `MenuItem`, which `getClassName.tsx`'s `inheritClasses`
 * logic uses to rename each item's own root class from `inkq-menu-item` to
 * `inkq-subnav__menu-item` (since `'menu-item'.startsWith('menu')`).
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

		// The label is derived from `navitems[0].label`, rendered as text, not
		// as a menu item.
		await expect(canvas.getByText('Community', { selector: LABEL_SELECTOR }))
			.toBeInTheDocument()
		await expect(canvas.queryByRole('menuitem', { name: 'Community' })).not.toBeInTheDocument()

		// Third-level entries (e.g. `Events` → `Your Lineup`) are absent because
		// `MenuItem`'s flattening branch doesn't recurse into the children it hoists.
		await expect(canvas.queryByText('Your Lineup')).not.toBeInTheDocument()
	},
}

/**
 * Edge case: `routes` that match NOTHING anywhere in `NAVIGATION_DATA`.
 * `filterNavigation` returns `[]` (`Subnav` even short-circuits to `return null`
 * before rendering ANYTHING — root included — via its own `if (!navitems.length)
 * return null` guard, unlike `Navbar`'s narrower per-column guard).
 *
 * `NavRoutes.SETTINGS` (`/settings`) is deliberately NOT used here even though it
 * "matches nothing" at the top level: it's a real child of the route-less `User` item,
 * and `filterNavigation`'s recursive `filterNavitems` FLATTENS a route-less parent's
 * own matching children to the top level whenever `submenu` is non-empty (`else if
 * (submenu) list.push(...submenu)`) — so `routes: [SETTINGS]` actually renders a
 * `Settings` item, not nothing. Every real `NavRoute` is used somewhere in the tree
 * this same way, so a genuinely unmatched fixture needs a route that isn't a
 * `NavRoute` at all (`UNMATCHED_ROUTE`).
 */
export const NoMatchingRoutes: Story = {
	args: { routes: [UNMATCHED_ROUTE] },
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)

		await expect(canvas.queryByRole('menubar')).not.toBeInTheDocument()
		await expect(canvas.queryAllByRole('menuitem')).toHaveLength(0)
		await expect(canvasElement.querySelector(LABEL_SELECTOR)).not.toBeInTheDocument()

		// `Subnav` returns `null` OUTRIGHT when `navitems` is empty — root included —
		// so nothing at all is in the canvas, not even an empty root element.
		await expect(canvasElement.querySelector(ROOT_SELECTOR)).toBeNull()
		await expect(canvasElement).toBeEmptyDOMElement()
	},
}

/**
 * `Subnav.tsx` renders `category ?? navitems[0].label`: a provided `category`
 * replaces the label, and without one the first filtered item's own label
 * (`Community`) is used. The menu is the same in both groups.
 */
export const Category: Story = {
	parameters: { controls: { exclude: ['category'] } },
	render: (args) => (
		<Row>
			<Group label="category: set">
				<Subnav { ...args } category="Explore" />
			</Group>
			<Group label="category: undefined">
				<Subnav { ...args } category={ undefined } />
			</Group>
		</Row>
	),
	play: async ({ canvasElement }) => {
		const roots = Array.from(canvasElement.querySelectorAll(ROOT_SELECTOR)) as HTMLElement[]
		await expect(roots).toHaveLength(2)

		const [withCategory, withoutCategory] = roots

		await expect(within(withCategory).getByText('Explore', { selector: LABEL_SELECTOR })).toBeInTheDocument()
		await expect(within(withCategory).queryByText('Community', { selector: LABEL_SELECTOR })).not.toBeInTheDocument()

		await expect(within(withoutCategory).getByText('Community', { selector: LABEL_SELECTOR })).toBeInTheDocument()

		for (const root of roots)
			await expect(within(root).getAllByRole('menuitem')).toHaveLength(3)
	},
}

/**
 * Like `Navbar`, `Subnav` destructures `as` and passes it to its root `<Box>`
 * (`as={ as }`), so the rendered tag genuinely changes.
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

/**
 * `unstyled` never removes the semantic base classes (`inkq-subnav`,
 * `inkq-subnav__inner`, `inkq-subnav__label`) — they lose their CSS-module
 * hash, since each has a plain (config-less) SCSS declaration. `Subnav`'s
 * `styles('wrapper', true)` boolean-config call behaves differently again: `&__wrapper`
 * has no SCSS rule at all (no hash ever), and `getConfigClasses` in `getClassName.tsx`
 * now checks `check.isUnstyled` FIRST, before the boolean-shorthand branch, so the
 * boolean-config's own literal `inkq-wrapper` class is suppressed entirely when
 * `unstyled`, same as every other config class.
 */
export const Unstyled: Story = {
	parameters: { controls: { exclude: ['unstyled'] } },
	render: (args) => (
		<Row>
			{ BOOLEAN_OPTIONS.map(unstyled => (
				<Group key={ String(unstyled) } label={ String(unstyled) }>
					<Subnav { ...args } unstyled={ unstyled } />
				</Group>
			)) }
		</Row>
	),
	play: async ({ canvasElement }) => {
		const roots = Array.from(canvasElement.querySelectorAll(ROOT_SELECTOR)) as HTMLElement[]
		await expect(roots).toHaveLength(2)

		const [unstyledRoot, styledRoot] = roots

		const hasModuleClass = (el: Element, base: string) => {
			const moduleClass = (moduleClasses as Record<string, string>)[base]
			return !!moduleClass && el.classList.contains(moduleClass)
		}

		await expect(styledRoot).toHaveClass('inkq-subnav')
		await expect(unstyledRoot).toHaveClass('inkq-subnav')
		expect(hasModuleClass(styledRoot, 'inkq-subnav')).toBe(true)
		expect(hasModuleClass(unstyledRoot, 'inkq-subnav')).toBe(false)

		const styledWrapper = styledRoot.querySelector('.inkq-subnav__wrapper') as HTMLElement,
			unstyledWrapper = unstyledRoot.querySelector('.inkq-subnav__wrapper') as HTMLElement

		await expect(styledWrapper).toHaveClass('inkq-subnav__wrapper', 'inkq-wrapper')
		await expect(unstyledWrapper).toHaveClass('inkq-subnav__wrapper')
		await expect(unstyledWrapper).not.toHaveClass('inkq-wrapper')
		expect(hasModuleClass(styledWrapper, 'inkq-subnav__wrapper')).toBe(false)
		expect(hasModuleClass(unstyledWrapper, 'inkq-subnav__wrapper')).toBe(false)

		const styledInner = styledWrapper.querySelector('.inkq-subnav__inner') as HTMLElement,
			unstyledInner = unstyledWrapper.querySelector('.inkq-subnav__inner') as HTMLElement

		await expect(styledInner).toHaveClass('inkq-subnav__inner')
		await expect(unstyledInner).toHaveClass('inkq-subnav__inner')
		expect(hasModuleClass(styledInner, 'inkq-subnav__inner')).toBe(true)
		expect(hasModuleClass(unstyledInner, 'inkq-subnav__inner')).toBe(false)

		const styledLabel = styledRoot.querySelector('.inkq-subnav__label') as HTMLElement,
			unstyledLabel = unstyledRoot.querySelector('.inkq-subnav__label') as HTMLElement

		await expect(styledLabel).toHaveClass('inkq-subnav__label')
		await expect(unstyledLabel).toHaveClass('inkq-subnav__label')
		expect(hasModuleClass(styledLabel, 'inkq-subnav__label')).toBe(true)
		expect(hasModuleClass(unstyledLabel, 'inkq-subnav__label')).toBe(false)
	},
}
