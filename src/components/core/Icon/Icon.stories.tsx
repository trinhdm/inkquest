import { Icon } from './Icon'
import type { IconType } from './IconMap'
import { expect } from 'storybook/test'
import { getDefaultProps } from '@/lib/registries'
import type { ReactNode } from 'react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

// Single source of truth for this file's option lists. `Icon` has no
// subcomponent family (unlike Button/ButtonGroup/ButtonSection), so these
// stay local instead of living in a shared `options.story.ts`.

// Grouped to mirror the conceptual sub-maps composed together in
// `IconMap.tsx` (`ARROW_ICON_MAP`/`NAVIGATION_ICON_MAP`, `ACTION_MAP`,
// `CONTROL_ICON_MAP`, `USER_SETTING_MAP`, plus the standalone misc entries
// spread directly into `ICON_MAP`) purely for story scannability — `Icon`
// itself has no notion of these categories.
const ARROW_NAV_TYPES: readonly IconType[] = [
	'down-arrow', 'down-caret', 'left-arrow', 'left-caret',
	'right-arrow', 'right-caret', 'up-arrow', 'up-caret',
	'add', 'close', 'confirm', 'remove',
	'alert-tooltip', 'info-tooltip', 'warn-tooltip',
]

const ACTION_TYPES: readonly IconType[] = [
	'attach', 'block', 'call', 'comment', 'copy', 'delete', 'download',
	'drag', 'edit', 'email', 'invite', 'like', 'notify', 'paste',
	'refresh', 'report', 'save', 'send', 'share',
]

const CONTROL_TYPES: readonly IconType[] = [
	'calendar', 'filter', 'grid', 'hidden', 'list',
	'price', 'row', 'search', 'sort', 'visible',
]

const USER_SETTING_TYPES: readonly IconType[] = [
	'group', 'you', 'follow', 'handle',
	'link-internal', 'link-external', 'settings',
	'dark-theme', 'light-theme', 'menu', 'unverified', 'verified', 'website',
]

const MISC_TYPES: readonly IconType[] = [
	'camera', 'media', 'loading', 'location',
	'private', 'rating', 'ruler', 'time', 'wrench',
]

// Full `IconType` union (all 66 keys of `ICON_MAP`), used for `argTypes.type`
// and as the exhaustive list the `AllIcons` story maps over.
const ICON_TYPE_OPTIONS: readonly IconType[] = [
	...ARROW_NAV_TYPES,
	...ACTION_TYPES,
	...CONTROL_TYPES,
	...USER_SETTING_TYPES,
	...MISC_TYPES,
]

const SIZE_OPTIONS: readonly number[] = [16, 24, 32, 48]

const Row = ({ children }: { children: ReactNode }) => (
	<div style={ { display: 'flex', gap: 24, flexWrap: 'wrap' } }>
		{ children }
	</div>
)

