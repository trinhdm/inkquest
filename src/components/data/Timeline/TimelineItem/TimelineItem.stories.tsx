import { Timeline } from '../Timeline'
import { expect, within } from 'storybook/test'
import { getDefaultProps } from '@/lib/registries'
import { Icon } from '@/components/core/Icon'
import moduleClasses from '../Timeline.module.scss'
import type { ReactNode } from 'react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

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

// `Timeline.Item.Props` (the `declare namespace` export, re-exported off
// `Timeline`) is just the raw `TimelineItemProps` interface — it doesn't
// include `unstyled`/`attributes`/etc., which only exist on the actual
// accepted prop type, `PolymorphicProps<...>`. `Parameters<typeof
// Timeline.Item>[0]` reads that real, wrapped type straight off the
// component itself — `TimelineItemSpecs`'s `isCompound: true` makes `as`
// resolve to `never` (compound components don't take a tag override), so
// this also correctly excludes `as` from the story's own controls.
type TimelineItemStoryProps = Parameters<typeof Timeline.Item>[0]
type Story = StoryObj<TimelineItemStoryProps>

const hasModuleClass = (el: Element, base: string) => {
	const moduleClass = (moduleClasses as Record<string, string>)[base]
	return !!moduleClass && el.classList.contains(moduleClass)
}

const meta: Meta<TimelineItemStoryProps> = {
	component: Timeline.Item,
	title: 'Data/Timeline/Timeline.Item',
	argTypes: {
		title: {
			control: 'text',
			description: 'Optional. Genuinely conditional — `{ title && (<span {...styles(\'title\')}>{title}</span>) }` — the element itself is entirely absent from the DOM when omitted (unlike `Quote`\'s `author`/`Statistic`\'s `caption`, which always render an empty element). See the `TitlePresence` story.',
		},
		content: {
			control: 'text',
			description: 'Required. **Probable source bug, verified against the live `TimelineItem.tsx`**: the body paragraph renders `{ content ?? children }`, but `content` is a REQUIRED prop on the public type, so the `children` fallback is dead code, unreachable through any type-safe call site — identical pattern to `Quote`\'s `quote ?? children`. No story here exercises `children` as a substitute for `content`.',
		},
		bullet: {
			control: false,
			description: 'Arbitrary `ReactNode`, rendered inside `.inkq-timeline-item__bullet`. The wrapping `<span>` itself renders unconditionally either way (only its content differs) — "no bullet" means an empty marker circle, not a missing one. See the `Bullet` story.',
		},
		unstyled: {
			control: 'boolean',
			description: 'Part of `PolymorphicProps`, not `TimelineItem`\'s own `TimelineItemProps`. The semantic base class is ALWAYS emitted for every selector `TimelineItem.tsx` styles (`root`, `marker`, `bullet`, `rail`, `body`, `title`, `content`) regardless of this prop — `unstyled` only suppresses the CSS-module-hashed class normally appended alongside it. All seven selectors have real declarations in `Timeline.module.scss`. See the `Unstyled` story.',
		},
	},
	args: {
		...getDefaultProps<Timeline.Item.Props>('TimelineItem'),
		content: 'Wireframes signed off by stakeholders.',
		title: 'Design review',
	},
}

export default meta

export const Default: Story = {
	render: (args) => (
		<Timeline>
			<Timeline.Item { ...args } />
		</Timeline>
	),
	play: async ({ canvasElement, args }) => {
		const canvas = within(canvasElement)

		await expect(canvas.getByText(args.title as string)).toBeInTheDocument()
		await expect(canvas.getByText(args.content)).toBeInTheDocument()
	},
}

