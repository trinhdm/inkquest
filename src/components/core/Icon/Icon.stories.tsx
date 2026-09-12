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
	'arrow-down', 'caret-down', 'arrow-left', 'caret-left',
	'arrow-right', 'caret-right', 'arrow-up', 'caret-up',
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

const ICON_GROUPS: Record<string, readonly IconType[]> = {
	'arrow / navigation': ARROW_NAV_TYPES,
	'action': ACTION_TYPES,
	'control': CONTROL_TYPES,
	'user / settings': USER_SETTING_TYPES,
	'misc': MISC_TYPES,
}

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

// Local, not shared: `Icon` has no subcomponent family, matching `Badge`'s/
// `Container`'s own local `BOOLEAN_OPTIONS`, used by the `Unstyled` story.
const BOOLEAN_OPTIONS = [true, false] as const

const Row = ({ children }: { children: ReactNode }) => (
	<div style={ { display: 'flex', gap: 24, flexWrap: 'wrap' } }>
		{ children }
	</div>
)

const Group = ({ label, children }: { label: string, children: ReactNode }) => (
	<div style={ { display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center' } }>
		<span style={ { font: 'var(--inkq-text-control)', letterSpacing: '.15em', textTransform: 'uppercase', opacity: 0.6 } }>
			{ label }
		</span>
		<div style={ { display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' } }>
			{ children }
		</div>
	</div>
)

const Section = ({ label, children }: { label: string, children: ReactNode }) => (
	<div style={ { display: 'flex', flexDirection: 'column', gap: 12 } }>
		<h3 style={ { font: 'var(--inkq-text-control)', letterSpacing: '.15em', textTransform: 'uppercase', opacity: 0.8, margin: 0 } }>
			{ label }
		</h3>
		<Row>
			{ children }
		</Row>
	</div>
)

// `Icon.Props` (the `declare namespace` export) is just the raw `IconProps`
// interface — it doesn't include `as`/`unstyled`/`attributes`/etc., which
// only exist on the actual accepted prop type, `PolymorphicProps<IconProps,
// C>`. `Parameters<typeof Icon>[0]` reads that real, wrapped type straight
// off the component itself — the generic call signature's default `C`
// resolves to `'svg'` here, since `IconSpecs`'s `default.component` is `'svg'`.
type IconStoryProps = Parameters<typeof Icon>[0]
type Story = StoryObj<IconStoryProps>

const meta: Meta<IconStoryProps> = {
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
		color: {
			control: 'color',
			description: 'Forwarded straight through to the underlying Lucide icon component as its `color` prop (sets the SVG\'s `stroke` — Lucide icons are stroke-based, not fill-based). See the `Color` story.',
		},
		strokeWidth: {
			control: 'number',
			description: 'Forwarded straight through to the underlying Lucide icon component as its `strokeWidth` prop, mapped to the rendered `<svg>`\'s `stroke-width` attribute. See the `StrokeWidth` story.',
		},
		unstyled: {
			control: 'boolean',
			description: 'Part of `PolymorphicProps` (via the shared `SpecsContract`), not `Icon`\'s own `IconProps` (which was narrowed from `extends LucideProps, BoxProps` down to just `color`/`size`/`strokeWidth`/`type`). When true, the `styles(\'root\')` call `Icon` makes returns an empty class name instead of its `inkq-icon` base class on the rendered `<svg>` — see the `Unstyled` story.',
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

export const Default: Story = {}

export const AllIcons: Story = {
	parameters: { layout: 'padded' },
	render: () => (
		<div style={ { display: 'flex', flexDirection: 'column', gap: 32 } }>
			{ Object.entries(ICON_GROUPS).map(([label, group]) => (
				<Section label={ label }>
					{ group.map(type => (
						<Group key={ type } label={ type }>
							<Icon type={ type } />
						</Group>
					)) }
				</Section>
			)) }
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
					<Icon { ...args as IconStoryProps } size={ size } />
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

const COLOR_OPTIONS = ['currentColor', 'crimson', 'seagreen'] as const

export const Color: Story = {
	render: (args) => (
		<Row>
			{ COLOR_OPTIONS.map(color => (
				<Group key={ color } label={ color }>
					<Icon { ...args as IconStoryProps } color={ color } />
				</Group>
			)) }
		</Row>
	),
	play: async ({ canvasElement }) => {
		// Lucide's `Icon` maps `color` directly onto the rendered `<svg>`'s
		// `stroke` attribute (see `lucide-react`'s `Icon.mjs`).
		const svgs = canvasElement.querySelectorAll('svg')

		await expect(svgs).toHaveLength(COLOR_OPTIONS.length)

		svgs.forEach((svg, index) => {
			expect(svg).toHaveAttribute('stroke', COLOR_OPTIONS[index])
		})
	},
}

const STROKE_WIDTH_OPTIONS = [1, 2, 4] as const

export const StrokeWidth: Story = {
	render: (args) => (
		<Row>
			{ STROKE_WIDTH_OPTIONS.map(strokeWidth => (
				<Group key={ strokeWidth } label={ String(strokeWidth) }>
					<Icon { ...args as IconStoryProps } strokeWidth={ strokeWidth } />
				</Group>
			)) }
		</Row>
	),
	play: async ({ canvasElement }) => {
		// Lucide's `Icon` maps `strokeWidth` directly onto the rendered
		// `<svg>`'s `stroke-width` attribute (see `lucide-react`'s `Icon.mjs`).
		const svgs = canvasElement.querySelectorAll('svg')

		await expect(svgs).toHaveLength(STROKE_WIDTH_OPTIONS.length)

		svgs.forEach((svg, index) => {
			expect(svg).toHaveAttribute('stroke-width', String(STROKE_WIDTH_OPTIONS[index]))
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

// `unstyled` does NOT remove the base `inkq-icon` class `useStyles`/
// `getClassName.tsx` applies to the root element — per `getClassName.tsx`,
// the base class is now ALWAYS emitted (`classList = [baseClass]`
// unconditionally). It only suppresses the CSS-module-hashed class normally
// appended alongside it — verified against `Icon.tsx`'s own render, which
// only ever calls `styles('root')` (no other selector) on the rendered
// Lucide `<svg>`.
export const Unstyled: Story = {
	parameters: { controls: { exclude: ['unstyled'] } },
	render: (args) => (
		<Row>
			{ BOOLEAN_OPTIONS.map(unstyled => (
				<Group key={ String(unstyled) } label={ String(unstyled) }>
					<Icon { ...args as IconStoryProps } unstyled={ unstyled } />
				</Group>
			)) }
		</Row>
	),
	play: async ({ canvasElement }) => {
		const svgs = canvasElement.querySelectorAll('svg')

		await expect(svgs).toHaveLength(BOOLEAN_OPTIONS.length)

		const [unstyledSvg, styledSvg] = svgs

		// The hashed CSS-module class is build-generated, so assert on its
		// presence/shape rather than a literal hash: any class beyond the
		// semantic base class (and Lucide's own `lucide`/`lucide-*` classes)
		// means the module class survived.
		const hasModuleClass = (el: Element, base: string) =>
			Array.from(el.classList).some(c => c !== base && !c.startsWith('lucide'))

		await expect(styledSvg).toHaveClass('inkq-icon')
		await expect(unstyledSvg).toHaveClass('inkq-icon')
		expect(hasModuleClass(styledSvg, 'inkq-icon')).toBe(true)
		expect(hasModuleClass(unstyledSvg, 'inkq-icon')).toBe(false)
	},
}
