import { expect, userEvent, within } from 'storybook/test'
import { getDefaultProps } from '@/hooks/useProps'
import { MenuLabel } from './MenuLabel'
import { NavRoutes } from '@/utils/navigation'
import type { ReactNode } from 'react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import moduleClasses from '../Menu.module.scss'

// `Menu.Label` is NOT attached to `Menu` (`Menu.tsx` has no `subcomponents`), so it is
// imported from its own folder, same as `MenuItem.stories.tsx` imports `MenuItem`.
//
// Its only enumerable props are the boolean `isActive` and the polymorphic `as`, so
// the option lists stay local instead of living in a shared `options.story.ts`.
const BOOLEAN_OPTIONS = [true, false] as const

// `as` only takes effect on the route-less branch (see the `AsElement` story).
const AS_OPTIONS = ['span', 'div', 'p'] as const

// `label` + `route` are the whole data shape (`item` is gone). The route-less set names
// `route: undefined` explicitly, so spreading it over `args` (which carry the routed
// default) really does clear the route.
const ROUTED = { label: 'Marketplace', route: NavRoutes.MARKETPLACE },
	ROUTELESS = { label: 'Company', route: undefined }

// Each group is an `<li role="none">`, the structure a real `menuitem` lives in. The
// meta-level decorator below supplies the single `role="menubar"` list.
const Group = ({ label, children }: { label: string, children: ReactNode }) => (
	<li role="none" style={ { display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-start' } }>
		<span style={ { font: 'var(--inkq-text-control)', letterSpacing: '.15em', textTransform: 'uppercase', opacity: 0.6 } }>
			{ label }
		</span>
		{ children }
	</li>
)

// `Parameters<typeof MenuLabel>[0]` reads the real, wrapped prop type off the
// component itself (it includes `as`, `unstyled`, ...). It fills the polymorphic
// `C` with its constraint (`ElementType`), not the default `'span'`.
type MenuLabelStoryProps = Parameters<typeof MenuLabel>[0]
type Story = StoryObj<MenuLabelStoryProps>

// The one template every story shares; stories override a single prop per call.
const menuLabel = (args: MenuLabelStoryProps) => <MenuLabel { ...args } />

const meta: Meta<MenuLabelStoryProps> = {
	component: MenuLabel,
	title: 'Navigation/Menu/Menu.Label',
	decorators: [
		(Story) => (
			<ul role="menubar" style={ { display: 'flex', gap: 48, flexWrap: 'wrap', listStyle: 'none', margin: 0, padding: 0 } }>
				<Story />
			</ul>
		),
	],
	argTypes: {
		as: {
			control: 'select',
			options: AS_OPTIONS,
			description: 'Part of `PolymorphicProps`; the registered default is `span`. Only the ROUTE-LESS branch applies it: the route branch always renders `next/link`. See the `AsElement` story.',
		},
		children: {
			control: false,
			description: 'Accepted through `PolymorphicProps` but IGNORED: both branches render `label`. See the `IgnoresChildren` story.',
		},
		isActive: {
			control: 'boolean',
			description: 'Registered default is `false`. On the route branch it sets `aria-current="page"`; the route-less branch never exposes `aria-current`. It is not reflected as a DOM attribute. See the `IsActive` story.',
		},
		label: {
			control: 'text',
			description: 'Required `ReactNode`, the content of the label on both branches. `MenuItem` passes its `trigger ?? label` here, so it can be a string or an element (an avatar, for instance). See the `NodeLabel` story.',
		},
		route: {
			control: 'select',
			options: [undefined, ...Object.values(NavRoutes)],
			description: 'Picks the branch. With a `route`, `MenuLabel` renders `next/link` with `href`, `scroll={ true }` and `shallow={ false }` (the last two are `Link` props, not DOM attributes, so no story asserts them); without one it renders its own `as` with `tabIndex={ -1 }`. Both set `role="menuitem"`. See the `Route` story.',
		},
		unstyled: {
			control: 'boolean',
			description: 'Part of the factory\'s `FactoryContract`, not `MenuLabel`\'s own props. Drops the CSS-module hash from the label; the semantic base class (`inkq-menu-item__label`, from `useStyles({ name: \'menu-item\' })`) stays. See the `Unstyled` story.',
		},
	},
	args: {
		...getDefaultProps<MenuLabel.Props>('Menu.Label'),
		...ROUTED,
	},
	render: (args) => <li role="none">{ menuLabel(args) }</li>,
}

export default meta

/**
 * With a `route`, the label is a `next/link` anchor: a focusable `<a href>` with
 * `role="menuitem"`, showing `label`.
 */
export const Default: Story = {
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			label = canvas.getByRole('menuitem')

		await expect(label.tagName).toBe('A')
		await expect(label).toHaveAttribute('href', NavRoutes.MARKETPLACE)
		await expect(label).toHaveTextContent('Marketplace')
		await expect(label).not.toHaveAttribute('aria-current')
	},
}

/**
 * The branch is picked by `route`: set, it is a link; unset, it is a plain
 * `as` element with `tabIndex={ -1 }` and no `href`. `scroll` and `shallow` are
 * passed to `Link` on the route branch, but they are not DOM attributes, so
 * they are not asserted here.
 */
export const Route: Story = {
	parameters: { controls: { exclude: ['label', 'route'] } },
	render: (args) => (
		<>
			<Group label="route: set">
				{ menuLabel({ ...args, ...ROUTED }) }
			</Group>
			<Group label="route: undefined">
				{ menuLabel({ ...args, ...ROUTELESS }) }
			</Group>
		</>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			routed = canvas.getByRole('menuitem', { name: 'Marketplace' }),
			routeless = canvas.getByRole('menuitem', { name: 'Company' })

		await expect(routed.tagName).toBe('A')
		await expect(routed).toHaveAttribute('href', NavRoutes.MARKETPLACE)
		await expect(routed).not.toHaveAttribute('tabindex')

		await expect(routeless.tagName).toBe('SPAN')
		await expect(routeless).not.toHaveAttribute('href')
		await expect(routeless).toHaveAttribute('tabindex', '-1')
	},
}

/**
 * `isActive` rendered both ways on each branch. On the route branch it marks the
 * link `aria-current="page"`; the route-less branch never exposes `aria-current`,
 * even when active. `isActive` itself never reaches the DOM.
 */
export const IsActive: Story = {
	parameters: { controls: { exclude: ['isActive', 'label', 'route'] } },
	render: (args) => (
		<>
			{ BOOLEAN_OPTIONS.map(isActive => (
				<Group key={ String(isActive) } label={ String(isActive) }>
					{ menuLabel({ ...args, ...ROUTED, isActive, label: `Routed (${isActive})` }) }
					{ menuLabel({ ...args, ...ROUTELESS, isActive, label: `Route-less (${isActive})` }) }
				</Group>
			)) }
		</>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)

		await expect(canvas.getByRole('menuitem', { name: 'Routed (true)' })).toHaveAttribute('aria-current', 'page')
		await expect(canvas.getByRole('menuitem', { name: 'Routed (false)' })).not.toHaveAttribute('aria-current')

		await expect(canvas.getByRole('menuitem', { name: 'Route-less (true)' })).not.toHaveAttribute('aria-current')
		await expect(canvas.getByRole('menuitem', { name: 'Route-less (false)' })).not.toHaveAttribute('aria-current')

		for (const item of canvas.getAllByRole('menuitem'))
			await expect(item).not.toHaveAttribute('isactive')
	},
}

