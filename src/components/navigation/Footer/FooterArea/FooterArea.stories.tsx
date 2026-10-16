import { expect, within } from 'storybook/test'
import { getDefaultProps } from '@/hooks/useProps'
import { Footer } from '../Footer'
import type { ReactNode } from 'react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import moduleClasses from '../Footer.module.scss'

// `Footer.Area = FooterArea` is attached in `Footer.tsx`, and `Footer`'s own
// `declare namespace` block re-exports the nested `Area` namespace
// (`export namespace Area { export type Props = FooterArea.Props; ... }`), so this
// file references it exclusively through the parent — never importing `./FooterArea`
// directly — matching `Button.Group`/`Accordion.Title`-style subcomponents elsewhere.
const BOOLEAN_OPTIONS = [true, false] as const

const Row = ({ children }: { children: ReactNode }) => (
	<div style={ { display: 'flex', gap: 48, flexWrap: 'wrap', alignItems: 'flex-start' } }>
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

// The route lists below are hand-typed here; only the resulting labels (`About`/
// `Careers` under the route-less `Company` item, `Privacy`/`Terms` under the route-less
// `Legal` item) come from `@/utils/navigation`'s `NAVIGATION_DATA`. `filterNavigation`'s
// non-`'dropdown'` (`'breadcrumbs'`) layout flattens both parents into their matched
// children directly, with no nesting.
const SAMPLE_ITEMS: Footer.Area.Props['items'] = [
	{ category: 'Company', routes: ['/about', '/careers'] },
]

const NO_CATEGORY_ITEMS: Footer.Area.Props['items'] = [
	{ routes: ['/privacy-policy', '/terms'] },
]

// `FooterArea`'s own `useStyles('footer', ...)` call (NOT `'FooterArea'`) intentionally
// shares `Footer`'s class namespace, since it imports `classes` from
// `'../Footer.module.scss'` rather than a module of its own — so its root wrapper is
// `inkq-footer__wrapper`, not `inkq-footer-area__wrapper`.
const WRAPPER_SELECTOR = '.inkq-footer__wrapper'

// `Footer.Area.Props` is just the raw `FooterAreaProps` interface (`{ items:
// readonly FooterNavGroup[] }`) — it has no `defaults.as` (`FooterAreaSpecs` sets
// `isCompound: true` instead), so `Box`'s `as` is hardcoded to `'div'` in
// `FooterArea.tsx` and never exposed as a control. `Parameters<typeof Footer.Area>[0]`
// reads the real, wrapped prop type straight off the component itself (including
// `unstyled`, from `FactoryContract`, plus the other shared polymorphic props), without needing to
// import `FooterArea`'s own file.
type FooterAreaStoryProps = Parameters<typeof Footer.Area>[0]
type Story = StoryObj<FooterAreaStoryProps>

const meta: Meta<FooterAreaStoryProps> = {
	component: Footer.Area,
	title: 'Navigation/Footer/Footer.Area',
	argTypes: {
		children: {
			control: false,
			description: 'Rendered inside a `styles(\'content\')` `<div>` (`.inkq-footer__content`), ABOVE the navigation block. That wrapper is guarded by `!!children` in `FooterArea.tsx`, so with no (or falsy) children the content `<div>` is NOT rendered at all. See the `NoChildren` story.',
		},
		items: {
			control: 'object',
			description: 'Required — a `readonly` list of `{ category?, location?, orientation?, routes }` groups. Each group renders its own `<Menu hasDropdowns={ false }>` populated via `filterNavigation(routes, \'breadcrumbs\')`; a `category` renders a label `<span>` above its group, and an absent `category` renders no label at all. The whole `.inkq-footer__navigation` block is guarded by `!!items.length` — an empty array renders no navigation at all (only `children`). `location`/`orientation` are read by the PARENT `Footer`/passed straight through to the per-group `Menu`, respectively — `FooterArea` itself never inspects `location`. Every per-group `<Menu>` is also hardcoded with `active={ null }` — per `Menu.tsx`\'s own resolution (`typeof active === \'string\' || active === null ? active : (pathname as NavigationItem[\'route\'])`), `null` is passed straight through rather than falling back to `usePathname()`, so NO footer menu item is ever marked active from the current page.',
		},
		unstyled: {
			control: 'boolean',
			description: 'Comes from `FactoryContract` (via `_PolymorphicContract`), not `FooterArea`\'s own props. When set it drops the CSS-module hash and config classes on `FooterArea`\'s own `styles(...)` calls (`FooterArea` defines no tokens, so there are none to drop), and — through `others` on the root `<Box>` — non-state `data-*` attributes (`FooterArea` sets none). The semantic base classes are still emitted (no inherited className replaces them here). `styles(\'wrapper\', true)` is the BOOLEAN-shorthand config form — `getConfigClasses` now checks `check.isUnstyled` FIRST, before the boolean-shorthand branch, so the `inkq-wrapper` class it emits is suppressed entirely when `unstyled`, same as its CSS-module HASH (a separate mechanism, `getStyleClass`). See the `Unstyled` story.',
		},
	},
	args: {
		...getDefaultProps<Footer.Area.Props>('Footer.Area'),
		items: SAMPLE_ITEMS,
		children: <span>Sample children content</span>,
	},
}

export default meta

/**
 * A single categorized group. `children` renders in its own `.inkq-footer__content`
 * block, ABOVE the `.inkq-footer__navigation` block built from `items`.
 */
export const Default: Story = {
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)

		await expect(canvas.getByText('Sample children content')).toBeInTheDocument()
		await expect(canvas.getByText('Company')).toBeInTheDocument()

		const menubar = canvas.getByRole('menubar')
		await expect(within(menubar).getByRole('menuitem', { name: 'About' })).toBeInTheDocument()
		await expect(within(menubar).getByRole('menuitem', { name: 'Careers' })).toBeInTheDocument()
	},
}

