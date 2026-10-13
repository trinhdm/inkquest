import {
	BOOLEAN_OPTIONS, GROUP_GAP_BY_SIZE, ORIENTATION_OPTIONS,
	SIZE_OPTIONS, TRACKING_BY_SIZE, VARIANT_OPTIONS,
} from '../options.story'
import { expect, userEvent, within } from 'storybook/test'
import { getDefaultProps } from '@/hooks/useProps'
import { Button } from '../Button'
import type { ReactNode } from 'react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import moduleClasses from '../Button.module.scss'

const Row = ({ children }: { children: ReactNode }) => (
	<div style={ { display: 'flex', gap: 24, flexWrap: 'wrap' } }>{ children }</div>
)

const Group = ({ label, children }: { label: string, children: ReactNode }) => (
	<div style={ { display: 'flex', flexDirection: 'column', gap: 8 } }>
		<span style={ { font: 'var(--inkq-text-control)', letterSpacing: '.15em', textTransform: 'uppercase', opacity: 0.6 } }>
			{ label }
		</span>
		{ children }
	</div>
)

// The hashed CSS-module class is build-generated, so resolve it through
// `Button.module.scss`'s own compiled export map rather than guessing from
// leftover classes — same helper shape as `Group`/`Container`/`Grid`'s
// stories. A naive "any class beyond the base" heuristic would be wrong
// here: the `orientation` config adds `inkq-button-group--horizontal` as a
// LITERAL, unhashed class (`Button.module.scss` has no `&--horizontal` rule,
// so `getStyleClass` finds nothing to hash), and that class would be mistaken
// for the module hash. The module map lookup pins the exact selector instead.
// Used by the `Orientations` and `Unstyled` stories below.
const hasModuleClass = (el: Element, base: string) => {
	const moduleClass = (moduleClasses as Record<string, string>)[base]
	return !!moduleClass && el.classList.contains(moduleClass)
}

// `Button.Group.Props` (the `declare namespace` export) is just the raw
// `ButtonGroupProps` interface — it doesn't include `unstyled`/`attributes`/
// etc., which only exist on the actual accepted prop type,
// `PolymorphicProps<ButtonGroupProps, C>`. `Parameters<typeof
// Button.Group>[0]` reads that real, wrapped type straight off the component
// itself — `ButtonGroupSpecs`'s `isCompound: true` makes `as`
// resolve to `never` (compound components don't take a tag override), so
// this also correctly excludes `as` from the story's own controls.
//
// `variant` isn't a `ButtonGroup` prop — it's a story-only control that feeds
// the `Button` children rendered inside the group. `size` IS a real
// `ButtonGroup` prop, but outside the `Sizes` story this control is applied to
// the child `Button`s directly rather than to the group.
type ButtonGroupStoryArgs = Parameters<typeof Button.Group>[0] & {
	variant: Button.Variant
	size: Button.Size
}

// templatized repeated `children` instead of re-declaring the same JSX block
const renderGroup = ({ variant, size }: ButtonGroupStoryArgs) => {
	const buttonProps = { variant, size }
	return (
		<>
			<Button { ...buttonProps }>Save</Button>
			<Button { ...buttonProps }>Edit</Button>
			<Button { ...buttonProps }>Delete</Button>
		</>
	)
}

// `hasPriority`/`orientation` are real `ButtonGroup` defaults; `variant`/`size`
// are Button's own defaults, since those two fields only ever feed the
// `Button` children here — pulled separately rather than spreading both
// registries together, since they'd otherwise collide on the shared `as` key.
const buttonGroupDefaults = getDefaultProps<Button.Group.Props>('Button.Group')
const buttonDefaults = getDefaultProps<Button.Props>('Button')

