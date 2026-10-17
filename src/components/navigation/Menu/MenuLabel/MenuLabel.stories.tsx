import { expect, userEvent, within } from 'storybook/test'
import { getDefaultProps } from '@/hooks/useProps'
import { MenuLabel } from './MenuLabel'
import { NavRoutes, type NavigationItem } from '@/utils/navigation'
import type { ReactNode } from 'react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import moduleClasses from '../Menu.module.scss'

// `MenuLabel` is NOT attached to `Menu` (`Menu.tsx` only wires `MenuItem`), so it is
// imported from its own folder, same as `MenuItem.stories.tsx` imports `MenuItem`.
//
// Its only enumerable props are the boolean `isActive` and the polymorphic `as`, so
// the option lists stay local instead of living in a shared `options.story.ts`.
const BOOLEAN_OPTIONS = [true, false] as const

// `as` only takes effect on the route-less branch (see the `AsElement` story).
const AS_OPTIONS = ['span', 'div', 'p'] as const

const ROUTED_ITEM: NavigationItem = { label: 'Marketplace', route: NavRoutes.MARKETPLACE }
const ROUTELESS_ITEM: NavigationItem = { label: 'User' }

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
	title: 'Navigation/Menu/MenuLabel',
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
			description: 'Accepted through `PolymorphicProps` but IGNORED: both branches render `item.label`. See the `IgnoresChildren` story.',
		},
		isActive: {
			control: 'boolean',
			description: 'Registered default is `false`. On the route branch it sets `aria-current="page"`; the route-less branch never exposes `aria-current`. It is not reflected as a DOM attribute. See the `IsActive` story.',
		},
		item: {
			control: 'object',
			description: 'Required `NavigationItem`. With a `route`, `MenuLabel` renders `next/link` with `href`, `scroll={ true }` and `shallow={ false }` (the last two are `Link` props, not DOM attributes, so no story asserts them); without one it renders its own `as` with `tabIndex={ -1 }`. Both set `role="menuitem"` and use `item.label` as content. `item.menu` is not read here. See the `Route` story.',
		},
		unstyled: {
			control: 'boolean',
			description: 'Part of the factory\'s `FactoryContract`, not `MenuLabel`\'s own props. Drops the CSS-module hash from the label; the semantic base class (`inkq-menu-item__label`, from `useStyles({ name: \'menu-item\' })`) stays. See the `Unstyled` story.',
		},
	},
	args: {
		...getDefaultProps<MenuLabel.Props>('MenuLabel'),
		item: ROUTED_ITEM,
	},
	render: (args) => <li role="none">{ menuLabel(args) }</li>,
}

export default meta

/**
 * With a `route`, the label is a `next/link` anchor: a focusable `<a href>` with
 * `role="menuitem"`, showing `item.label`.
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
 * The branch is picked by `item.route`: set, it is a link; unset, it is a plain
 * `as` element with `tabIndex={ -1 }` and no `href`. `scroll` and `shallow` are
 * passed to `Link` on the route branch, but they are not DOM attributes, so they
 * are not asserted here.
 */
export const Route: Story = {
	parameters: { controls: { exclude: ['item'] } },
	render: (args) => (
		<>
			<Group label="route: set">
				{ menuLabel({ ...args, item: ROUTED_ITEM }) }
			</Group>
			<Group label="route: undefined">
				{ menuLabel({ ...args, item: ROUTELESS_ITEM }) }
			</Group>
		</>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			routed = canvas.getByRole('menuitem', { name: 'Marketplace' }),
			routeless = canvas.getByRole('menuitem', { name: 'User' })

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
	parameters: { controls: { exclude: ['isActive'] } },
	render: (args) => (
		<>
			{ BOOLEAN_OPTIONS.map(isActive => (
				<Group key={ String(isActive) } label={ String(isActive) }>
					{ menuLabel({ ...args, isActive, item: { ...ROUTED_ITEM, label: `Routed (${isActive})` } }) }
					{ menuLabel({ ...args, isActive, item: { label: `Route-less (${isActive})` } }) }
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
	parameters: { controls: { exclude: ['as'] } },
	render: (args) => (
		<>
			{ AS_OPTIONS.map(as => (
				<Group key={ as } label={ `route-less, as="${as}"` }>
					{ menuLabel({ ...args, as, item: { label: `as-${as}` } }) }
				</Group>
			)) }
			<Group label='route set, as="div"'>
				{ menuLabel({ ...args, as: 'div', item: { ...ROUTED_ITEM, label: 'as-ignored' } }) }
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
 * Edge case: `children` are ignored on both branches; the content is always
 * `item.label`.
 */
export const IgnoresChildren: Story = {
	parameters: { controls: { exclude: ['children', 'item'] } },
	render: (args) => (
		<>
			<Group label="route: set">
				<MenuLabel { ...args } item={ ROUTED_ITEM }>Ignored child</MenuLabel>
			</Group>
			<Group label="route: undefined">
				<MenuLabel { ...args } item={ ROUTELESS_ITEM }>Ignored child</MenuLabel>
			</Group>
		</>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)

		await expect(canvas.getByRole('menuitem', { name: 'Marketplace' })).toHaveTextContent('Marketplace')
		await expect(canvas.getByRole('menuitem', { name: 'User' })).toHaveTextContent('User')
		await expect(canvas.queryByText('Ignored child')).not.toBeInTheDocument()
	},
}

/**
 * Pure focus mechanics. Only the link is a Tab stop; the route-less element has
 * `tabIndex={ -1 }`, so it is skipped by Tab but can still be focused
 * programmatically (which is how `Menu`'s arrow-key cycling reaches it). The
 * route-less group comes first, so a Tab that skipped it proves the point.
 */
export const KeyboardFocus: Story = {
	parameters: { controls: { exclude: ['item'] } },
	render: (args) => (
		<>
			<Group label="route: undefined">
				{ menuLabel({ ...args, item: ROUTELESS_ITEM }) }
			</Group>
			<Group label="route: set">
				{ menuLabel({ ...args, item: ROUTED_ITEM }) }
			</Group>
		</>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			routeless = canvas.getByRole('menuitem', { name: 'User' }),
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
	parameters: { controls: { exclude: ['unstyled', 'item'] } },
	render: (args) => (
		<>
			{ BOOLEAN_OPTIONS.map(unstyled => (
				<Group key={ String(unstyled) } label={ String(unstyled) }>
					{ menuLabel({ ...args, item: { ...ROUTED_ITEM, label: `unstyled=${unstyled}` }, unstyled }) }
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
