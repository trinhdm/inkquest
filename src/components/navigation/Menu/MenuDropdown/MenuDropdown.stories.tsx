import { expect, userEvent, waitFor, within } from 'storybook/test'
import { getDefaultProps } from '@/hooks/useProps'
import { MenuDropdown } from './MenuDropdown'
import { MenuLabel } from '../MenuLabel'
import { NavRoutes, NAVIGATION_DATA } from '@/utils/navigation'
import type { ReactNode } from 'react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import moduleClasses from '../Menu.module.scss'

// `Menu.Dropdown` is NOT attached to `Menu` (`Menu.tsx` has no `subcomponents`), so it is
// imported from its own folder. `MenuItem` is what mounts it in the app (handing it a
// `Menu.Label` element as `trigger`); these stories drive it directly.
//
// Its only enumerable props are the boolean `hasCaret` and the polymorphic `as`, so the option
// lists stay local instead of living in a shared `options.story.ts`.
const BOOLEAN_OPTIONS = [true, false] as const

// Root tags exercised by the `AsElement` story. `li` is the registered default.
const AS_OPTIONS = ['li', 'div'] as const

const findItem = (label: string) => NAVIGATION_DATA.find(item => item.label === label)!

// `Company` is the dropdown fixture: it has a `menu` but NO `route`, so its label is a plain
// `<span>`, and none of its five children is itself a dropdown. That keeps the click, hover
// and keyboard stories free of navigation. `Discover` has a `route`, for the story that needs
// a label which is a link. Read from `NAVIGATION_DATA` so the fixtures can't drift.
const COMPANY_MENU = findItem('Company').menu!,
	DISCOVER_ITEM = findItem('Discover')

// `MenuItem` passes `id ?? `dropdown-${ toSlug(label) }``; the caret button and submenu ids are
// built from it inside `MenuDropdown`. Driven directly, the id is whatever is passed; this one
// is the label-derived form.
const DROPDOWN_ID = 'dropdown-company',
	TRIGGER_ID = `${ DROPDOWN_ID }-trigger`,
	MENU_ID = `${ DROPDOWN_ID }-menu`

const FIRST_ITEM = COMPANY_MENU[0].label,
	SECOND_ITEM = COMPANY_MENU[1].label,
	LAST_ITEM = COMPANY_MENU[COMPANY_MENU.length - 1].label

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

const Row = ({ children }: { children: ReactNode }) => (
	<div style={ { display: 'flex', gap: 48, flexWrap: 'wrap', alignItems: 'flex-start' } }>
		{ children }
	</div>
)

// A plain wrapper, NOT its own `<ul>` — the single `role="menubar"` list every story renders
// inside comes from the meta-level decorator below.
const Group = ({ label, children }: { label: string, children: ReactNode }) => (
	<div style={ { display: 'flex', flexDirection: 'column', gap: 8 } }>
		<span style={ { font: 'var(--inkq-text-control)', letterSpacing: '.15em', textTransform: 'uppercase', opacity: 0.6 } }>
			{ label }
		</span>
		<div style={ { display: 'flex', gap: 8, alignItems: 'flex-start', flexWrap: 'wrap' } }>
			{ children }
		</div>
	</div>
)

// `MenuDropdown` always renders `<li role="none">`, which is only valid semantics inside a
// real `role="menubar"` list.
const MenubarWrapper = ({ children }: { children: ReactNode }) => (
	<ul role="menubar" style={ { display: 'flex', gap: 24, flexWrap: 'wrap', listStyle: 'none', margin: 0, padding: 0 } }>
		{ children }
	</ul>
)

const getById = (root: HTMLElement, id: string) => {
	const element = root.querySelector<HTMLElement>(`#${ id }`)
	if (!element) throw new Error(`#${ id } is not in the canvas`)
	return element
}

// The caret button gets a `--hidden` modifier (a hashed CSS-module class, hence the substring
// match) when its caret is hidden. In a real browser the CSS visually hides it on hover
// devices unless it has keyboard focus; it stays in the accessibility tree and keeps working.
const hasHiddenCaret = (button: Element) =>
	Array.from(button.classList).some(c => c.includes('trigger--hidden'))

