import { expect, fn, userEvent, within } from 'storybook/test'
import { getDefaultProps } from '@/hooks/useProps'
import { Button } from './Button'
import { Icon } from '../Icon'
import {
	BOOLEAN_OPTIONS, FONT_SIZE_BY_SIZE, ICON_SIZE_BY_SIZE,
	PADDING_BY_SIZE, PRIORITY_OPTIONS, SIZE_OPTIONS,
	TONE_OPTIONS, TRACKING_BY_SIZE, VARIANT_OPTIONS,
} from './options.story'
import type { ReactNode } from 'react'
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

// `Button.Props` (the `declare namespace` export) is just the RAW
// `ButtonProps` interface — it does NOT include `as`/`children`/`unstyled`/
// `attributes`/etc., which only exist on the actual accepted prop type,
// `PolymorphicProps<ButtonProps, C>`. `Parameters<typeof Button>[0]` reads
// that real, wrapped type straight off the component itself (no
// hand-typing/drift risk) — the generic call signature's default `C`
// resolves to `'button'` here, since `ButtonSpecs`'s `defaults.as` is
// `'button'`.
type ButtonStoryProps = Parameters<typeof Button>[0]

// Still `BoxProps & (LinkButtonProps | NativeButtonProps) & {...}` under the
// hood — same conditional-interface shape `Button.tsx` itself narrows via
// `others as Extract<typeof others, LinkButtonProps>`. These stories only ever
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
			description: 'The SHAPE axis only — `solid`/`outline`/`ghost`/`light`/`dark`/`text`. Semantic colours (`danger`, `warning`, `success`, `info`) are NOT variants; they are `tone` values, and the two props are fully orthogonal. `Button.tsx` reflects each on its own data attribute (`data = { variant, tone, priority, ... }`), so a red outline button is `variant="outline" tone="danger"`, which renders `data-variant="outline" data-tone="danger"` — not `variant="danger"`. Registered as a default (`DEFAULT_PROPS` in `Button.tsx`, `variant: \'solid\'`), so `data-variant` is always present. See the `Variants` story.',
		},
		tone: {
			control: 'select',
			options: TONE_OPTIONS,
			description: 'The semantic COLOUR axis, orthogonal to `variant` (see above) — reflected verbatim as `data-tone`. Unlike `variant`, this is NOT in `Button.tsx`\'s `DEFAULT_PROPS`, so `data-tone` is omitted entirely unless a tone is passed (`prefixAttributes` drops keys that fail `hasValue`, exactly as it does for `priority`). Decorative rather than functional, so `unstyled` strips it — `data-tone` is absent from `buildAttributes`\' `STATE_KEYS` allowlist, alongside `variant`/`priority`/`block`. See the `Tones` story.',
		},
		priority: {
			control: 'select',
			options: PRIORITY_OPTIONS,
			description: 'Also inheritable from an enclosing `Button.Group`: when the group has `hasPriority` set, it publishes a derived `priority` through `ButtonGroupProvider`, and this Button fills its own `priority` from it ONLY when `priority` is entirely absent from this Button\'s own raw props (`useButtonGroupProps`\' `Object.hasOwn` guard on the raw props, skipping `undefined` context values) — an explicit `priority` on the Button itself always wins. See `Button.Group`\'s `HasPriority` story.',
		},
		size: {
			control: 'select',
			options: SIZE_OPTIONS,
			description: 'Sizing is token-driven: `size` adds NO modifier class and NO `data-size` attribute. The `tokens` function in `Button.tsx` turns it into inline CSS custom properties — `--button-font-size`, `--button-icon-size` and `--button-tracking` on the root element, and `--button-padding` on the inner element — which `Button.module.scss` reads (with fallbacks). Registered default is `md` (`DEFAULT_PROPS` in `Button.tsx`). `unstyled` skips these inline tokens. Also inheritable from an enclosing `Button.Group` (own prop wins). See the `Sizes` story.',
		},
		disabled: {
			control: 'boolean',
			description: 'Also inheritable from an enclosing `Button.Group`, via `ButtonGroupProvider` / `useButtonGroupProps`: the group\'s own `disabled` fills this Button\'s `disabled` ONLY when the key is absent from this Button\'s own raw props — an own prop, including an explicit `disabled={false}` inside a disabled group, always wins. See the `DisabledState` story, and `Button.Group`\'s `Disabled`/`ChildOverrides` stories.',
		},
		loading: {
			control: 'boolean',
			description: 'Also inheritable from an enclosing `Button.Group`, via the same `ButtonGroupProvider` / `useButtonGroupProps` own-prop-wins precedence as `disabled`. See the `LoadingState` story, and `Button.Group`\'s `Loading`/`ChildOverrides` stories.',
		},
		unstyled: {
			control: 'boolean',
			description: 'Part of the shared `FactoryContract` (`unstyled` on `_PolymorphicContract`), not `Button`\'s own `ButtonProps`. The semantic base class (`inkq-button`, `inkq-button__inner`, `inkq-button__label`, and `inkq-button__loader` while loading) is emitted regardless of this prop (an inherited semantic `className` could replace it). `unstyled` drops the CSS-module-hashed class for every selector this component styles (`root`, `inner`, `label`, `loader`), the config classes (the global `inkq-block` from `fullWidth` and `inkq-loader` on the loader, since `getConfigClasses` returns early), and the inline size tokens (`getStyle` returns early). `Button` also forwards `unstyled` to its root `Box`, which strips the non-state `data-*` attributes (`data-variant`, `data-tone`, `data-priority`, `data-block`) while keeping the state ones (`data-disabled` is dropped on a native `<button>`, which has real `disabled`) — see the `Unstyled` story. Also inheritable from an enclosing `Button.Group`, via the same `ButtonGroupProvider` / `useButtonGroupProps` own-prop-wins precedence as `disabled`/`loading`/`priority`.',
		},
		showLabel: {
			control: 'boolean',
			description: 'Gates whether an `aria-label` is emitted at all: `Button.tsx` derives `ariaLabel` from `extractText(children)` (`@/lib/component/children`), then only sets `aria-label` when `!!(showLabel && ariaLabel.length)` — an undefined/falsy `showLabel` (the default; not registered via `Button.set({ defaultProps: DEFAULT_PROPS, displayName: NAME, subcomponents: SUBCOMPONENTS })`) means NO `aria-label` is ever emitted, regardless of children content. See the `ShowLabel` story, and `AriaLabel` (which sets `showLabel` explicitly to exercise the text-extraction logic itself).',
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
	render: args => (
		<Row>
			{ VARIANT_OPTIONS.map(variant => (
				<Group key={ variant } label={ variant }>
					<Button { ...args as NativeButtonArgs } variant={ variant } />
				</Group>
			)) }
		</Row>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			buttons = canvas.getAllByRole('button')

		expect(buttons).toHaveLength(VARIANT_OPTIONS.length)

		// Guards `VARIANT_OPTIONS` against regaining the tone names that used
		// to sit commented out inside it (see `options.story.ts`): a tone
		// leaking back into this list would render `data-variant="danger"`,
		// which `Variant` does not describe.
		for (const [i, variant] of VARIANT_OPTIONS.entries())
			await expect(buttons[i]).toHaveAttribute('data-variant', variant)
	},
}