const meta: Meta<ButtonGroupStoryArgs> = {
	component: Button.Group,
	title: 'Core/Button/Button.Group',
	argTypes: {
		variant: {
			control: 'select',
			options: VARIANT_OPTIONS,
		},
		size: {
			control: 'select',
			options: SIZE_OPTIONS,
			description: 'Story control: in most stories it is applied to each child `Button` directly. `ButtonGroup` also accepts `size` itself — it is published to the child Buttons through context (own prop wins) and, via the group\'s own `tokens` function, sets the `--button-group-gap` custom property on the group root (`sm`/`md` share one gap, `lg` has a larger one). Not a modifier class and not a data attribute. See the `Sizes` story.',
		},
		orientation: {
			control: 'select',
			options: ORIENTATION_OPTIONS,
		},
		disabled: { control: 'boolean' },
		hasPriority: { control: 'boolean' },
		loading: { control: 'boolean' },
		fullWidth: {
			control: 'boolean',
			description: 'Stretches the group to fill its container\'s width (adds a `data-block` attribute to the root element via `attributes.data`, present only when truthy — `ButtonGroup.tsx`\'s `data: { block: !!fullWidth || null }`). Unlike `Button`\'s own `fullWidth`, this does NOT also add a global `inkq-block` class — `ButtonGroup` only ever passes a `module` config (`orientation` only) to `styles(\'root\', ...)`, no `global` config. `aria-orientation` is unrelated: it always reflects the group\'s own `orientation` prop, independent of `fullWidth`. See the `FullWidth` story.',
		},
		revealFrom: {
			control: 'number',
			description: 'Fed into `revealItemFrom(index, revealFrom)` (`@/hooks/animation`, defined in `useReveal/helpers.ts`) for each surviving child, and spread onto that child\'s `ButtonGroupContext` value alongside `disabled`/`loading`/`priority`/`size`/`unstyled` (`ButtonGroupContext extends RevealItemProps`). When `revealFrom` is a number, each child\'s context carries a `data-reveal-item` value (`revealFrom + index`, stringified); when it\'s `undefined`, `revealItemFrom` returns `{}` and no such key is published at all. That context key reaches each child `Button` via `useButtonGroupProps` (own props always win, same precedence as the other cascaded fields) and, since `Button` doesn\'t destructure it, flows through `...rest`/`extractOthers` straight onto the rendered element as a literal `data-reveal-item` attribute. See the `RevealFrom` story.',
		},
		justify: {
			control: 'text',
			description: 'Destructured in `ButtonGroup`\'s render and emitted by its `tokens` function as the `--button-group-justify` custom property on the root element, which `Button.module.scss` reads on `.inkq-button-group` as `justify-content: var(--button-group-justify, start)`, or `var(--button-group-justify, space-between)` in the `[data-block]` (full-width) rule. It works independently of `size`. When unset, no token is emitted and the matching fallback applies (`start`, or `space-between` with `fullWidth`). No `justify` DOM attribute is rendered. Also skipped when `unstyled`. See the `Justify` story. See the `Justify` story.',
		},
		unstyled: {
			control: 'boolean',
			description: 'Part of the shared `FactoryContract` (`unstyled` on `_PolymorphicContract`), not `ButtonGroup`\'s own `ButtonGroupProps`. The semantic base class (`inkq-button-group`) on the group\'s root element is emitted regardless of this prop (an inherited semantic `className` could replace it). For the group\'s own `styles(\'root\')` call, `unstyled` drops the CSS-module-hashed class, the `orientation` config class (`getConfigClasses` returns early), and the `--button-group-gap` token (`getStyle` returns early). `ButtonGroup` destructures `unstyled` out and does not forward it to its root `Box`, so the group\'s own `data-block` and `aria-orientation` attributes are not stripped — see the `Unstyled` story. It also cascades to the child `Button`s: `ButtonGroup` flattens its children (`filterChildren` — recursing into `Fragment`s, dropping any element whose `displayName` isn\'t `\'Button\'`) and wraps EACH surviving child in its own `ButtonGroupProvider`, publishing `{ disabled, loading, priority, size, unstyled }` plus whatever `revealItemFrom(index, revealFrom)` returns (`ButtonGroupContext extends RevealItemProps`). Each `Button` reads that context via `useButtonGroupProps`, which fills a key on the Button\'s own raw props ONLY when that key is entirely absent there (checked with `Object.hasOwn` on the raw, pre-merge props, and skipping any `undefined` context value) — so a child `Button`\'s own prop, including an explicit `disabled={false}` inside a disabled group, always wins over the group\'s context value.',
		},
	},
	args: {
		hasPriority: buttonGroupDefaults.hasPriority,
		orientation: buttonGroupDefaults.orientation,
		variant: buttonDefaults.variant,
		size: buttonDefaults.size,
	},
	render: ({ size, variant, ...args }) => (
		<Button.Group { ...args }>
			{ renderGroup({ size, variant }) }
		</Button.Group>
	),
}