const Group = ({ label, children }: { label: string, children: ReactNode }) => (
	<div style={ { display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center' } }>
		<span style={ { font: 'var(--inkq-font-control)', letterSpacing: '.15em', textTransform: 'uppercase', opacity: 0.6 } }>
			{ label }
		</span>
		<div style={ { display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' } }>
			{ children }
		</div>
	</div>
)

const Section = ({ label, children }: { label: string, children: ReactNode }) => (
	<div style={ { display: 'flex', flexDirection: 'column', gap: 12 } }>
		<h3 style={ { font: 'var(--inkq-font-control)', letterSpacing: '.15em', textTransform: 'uppercase', opacity: 0.8, margin: 0 } }>
			{ label }
		</h3>
		<Row>
			{ children }
		</Row>
	</div>
)

const meta: Meta<typeof Icon> = {
	component: Icon,
	title: 'Core/Icon',
	argTypes: {
		type: {
			control: 'select',
			options: ICON_TYPE_OPTIONS,
			description: 'Which icon glyph to render, keyed against `ICON_MAP` in `IconMap.tsx`. Unrecognized values render nothing.',
		},
		size: {
			control: 'number',
			description: 'Pixel size applied to both the `width` and `height` of the underlying Lucide SVG icon.',
		},
	},
	args: {
		// `type` has no registered default (`Icon.setDefaults` only registers
		// `as`/`size`, see `Icon.tsx`) — supplied explicitly here.
		...getDefaultProps<Icon.Props>('Icon'),
		type: 'settings',
	},
}

export default meta
type Story = StoryObj<typeof Icon>

export const Default: Story = {}

export const AllIcons: Story = {
	parameters: { layout: 'padded' },
	render: () => (
		<div style={ { display: 'flex', flexDirection: 'column', gap: 32 } }>
			<Section label="arrow / navigation">
				{ ARROW_NAV_TYPES.map(type => (
					<Group key={ type } label={ type }>
						<Icon type={ type } />
					</Group>
				)) }
			</Section>
			<Section label="action">
				{ ACTION_TYPES.map(type => (
					<Group key={ type } label={ type }>
						<Icon type={ type } />
					</Group>
				)) }
			</Section>
			<Section label="control">
				{ CONTROL_TYPES.map(type => (
					<Group key={ type } label={ type }>
						<Icon type={ type } />
					</Group>
				)) }
			</Section>
			<Section label="user / settings">
				{ USER_SETTING_TYPES.map(type => (
					<Group key={ type } label={ type }>
						<Icon type={ type } />
					</Group>
				)) }
			</Section>
			<Section label="misc">
				{ MISC_TYPES.map(type => (
					<Group key={ type } label={ type }>
						<Icon type={ type } />
					</Group>
				)) }
			</Section>
		</div>
	),
	play: async ({ canvasElement }) => {
		// Icons render as `aria-hidden` decorative SVGs by default (Lucide's
		// `Icon` sets `aria-hidden="true"` whenever no children/a11y prop is
		// passed — see `lucide-react`'s `Icon.mjs`), so there's no accessible
		// role to query by; assert directly against the rendered `<svg>` nodes.
		const svgs = canvasElement.querySelectorAll('svg')

		await expect(svgs).toHaveLength(ICON_TYPE_OPTIONS.length)
	},
}

export const Sizes: Story = {
	render: (args) => (
		<Row>
			{ SIZE_OPTIONS.map(size => (
				<Group key={ size } label={ String(size) }>
					<Icon { ...args as Icon.Props } size={ size } />
				</Group>
			)) }
		</Row>
	),
	play: async ({ canvasElement }) => {
		// Lucide's `Icon` maps `size` directly to the rendered `<svg>`'s
		// `width`/`height` attributes (see `lucide-react`'s `Icon.mjs`:
		// `width: size ?? contextSize`), so assert against those attributes
		// rather than any Inkquest-specific styling.
		const svgs = canvasElement.querySelectorAll('svg')

		await expect(svgs).toHaveLength(SIZE_OPTIONS.length)

		svgs.forEach((svg, index) => {
			const expected = String(SIZE_OPTIONS[index])

			expect(svg).toHaveAttribute('width', expected)
			expect(svg).toHaveAttribute('height', expected)
		})
	},
}

export const UnrecognizedType: Story = {
	parameters: { layout: 'padded' },
	render: () => (
		<Group label="type=&quot;not-a-real-icon&quot; (absent from ICON_MAP)">
			{ /* `type` is a strict `IconType` union with no escape hatch for
			   invalid values, so force one through with a local cast — same
			   fallback the agent guidelines describe for unions that don't fit
			   a spread cleanly. */ }
			<Icon type={ 'not-a-real-icon' as unknown as IconType } />
		</Group>
	),
	play: async ({ canvasElement }) => {
		// `Icon.tsx`: `const component = ICON_MAP[type]; if (!component) return
		// null` — an unrecognized `type` renders nothing at all.
		await expect(canvasElement.querySelector('svg')).not.toBeInTheDocument()
	},
}