export const Tones: Story = {
	render: args => (
		<Row>
			{ TONE_OPTIONS.map(tone => (
				<Group key={ tone } label={ tone }>
					<Button { ...args as NativeButtonArgs } tone={ tone } />
				</Group>
			)) }
		</Row>
	),
	play: async ({ args, canvasElement }) => {
		const canvas = within(canvasElement),
			buttons = canvas.getAllByRole('button')

		expect(buttons).toHaveLength(TONE_OPTIONS.length)

		for (const [i, tone] of TONE_OPTIONS.entries()) {
			await expect(buttons[i]).toHaveAttribute('data-tone', tone)

			// The orthogonality itself: every tone renders under the SAME,
			// unchanged `variant`, on its own separate attribute. Read off
			// `args` rather than a literal 'solid' so switching the `variant`
			// control still holds (the per-button `tone` is what this story
			// varies, and it never feeds `data-variant`).
			await expect(buttons[i]).toHaveAttribute('data-variant', `${args.variant}`)
		}
	},
}

export const Priorities: Story = {
	render: args => (
		<Row>
			{ PRIORITY_OPTIONS.map(priority => (
				<Group key={ priority } label={ priority }>
					<Button { ...args as NativeButtonArgs } priority={ priority } />
				</Group>
			)) }
		</Row>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			buttons = canvas.getAllByRole('button')

		await expect(buttons).toHaveLength(PRIORITY_OPTIONS.length)

		// Each button carries its own `data-priority` (exact-value match) and
		// none of its siblings' values.
		for (const [i, priority] of PRIORITY_OPTIONS.entries()) {
			await expect(buttons[i]).toHaveAttribute('data-priority', priority)

			for (const other of PRIORITY_OPTIONS.filter(p => p !== priority))
				await expect(buttons[i]).not.toHaveAttribute('data-priority', other)
		}
	},
}

