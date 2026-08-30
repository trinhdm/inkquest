import { Badge } from './Badge'
import { expect, within } from 'storybook/test'
import type { ReactNode } from 'react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

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

const meta: Meta<typeof Badge> = {
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
			description: 'Inherited from `BoxProps`. When true, every `styles(selector)` call `Badge` makes (`root` and `inner`) returns an empty class name instead of its `inkq-badge`/`inkq-badge__inner` base class — see the `Unstyled` story.',
		},
	},
	args: {
		children: 'Badge',
		variant: 'light',
		shape: 'pill',
		fullWidth: false,
	},
}

export default meta
type Story = StoryObj<typeof Badge>

export const Default: Story = {}

export const Variants: Story = {
	render: (args) => (
		<Row>
			{ VARIANT_OPTIONS.map(variant => (
				<Group key={ variant } label={ variant }>
					<Badge { ...args as Badge.Props } variant={ variant } />
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
					<Badge { ...args as Badge.Props } shape={ shape } />
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
					<Badge { ...args as Badge.Props } size={ size } />
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
					<Badge { ...args as Badge.Props } fullWidth={ fullWidth } />
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
				<Badge { ...args as Badge.Props } />
			</Group>
			<Group label='as="span"'>
				<Badge { ...args as Badge.Props } as="span" />
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

// `unstyled` strips the base `inkq-badge`/`inkq-badge__inner` classes
// `useStyles`/`getClassName.tsx` applies to the root and inner wrapper
// elements — verified against `Badge.tsx`'s own render, which calls
// `styles('root')` on the root `Box` and `styles('inner')` on the nested
// `<Box as="span">` wrapping `children`.
export const Unstyled: Story = {
	parameters: { controls: { exclude: ['unstyled'] } },
	render: (args) => (
		<Row>
			{ BOOLEAN_OPTIONS.map(unstyled => (
				<Group key={ String(unstyled) } label={ String(unstyled) }>
					<Badge { ...args as Badge.Props } unstyled={ unstyled } />
				</Group>
			)) }
		</Row>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			badges = canvas.getAllByText('Badge')

		await expect(badges).toHaveLength(2)

		// `badges` here ARE the inner `<Box as="span">` elements (`children`
		// renders directly inside them) — the `data-variant` attribute (set
		// unconditionally by `Badge.tsx`, independent of `unstyled`) still
		// reaches the root element regardless, so it's a safe way to walk up
		// to it even when `unstyled` strips the root's own class name.
		const [unstyledInner, styledInner] = badges,
			unstyledRoot = unstyledInner.closest('[data-variant]') as HTMLElement,
			styledRoot = styledInner.closest('[data-variant]') as HTMLElement

		await expect(styledRoot).toHaveClass('inkq-badge')
		await expect(unstyledRoot).not.toHaveClass('inkq-badge')

		await expect(styledInner).toHaveClass('inkq-badge__inner')
		await expect(unstyledInner).not.toHaveClass('inkq-badge__inner')
	},
}