/**
 * `as` only applies to the route-less branch (default `span`). With a `route` the
 * root is always the `next/link` anchor, so `as` has no effect there.
 */
export const AsElement: Story = {
	parameters: { controls: { exclude: ['as', 'label', 'route'] } },
	render: (args) => (
		<>
			{ AS_OPTIONS.map(as => (
				<Group key={ as } label={ `route-less, as="${as}"` }>
					{ menuLabel({ ...args, ...ROUTELESS, as, label: `as-${as}` }) }
				</Group>
			)) }
			<Group label='route set, as="div"'>
				{ menuLabel({ ...args, ...ROUTED, as: 'div', label: 'as-ignored' }) }
			</Group>
		</>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)

		await expect(canvas.getByRole('menuitem', { name: 'as-span' }).tagName).toBe('SPAN')
		await expect(canvas.getByRole('menuitem', { name: 'as-div' }).tagName).toBe('DIV')
		await expect(canvas.getByRole('menuitem', { name: 'as-p' }).tagName).toBe('P')

		const routed = canvas.getByRole('menuitem', { name: 'as-ignored' })
		await expect(routed.tagName).toBe('A')
		await expect(routed).toHaveAttribute('href', NavRoutes.MARKETPLACE)
	},
}

/**
 * `label` is a `ReactNode`, not just a string (`MenuItem` hands it `trigger ?? label`, so an
 * avatar or icon can land here). An element label is rendered inside the label element on
 * both branches, and still provides its text as the accessible name.
 */