export default meta
type Story = StoryObj<ButtonGroupStoryArgs>

export const Default: Story = {}

export const Orientations: Story = {
	render: ({ size, variant, ...args }) => (
		<Row>
			{ ORIENTATION_OPTIONS.map(orientation => (
				<Group key={ orientation } label={ orientation }>
					<Button.Group { ...args } orientation={ orientation }>
						{ renderGroup({ size, variant }) }
					</Button.Group>
				</Group>
			)) }
		</Row>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			groups = canvas.getAllByRole('group'),
			[rowGroup, columnGroup] = groups

		// `ButtonGroup.tsx` only ever sets `attributes.aria.orientation` —
		// there is no `data-orientation` attribute at all (a `module` config
		// keyed on `orientation` only feeds a `--horizontal`/`--vertical`
		// class, not a DOM attribute). `aria-orientation` reflects
		// the group's own `orientation` value on BOTH groups, not just the
		// vertical one.
		await expect(rowGroup).toHaveAttribute('aria-orientation', 'horizontal')
		await expect(rowGroup).not.toHaveAttribute('data-orientation')

		await expect(columnGroup).toHaveAttribute('aria-orientation', 'vertical')
		await expect(columnGroup).not.toHaveAttribute('data-orientation')

		// Only `&--vertical` has an SCSS rule in `Button.module.scss`, so
		// only the vertical group gets a hashed module class. The
		// horizontal group's `inkq-button-group--horizontal` stays literal.
		expect(hasModuleClass(columnGroup, 'inkq-button-group--vertical')).toBe(true)
		expect(hasModuleClass(rowGroup, 'inkq-button-group--vertical')).toBe(false)

		await expect(rowGroup).toHaveClass('inkq-button-group--horizontal')
		await expect(columnGroup).not.toHaveClass('inkq-button-group--horizontal')
	},
}

// `size` is a real `ButtonGroup` prop (`ButtonGroupProps['size']`). It does two
// things: it is published through `ButtonGroupProvider` to every surviving
// child `Button`, which fills its own `size` from context via
// `useButtonGroupProps` ONLY when `size` is entirely absent from that child's
// own raw props (same own-prop-wins precedence as `disabled`/`loading`/
// `priority`/`unstyled`); and the group's own `tokens` function sets
// `--button-group-gap` on the group root.
// Children here are rendered WITHOUT their own `size` (only `variant`, for
// visual consistency), so what's asserted is purely the group's own cascade
// — not an own-prop short-circuiting it, as `renderGroup`'s children would.
export const Sizes: Story = {
	render: ({ variant, ...args }) => (
		<Row>
			{ SIZE_OPTIONS.map(size => (
				<Group key={ size } label={ size }>
					<Button.Group { ...args } size={ size }>
						<Button variant={ variant }>Save</Button>
						<Button variant={ variant }>Edit</Button>
						<Button variant={ variant }>Delete</Button>
					</Button.Group>
				</Group>
			)) }
		</Row>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			groups = canvas.getAllByRole('group')

		expect(groups).toHaveLength(SIZE_OPTIONS.length)

		// `Button.tsx` has no `data-size` attribute at all — its own `data` bag
		// is only `{ variant, tone, priority, block, disabled, loading }` —
		// and `size` adds no modifier class either; it is expressed purely as
		// inline tokens. The cascaded `size` (children carry no own `size`)
		// shows up as that size's `--button-tracking` on each child, which
		// differs per size, so it proves the group's cascade reached the
		// child. The group's own `size` sets `--button-group-gap` on the
		// group root (`sm` and `md` share a gap, `lg` has a larger one).
		for (const [index, group] of groups.entries()) {
			const size = SIZE_OPTIONS[index]!,
				buttons = within(group).getAllByRole('button')

			await expect(group.style.getPropertyValue('--button-group-gap'))
				.toBe(GROUP_GAP_BY_SIZE[size])

			for (const other of SIZE_OPTIONS) {
				if (GROUP_GAP_BY_SIZE[other] !== GROUP_GAP_BY_SIZE[size])
					await expect(group.style.getPropertyValue('--button-group-gap'))
						.not.toBe(GROUP_GAP_BY_SIZE[other])
			}

			for (const button of buttons) {
				await expect(button).not.toHaveAttribute('data-size')
				await expect(button).not.toHaveClass(`inkq-button--${size}`)

				await expect(button.style.getPropertyValue('--button-tracking'))
					.toBe(TRACKING_BY_SIZE[size])

				for (const other of SIZE_OPTIONS.filter(s => s !== size))
					await expect(button.style.getPropertyValue('--button-tracking'))
						.not.toBe(TRACKING_BY_SIZE[other])
			}
		}
	},
}

