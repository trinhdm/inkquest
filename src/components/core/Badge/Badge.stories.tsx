import { Badge } from './Badge'
import { expect, within } from 'storybook/test'
import { getDefaultProps } from '@/hooks/useProps'
import type { ReactNode } from 'react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

// `Badge.Props` (the `declare namespace` export) is just the raw `BadgeProps`
// interface — `children` IS a real, required field on it (`children:
// ReactNode`), but the export still doesn't include `as`/`unstyled`/
// `attributes`/etc., which only exist on the actual accepted prop type,
// `PolymorphicProps<BadgeProps, C>`. `Parameters<typeof Badge>[0]` reads that
// real, wrapped type straight off the component itself — the generic call
// signature's default `C` resolves to `'div'` here, since `BadgeSpecs`'s
// `defaults.as` is `'div'`.
type BadgeStoryProps = Parameters<typeof Badge>[0]

// Single source of truth for this file's option lists. `Badge` has no
// subcomponent family (unlike Button/ButtonGroup/ButtonSection), so these
// stay local instead of living in a shared `options.story.ts`.
//
// `variant` is the SHAPE axis only. The semantic colours ('success' |
// 'warning' | 'danger' | 'info') used to sit conflated inside this list —
// they are `tone` values and belong in `TONE_OPTIONS` below instead. The two
// props are orthogonal: `Badge.tsx` reflects both, as `data-variant` and
// `data-tone`.
const VARIANT_OPTIONS: readonly Badge.Variant[] = [
	'solid', 'outline', 'ghost', 'light', 'dark', 'text',
]

const TONE_OPTIONS: readonly Badge.Tone[] = [
	'neutral', 'action',
	'success', 'warning', 'danger', 'info',
]

const SHAPE_OPTIONS: readonly NonNullable<Badge.Props['shape']>[] = [
	'round', 'pill',
]

const SIZE_OPTIONS: readonly Badge.Size[] = [
	'sm', 'lg',
]

const BOOLEAN_OPTIONS = [true, false] as const

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

type Story = StoryObj<BadgeStoryProps>

const meta: Meta<BadgeStoryProps> = {
	component: Badge,
	title: 'Core/Badge',
	argTypes: {
		children: { control: 'text' },
		variant: {
			control: 'select',
			options: VARIANT_OPTIONS,
			description: 'The SHAPE axis only — `solid`/`outline`/`ghost`/`light`/`dark`/`text`. Semantic colours (`danger`, `warning`, `success`, `info`) are NOT variants; they are `tone` values, and the two props are fully orthogonal. `Badge.tsx` reflects each on its own data attribute (passed inline as `attributes={ { data: { tone, variant, block } } }`), so a red outline badge is `variant="outline" tone="danger"`, which renders `data-variant="outline" data-tone="danger"` — not `variant="danger"`. Registered as a default (`DEFAULT_PROPS` in `Badge.tsx`, `variant: \'light\'`), so `data-variant` is always present. See the `Variants` story.',
		},
		tone: {
			control: 'select',
			options: TONE_OPTIONS,
			description: 'The semantic COLOUR axis, orthogonal to `variant` (see above) — reflected verbatim as `data-tone`. Unlike `variant`, this is NOT in `Badge.tsx`\'s `DEFAULT_PROPS`, so `data-tone` is omitted entirely unless a tone is passed (`prefixAttributes` drops keys that fail `hasValue`). Decorative rather than functional, so `unstyled` strips it — `data-tone` is absent from `buildAttributes`\'s `STATE_KEYS` allowlist, alongside `variant`/`block`. See the `Tones` story.',
		},
		shape: {
			control: 'select',
			options: SHAPE_OPTIONS,
			description: 'Intended corner treatment of the badge (`round` or `pill`; registered default `pill`). **Currently has no effect**: `Badge.tsx` destructures `shape` out of its props but never uses it afterwards — no class, no data attribute, no style — so every value renders identically. See the `Shape` story.',
		},
		size: {
			control: 'select',
			options: SIZE_OPTIONS,
			description: '`size` is expressed as a `module` modifier class (via the `clsx.module` config passed to `styles(\'root\', clsx)` in `Badge.tsx`), formatted as `inkq-badge--${size}`. `Badge.module.scss` declares no matching `&--sm`/`&--lg` rule, so there is no CSS-module hash to resolve and this stays a LITERAL, unhashed class. `Badge` registers no default `size` (`DEFAULT_PROPS` in `Badge.tsx` omits it), so leaving it unset emits no size class at all. See the `Size` story.',
		},
		fullWidth: {
			control: 'boolean',
			description: 'Stretches the badge to fill its container\'s width.',
		},
		unstyled: {
			control: 'boolean',
			description: 'Part of the shared `FactoryContract` (`unstyled` on `_PolymorphicContract`), not `Badge`\'s own `BadgeProps`. The semantic base class (`inkq-badge`, `inkq-badge__inner`) is emitted regardless of this prop (an inherited semantic `className` could replace it). `unstyled` drops the CSS-module-hashed class for every `styles(selector)` call `Badge` makes (`root` and `inner`), plus the config classes (`inkq-badge--${size}` and the global `inkq-block` from `fullWidth`), since `getConfigClasses` returns early. `Badge` has no tokens. Because `unstyled` reaches `Badge`\'s root `Box` through `others`, `Box` also strips the non-state `data-*` attributes (`data-variant`, `data-tone`, `data-block`) — see the `Unstyled` story.',
		},
	},
	args: {
		...getDefaultProps<Badge.Props>('Badge'),
		children: 'Badge',
	},
}