// The nested `Menu` is ALWAYS mounted, so open state is read off the DOM, not from whether it
// exists: `data-open` on the dropdown's own `li` (the CSS shows the submenu from that) plus
// `aria-expanded` on the caret button.
const expectOpen = async (trigger: HTMLElement) => {
	await waitFor(() => expect(trigger).toHaveAttribute('aria-expanded', 'true'))
	await expect(trigger.closest('li')).toHaveAttribute('data-open')
}

const expectClosed = async (trigger: HTMLElement) => {
	await waitFor(() => expect(trigger).toHaveAttribute('aria-expanded', 'false'))
	await expect(trigger.closest('li')).not.toHaveAttribute('data-open')
}

// `Menu.module.scss` hides a closed submenu with `visibility: hidden`, and on CLOSE it delays
// that by the dropdown's transition duration. Testing Library leaves `visibility: hidden`
// elements out of role queries, so "the items are gone" only becomes true once the delay
// passes, hence `waitFor`. Opening applies at once, hence `findByRole`.
const expectItemsHidden = (canvasElement: HTMLElement) =>
	waitFor(
		() => expect(within(canvasElement).queryByRole('menuitem', { name: FIRST_ITEM })).not.toBeInTheDocument(),
		{ timeout: 2000 },
	)

const expectItemsVisible = async (canvasElement: HTMLElement) =>
	expect(await within(canvasElement).findByRole('menuitem', { name: FIRST_ITEM })).toBeInTheDocument()

// `MenuDropdown.Props` (the `declare namespace` export) is just the raw `MenuDropdownProps`
// interface — it doesn't include `as`/`unstyled`/`attributes`/etc., which only exist on the
// actual accepted prop type, `PolymorphicProps<MenuDropdownProps, C>`.
// `Parameters<typeof MenuDropdown>[0]` reads that real, wrapped type straight off the
// component itself. It fills `C` with its constraint (`ElementType`), not the default `'li'`,
// so `as` is any `ElementType` here.
type MenuDropdownStoryProps = Parameters<typeof MenuDropdown>[0]
type Story = StoryObj<MenuDropdownStoryProps>