export const HasPriority: Story = {
	parameters: { controls: { exclude: ['hasPriority'] } },
	render: ({ size, variant, ...args }) => (
		<Row>
			{ BOOLEAN_OPTIONS.map(hasPriority => (
				<Group key={ String(hasPriority) } label={ String(hasPriority) }>
					<Button.Group { ...args } hasPriority={ hasPriority }>
						{ renderGroup({ size, variant }) }
					</Button.Group>
				</Group>
			)) }
			<Group label="clamped (4 buttons — derivePriority maxes out at tertiary)">
				<Button.Group { ...args } hasPriority>
					<Button { ...{ variant, size } }>First</Button>
					<Button { ...{ variant, size } }>Second</Button>
					<Button { ...{ variant, size } }>Third</Button>
					<Button { ...{ variant, size } }>Fourth</Button>
				</Button.Group>
			</Group>
		</Row>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			groups = canvas.getAllByRole('group')

		expect(groups).toHaveLength(3)

		const [withPriority, withoutPriority, clamped] = groups,
			withPriorityButtons = within(withPriority).getAllByRole('button'),
			withoutPriorityButtons = within(withoutPriority).getAllByRole('button'),
			clampedButtons = within(clamped).getAllByRole('button')

		const expectedPriorities: Button.Priority[] = ['primary', 'secondary', 'tertiary']
		for (const [index, button] of withPriorityButtons.entries())
			await expect(button).toHaveAttribute('data-priority', expectedPriorities[index])

		for (const button of withoutPriorityButtons)
			await expect(button).not.toHaveAttribute('data-priority')

		// `derivePriority` clamps any index at/beyond `PRIORITY_ROLES.length`
		// (3) to the last role, `tertiary` — the 4th button gets the same
		// `tertiary` as the 3rd, not a new/undefined role.
		expect(clampedButtons).toHaveLength(4)
		await expect(clampedButtons[0]).toHaveAttribute('data-priority', 'primary')
		await expect(clampedButtons[1]).toHaveAttribute('data-priority', 'secondary')
		await expect(clampedButtons[2]).toHaveAttribute('data-priority', 'tertiary')
		await expect(clampedButtons[3]).toHaveAttribute('data-priority', 'tertiary')
	},
}

// Children here (via `renderGroup`) carry no own `loading` prop, so each
// button's `data-loading` comes purely from `ButtonGroup`'s own `loading`
// cascading through `ButtonGroupProvider` / `useButtonGroupProps` — the same
// own-prop-wins precedence exercised (from the opposite direction) by
// `ChildOverrides`.
export const Loading: Story = {
	parameters: { controls: { exclude: ['loading'] } },
	render: ({ size, variant, ...args }) => (
		<Row>
			{ BOOLEAN_OPTIONS.map(loading => (
				<Group key={ String(loading) } label={ String(loading) }>
					<Button.Group { ...args } loading={ loading }>
						{ renderGroup({ size, variant }) }
					</Button.Group>
				</Group>
			)) }
		</Row>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			groups = canvas.getAllByRole('group')

		expect(groups).toHaveLength(2)

		const [loadingGroup, notLoadingGroup] = groups,
			loadingButtons = within(loadingGroup).getAllByRole('button'),
			notLoadingButtons = within(notLoadingGroup).getAllByRole('button')

		// Reflected as a VALUELESS attribute (`data-loading=""`), not `"true"`
		// — matches `Button.test.tsx`'s own assertion.
		for (const button of loadingButtons)
			await expect(button).toHaveAttribute('data-loading', '')

		for (const button of notLoadingButtons)
			await expect(button).not.toHaveAttribute('data-loading')
	},
}

