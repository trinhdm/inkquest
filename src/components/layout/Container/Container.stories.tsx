import { Container } from './Container'
import { expect, within } from 'storybook/test'
import { getDefaultProps } from '@/lib/registries'
import type { ReactNode } from 'react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

// `Container` has no enum-valued props of its own (just `children` and
// `fullWidth`, plus the polymorphic `as`/Box escape hatches), so — same as
// `Badge` — these stay local instead of living in a shared `options.story.ts`.
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

// `Container` renders its own root class unconditionally (`getClassName`
// always pushes the kebab-cased, prefixed base class — `inkq-container` —
// onto the root element's `className` before any CSS-module hash is mixed
// in; see `useStyles/getClassName.tsx`). Unlike `Badge`, `Container` has no
// `data-variant` attribute to key off of, so this literal class name is the
// stable selector used below to walk from the rendered text (which lives one
// level down, inside the internal `<Box as="span">` wrapper) back up to the
// actual polymorphic root element.
const ROOT_SELECTOR = '.inkq-container'

const meta: Meta<typeof Container> = {
	component: Container,
	title: 'Layout/Container',
	argTypes: {
		children: { control: 'text' },
		fullWidth: {
			control: 'boolean',
			description: 'Stretches the container to fill its parent\'s width (adds `data-block`/`display: block; width: 100%`).',
		},
	},
	args: {
		...getDefaultProps<Container.Props>('Container'),
		children: 'Container content',
	},
}

export default meta
type Story = StoryObj<typeof Container>

export const Default: Story = {}

export const FullWidth: Story = {
	parameters: {
		layout: 'padded',
		controls: { exclude: ['fullWidth'] },
	},
	render: (args) => (
		<div style={ { display: 'flex', flexDirection: 'column', gap: 24 } }>
			{ BOOLEAN_OPTIONS.map(fullWidth => (
				<Group key={ String(fullWidth) } label={ String(fullWidth) }>
					<Container { ...args as Container.Props } fullWidth={ fullWidth } />
				</Group>
			)) }
		</div>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			items = canvas.getAllByText('Container content')

		await expect(items).toHaveLength(2)

		// `fullWidth` maps to a `data-block` attribute on the root element (see
		// `Container.tsx`'s `data={ { block: !!fullWidth || null } }`, which
		// `filterProps` only keeps when truthy) — the text sits one level down
		// inside the `<Box as="span">` wrapper, so walk up to the root.
		const [isFullWidth, isNotFullWidth] = items.map(
			item => item.closest(ROOT_SELECTOR) as HTMLElement
		)

		await expect(isFullWidth).toHaveAttribute('data-block')
		await expect(isNotFullWidth).not.toHaveAttribute('data-block')
	},
}

export const AsElement: Story = {
	parameters: { layout: 'padded' },
	render: (args) => (
		<Row>
			<Group label='as="div" (default)'>
				<Container { ...args as Container.Props } />
			</Group>
			<Group label='as="section"'>
				<Container { ...args as Container.Props } as="section" />
			</Group>
		</Row>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			items = canvas.getAllByText('Container content')

		await expect(items).toHaveLength(2)

		const [asDiv, asSection] = items.map(
			item => item.closest(ROOT_SELECTOR) as HTMLElement
		)

		await expect(asDiv.tagName).toBe('DIV')
		await expect(asSection.tagName).toBe('SECTION')
	},
}

export const LongText: Story = {
	args: {
		children: 'This is a container with an unusually long text child, used to verify that the max-width constraint and centered layout hold up against overflow-prone content rather than letting it stretch the page or clip unexpectedly.',
	},
	parameters: { layout: 'padded' },
}

export const NestedContent: Story = {
	args: {
		children: (
			<div style={ { display: 'flex', flexDirection: 'column', gap: 12, width: '100%' } }>
				<div style={ { padding: 16, background: 'var(--inkq-background-page)', border: '1px dashed currentColor' } }>
					Block one
				</div>
				<div style={ { padding: 16, background: 'var(--inkq-background-page)', border: '1px dashed currentColor' } }>
					Block two
				</div>
			</div>
		),
	},
	parameters: { layout: 'padded' },
}
