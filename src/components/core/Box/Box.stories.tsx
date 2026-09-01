import { Box } from './Box'
import { expect, fn, userEvent, within } from 'storybook/test'
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
// `polymorphic()` factory that `Button`/etc. use): `export const Box =
// toPolymorphic<BoxProps, 'div'>(...)`. `BoxProps` itself isn't exported from
// `Box.tsx` (`interface BoxProps` has no `export`), so it can't be imported
// directly — and `ComponentProps<typeof Box>` can't capture it either, since
// `toPolymorphic`'s returned type is a generic call signature (`<C extends
// ElementType | undefined = 'div'>(props: PolymorphicProps<BoxProps, C>) =>
// ...`), not a concrete component type. `Parameters<typeof Box>[0]` reads
// that real, wrapped prop type straight off the component itself instead —
// the generic parameter's default (`= 'div'`) resolves it to
// `PolymorphicProps<BoxProps, 'div'>`, the same shape `Box.tsx` itself
// renders as by default via `as || 'div'`.
type BoxDivProps = Parameters<typeof Box>[0]

// Only needed for the two native-`<button>` interaction stories below, where
// `as="button"` is fixed for real native click/keyboard semantics — an
// explicit instantiation expression (`Box<'button'>`) picks the `'button'`
// branch of the same generic call signature instead of the `'div'` default.
type BoxButtonProps = Parameters<typeof Box<'button'>>[0]

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
			description: 'Declared on the shared `SpecsContract` type and destructured out of `Box`\'s render (so it never lands on the DOM as a literal attribute), but its value IS read — inside `handleProps`/`getAttributes`, before that destructure ever runs — to decide whether `attributes.data` entries get filtered down to only interaction-state keys (`busy`, `checked`, `disabled`, etc; see `getAttributes.ts`\'s `filterDecorative`). See the `Unstyled` story, which demonstrates that filtering with a non-state `data` key.',
		},
		attributes: {
			control: 'object',
			description: 'Structured `{ aria?, data? }` bag. Keys are prefixed onto the rendered element as `aria-*`/`data-*` attributes. See the `Attributes` story.',
		},
		classNames: {
			control: 'text',
			description: 'Plain `string`, merged with the native `className` prop via `clsx(classNames, className)` onto the rendered element (`clsx` accepts a bare string fine — it isn\'t doing any conditional/array composition here). See the `ClassNames` story.',
		},
		styles: {
			control: 'object',
			description: 'Merged with the native `style` prop (`{ ...style, ...styles }`) onto the rendered element.',
		},
		id: {
			control: 'text',
			description: 'Declared on the shared `SpecsContract` type. Not destructured/read anywhere in `Box`\'s render — falls through to `...rest` and is spread onto the DOM element as a normal native `id` attribute.',
		},
		ref: {
			control: false,
			description: 'Declared on the shared `SpecsContract` type (typed as `any` there). Not destructured/read anywhere in `Box`\'s render — falls through to `...rest` and is spread directly onto the underlying JSX element call, so it attaches as a normal DOM ref.',
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

// `unstyled` is declared on `BoxProps`/`SpecsContract` and destructured out
// of `Box`'s render, so it never lands on the DOM as a literal attribute —
// but its raw value IS read earlier, inside `handleProps`/`getAttributes`
// (`Box/utils/get-attributes.ts`'s `filterDecorative`), to decide whether
// `attributes.data` entries survive: when `unstyled` is true, only
// interaction-state keys (`busy`, `checked`, `disabled`, `expanded`,
// `invalid`, `loading`, `pressed`, `readonly`, `required`, `selected`)
// are kept — any other `data-*` key (like the non-state `demo` key used
// below) is stripped entirely.
export const Unstyled: Story = {
	parameters: { controls: { exclude: ['unstyled'] } },
	render: (args) => (
		<Row>
			{ BOOLEAN_OPTIONS.map(unstyled => (
				<Group key={ String(unstyled) } label={ String(unstyled) }>
					<Box
						{ ...args }
						unstyled={ unstyled }
						attributes={ { data: { demo: 'value' } } }
					/>
				</Group>
			)) }
		</Row>
	),
	play: async ({ canvasElement }) => {
		// The rendered `<Box style={demoStyle}>`'s dashed border is the stable
		// selector here — `data-demo` itself is exactly what `unstyled` strips
		// from the unstyled instance, so it can't be used to locate it.
		const boxes = canvasElement.querySelectorAll('[style*="dashed"]')

		await expect(boxes).toHaveLength(2)

		// `BOOLEAN_OPTIONS` is `[true, false]`, matching render/DOM order.
		const [unstyledBox, styledBox] = boxes

		await expect(styledBox).toHaveAttribute('data-demo', 'value')
		await expect(unstyledBox).not.toHaveAttribute('data-demo')
	},
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

export const NativeId: Story = {
	args: {
		children: 'Box with a native id',
		id: 'box-native-id-demo',
	},
	play: async ({ canvasElement }) => {
		const box = canvasElement.querySelector('#box-native-id-demo')

		await expect(box).toBeInTheDocument()
		await expect(box).toHaveAttribute('id', 'box-native-id-demo')
	},
}

export const ClassNames: Story = {
	args: {
		children: 'Box with merged class names',
		className: 'from-classname',
		classNames: 'from-classnames',
		attributes: { data: { testid: 'box-classnames-demo' } },
		style: demoStyle,
	},
	play: async ({ canvasElement }) => {
		const box = canvasElement.querySelector('[data-testid="box-classnames-demo"]')

		await expect(box).toBeInTheDocument()
		await expect(box).toHaveClass('from-classname')
		await expect(box).toHaveClass('from-classnames')
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