export const Disabled: Story = {
	parameters: { controls: { exclude: ['disabled'] } },
	render: ({ size, variant, ...args }) => (
		<Row>
			{ BOOLEAN_OPTIONS.map(disabled => (
				<Group key={ String(disabled) } label={ String(disabled) }>
					<Button.Group { ...args } disabled={ disabled }>
						{ renderGroup({ size, variant }) }
					</Button.Group>
				</Group>
			)) }
		</Row>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)
		const buttons = canvas.getAllByRole('button')

		expect(buttons).toHaveLength(6)

		const [disabledGroup, enabledGroup] = [buttons.slice(0, 3), buttons.slice(3)]

		for (const button of disabledGroup) {
			await expect(button).toHaveAttribute('disabled')
		}
		for (const button of enabledGroup) {
			await expect(button).not.toHaveAttribute('disabled')
		}

		// native `disabled` buttons drop out of the tab sequence entirely,
		// so tabbing from a blurred state should skip the whole disabled
		// group and land directly on the first enabled-group button
		await userEvent.tab()
		for (const button of disabledGroup)
			await expect(button).not.toHaveFocus()
		await expect(enabledGroup[0]).toHaveFocus()
	},
}

export const FullWidth: Story = {
	parameters: {
		layout: 'padded',
		controls: { exclude: ['fullWidth'] },
	},
	render: ({ size, variant, ...args }) => (
		<div style={ { display: 'flex', flexDirection: 'column', gap: 24 } }>
			{ BOOLEAN_OPTIONS.map(fullWidth => (
				<Group key={ String(fullWidth) } label={ String(fullWidth) }>
					<Button.Group { ...args } fullWidth={ fullWidth }>
						{ renderGroup({ size, variant }) }
					</Button.Group>
				</Group>
			)) }
		</div>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			groups = canvas.getAllByRole('group')

		expect(groups).toHaveLength(2)

		const [isFullWidth, isNotFullWidth] = groups

		// `data-block` only — `ButtonGroup`, unlike `Button`, never passes a
		// `global` config to `styles('root', ...)`, so there's no accompanying
		// literal utility class to assert here.
		await expect(isFullWidth).toHaveAttribute('data-block')
		await expect(isNotFullWidth).not.toHaveAttribute('data-block')
	},
}

