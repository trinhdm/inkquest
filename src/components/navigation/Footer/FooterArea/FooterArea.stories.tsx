import { expect, within } from 'storybook/test'
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

// `About`/`Careers` are real leaf children of the route-less `Company`
// `NavigationItem`, and `Privacy`/`Terms` are real leaf children of the route-less
// `Legal` item — reused from `@/utils/navigation`'s own `NAVIGATION_DATA` so these
// fixtures can't drift from the app's real nav tree. `filterNavigation`'s
// non-`'dropdown'` (`'breadcrumbs'`) layout flattens both parents into their matched
// children directly, with no nesting.
const SAMPLE_ITEMS: Footer.Area.Props['items'] = [
	{ category: 'Company', routes: ['/about', '/careers'] },
]

const NO_CATEGORY_ITEMS: Footer.Area.Props['items'] = [
	{ routes: ['/privacy-policy', '/terms-conditions'] },
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
// `unstyled`/`attributes`/etc. from the shared `SpecsContract`), without needing to
// import `FooterArea`'s own file.
type FooterAreaStoryProps = Parameters<typeof Footer.Area>[0]
type Story = StoryObj<FooterAreaStoryProps>

const meta: Meta<FooterAreaStoryProps> = {
	component: Footer.Area,
	title: 'Navigation/Footer/Footer.Area',
	argTypes: {
		items: {
			control: 'object',
			description: 'Required — a `readonly` list of `{ category?, location?, orientation?, routes }` groups. Each group renders its own `<Menu hasDropdowns={ false }>` populated via `filterNavigation(routes, \'breadcrumbs\')`; a `category` renders a label `<span>` above its group, and an absent `category` renders no label at all. The whole `.inkq-footer__navigation` block is guarded by `!!items.length` — an empty array renders no navigation at all (only `children`). `location`/`orientation` are read by the PARENT `Footer`/passed straight through to the per-group `Menu`, respectively — `FooterArea` itself never inspects `location`.',
		},
		unstyled: {
			control: 'boolean',
			description: 'Part of `PolymorphicProps` (via the shared `SpecsContract`), not `FooterArea`\'s own props. The semantic base classes are always emitted. `styles(\'wrapper\', true)` is the BOOLEAN-shorthand config form — `getConfigClasses` checks `typeof config === \'boolean\'` BEFORE it ever looks at `unstyled`, so the `inkq-wrapper` class it emits survives `unstyled` unconditionally; only its CSS-module HASH (a separate mechanism, `getStyleClass`) is suppressed. See the `Unstyled` story.',
		},
	},
	args: {
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
			{ category: 'Vertical (default)', orientation: 'vertical', routes: ['/about', '/careers'] },
			{ category: 'Horizontal', orientation: 'horizontal', routes: ['/privacy-policy', '/terms-conditions'] },
		],
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			[verticalMenu, horizontalMenu] = canvas.getAllByRole('menubar')

		const hasClassLike = (el: Element, substring: string) =>
			Array.from(el.classList).some(c => c.includes(substring))

		expect(hasClassLike(verticalMenu, 'inkq-menu--vertical')).toBe(true)
		await expect(horizontalMenu).toHaveClass('inkq-menu--horizontal')
	},
}

/**
 * `unstyled` never removes the semantic base classes (`inkq-footer__wrapper`,
 * `inkq-footer__content`) — only their CSS-module hash is suppressed (both have
 * plain, config-less SCSS declarations nested under `Footer.module.scss`'s
 * `&__info`/`&__legal` blocks, which still generate a hash for the shared class
 * TOKEN regardless of which ancestor context it's compiled under). The boolean-config
 * `styles('wrapper', true)` call behaves differently again: `getConfigClasses` checks
 * `typeof config === 'boolean'` BEFORE it ever looks at `unstyled`, so the literal
 * `inkq-wrapper` class it emits is present EITHER WAY — only the wrapper's own
 * CSS-module hash (a separate, unrelated mechanism) is suppressed when unstyled.
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

		// Boolean-shorthand `inkq-wrapper` survives `unstyled` unconditionally —
		// only the CSS-module hash for `inkq-footer__wrapper` itself is suppressed.
		await expect(styledWrapper).toHaveClass('inkq-footer__wrapper', 'inkq-wrapper')
		await expect(unstyledWrapper).toHaveClass('inkq-footer__wrapper', 'inkq-wrapper')
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