export default meta

export const Default: Story = {}

export const Variants: Story = {
	render: (args) => (
		<Row>
			{ VARIANT_OPTIONS.map(variant => (
				<Group key={ variant } label={ variant }>
					<Badge { ...args as BadgeStoryProps } variant={ variant } />
				</Group>
			)) }
		</Row>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			badges = canvas.getAllByText('Badge')

		await expect(badges).toHaveLength(VARIANT_OPTIONS.length)

		const roots = badges.map(badge => badge.closest('[data-variant]') as HTMLElement)

		// Each root carries exactly its own group's `data-variant` value
		// (an exact-value match), and every other variant's value is
		// asserted absent as well.
		for (const [i, variant] of VARIANT_OPTIONS.entries()) {
			await expect(roots[i]).toHaveAttribute('data-variant', variant)

			for (const other of VARIANT_OPTIONS.filter(v => v !== variant))
				await expect(roots[i]).not.toHaveAttribute('data-variant', other)
		}
	},
}

// `tone` is the semantic COLOUR axis, orthogonal to `variant` (the SHAPE
// axis) — every group below renders under the SAME, unchanged `variant`,
// each carrying its own `data-tone` on top (`Badge.tsx` passes
// `tone`/`variant`/`block` inline via `attributes={ { data: {...} } }`).
export const Tones: Story = {
	render: (args) => (
		<Row>
			{ TONE_OPTIONS.map(tone => (
				<Group key={ tone } label={ tone }>
					<Badge { ...args as BadgeStoryProps } tone={ tone } />
				</Group>
			)) }
		</Row>
	),
	play: async ({ args, canvasElement }) => {
		const canvas = within(canvasElement),
			badges = canvas.getAllByText('Badge')

		await expect(badges).toHaveLength(TONE_OPTIONS.length)

		const roots = badges.map(badge => badge.closest('[data-variant]') as HTMLElement)

		for (const [i, tone] of TONE_OPTIONS.entries()) {
			await expect(roots[i]).toHaveAttribute('data-tone', tone)

			// The orthogonality itself: every tone renders under the SAME,
			// unchanged `variant`, on its own separate attribute. Read off
			// `args` rather than a literal 'light' so switching the `variant`
			// control still holds (the per-badge `tone` is what this story
			// varies, and it never feeds `data-variant`).
			await expect(roots[i]).toHaveAttribute('data-variant', `${args.variant}`)
		}
	},
}

// Shows every `shape` value side by side, but deliberately asserts nothing:
// `Badge.tsx` currently ignores `shape` (see the argType description), so
// there is no behavior to verify. Add assertions once the prop is wired up.
export const Shape: Story = {
	render: (args) => (
		<Row>
			{ SHAPE_OPTIONS.map(shape => (
				<Group key={ shape } label={ shape }>
					<Badge { ...args as BadgeStoryProps } shape={ shape } />
				</Group>
			)) }
		</Row>
	),
}

export const Size: Story = {
	render: (args) => (
		<Row>
			{ SIZE_OPTIONS.map(size => (
				<Group key={ size } label={ size }>
					<Badge { ...args as BadgeStoryProps } size={ size } />
				</Group>
			)) }
		</Row>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			badges = canvas.getAllByText('Badge')

		await expect(badges).toHaveLength(SIZE_OPTIONS.length)

		const roots = badges.map(badge => badge.closest('[data-variant]') as HTMLElement)

		// `size` resolves to a LITERAL class (`inkq-badge--${size}`), not a
		// CSS-module hash: `Badge.module.scss` declares no matching `&--sm`/
		// `&--lg` rule for `getStyleClass` (`getClassName.tsx`) to resolve
		// against, so `formatConfigClass`'s unhashed fallback
		// (`styleName ?? baseName`) is what lands. Assert BOTH halves per
		// size — this size's own class present AND the other size's class
		// absent — so the story actually discriminates between sizes.
		for (const [i, size] of SIZE_OPTIONS.entries()) {
			await expect(roots[i]).toHaveClass(`inkq-badge--${size}`)

			for (const other of SIZE_OPTIONS.filter(s => s !== size))
				await expect(roots[i]).not.toHaveClass(`inkq-badge--${other}`)
		}
	},
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
					<Badge { ...args as BadgeStoryProps } fullWidth={ fullWidth } />
				</Group>
			)) }
		</div>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			badges = canvas.getAllByText('Badge')

		await expect(badges).toHaveLength(2)

		// `fullWidth` maps to a `data-block` attribute on the root element
		// (see `Badge.tsx`'s `attributes={ { data: { block: !!fullWidth || null } } }`,
		// which `prefixAttributes` only keeps when `hasValue` passes, so `null`
		// is dropped) — the inner text node sits one
		// level down inside the `<Box as="span">` wrapper, so walk up to it.
		const [isFullWidth, isNotFullWidth] = badges.map(
			badge => badge.closest('[data-variant]') as HTMLElement
		)

		await expect(isFullWidth).toHaveAttribute('data-block')
		await expect(isNotFullWidth).not.toHaveAttribute('data-block')

		// `fullWidth` also feeds `global: { block: fullWidth }` in `Badge.tsx`'s
		// `clsx`, which `getClassName.tsx` emits as the literal global class
		// `inkq-block` (prefix + modifier), only when truthy.
		await expect(isFullWidth).toHaveClass('inkq-block')
		await expect(isNotFullWidth).not.toHaveClass('inkq-block')
	},
}