export const Sizes: Story = {
	render: args => (
		<Row>
			{ SIZE_OPTIONS.map(size => (
				<Group key={ size } label={ size }>
					<Button { ...args as NativeButtonArgs } size={ size } />
				</Group>
			)) }
		</Row>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			buttons = canvas.getAllByRole('button')

		expect(buttons).toHaveLength(SIZE_OPTIONS.length)

		// `size` has no modifier class and no data attribute — it only shows up
		// as inline tokens: three on the root, `--button-padding` on the inner.
		const readTokens = (button: HTMLElement) => {
			const inner = button.querySelector('.inkq-button__inner') as HTMLElement

			return {
				fontSize: button.style.getPropertyValue('--button-font-size'),
				iconSize: button.style.getPropertyValue('--button-icon-size'),
				padding: inner.style.getPropertyValue('--button-padding'),
				tracking: button.style.getPropertyValue('--button-tracking'),
			}
		}

		const actual = buttons.map(readTokens)

		for (const [i, size] of SIZE_OPTIONS.entries()) {
			await expect(buttons[i]).not.toHaveAttribute('data-size')

			for (const other of SIZE_OPTIONS)
				await expect(buttons[i]).not.toHaveClass(`inkq-button--${other}`)

			// This size's own token values...
			await expect(actual[i]).toEqual({
				fontSize: FONT_SIZE_BY_SIZE[size],
				iconSize: ICON_SIZE_BY_SIZE[size],
				padding: PADDING_BY_SIZE[size],
				tracking: TRACKING_BY_SIZE[size],
			})

			// ...and they differ from every other size's. Compared as whole
			// objects, since `md` and `lg` share one font size.
			for (const [j, other] of SIZE_OPTIONS.entries()) {
				if (other !== size) await expect(actual[i]).not.toEqual(actual[j])
			}
		}

		// Padding, icon size and tracking are unique per size, so each of them
		// tells the three sizes apart on its own.
		for (const key of ['iconSize', 'padding', 'tracking'] as const)
			await expect(new Set(actual.map(tokens => tokens[key])).size).toBe(SIZE_OPTIONS.length)
	},
}

// `fullWidth` maps to two independent things on the root `<button>`: a
// `data-block` attribute (`data = { block: !!fullWidth || null, ... }`,
// `hasValue` drops the `null` case entirely when `false`) AND a literal,
// unhashed `inkq-block` class (`clsx = { global: { block: fullWidth }, ... }`
// fed into `styles('root', clsx)` — `getClassName.tsx`'s `global` config key
// formats the modifier as a plain prefixed class, `${prefix}-${mod}`, with no
// matching rule in `Button.module.scss` to hash against, so it always stays
// literal).
export const FullWidth: Story = {
	parameters: {
		layout: 'padded',
		controls: { exclude: ['fullWidth'] },
	},
	// Each button sits in a block wrapper (`data-width-container`) with a fixed
	// 400px width, so its content width is known for the stretch check below.
	render: args => (
		<div style={ { display: 'flex', flexDirection: 'column', gap: 24 } }>
			{ BOOLEAN_OPTIONS.map(fullWidth => (
				<Group key={ String(fullWidth) } label={ String(fullWidth) }>
					<div data-width-container style={ { width: 400 } }>
						<Button { ...args as NativeButtonArgs } fullWidth={ fullWidth } />
					</div>
				</Group>
			)) }
		</div>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			buttons = canvas.getAllByRole('button')

		expect(buttons).toHaveLength(2)

		const [isFullWidth, isNotFullWidth] = buttons

		// `.inkq-block` (`_base.scss`) makes the button a block, and
		// `Button.module.scss` only applies `width: fit-content` under
		// `&:not([data-block])`, so the `true` button stretches to its
		// container's width while the `false` one stays at its content width.
		const containerWidth = (el: HTMLElement) =>
			el.closest<HTMLElement>('[data-width-container]')!.getBoundingClientRect().width

		const fullRect = isFullWidth.getBoundingClientRect().width,
			naturalRect = isNotFullWidth.getBoundingClientRect().width

		expect(Math.abs(fullRect - containerWidth(isFullWidth))).toBeLessThanOrEqual(1)
		expect(naturalRect).toBeLessThan(containerWidth(isNotFullWidth) - 1)
		expect(naturalRect).toBeLessThan(fullRect)

		await expect(isFullWidth).toHaveAttribute('data-block')
		await expect(isFullWidth).toHaveClass('inkq-block')

		await expect(isNotFullWidth).not.toHaveAttribute('data-block')
		await expect(isNotFullWidth).not.toHaveClass('inkq-block')
	},
}