/**
 * An item with no `category` renders its `<Menu>` with no label `<span>` above it —
 * demonstrated here side by side with a categorized group for direct comparison.
 */
export const Items: Story = {
	parameters: { layout: 'padded' },
	render: (args) => (
		<Row>
			<Group label="category: 'Company'">
				<Footer.Area { ...args } items={ SAMPLE_ITEMS } />
			</Group>
			<Group label="category: undefined">
				<Footer.Area { ...args } items={ NO_CATEGORY_ITEMS } />
			</Group>
		</Row>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)

		await expect(canvas.getByText('Company')).toBeInTheDocument()
		await expect(canvas.getByRole('menuitem', { name: 'Privacy' })).toBeInTheDocument()
		await expect(canvas.getByRole('menuitem', { name: 'Terms' })).toBeInTheDocument()

		// Both groups render a `<Menu>`, but only the categorized one renders a
		// `.inkq-footer__label` span above it.
		await expect(canvas.getAllByRole('menubar')).toHaveLength(2)
		await expect(canvasElement.querySelectorAll('.inkq-footer__label')).toHaveLength(1)
	},
}

/**
 * Edge case: `items: []`. The entire `.inkq-footer__navigation` block (guarded by
 * `!!items.length`) is skipped — no `<Menu>`, no category label — but `children`
 * still renders in its own `.inkq-footer__content` block, unaffected.
 */
export const EmptyItems: Story = {
	args: { items: [] },
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)

		await expect(canvas.getByText('Sample children content')).toBeInTheDocument()
		await expect(canvas.queryAllByRole('menubar')).toHaveLength(0)
	},
}

/**
 * `FooterArea.tsx` renders the `.inkq-footer__content` wrapper only when
 * `!!children`. Both cases side by side: with children the wrapper holds them; with
 * none the wrapper is absent entirely, while the navigation block (driven by `items`)
 * is unaffected.
 */
export const NoChildren: Story = {
	parameters: {
		layout: 'padded',
		controls: { exclude: ['children'] },
	},
	render: (args) => {
		const { children: _children, ...withoutChildren } = args

		return (
			<Row>
				<Group label="children: set">
					<Footer.Area { ...args } />
				</Group>
				<Group label="children: none">
					<Footer.Area { ...withoutChildren } />
				</Group>
			</Row>
		)
	},
	play: async ({ canvasElement }) => {
		const wrappers = Array.from(canvasElement.querySelectorAll(WRAPPER_SELECTOR)) as HTMLElement[]
		await expect(wrappers).toHaveLength(2)

		const [withChildren, withoutChildren] = wrappers

		const content = withChildren.querySelector('.inkq-footer__content') as HTMLElement
		await expect(content).toBeInTheDocument()
		await expect(within(content).getByText('Sample children content')).toBeInTheDocument()

		await expect(withoutChildren.querySelector('.inkq-footer__content')).toBeNull()
		await expect(within(withoutChildren).queryByText('Sample children content')).not.toBeInTheDocument()

		// Navigation is independent of `children`.
		await expect(within(withChildren).getByRole('menubar')).toBeInTheDocument()
		await expect(within(withoutChildren).getByRole('menubar')).toBeInTheDocument()
	},
}