const meta: Meta<MenuDropdownStoryProps> = {
	component: MenuDropdown,
	title: 'Navigation/Menu/Menu.Dropdown',
	decorators: [(Story) => <MenubarWrapper><Story /></MenubarWrapper>],
	argTypes: {
		as: {
			control: 'select',
			options: AS_OPTIONS,
			description: 'Part of `PolymorphicProps`; the registered default is `li`. Sets the tag of the root, which always carries `role="none"` and the `id`. See the `AsElement` story.',
		},
		active: {
			control: 'text',
			description: 'A `NavRoute` forwarded as-is to the nested `Menu`, which marks the child whose `route` matches it exactly (`aria-current="page"` on the label, `data-current` on its `li`). `MenuDropdown` does not compare it with anything itself. See the `Active` story.',
		},
		attributes: {
			control: 'object',
			description: 'Escape-hatch attributes (`data`, `aria`) merged onto the ROOT `li`, alongside the `data-open` it sets itself; not applied to the caret button or the submenu. See the `Attributes` story.',
		},
		className: {
			control: false,
			description: 'Forwarded to the nested `Menu`, which passes it on to its items (`MenuItem` uses it to inherit a semantic class such as `inkq-navbar__menu-item`). No story asserts on it.',
		},
		depth: {
			control: 'number',
			description: 'Nesting level of this dropdown. It decides the keyboard rules: a dropdown with a truthy `depth` is NESTED (inside another dropdown\'s submenu), where `ArrowRight` opens it and `ArrowLeft` also closes it; at depth `0` or `undefined` it is top-level, where `ArrowDown` opens it. When `depth` is a number, the nested `Menu` gets `depth + 1`; otherwise it gets `undefined` and falls back to its own registered default of `0`. These stories pass `0` unless they test nesting. See the `KeyboardNested` story.',
		},
		hasCaret: {
			control: 'boolean',
			description: 'No registered default. A boolean decides whether the caret is shown; when omitted it is shown only if the content (`trigger ?? label`) is a string, so an element `trigger` hides it unless `hasCaret` is `true` (the stories pass `true`; `MenuItem` passes `trigger === undefined`). The caret button is ALWAYS rendered; a hidden caret gets a `--hidden` modifier that CSS-hides it on hover devices unless it has keyboard focus (it stays visible on touch devices) and it still opens the dropdown. The icon is always `caret-down`; only the open dropdown\'s own caret rotates. See the `HasCaret` and `HiddenCaretInteraction` stories.',
		},
		id: {
			control: 'text',
			description: 'Required. Becomes the root `li`\'s `id`; the caret button gets `${ id }-trigger` and the nested submenu gets `${ id }-menu`, which the button\'s `aria-controls` and the submenu\'s `aria-labelledby` point at. The submenu is a `Menu` given that `id`, so it prefixes any dropdown nested inside it (`${ id }-menu-events`, …). `MenuItem` passes its own `id` (set by `Menu` as `${ menuId }-${ toSlug(label) }` when the `Menu` has one), falling back to `dropdown-${ toSlug(label) }`.',
		},
		label: {
			control: 'text',
			description: 'Required string. Names the caret button (`aria-label="${ label } submenu"`) and is what the dropdown shows when no `trigger` is given (a string, so the caret is shown by default).',
		},
		menu: {
			control: 'object',
			description: 'Required `NavigationItem[]` handed to the nested `Menu` as `items`. May be empty: the caret button still renders, and the submenu is an empty list. See the `EmptyMenu` story.',
		},
		trigger: {
			control: false,
			description: 'A `ReactNode` rendered as the dropdown\'s content INSTEAD of `label`, before the caret button (`MenuItem` passes a `Menu.Label` element: a link, or a `span` without a `route`). It sits beside the caret button, never inside it. Keyboard focus moves back to this element\'s first `menuitem` when the dropdown closes with `Escape` or `ArrowLeft`.',
		},
		unstyled: {
			control: 'boolean',
			description: 'Comes from `FactoryContract` (via `_PolymorphicContract`), not `MenuDropdown`\'s own props. Drops the CSS-module hash from the root; the semantic base class (`inkq-menu-dropdown`) stays. See the `Unstyled` story.',
		},
	},
	args: {
		...getDefaultProps<MenuDropdown.Props>('Menu.Dropdown'),
		depth: 0,
		hasCaret: true,
		id: DROPDOWN_ID,
		label: 'Company',
		menu: COMPANY_MENU,
		trigger: <MenuLabel label="Company" />,
	},
}

export default meta

/**
 * The closed baseline. The root is a `li role="none"` with the given `id` and no `data-open`.
 * Its children are, in order: the label (here a route-less `Menu.Label` `span`), a SEPARATE
 * caret `Button`, and the nested `Menu`; nothing interactive is inside the button.
 *
 * The button is an `unstyled` `Button` named `Company submenu` that carries `aria-controls`,
 * `aria-haspopup` and `aria-expanded="false"`, and contains the `caret-down` `Icon`. The
 * submenu is already in the DOM (positive control: its items are there as text) but not open,
 * and CSS hides it, so its items are not reachable by role. It is labelled by the button
 * (`aria-labelledby`).
 *
 * The caret is `<Icon type="caret-down" />`; `Icon` registers `hidden: true`, so the glyph is
 * `aria-hidden` and has no role to query it by (hence a CSS selector).
 */
export const Default: Story = {
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			label = canvas.getByRole('menuitem', { name: 'Company' }),
			trigger = canvas.getByRole('button', { name: 'Company submenu' }),
			root = getById(canvasElement, DROPDOWN_ID),
			submenu = getById(canvasElement, MENU_ID)

		await expect(root.tagName).toBe('LI')
		await expect(root).toHaveAttribute('role', 'none')
		await expect(root).not.toHaveAttribute('data-open')

		await expect(label.tagName).toBe('SPAN')
		await expect(label.parentElement).toBe(root)
		await expect(trigger).not.toContainElement(label)
		await expect(label.nextElementSibling).toBe(trigger)
		await expect(trigger.nextElementSibling).toBe(submenu)

		await expect(trigger).toHaveAttribute('id', TRIGGER_ID)
		await expect(trigger).toHaveAttribute('type', 'button')
		await expect(trigger).toHaveAttribute('aria-controls', MENU_ID)
		await expect(trigger).toHaveAttribute('aria-haspopup', 'true')
		await expect(trigger).toHaveAttribute('aria-expanded', 'false')

		const icon = trigger.querySelector('svg')
		await expect(icon).not.toBeNull()
		await expect(icon).toHaveAttribute('aria-hidden', 'true')

		await expect(submenu.tagName).toBe('UL')
		await expect(submenu).toHaveAttribute('role', 'menubar')
		await expect(submenu).toHaveAttribute('aria-labelledby', TRIGGER_ID)
		await expect(within(submenu).getByText(FIRST_ITEM)).toBeInTheDocument()

		await expectItemsHidden(canvasElement)
	},
}