export const AsLink: Story = {
	parameters: { layout: 'padded' },
	render: () => (
		<div style={ { display: 'flex', flexDirection: 'column', gap: 24 } }>
			<Row>
				<Group label="href">
					<Button href="#">Internal link</Button>
				</Group>
				<Group label='as="a" (no href)'>
					<Button as="a">Anchor without href</Button>
				</Group>
				<Group label="disabled">
					<Button href="#" disabled>Disabled link</Button>
				</Group>
				<Group label="loading">
					<Button href="#" loading>Loading link</Button>
				</Group>
			</Row>
			<Row>
				<Group label="external http(s) href">
					<Button href="https://example.com">External link</Button>
				</Group>
				<Group label="non-http scheme (mailto:)">
					<Button href="mailto:hello@example.com">Mail link</Button>
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
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			anchorOf = (text: string) => canvas.getByText(text).closest('a') as HTMLAnchorElement

		// A `href` makes `Button.tsx` render the `next/link` branch: a real
		// `<a>` carrying the `href`.
		const internal = anchorOf('Internal link')
		await expect(internal.tagName).toBe('A')
		await expect(internal).toHaveAttribute('href', '#')

		// `isExternalLink` (`@/utils/helpers`) is false for hashes and for
		// non-http schemes, so neither gets `target`/`rel`.
		await expect(internal).not.toHaveAttribute('target')
		await expect(internal).not.toHaveAttribute('rel')

		const mail = anchorOf('Mail link')
		await expect(mail).toHaveAttribute('href', 'mailto:hello@example.com')
		await expect(mail).not.toHaveAttribute('target')
		await expect(mail).not.toHaveAttribute('rel')

		// An external http(s) host gets `target="_blank"` and
		// `rel="noopener noreferrer"` added by `Button.tsx`.
		const external = anchorOf('External link')
		await expect(external).toHaveAttribute('href', 'https://example.com')
		await expect(external).toHaveAttribute('target', '_blank')
		await expect(external).toHaveAttribute('rel', 'noopener noreferrer')

		// `as="a"` without `href` skips the link branch: an anchor tag, but
		// not a real link.
		const bare = anchorOf('Anchor without href')
		await expect(bare.tagName).toBe('A')
		await expect(bare).not.toHaveAttribute('href')

		// `disabled`/`loading` on a link button are reflected as data
		// attributes only (the siblings stay free of them).
		const disabled = anchorOf('Disabled link'),
			loading = anchorOf('Loading link')

		await expect(disabled).toHaveAttribute('data-disabled')
		await expect(disabled).not.toHaveAttribute('data-loading')
		await expect(loading).toHaveAttribute('data-loading')
		await expect(loading).not.toHaveAttribute('data-disabled')
		await expect(internal).not.toHaveAttribute('data-disabled')
		await expect(internal).not.toHaveAttribute('data-loading')
	},
}