export const NodeLabel: Story = {
	parameters: { controls: { exclude: ['label', 'route'] } },
	render: (args) => (
		<>
			<Group label="route: set">
				{ menuLabel({ ...args, ...ROUTED, label: <strong>Rich routed</strong> }) }
			</Group>
			<Group label="route: undefined">
				{ menuLabel({ ...args, ...ROUTELESS, label: <strong>Rich route-less</strong> }) }
			</Group>
		</>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			routed = canvas.getByRole('menuitem', { name: 'Rich routed' }),
			routeless = canvas.getByRole('menuitem', { name: 'Rich route-less' })

		await expect(routed.tagName).toBe('A')
		await expect(routed.querySelector('strong')).not.toBeNull()

		await expect(routeless.tagName).toBe('SPAN')
		await expect(routeless.querySelector('strong')).not.toBeNull()
	},
}

/**
 * Edge case: `children` are ignored on both branches; the content is always
 * `label`.
 */
export const IgnoresChildren: Story = {
	parameters: { controls: { exclude: ['children', 'label', 'route'] } },
	render: (args) => (
		<>
			<Group label="route: set">
				<MenuLabel { ...args } { ...ROUTED }>Ignored child</MenuLabel>
			</Group>
			<Group label="route: undefined">
				<MenuLabel { ...args } { ...ROUTELESS }>Ignored child</MenuLabel>
			</Group>
		</>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)

		await expect(canvas.getByRole('menuitem', { name: 'Marketplace' })).toHaveTextContent('Marketplace')
		await expect(canvas.getByRole('menuitem', { name: 'Company' })).toHaveTextContent('Company')
		await expect(canvas.queryByText('Ignored child')).not.toBeInTheDocument()
	},
}

/**
 * Pure focus mechanics. Only the link is a Tab stop; the route-less element has
 * `tabIndex={ -1 }`, so it is skipped by Tab but can still be focused
 * programmatically (which is how `Menu.Dropdown`'s arrow-key cycling reaches it). The
 * route-less group comes first, so a Tab that skipped it proves the point.
 */
export const KeyboardFocus: Story = {
	parameters: { controls: { exclude: ['label', 'route'] } },
	render: (args) => (
		<>
			<Group label="route: undefined">
				{ menuLabel({ ...args, ...ROUTELESS }) }
			</Group>
			<Group label="route: set">
				{ menuLabel({ ...args, ...ROUTED }) }
			</Group>
		</>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			routeless = canvas.getByRole('menuitem', { name: 'Company' }),
			routed = canvas.getByRole('menuitem', { name: 'Marketplace' })

		await expect(routed).not.toHaveFocus()

		await userEvent.tab()
		await expect(routed).toHaveFocus()
		await expect(routeless).not.toHaveFocus()

		routeless.focus()
		await expect(routeless).toHaveFocus()

		// Explicit blur rather than tabbing away: where a further `tab()` lands is
		// browser/environment-dependent.
		routeless.blur()
		await expect(routeless).not.toHaveFocus()
	},
}

/**
 * `unstyled` keeps the semantic base class (`inkq-menu-item__label`) but drops the
 * CSS-module hash.
 */
export const Unstyled: Story = {
	parameters: { controls: { exclude: ['unstyled', 'label', 'route'] } },
	render: (args) => (
		<>
			{ BOOLEAN_OPTIONS.map(unstyled => (
				<Group key={ String(unstyled) } label={ String(unstyled) }>
					{ menuLabel({ ...args, ...ROUTED, label: `unstyled=${unstyled}`, unstyled }) }
				</Group>
			)) }
		</>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			unstyledLabel = canvas.getByRole('menuitem', { name: 'unstyled=true' }),
			styledLabel = canvas.getByRole('menuitem', { name: 'unstyled=false' })

		const hasModuleClass = (el: Element, base: string) => {
			const moduleClass = (moduleClasses as Record<string, string>)[base]
			return !!moduleClass && el.classList.contains(moduleClass)
		}

		await expect(styledLabel).toHaveClass('inkq-menu-item__label')
		await expect(unstyledLabel).toHaveClass('inkq-menu-item__label')
		expect(hasModuleClass(styledLabel, 'inkq-menu-item__label')).toBe(true)
		expect(hasModuleClass(unstyledLabel, 'inkq-menu-item__label')).toBe(false)
	},
}