/**
 * `hasCaret` rendered both ways. The caret button is rendered in BOTH (named
 * `Company submenu`, holding the icon), so assistive tech and keyboard users always have it.
 * `true` shows it; `false` adds the `--hidden` modifier, which hides it visually on hover
 * devices unless it has keyboard focus. The ids carry the value so the two dropdowns don't
 * collide.
 */
export const HasCaret: Story = {
	parameters: { controls: { exclude: ['hasCaret', 'id'] } },
	render: (args) => (
		<Row>
			{ BOOLEAN_OPTIONS.map(hasCaret => (
				<Group key={ String(hasCaret) } label={ String(hasCaret) }>
					<MenuDropdown { ...args } hasCaret={ hasCaret } id={ `${ DROPDOWN_ID }-${ hasCaret }` } />
				</Group>
			)) }
		</Row>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			[withCaret, withoutCaret] = canvas.getAllByRole('button', { name: 'Company submenu' })

		await expect(hasHiddenCaret(withCaret)).toBe(false)
		await expect(hasHiddenCaret(withoutCaret)).toBe(true)

		// The button and its icon are there either way.
		await expect(withCaret.querySelector('svg')).not.toBeNull()
		await expect(withoutCaret.querySelector('svg')).not.toBeNull()
	},
}

/**
 * A hidden caret (`hasCaret: false`) is only hidden visually: the button is still in the Tab
 * order and still opens and closes the dropdown, by keyboard and by click.
 *
 * Keyboard first: Tab lands on the caret (the label `span` is `tabIndex={ -1 }`), Enter opens
 * the dropdown, and Space then closes it through the button's native activation. The click
 * steps use the element's own `click()` because a pointer click is always preceded by the
 * `mouseenter` that already opens the dropdown (see `ClickToOpen`).
 */
export const HiddenCaretInteraction: Story = {
	args: { hasCaret: false },
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			trigger = canvas.getByRole('button', { name: 'Company submenu' })

		await expect(hasHiddenCaret(trigger)).toBe(true)

		await userEvent.tab()
		await expect(trigger).toHaveFocus()

		await userEvent.keyboard('{Enter}')
		await expectOpen(trigger)

		// Enter's open handling moves focus to the first item on the next frame; wait for it
		// before refocusing the caret by hand, so the frame can't take focus back afterwards.
		const first = await canvas.findByRole('menuitem', { name: FIRST_ITEM })
		await waitFor(() => expect(first).toHaveFocus())

		trigger.focus()
		await userEvent.keyboard(' ')
		await expectClosed(trigger)
		await expectItemsHidden(canvasElement)

		trigger.blur()

		trigger.click()
		await expectOpen(trigger)

		trigger.click()
		await expectClosed(trigger)
	},
}

/**
 * `as` sets the tag of the root. `role="none"` and the `id` are on the root either way.
 */
export const AsElement: Story = {
	parameters: { controls: { exclude: ['as', 'id'] } },
	render: (args) => (
		<Row>
			{ AS_OPTIONS.map(as => (
				<Group key={ as } label={ as }>
					<MenuDropdown { ...args } as={ as } id={ `${ DROPDOWN_ID }-${ as }` } />
				</Group>
			)) }
		</Row>
	),
	play: async ({ canvasElement }) => {
		for (const as of AS_OPTIONS) {
			const root = getById(canvasElement, `${ DROPDOWN_ID }-${ as }`)

			await expect(root.tagName.toLowerCase()).toBe(as)
			await expect(root).toHaveAttribute('role', 'none')
		}
	},
}

