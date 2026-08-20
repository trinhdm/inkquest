import { Box, type BoxProps } from './Box'
import { expect, fn, userEvent, within } from 'storybook/test'
import type { PolymorphicProps } from './Polymorphic'
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

// `Box` is built via the raw `toPolymorphic()` helper (not the higher-level
// `polymorphic()` factory that `Button`/etc. use), whose generic `C` type
// parameter has NO default — only the constraint `ValidElement = keyof
// JSX.IntrinsicElements | JSXElementConstructor<any>`. That means
// `ComponentProps<typeof Box>` (what `Meta<typeof Box>`/`StoryObj<typeof Box>`
// resolve to under the hood) would fall back to substituting that huge
// constraint, producing an unusable/likely-intractable union across every
// HTML tag. So — per this component's own polymorphic shape — type directly
// against `PolymorphicProps<'div', BoxProps>` (the concrete instantiation
// `Box.tsx` itself renders as by default via `as || 'div'`) instead.
type BoxDivProps = PolymorphicProps<'div', BoxProps>

// Only needed for the two native-`<button>` interaction stories below, where
// `as="button"` is fixed for real native click/keyboard semantics — kept
// separate from `BoxDivProps` since `as` is typed as an exact literal per
// instantiation (`AsTag<'div', BoxProps>` vs `AsTag<'button', BoxProps>`).
type BoxButtonProps = PolymorphicProps<'button', BoxProps>

const BOOLEAN_OPTIONS = [true, false] as const

const demoStyle = { border: '1px dashed currentColor', borderRadius: 4, padding: '12px 16px' }

const meta: Meta<BoxDivProps> = {
	component: Box,
	title: 'Core/Box',
	argTypes: {
		as: {
			control: 'text',
			description: 'Polymorphic tag or component `Box` renders as (defaults to `"div"`). See the `As` story for a demo across multiple tags.',
		},
		unstyled: {
			control: 'boolean',
			description: 'Declared on the shared `SpecStructure` type, but currently destructured out of `Box`\'s render and never read or forwarded anywhere — has no visible effect on either the DOM or styling. See the `Unstyled` story.',
		},
		attributes: {
			control: 'object',
			description: 'Structured `{ aria?, data? }` bag. Keys are prefixed onto the rendered element as `aria-*`/`data-*` attributes. See the `Attributes` story.',
		},
		classNames: {
			control: 'text',
			description: 'clsx-style `ClassValue`, merged with the native `className` prop (`clsx(classNames, className)`) onto the rendered element. See the `ClassNames` story.',
		},
		styles: {
			control: 'object',
			description: 'Merged with the native `style` prop (`{ ...style, ...styles }`) onto the rendered element.',
		},
		tokens: {
			control: false,
			description: 'Declared on the shared `SpecStructure` type but not destructured/read anywhere in `Box`\'s render — falls through to `...rest` and would be spread onto the DOM element as a literal `tokens` attribute if passed. Not a working prop on `Box`.',
		},
		variant: {
			control: false,
			description: 'Declared on the shared `SpecStructure` type but not destructured/read anywhere in `Box`\'s render — falls through to `...rest` and would be spread onto the DOM element as a literal `variant` attribute if passed. Not a working prop on `Box`.',
		},
	},
	args: {
		children: 'Box content',
		style: demoStyle,
	},
}

export default meta
type Story = StoryObj<BoxDivProps>

export const Default: Story = {}

// `unstyled` is declared on `BoxProps`/`SpecStructure` and destructured in
// `Box.tsx`, but the destructured value is never read again afterwards — it
// has no visible DOM/style consequence today. Both groups below render
// identically; that's the honest current behavior, not an oversight in this
// story.
export const Unstyled: Story = {
	parameters: { controls: { exclude: ['unstyled'] } },
	render: (args) => (
		<Row>
			{ BOOLEAN_OPTIONS.map(unstyled => (
				<Group key={ String(unstyled) } label={ String(unstyled) }>
					<Box { ...args } unstyled={ unstyled } />
				</Group>
			)) }
		</Row>
	),
}

export const As: Story = {
	parameters: { layout: 'padded' },
	render: () => (
		<Row>
			<Group label="div">
				<Box style={ demoStyle }>div content</Box>
			</Group>
			<Group label="span">
				<Box as="span" style={ demoStyle }>span content</Box>
			</Group>
			<Group label='a (href)'>
				<Box as="a" href="#" style={ demoStyle }>a content</Box>
			</Group>
			<Group label='a (no href)'>
				<Box as="a" style={ demoStyle }>a content</Box>
			</Group>
		</Row>
	),
}

export const LongText: Story = {
	parameters: { layout: 'padded' },
	args: {
		children: 'This is an unusually long piece of content rendered inside a Box, used to verify that text wraps naturally within the element instead of overflowing or being clipped by any default styling.',
		style: { ...demoStyle, maxWidth: 320 },
	},
}

export const NoChildren: Story = {
	args: {
		children: undefined,
		style: { ...demoStyle, minWidth: 120, minHeight: 40 },
	},
}

export const Attributes: Story = {
	args: {
		children: 'Box with aria/data attributes',
		attributes: {
			aria: { label: 'Custom accessible label' },
			data: { testid: 'box-attributes-demo' },
		},
	},
	play: async ({ canvasElement }) => {
		// Verifying `attributes.aria`/`attributes.data` -> `aria-*`/`data-*`
		// prefixing directly on the DOM: a plain `<div>` carries no implicit
		// ARIA role, so there's nothing meaningful to query by role here.
		const box = canvasElement.querySelector('[data-testid="box-attributes-demo"]')

		await expect(box).toBeInTheDocument()
		await expect(box).toHaveAttribute('aria-label', 'Custom accessible label')
	},
}

export const ClassNames: Story = {
	args: {
		children: 'Box with merged class names',
		className: 'from-classname',
		classNames: ['from-classnames', { 'conditional-classname': true }],
		attributes: { data: { testid: 'box-classnames-demo' } },
		style: demoStyle,
	},
	play: async ({ canvasElement }) => {
		const box = canvasElement.querySelector('[data-testid="box-classnames-demo"]')

		await expect(box).toBeInTheDocument()
		await expect(box).toHaveClass('from-classname')
		await expect(box).toHaveClass('from-classnames')
		await expect(box).toHaveClass('conditional-classname')
	},
}

export const ClickableInteraction: StoryObj<BoxButtonProps> = {
	args: {
		as: 'button',
		children: 'Click me',
		onClick: fn(),
	},
	play: async ({ args, canvasElement }) => {
		const canvas = within(canvasElement),
			button = canvas.getByRole('button')

		await expect(button).toBeInTheDocument()

		await userEvent.click(button)
		await expect(args.onClick).toHaveBeenCalledOnce()

		await userEvent.click(button)
		await expect(args.onClick).toHaveBeenCalledTimes(2)
	},
}

export const KeyboardInteraction: StoryObj<BoxButtonProps> = {
	args: {
		as: 'button',
		children: 'Click me',
		onClick: fn(),
	},
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
	},
}