/**
 * Each item's own `orientation` (default `'vertical'` per `FooterArea.tsx`'s
 * `orientation={ orientation ?? 'vertical' }`) is forwarded straight to that group's
 * `<Menu>`. `'vertical'` has a real SCSS rule (`Menu.module.scss`'s `&--vertical`), so
 * the modifier is emitted as a HASHED CSS-module class (e.g.
 * `_inkq-menu--vertical_gtzaz_6`) rather than the literal `inkq-menu--vertical` token —
 * `getConfigClass`'s `module` branch returns the resolved hash INSTEAD of the literal
 * whenever one exists (`formatConfigClass`'s `styleName ?? baseName`), it doesn't add
 * both. `'horizontal'` has no matching SCSS rule, so `inkq-menu--horizontal` has no
 * hash to substitute and stays a literal class. Because the hash token embeds the full
 * literal name, a substring match is used rather than pinning the compiled hash — see
 * `Menu.stories.tsx`'s own `Orientation` story for the same mechanism in isolation.
 */
export const Orientation: Story = {
	parameters: { layout: 'padded' },
	args: {
		items: [
			{ category: 'Vertical (default)', routes: ['/about', '/careers'] },
			{ category: 'Horizontal', orientation: 'horizontal', routes: ['/privacy-policy', '/terms'] },
		],
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			[verticalMenu, horizontalMenu] = canvas.getAllByRole('menubar')

		const hasClassLike = (el: Element, substring: string) =>
			Array.from(el.classList).some(c => c.includes(substring))

		// Unset orientation falls back to 'vertical'; the explicit 'horizontal' group does not.
		expect(hasClassLike(verticalMenu, 'inkq-menu--vertical')).toBe(true)
		expect(hasClassLike(verticalMenu, 'inkq-menu--horizontal')).toBe(false)
		await expect(horizontalMenu).toHaveClass('inkq-menu--horizontal')
		expect(hasClassLike(horizontalMenu, 'inkq-menu--vertical')).toBe(false)
	},
}

/**
 * `unstyled` never removes the semantic base classes (`inkq-footer__wrapper`,
 * `inkq-footer__content`) — they lose their CSS-module hash (both have
 * plain, config-less SCSS declarations nested under `Footer.module.scss`'s
 * `&__info`/`&__legal` blocks, which still generate a hash for the shared class
 * TOKEN regardless of which ancestor context it's compiled under). The boolean-config
 * `styles('wrapper', true)` call behaves the SAME way now: `getConfigClasses` checks
 * `check.isUnstyled` FIRST, before the boolean-shorthand branch, so the literal
 * `inkq-wrapper` class it emits is ALSO suppressed entirely when unstyled, right
 * alongside the wrapper's own CSS-module hash.
 */
export const Unstyled: Story = {
	parameters: { controls: { exclude: ['unstyled'] } },
	render: (args) => (
		<Row>
			{ BOOLEAN_OPTIONS.map(unstyled => (
				<Group key={ String(unstyled) } label={ String(unstyled) }>
					<Footer.Area { ...args } unstyled={ unstyled } />
				</Group>
			)) }
		</Row>
	),
	play: async ({ canvasElement }) => {
		const wrappers = Array.from(canvasElement.querySelectorAll(WRAPPER_SELECTOR)) as HTMLElement[]
		await expect(wrappers).toHaveLength(2)

		const [unstyledWrapper, styledWrapper] = wrappers

		const hasModuleClass = (el: Element, base: string) => {
			const moduleClass = (moduleClasses as Record<string, string>)[base]
			return !!moduleClass && el.classList.contains(moduleClass)
		}

		// Boolean-shorthand `inkq-wrapper` is now suppressed entirely when
		// unstyled, same as the CSS-module hash for `inkq-footer__wrapper` itself.
		await expect(styledWrapper).toHaveClass('inkq-footer__wrapper', 'inkq-wrapper')
		await expect(unstyledWrapper).toHaveClass('inkq-footer__wrapper')
		await expect(unstyledWrapper).not.toHaveClass('inkq-wrapper')
		expect(hasModuleClass(styledWrapper, 'inkq-footer__wrapper')).toBe(true)
		expect(hasModuleClass(unstyledWrapper, 'inkq-footer__wrapper')).toBe(false)

		const styledContent = styledWrapper.querySelector('.inkq-footer__content') as HTMLElement,
			unstyledContent = unstyledWrapper.querySelector('.inkq-footer__content') as HTMLElement

		await expect(styledContent).toHaveClass('inkq-footer__content')
		await expect(unstyledContent).toHaveClass('inkq-footer__content')
		expect(hasModuleClass(styledContent, 'inkq-footer__content')).toBe(true)
		expect(hasModuleClass(unstyledContent, 'inkq-footer__content')).toBe(false)
	},
}
