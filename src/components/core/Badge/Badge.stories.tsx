import { Badge } from './Badge'
import { expect, within } from 'storybook/test'
import { getDefaultProps } from '@/lib/registries'
import type { ReactNode } from 'react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

// `Badge.Props` (the `declare namespace` export) is just the raw `BadgeProps`
// interface — it doesn't include `as`/`children`/`unstyled`/`attributes`/etc.
// (`BadgeProps`'s own `children` field is even commented out in source), all
// of which only exist on the actual accepted prop type,
// `PolymorphicProps<BadgeProps, C>`. `Parameters<typeof Badge>[0]` reads that
// real, wrapped type straight off the component itself — the generic call
// signature's default `C` resolves to `'div'` here, since `BadgeSpecs`'s
// `default.component` is `'div'`.
type BadgeStoryProps = Parameters<typeof Badge>[0]

// Single source of truth for this file's option lists. `Badge` has no
// subcomponent family (unlike Button/ButtonGroup/ButtonSection), so these
// stay local instead of living in a shared `options.story.ts`.
const VARIANT_OPTIONS: readonly Badge.Variant[] = [
	'dark', 'ghost', 'light', 'outline', 'solid', 'success', 'warning', 'danger',
]

const SHAPE_OPTIONS: readonly NonNullable<Badge.Props['shape']>[] = [
	'round', 'pill',
]

const SIZE_OPTIONS: readonly NonNullable<Badge.Props['size']>[] = [
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
		<span style={ { font: 'var(--inkq-font-control)', letterSpacing: '.15em', textTransform: 'uppercase', opacity: 0.6 } }>
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
			description: 'Visual style of the badge.',
		},
		shape: {
			control: 'select',
			options: SHAPE_OPTIONS,
			description: 'Corner treatment of the badge.',
		},
		size: {
			control: 'select',
			options: SIZE_OPTIONS,
			description: 'Size of the badge. Unset renders the component\'s intrinsic size.',
		},
		fullWidth: {
			control: 'boolean',
			description: 'Stretches the badge to fill its container\'s width.',
		},
		unstyled: {
			control: 'boolean',
			description: 'Part of `PolymorphicProps` (via the shared `SpecsContract`), not `Badge`\'s own `BadgeProps`. The semantic base class (`inkq-badge`, `inkq-badge__inner`) is ALWAYS emitted regardless of this prop — `unstyled` only suppresses the CSS-module-hashed class normally appended alongside it, for every `styles(selector)` call `Badge` makes (`root` and `inner`). It also strips non-state `data-*` attributes (like `data-variant`) from the root element — see the `Unstyled` story.',
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
}

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
		// (see `Badge.tsx`'s `data={ { block: !!fullWidth || null } }`, which
		// `filterProps` only keeps when truthy) — the inner text node sits one
		// level down inside the `<Box as="span">` wrapper, so walk up to it.
		const [isFullWidth, isNotFullWidth] = badges.map(
			badge => badge.closest('[data-variant]') as HTMLElement
		)

		await expect(isFullWidth).toHaveAttribute('data-block')
		await expect(isNotFullWidth).not.toHaveAttribute('data-block')
	},
}

export const LongText: Story = {
	args: {
		children: 'This is a badge with an unusually long label to test overflow behavior',
	},
	parameters: { layout: 'padded' },
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
// wrapper elements — per `getClassName.tsx`, the base class is now ALWAYS
// emitted (`classList = [baseClass]` unconditionally). It only suppresses
// the CSS-module-hashed class normally appended alongside it — verified
// against `Badge.tsx`'s own render, which calls `styles('root')` on the root
// `Box` and `styles('inner')` on the nested `<Box as="span">` wrapping
// `children`.
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
		// `get-attributes.ts`'s `filterDecorative` strip the (non-state)
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