// `unstyled` does NOT remove the base `inkq-button-group` class
// `useStyles`/`getClassName.tsx` applies to the group's root element
// (rendered with `role="group"`) — per `getClassName.tsx`, the first
// `classList` entry (`namespace ?? baseName`) is not gated on
// `check.isUnstyled` (an inherited semantic `className` could replace it;
// none is passed here). On the group itself it suppresses the
// CSS-module-hashed class (`styleName`) normally appended alongside it
// (asserted below), plus the `orientation` config class and the
// `--button-group-gap` token (not asserted). `ButtonGroup.tsx` does not forward
// `unstyled` to its root `Box`, so no `data-*` attributes are stripped —
// verified against its own render, which only ever calls
// `styles('root')` (no other selector). It ALSO cascades to the child
// `Button`s: each surviving child (after `filterChildren` drops non-`Button`
// elements and flattens `Fragment`s) is wrapped in its own
// `ButtonGroupProvider` publishing `{ disabled, loading, priority, size,
// unstyled }` plus any `revealItemFrom` result, and each `Button` fills its
// own `unstyled` from that context via `useButtonGroupProps` ONLY because
// none of these children set `unstyled` themselves — so passing `unstyled`
// to `ButtonGroup` suppresses each child `Button`'s own hashed module class
// too (same "base always present, module class suppressed" contract, one
// level down).
export const Unstyled: Story = {
	parameters: { controls: { exclude: ['unstyled'] } },
	render: ({ size, variant, ...args }) => (
		<Row>
			{ BOOLEAN_OPTIONS.map(unstyled => (
				<Group key={ String(unstyled) } label={ String(unstyled) }>
					<Button.Group { ...args } unstyled={ unstyled }>
						{ renderGroup({ size, variant }) }
					</Button.Group>
				</Group>
			)) }
		</Row>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			groups = canvas.getAllByRole('group')

		expect(groups).toHaveLength(2)

		const [isUnstyled, isStyled] = groups

		await expect(isStyled).toHaveClass('inkq-button-group')
		await expect(isUnstyled).toHaveClass('inkq-button-group')
		expect(hasModuleClass(isStyled, 'inkq-button-group')).toBe(true)
		expect(hasModuleClass(isUnstyled, 'inkq-button-group')).toBe(false)

		// Cascades to child `Button`s too.
		const [unstyledButton] = within(isUnstyled).getAllByRole('button'),
			[styledButton] = within(isStyled).getAllByRole('button')

		await expect(styledButton).toHaveClass('inkq-button')
		await expect(unstyledButton).toHaveClass('inkq-button')
		expect(hasModuleClass(styledButton, 'inkq-button')).toBe(true)
		expect(hasModuleClass(unstyledButton, 'inkq-button')).toBe(false)
	},
}

// `justify` is destructured in `ButtonGroup`'s render (so it is NOT spread onto
// the DOM as a `justify` attribute) and emitted by the group's `tokens`
// function as the `--button-group-justify` custom property on the root, which
// `Button.module.scss`'s `.inkq-button-group` reads via `justify-content:
// var(--button-group-justify, start)` (or `var(--button-group-justify,
// space-between)` in its `[data-block]` full-width rule, set by `fullWidth`).
// The `tokens` function emits the token independently of `size`, so none of the
// groups here is given a `size`: that proves `justify` works alone. When
// `justify` is unset the token is `undefined`, nothing is emitted, and the
// stylesheet fallback applies (`start` normally, `space-between` full width).
// Because no group has a `size`, no `--button-group-gap` is emitted either, so
// the stylesheet falls back to `--inkq-space-group` (regression check below).
export const Justify: Story = {
	parameters: { layout: 'padded' },
	render: ({ size, variant, ...args }) => (
		<div style={ { display: 'flex', flexDirection: 'column', gap: 24 } }>
			<Group label="justify: undefined (default)">
				<Button.Group { ...args }>
					{ renderGroup({ size, variant }) }
				</Button.Group>
			</Group>
			<Group label="justify: center">
				<Button.Group { ...args } justify="center">
					{ renderGroup({ size, variant }) }
				</Button.Group>
			</Group>
			<Group label="fullWidth, justify: undefined">
				<Button.Group { ...args } fullWidth>
					{ renderGroup({ size, variant }) }
				</Button.Group>
			</Group>
			<Group label="fullWidth, justify: center">
				<Button.Group { ...args } fullWidth justify="center">
					{ renderGroup({ size, variant }) }
				</Button.Group>
			</Group>
		</div>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			groups = canvas.getAllByRole('group')

		expect(groups).toHaveLength(4)

		const [unset, centered, fullUnset, fullCentered] = groups

		await expect(fullUnset).toHaveAttribute('data-block')
		await expect(fullCentered).toHaveAttribute('data-block')
		await expect(unset).not.toHaveAttribute('data-block')
		await expect(centered).not.toHaveAttribute('data-block')

		const expected = [
			[unset, '', 'start'],
			[centered, 'center', 'center'],
			[fullUnset, '', 'space-between'],
			[fullCentered, 'center', 'center'],
		] as const

		for (const [group, token, computed] of expected) {
			await expect(group.style.getPropertyValue('--button-group-justify')).toBe(token)
			await expect(getComputedStyle(group).justifyContent).toBe(computed)

			// Consumed by the token, not leaked as a DOM attribute.
			await expect(group).not.toHaveAttribute('justify')

			// No `size` on any group here, so no gap token: the stylesheet's
			// `--inkq-space-group` fallback applies.
			await expect(group.style.getPropertyValue('--button-group-gap')).toBe('')
		}
	},
}