// `title` is genuinely conditional — "without title" means the `<span>` is
// entirely absent, not merely empty.
export const TitlePresence: Story = {
	parameters: { controls: { exclude: ['title'] } },
	render: (args) => (
		<Row>
			<Group label="with title">
				<Timeline><Timeline.Item { ...args } title="Design review" /></Timeline>
			</Group>
			<Group label="without title">
				<Timeline><Timeline.Item { ...args } title={ undefined } /></Timeline>
			</Group>
		</Row>
	),
	play: async ({ canvasElement, args }) => {
		const canvas = within(canvasElement),
			items = canvas.getAllByText(args.content)

		expect(items).toHaveLength(2)

		const [withTitle, withoutTitle] = items.map(
			item => item.closest('.inkq-timeline-item') as HTMLElement
		)

		await expect(withTitle.querySelector('.inkq-timeline-item__title')).toHaveTextContent('Design review')
		await expect(withoutTitle.querySelector('.inkq-timeline-item__title')).not.toBeInTheDocument()
	},
}

export const Bullet: Story = {
	render: (args) => (
		<Row>
			<Group label="custom bullet">
				<Timeline>
					<Timeline.Item { ...args } bullet={ <Icon type="confirm" /> } />
				</Timeline>
			</Group>
			<Group label="default (empty marker)">
				<Timeline>
					<Timeline.Item { ...args } />
				</Timeline>
			</Group>
		</Row>
	),
	play: async ({ canvasElement, args }) => {
		const canvas = within(canvasElement),
			items = canvas.getAllByText(args.content)

		expect(items).toHaveLength(2)

		const [withBullet, withoutBullet] = items.map(
			item => item.closest('.inkq-timeline-item') as HTMLElement
		)

		await expect(withBullet.querySelector('.inkq-timeline-item__bullet svg')).toBeInTheDocument()
		await expect(withoutBullet.querySelector('.inkq-timeline-item__bullet')).toBeEmptyDOMElement()
	},
}

// `unstyled` does NOT remove any of `TimelineItem`'s semantic base classes —
// per `getClassName.tsx`, the base class is now ALWAYS emitted. It only
// suppresses the CSS-module-hashed class normally appended alongside it, for
// every one of the seven selectors `TimelineItem.tsx` styles — unlike
// `Quote`/`Statistic`'s `caption`, all seven have a real declaration in
// `Timeline.module.scss`, so all seven genuinely carry a hash when styled.
export const Unstyled: Story = {
	parameters: { controls: { exclude: ['unstyled'] } },
	render: (args) => (
		<Row>
			{ BOOLEAN_OPTIONS.map(unstyled => (
				<Group key={ String(unstyled) } label={ String(unstyled) }>
					<Timeline>
						<Timeline.Item { ...args } unstyled={ unstyled } />
					</Timeline>
				</Group>
			)) }
		</Row>
	),
	play: async ({ canvasElement, args }) => {
		const canvas = within(canvasElement),
			items = canvas.getAllByText(args.content)

		expect(items).toHaveLength(2)

		const [unstyledRoot, styledRoot] = items.map(
			item => item.closest('.inkq-timeline-item') as HTMLElement
		)

		const selectors: [string, string][] = [
			['root', 'inkq-timeline-item'],
			['marker', 'inkq-timeline-item__marker'],
			['bullet', 'inkq-timeline-item__bullet'],
			['rail', 'inkq-timeline-item__rail'],
			['body', 'inkq-timeline-item__body'],
			['title', 'inkq-timeline-item__title'],
			['content', 'inkq-timeline-item__content'],
		]

		for (const [, base] of selectors) {
			const styledEl = base === 'inkq-timeline-item' ? styledRoot : styledRoot.querySelector(`.${ base }`) as HTMLElement,
				unstyledEl = base === 'inkq-timeline-item' ? unstyledRoot : unstyledRoot.querySelector(`.${ base }`) as HTMLElement

			await expect(styledEl).toHaveClass(base)
			await expect(unstyledEl).toHaveClass(base)
			expect(hasModuleClass(styledEl, base)).toBe(true)
			expect(hasModuleClass(unstyledEl, base)).toBe(false)
		}
	},
}