/**
 * `attributes` lands on the ROOT `li` (merged with the `data-open` the dropdown sets itself).
 * `data-current` is the hook `MenuItem` sets on a dropdown whose own `route` is the active
 * one; here it is forced on by hand. The caret button doesn't receive it.
 */
export const Attributes: Story = {
	parameters: { controls: { exclude: ['attributes', 'id'] } },
	render: (args) => (
		<Row>
			<Group label="attributes.data.current: true">
				<MenuDropdown
					{ ...args }
					attributes={ { data: { current: true } } }
					id={ `${ DROPDOWN_ID }-set` }
				/>
			</Group>
			<Group label="attributes: undefined">
				<MenuDropdown { ...args } attributes={ undefined } id={ `${ DROPDOWN_ID }-unset` } />
			</Group>
		</Row>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			withData = getById(canvasElement, `${ DROPDOWN_ID }-set`),
			withoutData = getById(canvasElement, `${ DROPDOWN_ID }-unset`)

		await expect(withData).toHaveAttribute('data-current')
		await expect(withoutData).not.toHaveAttribute('data-current')

		for (const trigger of canvas.getAllByRole('button'))
			await expect(trigger).not.toHaveAttribute('data-current')
	},
}

/**
 * `active` is handed to the nested `Menu`, which marks the one child whose `route` matches
 * exactly. The dropdown is opened by hover first, since closed items are out of reach for
 * role queries.
 */
export const Active: Story = {
	args: { active: NavRoutes.COMPANY_FAQS },
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			user = userEvent.setup(),
			trigger = canvas.getByRole('button')

		await user.hover(trigger)
		await expectOpen(trigger)

		const match = await canvas.findByRole('menuitem', { name: 'FAQs' }),
			other = canvas.getByRole('menuitem', { name: FIRST_ITEM })

		await expect(match).toHaveAttribute('aria-current', 'page')
		await expect(match.closest('li')).toHaveAttribute('data-current')
		await expect(other).not.toHaveAttribute('aria-current')
		await expect(other.closest('li')).not.toHaveAttribute('data-current')
	},
}

/**
 * Edge case: `menu` is required but may be empty. The caret button renders as usual and the
 * submenu is an empty list. Opening it with `ArrowDown` has nothing to focus, so focus stays
 * on the button.
 */
export const EmptyMenu: Story = {
	args: { menu: [] },
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			trigger = canvas.getByRole('button'),
			submenu = getById(canvasElement, MENU_ID)

		await expect(submenu).toBeEmptyDOMElement()

		await userEvent.tab()
		await expect(trigger).toHaveFocus()

		await userEvent.keyboard('{ArrowDown}')
		await expectOpen(trigger)

		// Give the `requestAnimationFrame` focus call time to run (and find nothing).
		await sleep(100)
		await expect(trigger).toHaveFocus()
	},
}

/**
 * Pointer-driven toggling of the caret button.
 *
 * IMPORTANT: the root also opens on `mouseenter`, and any real pointer click is preceded by a
 * pointer move onto the element — so a click can never be observed opening a closed dropdown
 * with the mouse. `userEvent.setup()` is used (rather than the per-call direct API) so pointer
 * position PERSISTS between steps: the hover fires once, and each later click is a pure
 * toggle.
 */
export const ClickToOpen: Story = {
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			user = userEvent.setup(),
			trigger = canvas.getByRole('button')

		await expectClosed(trigger)

		// Moving the pointer onto the dropdown opens it before the click lands.
		await user.hover(trigger)
		await expectOpen(trigger)
		await expectItemsVisible(canvasElement)

		// `handleToggle` inverts whatever the hover left behind.
		await user.click(trigger)
		await expectClosed(trigger)
		await expectItemsHidden(canvasElement)

		await user.click(trigger)
		await expectOpen(trigger)
		await expectItemsVisible(canvasElement)

		await user.click(trigger)
		await expectClosed(trigger)
	},
}

/**
 * `useOutsideClick` (subscribed on `document` for `mousedown`/`touchstart`) toggles the
 * dropdown only while it is open, so a click anywhere outside the root closes it.
 *
 * Opened with the keyboard on purpose: opening by hover would leave the pointer inside the
 * dropdown, and moving it out to the outside button would ALSO start the 300ms mouse-leave
 * timer, making it ambiguous which mechanism did the closing.
 */
