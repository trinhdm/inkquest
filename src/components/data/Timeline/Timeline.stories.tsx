import { expect, within } from 'storybook/test'
import { getDefaultProps } from '@/hooks/useProps'
import { Timeline } from './Timeline'
import type { ReactNode } from 'react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import moduleClasses from './Timeline.module.scss'

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
		<div style={ { width: 260 } }>
			{ children }
		</div>
	</div>
)

// `Timeline.Props` (the `declare namespace` export) is just the raw
// `TimelineProps` interface (`{ children: ReactNode }`) — it doesn't include
// `as`/`unstyled`/`attributes`/etc., which only exist on the actual accepted
// prop type, `PolymorphicProps<TimelineProps, C>`. `Parameters<typeof
// Timeline>[0]` reads that real, wrapped type straight off the component
// itself — the generic call signature's default `C` resolves to `'div'`
// here, since `TimelineSpecs`'s `defaults.as` is `'div'`.
type TimelineStoryProps = Parameters<typeof Timeline>[0]
type Story = StoryObj<TimelineStoryProps>

const hasModuleClass = (el: Element, base: string) => {
	const moduleClass = (moduleClasses as Record<string, string>)[base]
	return !!moduleClass && el.classList.contains(moduleClass)
}

const renderItems = () => (
	<>
		<Timeline.Item title="Kickoff" content="Project scope and timeline agreed." />
		<Timeline.Item title="Design review" content="Wireframes signed off by stakeholders." />
		<Timeline.Item content="Launch — no title on this one." />
	</>
)

const meta: Meta<TimelineStoryProps> = {
	component: Timeline,
	title: 'Data/Timeline',
	argTypes: {
		children: {
			control: false,
			description: 'Required. Rendered through `filterChildren(children, TimelineItem.displayName)` — only elements whose `displayName` is `\'TimelineItem\'` survive; everything else (including `Fragment`-wrapped content, which `filterChildren` recurses into and flattens) is dropped entirely before rendering, not merely hidden. See the `NonTimelineItemChildren` story.',
		},
		unstyled: {
			control: 'boolean',
			description: 'Part of `PolymorphicProps`, not `Timeline`\'s own `TimelineProps`. `Timeline.tsx` only ever calls `styles(\'root\')` — no other selector — and `.inkq-timeline` has a real declaration in `Timeline.module.scss`, so the semantic base class is ALWAYS emitted and only the CSS-module hash is suppressed by `unstyled`. See the `Unstyled` story.',
		},
	},
	args: {
		...getDefaultProps<Timeline.Props>('Timeline'),
	},
}

export default meta

export const Default: Story = {
	render: (args) => (
		<Timeline { ...args }>
			{ renderItems() }
		</Timeline>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)

		await expect(canvas.getByText('Kickoff')).toBeInTheDocument()
		await expect(canvas.getByText('Design review')).toBeInTheDocument()
		await expect(canvas.getByText('Launch — no title on this one.')).toBeInTheDocument()
	},
}

export const AsElement: Story = {
	parameters: { layout: 'padded' },
	render: (args) => (
		<Row>
			<Group label='as="div" (default)'>
				<Timeline { ...args }>{ renderItems() }</Timeline>
			</Group>
			<Group label='as="section"'>
				<Timeline { ...args } as="section">{ renderItems() }</Timeline>
			</Group>
		</Row>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			roots = canvas.getAllByText('Kickoff').map(
				el => el.closest('.inkq-timeline') as HTMLElement
			)

		expect(roots).toHaveLength(2)

		const [asDiv, asSection] = roots

		await expect(asDiv.tagName).toBe('DIV')
		await expect(asSection.tagName).toBe('SECTION')
	},
}

// `filterChildren(children, TimelineItem.displayName)` (`Timeline.tsx`)
// recurses into `Fragment`s (flattening their children into the same list)
// and drops any element whose `displayName` isn't `'TimelineItem'` — a raw
// `<span>` simply renders nothing; it's excluded before the
// `.map(child => child)` pass, not merely hidden.
export const NonTimelineItemChildren: Story = {
	render: (args) => (
		<Timeline { ...args }>
			<>
				<Timeline.Item title="Fragment child A" content="Kept via Fragment flattening." />
				<Timeline.Item title="Fragment child B" content="Also kept." />
			</>
			<span>not a Timeline.Item — dropped by filterChildren</span>
			<Timeline.Item title="Trailing" content="Kept, direct child." />
		</Timeline>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			root = canvas.getByText('Fragment child A').closest('.inkq-timeline') as HTMLElement

		await expect(canvas.getByText('Fragment child A')).toBeInTheDocument()
		await expect(canvas.getByText('Fragment child B')).toBeInTheDocument()
		await expect(canvas.getByText('Trailing')).toBeInTheDocument()
		await expect(canvas.queryByText('not a Timeline.Item — dropped by filterChildren')).not.toBeInTheDocument()
		expect(root.children).toHaveLength(3)
	},
}

// `unstyled` does NOT remove `Timeline`'s semantic base class
// (`inkq-timeline`) — per `getClassName.tsx`, the base class is now ALWAYS
// emitted. It only suppresses the CSS-module-hashed class normally appended
// alongside it. `Timeline.tsx` only ever styles the root selector, so this is
// the only class pair to verify (unlike `Timeline.Item`, which styles six).
export const Unstyled: Story = {
	parameters: { controls: { exclude: ['unstyled'] } },
	render: (args) => (
		<Row>
			{ BOOLEAN_OPTIONS.map(unstyled => (
				<Group key={ String(unstyled) } label={ String(unstyled) }>
					<Timeline { ...args } unstyled={ unstyled }>{ renderItems() }</Timeline>
				</Group>
			)) }
		</Row>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			roots = canvas.getAllByText('Kickoff').map(
				el => el.closest('.inkq-timeline') as HTMLElement
			)

		expect(roots).toHaveLength(2)

		const [unstyledRoot, styledRoot] = roots

		await expect(styledRoot).toHaveClass('inkq-timeline')
		await expect(unstyledRoot).toHaveClass('inkq-timeline')
		expect(hasModuleClass(styledRoot, 'inkq-timeline')).toBe(true)
		expect(hasModuleClass(unstyledRoot, 'inkq-timeline')).toBe(false)
	},
}