// `extractText` (`@/lib/component/children`, called from `Button.tsx`) walks
// `Button`'s own `children` and recurses into ANY child element that has a
// `children` prop — including a `Button.Section` — accumulating string/number
// leaves into the derived `ariaLabel`. An icon-only `Button.Section`
// contributes nothing (`Icon` has no `children` prop to recurse into), so the
// label stays empty. Either
// way, none of this even reaches the DOM unless `showLabel` is also truthy
// (`aria = { label: !!(showLabel && ariaLabel.length) ? ariaLabel :
// undefined }`) — see the `ShowLabel` story for that gate in isolation; this
// story fixes `showLabel: true` on every group to exercise the text
// extraction itself.
export const AriaLabel: Story = {
	render: args => (
		<Row>
			<Group label="plain text">
				<Button { ...args as NativeButtonArgs } showLabel>Save changes</Button>
			</Group>
			<Group label="text split across a Button.Section child">
				<Button { ...args as NativeButtonArgs } showLabel>
					<Button.Section left>Confirm</Button.Section>
					{ ' and continue' }
				</Button>
			</Group>
			<Group label="icon-only (no aria-label)">
				<Button { ...args as NativeButtonArgs } showLabel>
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

// `showLabel` itself gates whether `aria-label` is emitted at all, entirely
// independent of whether `children` actually has extractable text — with
// identical `children` in both groups, only the `showLabel` group gets an
// `aria-label`.
export const ShowLabel: Story = {
	parameters: { controls: { exclude: ['showLabel'] } },
	render: args => (
		<Row>
			{ BOOLEAN_OPTIONS.map(showLabel => (
				<Group key={ String(showLabel) } label={ String(showLabel) }>
					<Button { ...args as NativeButtonArgs } showLabel={ showLabel }>Save changes</Button>
				</Group>
			)) }
		</Row>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			buttons = canvas.getAllByRole('button')

		expect(buttons).toHaveLength(2)

		const [withLabel, withoutLabel] = buttons

		await expect(withLabel).toHaveAttribute('aria-label', 'Save changes')
		await expect(withoutLabel).not.toHaveAttribute('aria-label')
	},
}

// `loading` does two things: a valueless `data-loading` attribute on the root,
// and a `loader` part — a spinner icon rendered inside the inner element
// (`styles('loader', true)` in `Button.tsx`), carrying the semantic
// `inkq-button__loader` class plus the global `inkq-loader` class. Neither
// exists when `loading` is false.
export const LoadingState: Story = {
	parameters: { controls: { exclude: ['loading'] } },
	render: args => (
		<Row>
			{ BOOLEAN_OPTIONS.map(loading => (
				<Group key={ String(loading) } label={ String(loading) }>
					<Button { ...args as NativeButtonArgs } loading={ loading } />
				</Group>
			)) }
		</Row>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			buttons = canvas.getAllByRole('button')

		expect(buttons).toHaveLength(2)

		// `BOOLEAN_OPTIONS` is `[true, false]`, matching the render order above.
		const [isLoading, isNotLoading] = buttons

		await expect(isLoading).toHaveAttribute('data-loading', '')
		await expect(isNotLoading).not.toHaveAttribute('data-loading')

		await expect(isLoading.querySelectorAll('.inkq-button__loader')).toHaveLength(1)
		const loader = isLoading.querySelector('.inkq-button__loader')
		await expect(loader).toBeInTheDocument()
		await expect(loader).toHaveClass('inkq-loader')

		await expect(isNotLoading.querySelector('.inkq-button__loader')).not.toBeInTheDocument()
		await expect(isNotLoading.querySelector('.inkq-loader')).not.toBeInTheDocument()
	},
}

export const DisabledState: Story = {
	parameters: { controls: { exclude: ['disabled'] } },
	render: args => (
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
// `getClassName.tsx`, the first `classList` entry (`namespace ?? baseName`)
// is not gated on `check.isUnstyled`. It suppresses the CSS-module-hashed
// class normally appended alongside it (`styleName`, from `classes`),
// for every selector this component styles (`root`, `inner`, `label`) — not
// just the root element — since `check.isUnstyled` is derived once from
// `props.unstyled` and reused across every `styles(...)` call `Button` makes.
// It also skips the inline size tokens (`getStyle.tsx` returns early when
// unstyled, so `--button-tracking` and `--button-padding` are not set).
// Verified against `Button.tsx`'s own render: root is the `<button>` itself
// (`inkq-button`), wrapping an inner `<span>` (`inkq-button__inner`) that
// wraps a label `<span>` (`inkq-button__label`).
export const Unstyled: Story = {
	parameters: { controls: { exclude: ['unstyled'] } },
	render: args => (
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
		// literal hash: any class beyond the semantic base means the hash
		// survived. `size` no longer adds a modifier class, and
		// `getConfigClasses` (`getClassName.tsx`) returns early when unstyled, so
		// no config-driven class lands on the unstyled instance either. The
		// `${base}--*` exclusion is a guard so a future modifier class is not
		// mistaken for the hash.
		const hasModuleClass = (el: Element, base: string) =>
			Array.from(el.classList).some(c => c !== base && !c.startsWith(`${base}--`))

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

		// Inline size tokens: set on the styled instance (registered default
		// `size`), skipped entirely on the unstyled one.
		await expect(isStyled.style.getPropertyValue('--button-tracking')).not.toBe('')
		await expect(styledInner!.style.getPropertyValue('--button-padding')).not.toBe('')
		await expect(isUnstyled.style.getPropertyValue('--button-tracking')).toBe('')
		await expect(unstyledInner!.style.getPropertyValue('--button-padding')).toBe('')
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