export const OutsideClick: Story = {
	// The meta-level decorator already wraps this story in a single `<ul role="menubar">`;
	// the outside button is a plain sibling `li` in that same list.
	render: (args) => (
		<>
			<MenuDropdown { ...args } />
			<li><button type="button">Outside</button></li>
		</>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			trigger = getById(canvasElement, TRIGGER_ID),
			outside = canvas.getByRole('button', { name: 'Outside' })

		// Focus assertions first — a click would focus the caret and make a later `tab()`
		// move focus away instead of onto it.
		await userEvent.tab()
		await expect(trigger).toHaveFocus()

		await userEvent.keyboard('{Enter}')
		await expectOpen(trigger)
		await expectItemsVisible(canvasElement)

		await userEvent.click(outside)

		await expectClosed(trigger)
		await expectItemsHidden(canvasElement)
	},
}

/**
 * Hover opens immediately. Leaving does NOT close at once: `handleMouseLeave` starts a 300ms
 * `setTimeout`, so the dropdown is still open right after `unhover` and closes only once the
 * grace period passes, hence the `waitFor`. A single `userEvent.setup()` instance keeps the
 * pointer position coherent between the hover and the unhover.
 */
export const HoverToOpen: Story = {
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			user = userEvent.setup(),
			trigger = canvas.getByRole('button')

		await expectClosed(trigger)

		await user.hover(trigger)
		await expectOpen(trigger)
		await expectItemsVisible(canvasElement)

		await user.unhover(trigger)

		// Still inside the grace period.
		await expect(trigger).toHaveAttribute('aria-expanded', 'true')

		await waitFor(
			() => expect(trigger).toHaveAttribute('aria-expanded', 'false'),
			{ timeout: 2000 },
		)
		await expectClosed(trigger)
		await expectItemsHidden(canvasElement)
	},
}

/**
 * Entering again before the 300ms timer fires cancels the pending close
 * (`handleMouseEnter` clears the timeout), so the dropdown is still open well after the
 * original grace period would have ended.
 */
export const HoverReentry: Story = {
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			user = userEvent.setup(),
			trigger = canvas.getByRole('button')

		await user.hover(trigger)
		await expectOpen(trigger)

		await user.unhover(trigger)
		await user.hover(trigger)

		// Comfortably past the 300ms the cancelled timer would have needed.
		await sleep(600)
		await expectOpen(trigger)
		await expectItemsVisible(canvasElement)
	},
}

/**
 * The caret is a real `<button>` (`Button` with `unstyled`) and the first Tab stop in the
 * canvas: the label is a route-less `span` with `tabIndex={ -1 }`, and the closed submenu is
 * `visibility: hidden`, so nothing else is focusable. While the dropdown is closed and focus is
 * not on a link, Enter opens it through the root's own `onKeyDown` (which also moves focus to
 * the first item on the next animation frame); Space then closes it through the button's native
 * activation.
 *
 * The focus move is awaited before the caret is refocused by hand: otherwise the pending
 * `requestAnimationFrame` could land after the refocus and take focus back.
 */
export const KeyboardActivation: Story = {
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			trigger = canvas.getByRole('button')

		await expect(trigger).not.toHaveFocus()

		await userEvent.tab()
		await expect(trigger).toHaveFocus()

		await userEvent.keyboard('{Enter}')
		await expectOpen(trigger)

		const first = await canvas.findByRole('menuitem', { name: FIRST_ITEM })
		await waitFor(() => expect(first).toHaveFocus())

		trigger.focus()
		await expect(trigger).toHaveFocus()

		await userEvent.keyboard(' ')
		await expectClosed(trigger)
		await expectItemsHidden(canvasElement)

		await userEvent.keyboard('{Enter}')
		await expectOpen(trigger)

		// Explicit blur rather than tabbing away: where a further `tab()` lands is
		// browser/environment-dependent and not worth asserting on.
		trigger.blur()
		await expect(trigger).not.toHaveFocus()
	},
}