// `revealFrom` feeds `revealItemFrom(index, revealFrom)` for each surviving
// child, publishing a `data-reveal-item` value (`revealFrom + index`) through
// `ButtonGroupContext` — reaching each `Button` unmodified (it isn't a prop
// `Button` destructures, so it falls through to the DOM) as a literal
// attribute. `undefined` (the default) means no such key is published at all
// on any child.
export const RevealFrom: Story = {
	render: ({ size, variant, ...args }) => (
		<Row>
			<Group label="revealFrom: undefined (default)">
				<Button.Group { ...args }>
					{ renderGroup({ size, variant }) }
				</Button.Group>
			</Group>
			<Group label="revealFrom: 10">
				<Button.Group { ...args } revealFrom={ 10 }>
					{ renderGroup({ size, variant }) }
				</Button.Group>
			</Group>
		</Row>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			groups = canvas.getAllByRole('group')

		expect(groups).toHaveLength(2)

		const [undefinedGroup, revealFromGroup] = groups,
			undefinedButtons = within(undefinedGroup).getAllByRole('button'),
			revealFromButtons = within(revealFromGroup).getAllByRole('button')

		for (const button of undefinedButtons)
			await expect(button).not.toHaveAttribute('data-reveal-item')

		for (const [index, button] of revealFromButtons.entries())
			await expect(button).toHaveAttribute('data-reveal-item', `${ 10 + index }`)
	},
}

// `filterChildren` (`ButtonGroup.tsx`) recurses into `Fragment`s (flattening
// their children into the same list) and drops any element whose
// `displayName` isn't `'Button'` — a raw `<span>` (or any other non-`Button`
// element) simply renders nothing; it's excluded before the
// `ButtonGroupProvider` wrap/map, not merely hidden. Plain text and number
// children are dropped the same way (only valid elements are ever kept).
export const NonButtonChildren: Story = {
	render: ({ size, variant, ...args }) => (
		<Button.Group { ...args }>
			<>
				<Button { ...{ variant, size } }>Fragment child A</Button>
				<Button { ...{ variant, size } }>Fragment child B</Button>
			</>
			<span>not a Button — dropped by filterChildren</span>
			plain text child — dropped
			{ 7531 }
			<Button { ...{ variant, size } }>Trailing</Button>
		</Button.Group>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			group = canvas.getByRole('group'),
			buttons = canvas.getAllByRole('button')

		expect(buttons).toHaveLength(3)
		await expect(canvas.queryByText('not a Button — dropped by filterChildren')).not.toBeInTheDocument()
		await expect(group).not.toHaveTextContent('plain text child')
		await expect(group).not.toHaveTextContent('7531')
		expect(group.children).toHaveLength(3)
	},
}

// Own props on a child `Button` beat the group's `ButtonGroupProvider`
// context value, per `useButtonGroupProps`' `Object.hasOwn` guard on the
// child's raw props — even when the group publishes the opposite value.
export const ChildOverrides: Story = {
	render: ({ size, variant, ...args }) => (
		<Button.Group { ...args } disabled loading={ false }>
			<Button { ...{ variant, size } }>Inherits disabled</Button>
			<Button { ...{ variant, size } } disabled={ false }>Own disabled=false wins</Button>
			<Button { ...{ variant, size } } loading>Own loading=true wins</Button>
		</Button.Group>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			buttons = canvas.getAllByRole('button')

		expect(buttons).toHaveLength(3)

		const [inherited, ownDisabledFalse, ownLoadingTrue] = buttons

		await expect(inherited).toHaveAttribute('disabled')
		await expect(ownDisabledFalse).not.toHaveAttribute('disabled')

		// the group publishes `loading={false}`; this child's own `loading`
		// still wins over it
		await expect(ownLoadingTrue).toHaveAttribute('data-loading', '')
	},
}
