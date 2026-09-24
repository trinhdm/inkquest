import { expect, fn, userEvent, within } from 'storybook/test'
import { Badge } from '@/components/core'
import { Box } from './Box'
import { DEFAULT_TAG } from '@/lib/component'
import type { ElementType, ReactNode } from 'react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const Row = ({ children }: { children: ReactNode }) => (
	<div style={ { display: 'flex', gap: 24, flexWrap: 'wrap' } }>
		{ children }
	</div>
)

const Group = ({ label, children }: { label: string, children: ReactNode }) => (
	<div style={ { display: 'flex', flexDirection: 'column', gap: 8 } }>
		<span style={ { font: 'var(--inkq-text-control)', letterSpacing: '.15em', textTransform: 'uppercase', opacity: 0.6 } }>
			{ label }
		</span>
		<div style={ { display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' } }>
			{ children }
		</div>
	</div>
)

//	`BoxComponentProps` reads the real, wrapped prop type straight off `Box`
//  itself - for a given tag `C`, defaulting to `div` (`DEFAULT_TAG`)
//	this is because `Box` is built via the `definePolymorphic()` helper
//	(and not the higher-level `polymorphic()` factory that `Button`/etc. use)
type BoxComponentProps<C extends ElementType | undefined = typeof DEFAULT_TAG> =
	Parameters<typeof Box<C>>[0]

// for the two native-`<button>` interaction stories below,
// where `as="button"` is fixed for real native click/keyboard semantics
type BoxButtonProps =
	BoxComponentProps<'button'>

const BOOLEAN_OPTIONS = [true, false] as const

const demoStyle = { border: '1px dashed currentColor', borderRadius: 4, padding: '12px 16px' }

const meta: Meta<BoxComponentProps> = {
	component: Box,
	title: 'Polymorphic/Box',
	argTypes: {
		as: {
			control: 'text',
			description: 'Polymorphic tag or component `Box` renders as (defaults to `"div"`). See the `As` story for a demo across multiple tags.',
		},
		unstyled: {
			control: 'boolean',
			description: 'Declared on `Box`\'s own `BoxProps` (and the shared `SpecsContract` type) and destructured out of `Box`\'s render, so it never lands on the DOM as a literal attribute. Its value IS read before that destructure, inside `resolveProps` -> `buildAttributes` (`Box/utils/buildAttributes.ts`): `keepStateAttrs` uses it, together with `STATE_KEYS`/`DISABLEABLE_TAGS`, to decide whether `attributes.data` entries survive — when `true`, only interaction-state keys (`busy`, `checked`, `disabled`, etc.) are kept. See the `Unstyled` and `UnstyledDisableableTag` stories. It\'s also forwarded straight through to the `as` target itself, but only when that target carries `POLYMORPHIC_MARKER` (i.e. was built via `createFactory`/`polymorphic()`, like `Badge`) — a plain tag or an unmarked component never receives it. See the `UnstyledForwarding` story.',
		},
		attributes: {
			control: 'object',
			description: 'Structured `{ aria?, data? }` bag. Keys are prefixed onto the rendered element as `aria-*`/`data-*` attributes. See the `Attributes` story.',
		},
		classNames: {
			control: 'text',
			description: 'Plain `string`, merged with the native `className` prop via `clsx(className, classNames)` inside `resolveProps` (`styleProps`\'s `mergeStyleAliases`) before the result is spread onto the rendered element (`clsx` accepts a bare string fine — it isn\'t doing any conditional/array composition here). See the `ClassNames` story.',
		},
		styles: {
			control: 'object',
			description: 'Merged with the native `style` prop (`{ ...style, ...styles }`) inside `resolveProps` (`styleProps`\'s `mergeStyleAliases`) before the result is spread onto the rendered element.',
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
type Story = StoryObj<BoxComponentProps>

export const Default: Story = {}

// `unstyled` is declared on `BoxProps`/`SpecsContract` and destructured out
// of `Box`'s render, so it never lands on the DOM as a literal attribute —
// but its raw value IS read earlier, inside `resolveProps` -> `buildAttributes`
// (`Box/utils/buildAttributes.ts`)'s `keepStateAttrs`, to decide whether
// `attributes.data` entries survive: when `unstyled` is true, only
// interaction-state keys (`STATE_KEYS`: `busy`, `checked`, `disabled`,
// `expanded`, `invalid`, `loading`, `pressed`, `readonly`, `required`,
// `selected`) are kept — any other `data-*` key (like the non-state `demo`
// key used below) is stripped entirely. See `UnstyledDisableableTag` for the
// `disabled`-specific carve-out within that same filter.
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

// `keepStateAttrs` keeps `disabled` inside `attributes.data` even when
// `unstyled` is true (it's a `STATE_KEYS` member) — UNLESS the rendered tag
// is itself disableable (`DISABLEABLE_TAGS`, e.g. `"button"`) and that data
// value is truthy, in which case it's dropped specifically (`buildAttributes`'s
// `if (key === 'disabled' && check.isDisabled) return false`), because
// `getNativeAttrs` already adds a real native `disabled` attribute for that
// case regardless of `unstyled`. So: native `disabled` is present on BOTH
// instances below, but `data-disabled` only survives on the styled one.
export const UnstyledDisableableTag: StoryObj<BoxButtonProps> = {
	parameters: { controls: { exclude: ['unstyled'] } },
	args: {
		as: 'button',
		children: 'Disableable',
		attributes: { data: { disabled: true } },
	},
	render: (args) => (
		<Row>
			{ BOOLEAN_OPTIONS.map(unstyled => (
				<Group key={ String(unstyled) } label={ String(unstyled) }>
					<Box
						{ ...args }
						unstyled={ unstyled }
						id={ `unstyled-disableable-${ unstyled }` }
					/>
				</Group>
			)) }
		</Row>
	),
	play: async ({ canvasElement }) => {
		const unstyledButton = canvasElement.querySelector('#unstyled-disableable-true'),
			styledButton = canvasElement.querySelector('#unstyled-disableable-false')

		await expect(unstyledButton).toBeInTheDocument()
		await expect(styledButton).toBeInTheDocument()

		await expect(unstyledButton).toHaveAttribute('disabled')
		await expect(styledButton).toHaveAttribute('disabled')

		// Reflected as a VALUELESS attribute (`data-disabled=""`), not `"true"`
		// — matches `Box.test.tsx`'s own assertion.
		await expect(styledButton).toHaveAttribute('data-disabled', '')
		await expect(unstyledButton).not.toHaveAttribute('data-disabled')
	},
}

// `Box.tsx` forwards its own `unstyled` prop straight through to the `as`
// target, but ONLY when that target carries `POLYMORPHIC_MARKER`
// (`isPolymorphic`'s `typeof target !== 'string' && POLYMORPHIC_MARKER in
// target`) — i.e. it was built via `createFactory`/`polymorphic()`, like
// `Badge`. A plain intrinsic tag (`"span"` here) is a string, so
// `isPolymorphic` is false and `unstyled` is never passed to it at all.
export const UnstyledForwarding: Story = {
	parameters: { layout: 'padded' },
	render: () => (
		<Row>
			<Group label="as={Badge} (marked target)">
				<Box as={ Badge } unstyled id="unstyled-forwarding-badge">
					Badge content
				</Box>
			</Group>
			<Group label='as="span" (plain tag)'>
				<Box as="span" unstyled id="unstyled-forwarding-span" style={ demoStyle }>
					span content
				</Box>
			</Group>
		</Row>
	),
	play: async ({ canvasElement }) => {
		const badgeRoot = canvasElement.querySelector('#unstyled-forwarding-badge'),
			span = canvasElement.querySelector('#unstyled-forwarding-span')

		await expect(badgeRoot).toBeInTheDocument()
		await expect(span).toBeInTheDocument()

		// Badge's own base class (`inkq-badge`) is always emitted regardless of
		// `unstyled` (`getClassName.tsx`); only the CSS-module-hashed class
		// alongside it is suppressed, and only because `unstyled` actually
		// reached Badge's own `useStyles` call here. `getConfigClasses` still
		// runs regardless of `unstyled`, but Badge's default args (`fullWidth:
		// false`) produce no `global`/`module` modifier class to confuse this
		// check with, unlike `Button`'s default `size` — see `Button.stories.tsx`'s
		// `Unstyled` story for that caveat.
		const hasModuleClass = (el: Element, base: string) =>
			Array.from(el.classList).some(c => c !== base && !c.startsWith(`${ base }--`))

		await expect(badgeRoot).toHaveClass('inkq-badge')
		expect(hasModuleClass(badgeRoot!, 'inkq-badge')).toBe(false)

		// `span` never receives `unstyled` at all (it's a plain tag, not a
		// POLYMORPHIC_MARKER-carrying component), so there's no styling system
		// on it for `unstyled` to affect either way. The only thing verifiable
		// here is that `Box` doesn't leak its own internal `unstyled` prop onto
		// the DOM as a stray literal attribute (true for any `as` target, since
		// `Box` always destructures it out of its own render before spreading).
		await expect(span).not.toHaveAttribute('unstyled')
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