/**
 * When the label is a LINK, Enter on it does what a link does and does not open the dropdown:
 * the open keys while closed are only `ArrowDown` (top level) plus Space and Enter when focus
 * is NOT on a link. So Enter leaves the `keydown` un-prevented (the browser follows the link;
 * Storybook's Next router mock means nothing really navigates) and the dropdown stays closed,
 * whereas `ArrowDown` on the same link still opens it.
 */
export const KeyboardOnLink: Story = {
	args: {
		id: 'dropdown-discover',
		label: DISCOVER_ITEM.label,
		menu: DISCOVER_ITEM.menu!,
		trigger: <MenuLabel label={ DISCOVER_ITEM.label } route={ DISCOVER_ITEM.route } />,
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			link = canvas.getByRole('menuitem', { name: 'Discover' }),
			trigger = canvas.getByRole('button', { name: 'Discover submenu' })

		await expect(link.tagName).toBe('A')

		// The link comes before the caret button, so it is the first Tab stop.
		await userEvent.tab()
		await expect(link).toHaveFocus()

		let prevented: boolean | undefined
		const record = (event: KeyboardEvent) => {
			if (event.key === 'Enter') prevented = event.defaultPrevented
		}

		canvasElement.ownerDocument.addEventListener('keydown', record)
		await userEvent.keyboard('{Enter}')
		canvasElement.ownerDocument.removeEventListener('keydown', record)

		// Give a (wrongly) handled Enter time to open the dropdown before asserting it did not.
		await sleep(150)
		await expect(prevented).toBe(false)
		await expectClosed(trigger)

		await userEvent.keyboard('{ArrowDown}')
		await expectOpen(trigger)
	},
}

/**
 * Pure focus mechanics inside a top-level dropdown. `ArrowDown` on the closed caret opens it
 * AND moves focus to the first item (`getSubmenuItems`, scoped to
 * `':scope > [role="none"] > [role="menuitem"]'` inside the nested menubar). Once open,
 * `ArrowDown` and `ArrowUp` cycle through that list and wrap at both ends. Because a nested
 * dropdown's label is itself a direct `menuitem` of its `li`, it is part of the cycle too
 * (see `Menu`'s `KeyboardNestedLabels` story).
 */
export const KeyboardArrowNavigation: Story = {
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			trigger = canvas.getByRole('button')

		await userEvent.tab()
		await expect(trigger).toHaveFocus()

		await userEvent.keyboard('{ArrowDown}')
		await expectOpen(trigger)

		const first = await canvas.findByRole('menuitem', { name: FIRST_ITEM }),
			second = canvas.getByRole('menuitem', { name: SECOND_ITEM }),
			last = canvas.getByRole('menuitem', { name: LAST_ITEM })

		await waitFor(() => expect(first).toHaveFocus())

		await userEvent.keyboard('{ArrowDown}')
		await waitFor(() => expect(second).toHaveFocus())

		await userEvent.keyboard('{ArrowUp}')
		await waitFor(() => expect(first).toHaveFocus())

		// From the FIRST item, `ArrowUp` wraps backward to the LAST.
		await userEvent.keyboard('{ArrowUp}')
		await waitFor(() => expect(last).toHaveFocus())

		// From the LAST item, `ArrowDown` wraps forward to the FIRST.
		await userEvent.keyboard('{ArrowDown}')
		await waitFor(() => expect(first).toHaveFocus())
	},
}

/**
 * Route-less submenu items are out of the natural Tab order (`tabIndex={ -1 }`), but that
 * same `tabIndex` makes them programmatically focusable. `getSubmenuItems` matches by
 * `role="menuitem"` whatever the tag, so arrow-key cycling reaches a route-less `<span>`
 * just like a real `<a>`.
 */
export const KeyboardRouteless: Story = {
	args: {
		menu: [
			{ label: 'Overview' },
			{ label: 'Settings', route: NavRoutes.USER_SETTINGS },
		],
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			trigger = canvas.getByRole('button')

		await userEvent.tab()
		await expect(trigger).toHaveFocus()

		await userEvent.keyboard('{ArrowDown}')
		await expectOpen(trigger)

		const overview = await canvas.findByRole('menuitem', { name: 'Overview' }),
			settings = canvas.getByRole('menuitem', { name: 'Settings' })

		// Opening focuses the first item, route-less or not.
		await waitFor(() => expect(overview).toHaveFocus())
		await expect(overview.tagName).toBe('SPAN')

		await userEvent.keyboard('{ArrowDown}')
		await waitFor(() => expect(settings).toHaveFocus())

		// Wraps back to the route-less item.
		await userEvent.keyboard('{ArrowDown}')
		await waitFor(() => expect(overview).toHaveFocus())
	},
}

