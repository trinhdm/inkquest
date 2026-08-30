import {
	BOOLEAN_OPTIONS, PRIORITY_OPTIONS,
	SIZE_OPTIONS, VARIANT_OPTIONS,
} from './options.story'
import { Button } from './Button'
import { expect, fn, userEvent, within } from 'storybook/test'
import { getDefaultProps } from '@/lib/registries'
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

// `Button.Props` is `BoxProps & (LinkButtonProps | NativeButtonProps) & {...}` —
// same conditional-interface shape `Button.tsx` itself narrows via
// `rest as Extract<typeof rest, LinkButtonProps>`. These stories only ever
// render the native `<button>` branch, so cast the other way: exclude the
// `href`-carrying (link) branch, leaving a spreadable, non-union shape.
type NativeButtonArgs = Exclude<Button.Props, { href: string }>

const meta: Meta<typeof Button> = {
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
		},
		size: {
			control: 'select',
			options: SIZE_OPTIONS,
		},
		unstyled: {
			control: 'boolean',
			description: 'Inherited from `BoxProps`. When true, every `styles(selector)` call `Button` makes (`root`, `inner`, `label`, and `icon` when `loading`) returns an empty class name instead of its `inkq-button*` base class — see the `Unstyled` story.',
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
type Story = StoryObj<typeof Button>

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

// export const LongText: Story = {
// 	args: { children: 'This is a button with an unusually long label to test text wrapping and truncation behavior' },
// 	parameters: { layout: 'padded' },
// }

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

// `unstyled` strips the base `inkq-*` class `useStyles`/`getClassName.tsx`
// would otherwise apply to EVERY selector this component styles (`root`,
// `inner`, `label`) — not just the root element — since `check.isUnstyled` is
// derived once from `props.unstyled` and reused across every `styles(...)`
// call `Button` makes. Verified against `Button.tsx`'s own render: root is
// the `<button>` itself (`inkq-button`), wrapping an inner `<span>`
// (`inkq-button__inner`) that wraps a label `<span>` (`inkq-button__label`).
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

		await expect(isStyled).toHaveClass('inkq-button')
		await expect(isUnstyled).not.toHaveClass('inkq-button')

		const styledInner = isStyled.querySelector('span'),
			unstyledInner = isUnstyled.querySelector('span')

		await expect(styledInner).toHaveClass('inkq-button__inner')
		await expect(unstyledInner).not.toHaveClass('inkq-button__inner')

		const styledLabel = styledInner?.querySelector('span'),
			unstyledLabel = unstyledInner?.querySelector('span')

		await expect(styledLabel).toHaveClass('inkq-button__label')
		await expect(unstyledLabel).not.toHaveClass('inkq-button__label')
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