export const AsElement: Story = {
	parameters: { layout: 'padded' },
	render: (args) => (
		<Row>
			<Group label='as="div" (default)'>
				<Badge { ...args as BadgeStoryProps } />
			</Group>
			<Group label='as="span"'>
				<Badge { ...args as BadgeStoryProps } as="span" />
			</Group>
		</Row>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			badges = canvas.getAllByText('Badge')

		await expect(badges).toHaveLength(2)

		const [asDiv, asSpan] = badges.map(
			badge => badge.closest('[data-variant]') as HTMLElement
		)

		await expect(asDiv.tagName).toBe('DIV')
		await expect(asSpan.tagName).toBe('SPAN')
	},
}

// `unstyled` does NOT remove the base `inkq-badge`/`inkq-badge__inner`
// classes `useStyles`/`getClassName.tsx` applies to the root and inner
// wrapper elements — per `getClassName.tsx`, the first entry of its
// `classList` is `namespace ?? baseName`, which is not gated on
// `check.isUnstyled` (an inherited semantic `className` can replace it, but
// this story passes none). `unstyled` suppresses the CSS-module-hashed
// class (`styleName`) normally appended alongside it (asserted below), and
// the config classes and non-state `data-*` attributes described next — verified
// against `Badge.tsx`'s own render, which calls `styles('root')` on the root
// `Box` and `styles('inner')` on the nested `<Box as="span">` wrapping
// `children`.
//
// This story doesn't vary `size`/`fullWidth`, but it's worth noting
// `getConfigClasses` (`getClassName.tsx`) returns before evaluating any
// `module`/`global` config at all once `check.isUnstyled` is true — so had
// either prop been set here too, `unstyled` would also suppress the
// `inkq-badge--${size}` modifier class and the `inkq-block` global class,
// on top of the CSS-module hash asserted below.
export const Unstyled: Story = {
	parameters: { controls: { exclude: ['unstyled'] } },
	render: (args) => (
		<Row>
			{ BOOLEAN_OPTIONS.map(unstyled => (
				<Group key={ String(unstyled) } label={ String(unstyled) }>
					<Badge { ...args as BadgeStoryProps } unstyled={ unstyled } />
				</Group>
			)) }
		</Row>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			badges = canvas.getAllByText('Badge')

		await expect(badges).toHaveLength(2)

		// `badges` here ARE the inner `<Box as="span">` elements (`children`
		// renders directly inside them). Unlike `FullWidth`/`AsElement` above,
		// this can't walk up via `[data-variant]` — `unstyled` makes
		// `Box/utils/buildAttributes.ts`'s `keepStateAttrs` strip the (non-state)
		// `variant` data key entirely from the unstyled instance's `attributes`.
		// The base `.inkq-badge` class is a safe anchor instead, since it's
		// never stripped by `unstyled`.
		const [unstyledInner, styledInner] = badges,
			unstyledRoot = unstyledInner.closest('.inkq-badge') as HTMLElement,
			styledRoot = styledInner.closest('.inkq-badge') as HTMLElement

		// The hashed CSS-module class is build-generated, so assert on its
		// presence/shape rather than a literal hash: any class beyond the
		// semantic base class means the module class survived.
		const hasModuleClass = (el: Element, base: string) =>
			Array.from(el.classList).some(c => c !== base)

		await expect(styledRoot).toHaveClass('inkq-badge')
		await expect(unstyledRoot).toHaveClass('inkq-badge')
		expect(hasModuleClass(styledRoot, 'inkq-badge')).toBe(true)
		expect(hasModuleClass(unstyledRoot, 'inkq-badge')).toBe(false)

		await expect(styledInner).toHaveClass('inkq-badge__inner')
		await expect(unstyledInner).toHaveClass('inkq-badge__inner')
		expect(hasModuleClass(styledInner, 'inkq-badge__inner')).toBe(true)
		expect(hasModuleClass(unstyledInner, 'inkq-badge__inner')).toBe(false)
	},
}
