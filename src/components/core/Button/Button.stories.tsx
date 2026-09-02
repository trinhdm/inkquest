import {
	BOOLEAN_OPTIONS, PRIORITY_OPTIONS,
	SIZE_OPTIONS, VARIANT_OPTIONS,
} from './options.story'
import { Button } from './Button'
import { expect, fn, userEvent, within } from 'storybook/test'
import { getDefaultProps } from '@/lib/registries'
import { Icon } from '../Icon'
import type { ReactNode } from 'react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const Row = ({ children }: { children: ReactNode }) => (
	<div style={ { display: 'flex', gap: 24, flexWrap: 'wrap' } }>
		{ children }
	</div>
)

const Group = ({ label, children }: { label: string, children: ReactNode }) => (
	<div style={ { display: 'flex', flexDirection: 'column', gap: 8 } }>
		<span style={ { font: 'var(--inkq-font-control)', letterSpacing: '.15em', textTransform: 'uppercase', opacity: 0.6 } }>
			{ label }
		</span>
		<div style={ { display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' } }>
			{ children }
		</div>
	</div>
)

// `Button.Props` (the `declare namespace` export) is just the RAW
// `ButtonProps` interface — it does NOT include `as`/`children`/`unstyled`/
// `attributes`/etc., which only exist on the actual accepted prop type,
// `PolymorphicProps<ButtonProps, C>`. `Parameters<typeof Button>[0]` reads
// that real, wrapped type straight off the component itself (no
// hand-typing/drift risk) — the generic call signature's default `C`
// resolves to `'button'` here, since `ButtonSpecs`'s `default.component` is
// `'button'`.
type ButtonStoryProps = Parameters<typeof Button>[0]

// Still `BoxProps & (LinkButtonProps | NativeButtonProps) & {...}` under the
// hood — same conditional-interface shape `Button.tsx` itself narrows via
// `rest as Extract<typeof rest, LinkButtonProps>`. These stories only ever
// render the native `<button>` branch, so cast the other way: exclude the
// `href`-carrying (link) branch, leaving a spreadable, non-union shape.
type NativeButtonArgs = Exclude<ButtonStoryProps, { href: string }>

type Story = StoryObj<ButtonStoryProps>

const meta: Meta<ButtonStoryProps> = {
	component: Button,
	title: 'Core/Button',
	argTypes: {
		variant: {
			control: 'select',
			options: VARIANT_OPTIONS,
		},
		priority: {
			control: 'select',
			options: PRIORITY_OPTIONS,
			description: 'Also inheritable from an enclosing `Button.Group`: when the group has `hasPriority` set, it publishes a derived `priority` through `ButtonGroupProvider`, and this Button fills its own `priority` from it ONLY when `priority` is entirely absent from this Button\'s own raw props (`useButtonGroupProps`\' `Object.hasOwn` guard on the raw props, skipping `undefined` context values) — an explicit `priority` on the Button itself always wins. See the `GroupInheritance` story.',
		},
		size: {
			control: 'select',
			options: SIZE_OPTIONS,
		},
		disabled: {
			control: 'boolean',
			description: 'Also inheritable from an enclosing `Button.Group`, via `ButtonGroupProvider` / `useButtonGroupProps`: the group\'s own `disabled` fills this Button\'s `disabled` ONLY when the key is absent from this Button\'s own raw props — an own prop, including an explicit `disabled={false}` inside a disabled group, always wins. See the `DisabledState` and `GroupInheritance` stories.',
		},
		loading: {
			control: 'boolean',
			description: 'Also inheritable from an enclosing `Button.Group`, via the same `ButtonGroupProvider` / `useButtonGroupProps` own-prop-wins precedence as `disabled`. See the `LoadingState` and `GroupInheritance` stories.',
		},
		unstyled: {
			control: 'boolean',
			description: 'Part of `PolymorphicProps` (via the shared `SpecsContract`), not `Button`\'s own `ButtonProps`. The semantic base class (`inkq-button`, `inkq-button__inner`, `inkq-button__label`) is ALWAYS emitted regardless of this prop — `unstyled` only suppresses the CSS-module-hashed class normally appended alongside it, for every selector this component styles (`root`, `inner`, `label`) — see the `Unstyled` story. Also inheritable from an enclosing `Button.Group`, via the same `ButtonGroupProvider` / `useButtonGroupProps` own-prop-wins precedence as `disabled`/`loading`/`priority`.',
		},
		onClick: { action: 'clicked' },
	},
	args: {
		...getDefaultProps<Button.Props>('Button') as Partial<NativeButtonArgs>,
		children: 'Button',
		onClick: fn(),
	},
}

export default meta

export const Default: Story = {}

export const Variants: Story = {
	render: (args) => (
		<Row>
			{ VARIANT_OPTIONS.map(variant => (
				<Group key={ variant } label={ variant }>
					<Button { ...args as NativeButtonArgs } variant={ variant } />
				</Group>
			)) }
		</Row>
	),
}

export const Priorities: Story = {
	render: (args) => (
		<Row>
			{ PRIORITY_OPTIONS.map(priority => (
				<Group key={ priority } label={ priority }>
					<Button { ...args as NativeButtonArgs } priority={ priority } />
				</Group>
			)) }
		</Row>
	),
}

export const Sizes: Story = {
	render: (args) => (
		<Row>
			{ SIZE_OPTIONS.map(size => (
				<Group key={ size } label={ size }>
					<Button { ...args as NativeButtonArgs } size={ size } />
				</Group>
			)) }
		</Row>
	),
}

export const FullWidth: Story = {
	parameters: {
		layout: 'padded',
		controls: { exclude: ['fullWidth'] },
	},
	render: (args) => (
		<div style={ { display: 'flex', flexDirection: 'column', gap: 24 } }>
			{ BOOLEAN_OPTIONS.map(fullWidth => (
				<Group key={ String(fullWidth) } label={ String(fullWidth) }>
					<Button { ...args as NativeButtonArgs } fullWidth={ fullWidth } />
				</Group>
			)) }
		</div>
	),
}

export const AsLink: Story = {
	parameters: { layout: 'padded' },
	render: () => (
		<div style={ { display: 'flex', flexDirection: 'column', gap: 24 } }>
			<Row>
				<Group label="href">
					<Button href="#">Link button</Button>
				</Group>
				<Group label='as="a" (no href)'>
					<Button as="a">Link button</Button>
				</Group>
				<Group label="disabled">
					<Button href="#" disabled>Link button</Button>
				</Group>
				<Group label="loading">
					<Button href="#" loading>Link button</Button>
				</Group>
			</Row>
			<Row>
				{ VARIANT_OPTIONS.map(variant => (
					<Group key={ variant } label={ variant }>
						<Button href="#" variant={ variant }>Link button</Button>
					</Group>
				)) }
			</Row>
			<Row>
				{ PRIORITY_OPTIONS.map(priority => (
					<Group key={ priority } label={ priority }>
						<Button href="#" priority={ priority }>Link button</Button>
					</Group>
				)) }
			</Row>
		</div>
	),
}

export const LongText: Story = {
	args: { children: 'This is a button with an unusually long label to test text wrapping and truncation behavior' },
	parameters: { layout: 'padded' },
}

// `getTextFromChildren` (`Button.tsx`) walks `Button`'s own `children` and
// recurses into ANY child element that has a `children` prop — including a
// `Button.Section` — accumulating string/number leaves into the derived
// `aria-label`. An icon-only `Button.Section` contributes nothing (`Icon`
// has no `children` prop to recurse into), so the label stays empty and no
// `aria-label` attribute is emitted at all (`!!ariaLabel.length ? ariaLabel
// : undefined`, then filtered out by `hasValue`).
export const AriaLabel: Story = {
	render: (args) => (
		<Row>
			<Group label="plain text">
				<Button { ...args as NativeButtonArgs }>Save changes</Button>
			</Group>
			<Group label="text split across a Button.Section child">
				<Button { ...args as NativeButtonArgs }>
					<Button.Section left>Confirm</Button.Section>
					{ ' and continue' }
				</Button>
			</Group>
			<Group label="icon-only (no aria-label)">
				<Button { ...args as NativeButtonArgs }>
					<Button.Section left><Icon type="download" /></Button.Section>
				</Button>
			</Group>
		</Row>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			buttons = canvas.getAllByRole('button')

		expect(buttons).toHaveLength(3)

		const [plain, withSection, iconOnly] = buttons

		await expect(plain).toHaveAttribute('aria-label', 'Save changes')
		await expect(withSection).toHaveAttribute('aria-label', 'Confirm and continue')
		await expect(iconOnly).not.toHaveAttribute('aria-label')
	},
}

// `buildSections` (`Button.tsx`) only ever assigns the FIRST
// `Button.Section[left]` (or `[right]`) it encounters to `left`/`right` —
// every subsequent same-side section is dropped (and dev-warns) rather than
// rendered.
export const MultipleSections: Story = {
	render: (args) => (
		<Button { ...args as NativeButtonArgs }>
			<Button.Section left><Icon type="download" /></Button.Section>
			<Button.Section left><Icon type="attach" /></Button.Section>
			Save
		</Button>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			button = canvas.getByRole('button'),
			leftSections = button.querySelectorAll('[data-side="left"]')

		await expect(leftSections).toHaveLength(1)
	},
}

// Buttons rendered inside a `Button.Group` inherit `disabled`/`loading`/
// `priority` through `ButtonGroupProvider` / `useButtonGroupProps` — but only
// for keys entirely absent from a child Button's own raw props. An own prop,
// including an explicit `disabled={false}` inside a `disabled` group, always
// wins over the group's context value.
export const GroupInheritance: Story = {
	parameters: { layout: 'padded' },
	render: (args) => (
		<div style={ { display: 'flex', flexDirection: 'column', gap: 24 } }>
			<Group label="disabled group (own disabled=false still wins)">
				<Row>
					<Button.Group hasPriority={ false }>
						<Button { ...args as NativeButtonArgs } disabled>Group only</Button>
						<Button { ...args as NativeButtonArgs } disabled={ false }>Own disabled=false wins</Button>
					</Button.Group>
				</Row>
			</Group>
			<Group label="loading group">
				<Row>
					<Button.Group loading hasPriority={ false }>
						<Button { ...args as NativeButtonArgs }>Inherits loading</Button>
					</Button.Group>
				</Row>
			</Group>
			<Group label="priority group (hasPriority derives primary/secondary/tertiary by index)">
				<Row>
					<Button.Group hasPriority>
						<Button { ...args as NativeButtonArgs }>First</Button>
						<Button { ...args as NativeButtonArgs }>Second</Button>
						<Button { ...args as NativeButtonArgs }>Third</Button>
					</Button.Group>
				</Row>
			</Group>
		</div>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			buttons = canvas.getAllByRole('button')

		expect(buttons).toHaveLength(6)

		const [
			inheritsDisabled, ownDisabledFalse,
			inheritsLoading,
			primary, secondary, tertiary,
		] = buttons

		await expect(inheritsDisabled).toHaveAttribute('disabled')
		await expect(ownDisabledFalse).not.toHaveAttribute('disabled')

		await expect(inheritsLoading).toHaveAttribute('data-loading', 'true')

		await expect(primary).toHaveAttribute('data-priority', 'primary')
		await expect(secondary).toHaveAttribute('data-priority', 'secondary')
		await expect(tertiary).toHaveAttribute('data-priority', 'tertiary')
	},
}

export const LoadingState: Story = {
	parameters: { controls: { exclude: ['loading'] } },
	render: (args) => (
		<Row>
			{ BOOLEAN_OPTIONS.map(loading => (
				<Group key={ String(loading) } label={ String(loading) }>
					<Button { ...args as NativeButtonArgs } loading={ loading } />
				</Group>
			)) }
		</Row>
	),
}

export const DisabledState: Story = {
	parameters: { controls: { exclude: ['disabled'] } },
	render: (args) => (
		<Row>
			{ BOOLEAN_OPTIONS.map(disabled => (
				<Group key={ String(disabled) } label={ String(disabled) }>
					<Button { ...args as NativeButtonArgs } disabled={ disabled } />
				</Group>
			)) }
		</Row>
	),
	play: async ({ args, canvasElement }) => {
		const canvas = within(canvasElement),
			buttons = canvas.getAllByRole('button'),
			[isDisabled, isNotDisabled] = buttons

		expect(buttons).toHaveLength(2)
		await expect(isDisabled).toHaveAttribute('disabled')
		await expect(isNotDisabled).not.toHaveAttribute('disabled')

		// Runs before any click: native `disabled` buttons drop out of tab
		// order entirely, but clicking a button also focuses it in a real
		// browser, which would make a subsequent tab() move focus away
		// instead of confirming it landed on the enabled button.
		await userEvent.tab()
		await expect(isDisabled).not.toHaveFocus()
		await expect(isNotDisabled).toHaveFocus()

		await userEvent.click(isDisabled)
		await expect(args.onClick).not.toHaveBeenCalledOnce()

		await userEvent.click(isNotDisabled)
		await expect(args.onClick).toHaveBeenCalledOnce()
	},
}

// `unstyled` does NOT remove `Button`'s own semantic base classes
// (`inkq-button`, `inkq-button__inner`, `inkq-button__label`) — per
// `getClassName.tsx`, the base class is now ALWAYS emitted
// (`classList = [baseClass]` unconditionally). It only suppresses the
// CSS-module-hashed class normally appended alongside it (`classes[baseClass]`),
// for every selector this component styles (`root`, `inner`, `label`) — not
// just the root element — since `check.isUnstyled` is derived once from
// `props.unstyled` and reused across every `styles(...)` call `Button` makes.
// Verified against `Button.tsx`'s own render: root is the `<button>` itself
// (`inkq-button`), wrapping an inner `<span>` (`inkq-button__inner`) that
// wraps a label `<span>` (`inkq-button__label`).
export const Unstyled: Story = {
	parameters: { controls: { exclude: ['unstyled'] } },
	render: (args) => (
		<Row>
			{ BOOLEAN_OPTIONS.map(unstyled => (
				<Group key={ String(unstyled) } label={ String(unstyled) }>
					<Button { ...args as NativeButtonArgs } unstyled={ unstyled } />
				</Group>
			)) }
		</Row>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			buttons = canvas.getAllByRole('button')

		expect(buttons).toHaveLength(2)

		const [isUnstyled, isStyled] = buttons

		// The hashed CSS-module class is build-generated (e.g.
		// `_inkq-button_q68tq_12`), so assert on its presence/shape rather than a
		// literal hash: any class beyond the semantic base class means the
		// module class survived.
		const hasModuleClass = (el: Element, base: string) =>
			Array.from(el.classList).some(c => c !== base)

		await expect(isStyled).toHaveClass('inkq-button')
		await expect(isUnstyled).toHaveClass('inkq-button')
		expect(hasModuleClass(isStyled, 'inkq-button')).toBe(true)
		expect(hasModuleClass(isUnstyled, 'inkq-button')).toBe(false)

		const styledInner = isStyled.querySelector('span'),
			unstyledInner = isUnstyled.querySelector('span')

		await expect(styledInner).toHaveClass('inkq-button__inner')
		await expect(unstyledInner).toHaveClass('inkq-button__inner')
		expect(hasModuleClass(styledInner!, 'inkq-button__inner')).toBe(true)
		expect(hasModuleClass(unstyledInner!, 'inkq-button__inner')).toBe(false)

		const styledLabel = styledInner?.querySelector('span'),
			unstyledLabel = unstyledInner?.querySelector('span')

		await expect(styledLabel).toHaveClass('inkq-button__label')
		await expect(unstyledLabel).toHaveClass('inkq-button__label')
		expect(hasModuleClass(styledLabel!, 'inkq-button__label')).toBe(true)
		expect(hasModuleClass(unstyledLabel!, 'inkq-button__label')).toBe(false)
	},
}

export const ClickableInteraction: Story = {
	play: async ({ canvasElement, args }) => {
		const canvas = within(canvasElement),
			button = canvas.getByRole('button')

		await expect(button).toBeInTheDocument()
		await expect(button).not.toBeDisabled()

		await userEvent.click(button)
		await expect(args.onClick).toHaveBeenCalledOnce()

		await userEvent.click(button)
		await expect(args.onClick).toHaveBeenCalledTimes(2)
	},
}

export const KeyboardInteraction: Story = {
	play: async ({ args, canvasElement }) => {
		const canvas = within(canvasElement),
			button = canvas.getByRole('button')

		await expect(button).not.toHaveFocus()

		await userEvent.tab()
		await expect(button).toHaveFocus()

		await userEvent.keyboard('{Enter}')
		await expect(args.onClick).toHaveBeenCalledOnce()

		await userEvent.keyboard(' ')
		await expect(args.onClick).toHaveBeenCalledTimes(2)

		// Explicit blur rather than tabbing away: with only one focusable
		// element in this canvas, where a further `tab()` lands is
		// browser/environment-dependent and not worth asserting on.
		button.blur()
		await expect(button).not.toHaveFocus()

		await userEvent.tab({ shift: true })
		await expect(button).toHaveFocus()
	},
}