/**
 * A NESTED dropdown (truthy `depth`, as inside another dropdown's submenu) has its own keys:
 * `ArrowDown` does not open it (the event is left for the parent menu), `ArrowRight` does and
 * focuses the first item, and `ArrowLeft` closes it and puts focus back on its label.
 */
export const KeyboardNested: Story = {
	args: { depth: 1 },
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			label = canvas.getByRole('menuitem', { name: 'Company' }),
			trigger = canvas.getByRole('button')

		label.focus()
		await expect(label).toHaveFocus()

		await userEvent.keyboard('{ArrowDown}')
		await sleep(100)
		await expectClosed(trigger)

		await userEvent.keyboard('{ArrowRight}')
		await expectOpen(trigger)

		const first = await canvas.findByRole('menuitem', { name: FIRST_ITEM })
		await waitFor(() => expect(first).toHaveFocus())

		await userEvent.keyboard('{ArrowLeft}')
		await expectClosed(trigger)
		await waitFor(() => expect(label).toHaveFocus())
	},
}

/**
 * `Escape` while open closes the dropdown and returns focus to its LABEL (the first
 * `menuitem` child of the root), even though focus was inside the submenu.
 */
export const KeyboardEscape: Story = {
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			label = canvas.getByRole('menuitem', { name: 'Company' }),
			trigger = canvas.getByRole('button')

		await userEvent.tab()
		await expect(trigger).toHaveFocus()

		await userEvent.keyboard('{ArrowDown}')
		await expectOpen(trigger)

		const first = await canvas.findByRole('menuitem', { name: FIRST_ITEM })
		await waitFor(() => expect(first).toHaveFocus())

		await userEvent.keyboard('{Escape}')

		await expectClosed(trigger)
		await waitFor(() => expect(label).toHaveFocus())
		await expectItemsHidden(canvasElement)
	},
}

/**
 * `Tab` while open closes the dropdown without moving focus itself; the browser performs the
 * actual focus move, so only the closing is asserted.
 */
export const KeyboardTab: Story = {
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			trigger = canvas.getByRole('button')

		await userEvent.tab()
		await expect(trigger).toHaveFocus()

		await userEvent.keyboard('{Enter}')
		await expectOpen(trigger)

		const first = await canvas.findByRole('menuitem', { name: FIRST_ITEM })
		await waitFor(() => expect(first).toHaveFocus())

		await userEvent.keyboard('{Tab}')

		await expectClosed(trigger)
	},
}

/**
 * `unstyled` keeps the semantic base class (`inkq-menu-dropdown`) but drops the CSS-module
 * hash from the root.
 */
export const Unstyled: Story = {
	parameters: { controls: { exclude: ['unstyled', 'id'] } },
	render: (args) => (
		<Row>
			{ BOOLEAN_OPTIONS.map(unstyled => (
				<Group key={ String(unstyled) } label={ String(unstyled) }>
					<MenuDropdown { ...args } id={ `${ DROPDOWN_ID }-${ unstyled }` } unstyled={ unstyled } />
				</Group>
			)) }
		</Row>
	),
	play: async ({ canvasElement }) => {
		const unstyledRoot = getById(canvasElement, `${ DROPDOWN_ID }-true`),
			styledRoot = getById(canvasElement, `${ DROPDOWN_ID }-false`)

		const hasModuleClass = (el: Element, base: string) => {
			const moduleClass = (moduleClasses as Record<string, string>)[base]
			return !!moduleClass && el.classList.contains(moduleClass)
		}

		await expect(styledRoot).toHaveClass('inkq-menu-dropdown')
		await expect(unstyledRoot).toHaveClass('inkq-menu-dropdown')
		expect(hasModuleClass(styledRoot, 'inkq-menu-dropdown')).toBe(true)
		expect(hasModuleClass(unstyledRoot, 'inkq-menu-dropdown')).toBe(false)
	},
}
