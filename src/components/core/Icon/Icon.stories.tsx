import { expect, within } from 'storybook/test'
import { getDefaultProps } from '@/hooks/useProps'
import { SOCIAL_BRANDS } from '@/utils/constants'
import { Icon } from './Icon'
import type { ReactNode } from 'react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import type { LucideType } from './IconMap'
import type { SocialBrand } from '@/types/shared'

// Single source of truth for this file's option lists. `Icon` has no
// subcomponent family (unlike Button/ButtonGroup/ButtonSection), so these
// stay local instead of living in a shared `options.story.ts`.

// Grouped to mirror the conceptual sub-maps composed together in
// `IconMap.tsx` (`ARROW_ICON_MAP`/`NAVIGATION_ICON_MAP`, `ACTION_MAP`,
// `CONTROL_ICON_MAP`, `USER_SETTING_MAP`, plus the standalone misc entries
// spread directly into `ICON_MAP`) purely for story scannability — `Icon`
// itself has no notion of these categories.
const ARROW_NAV_TYPES: readonly LucideType[] = [
	'arrow-down', 'caret-down', 'arrow-left', 'caret-left',
	'arrow-right', 'caret-right', 'arrow-up', 'caret-up',
	'add', 'close', 'confirm', 'remove',
	'alert-tooltip', 'info-tooltip', 'warn-tooltip',
]

const ACTION_TYPES: readonly LucideType[] = [
	'attach', 'block', 'call', 'comment', 'copy', 'delete', 'download',
	'drag', 'edit', 'email', 'invite', 'like', 'notify', 'paste',
	'refresh', 'report', 'save', 'send', 'share',
]

const CONTROL_TYPES: readonly LucideType[] = [
	'calendar', 'filter', 'grid', 'hidden', 'list',
	'price', 'row', 'search', 'sort', 'visible',
]

const USER_SETTING_TYPES: readonly LucideType[] = [
	'group', 'you', 'follow', 'handle',
	'link-internal', 'link-external', 'settings',
	'dark-theme', 'light-theme', 'menu', 'unverified', 'verified', 'website',
]

const MISC_TYPES: readonly LucideType[] = [
	'camera', 'media', 'loading', 'location',
	'private', 'rating', 'ruler', 'time', 'wrench',
]

const ICON_GROUPS: Record<string, readonly LucideType[]> = {
	'arrow / navigation': ARROW_NAV_TYPES,
	'action': ACTION_TYPES,
	'control': CONTROL_TYPES,
	'user / settings': USER_SETTING_TYPES,
	'misc': MISC_TYPES,
}

// Full `LucideType` union (all 66 keys of `ICON_MAP`), used for
// `argTypes.type`'s combined options and as the exhaustive list the
// `AllIcons` story maps over.
const ICON_TYPE_OPTIONS: readonly LucideType[] = [
	...ARROW_NAV_TYPES,
	...ACTION_TYPES,
	...CONTROL_TYPES,
	...USER_SETTING_TYPES,
	...MISC_TYPES,
]

// `IconProps` is a union (`LucideIconProps | SocialIconProps`), discriminated
// by `type`: a `LucideType` (`ICON_TYPE_OPTIONS`, above) or a `SocialBrand`.
// `SOCIAL_BRANDS` (`@/utils/constants`) is the exact literal-array source
// `SocialBrand` itself is derived from, so this stays a single re-typed
// `readonly SocialBrand[]` rather than a hand-copied list. Used by
// `argTypes.type`'s combined options and the `SocialIcons` story.
const SOCIAL_TYPE_OPTIONS: readonly SocialBrand[] = SOCIAL_BRANDS

// Combined `type` union for `argTypes.type.options` only — individual stories
// still map over `ICON_TYPE_OPTIONS`/`SOCIAL_TYPE_OPTIONS` separately, since
// `Lucide`- and social-branch icons render through entirely different code
// paths in `buildIcon` (`Icon.tsx`) and warrant separate stories.
const ALL_TYPE_OPTIONS: readonly Icon.Props['type'][] = [
	...ICON_TYPE_OPTIONS,
	...SOCIAL_TYPE_OPTIONS,
]

// `SvgProps['strokeLinecap']`, narrowed off `Icon.Props` itself rather than
// hand-typed: only `SocialIconProps` types `strokeLinecap` as a real value
// (`LucideIconProps` types it as `never`, though the REGISTERED default still
// applies to Lucide icons too at runtime — see the `StrokeLinecap` story).
type SocialIconStoryProps = Extract<Icon.Props, { type: SocialBrand }>
const STROKE_LINECAP_OPTIONS: readonly NonNullable<SocialIconStoryProps['strokeLinecap']>[] = [
	'inherit', 'round', 'butt', 'square',
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
// resolves to `'svg'` here, since `IconSpecs`'s `defaults.as` is `'svg'`.
type IconStoryProps = Parameters<typeof Icon>[0]
type Story = StoryObj<IconStoryProps>

const meta: Meta<IconStoryProps> = {
	component: Icon,
	title: 'Core/Icon',
	argTypes: {
		type: {
			control: 'select',
			options: ALL_TYPE_OPTIONS,
			description: '`Icon.Props` is a union discriminated on this field: a `LucideType` (keyed against `ICON_MAP` in `IconMap.tsx`, see the `AllIcons` story) or a `SocialBrand` (`@/types/shared`, routed through `getBrandProps`/`configSocialIcon` instead — see the `SocialIcons` story, including the two brands that render nothing at all). Unrecognized values render nothing either way.',
		},
		href: {
			control: 'text',
			description: 'When set, wraps the rendered icon glyph in a `next/link` `<Link>` instead of the default `<div>` wrapper (`Icon.tsx`\'s `\'href\' in props` branch). `isExternalLink(href)` (`@/utils/helpers`) additionally adds `target="_blank" rel="noopener noreferrer"` whenever the link is external. See the `AsLink` story for both branches.',
		},
		strokeLinecap: {
			control: 'select',
			options: STROKE_LINECAP_OPTIONS,
			description: 'Forwarded straight through `extractOtherProps`\' `others` onto the rendered `<svg>`\'s `stroke-linecap` attribute — `Icon.tsx` never destructures it explicitly. Typed as `never` on `LucideIconProps` (TS blocks passing it explicitly alongside a Lucide `type`), but the REGISTERED default (`DEFAULT_PROPS.strokeLinecap`, merged in by `useProps` regardless of which union branch is active) still applies to Lucide icons too. See the `StrokeLinecap` story.',
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
			description: 'Part of `PolymorphicProps` (via the shared `SpecsContract`), not `Icon`\'s own `IconProps` (which was narrowed from `extends LucideProps, BoxProps` down to just `color`/`filled`/`size`/`strokeWidth`/`type`). The semantic base class (`inkq-icon`) on the rendered `<svg>` is ALWAYS emitted regardless of this prop — `unstyled` only suppresses the CSS-module-hashed class normally appended alongside it, via the single `styles(\'root\')` call `Icon` makes — see the `Unstyled` story.',
		},
		filled: {
			control: 'boolean',
			description: 'Sets `fill="currentColor"` on the rendered `<svg>` when true (`Icon.tsx`: `fill={ filled ? \'currentColor\' : undefined }`). `filled` itself has no registered default (absent from `getDefaultProps<Icon.Props>(\'Icon\')`), so when false/unset, the explicit `fill: undefined` prop overrides Lucide\'s own `fill: "none"` default attribute, so NO `fill` attribute is rendered at all — not a literal `"none"`. See the `Filled` story.',
		},
	},
	args: {
		// `type` has no registered default — `getDefaultProps<Icon.Props>('Icon')`
		// only resolves whatever `Icon.tsx`'s own `DEFAULT_PROPS` registers
		// (currently `as`/`color`/`size`/`strokeLinecap`) — supplied explicitly here.
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

// `IconProps`'s other union branch (`type: SocialBrand`), routed through
// `getBrandProps`/`configSocialIcon` instead of `ICON_MAP` — an entirely
// different code path from `AllIcons`, above. `getBrandProps` only has real
// `<svg>` markup for `instagram`/`tiktok`/`x`; `facebook`/`pinterest` fall
// through its `default` branch (`undefined`), so `configSocialIcon` also
// returns `undefined` and `buildIcon` returns `null` entirely for those two
// brands — no wrapping element, nothing rendered at all (verified against
// `Icon.tsx`'s own `if (!iconEl) return null`).
export const SocialIcons: Story = {
	parameters: { layout: 'padded' },
	render: () => (
		<Row>
			{ SOCIAL_TYPE_OPTIONS.map(type => (
				<Group key={ type } label={ type }>
					<Icon type={ type } />
				</Group>
			)) }
		</Row>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)

		const renderedBrands: SocialBrand[] = ['instagram', 'tiktok', 'x']
		const unrenderedBrands: SocialBrand[] = ['facebook', 'pinterest']

		await expect(canvasElement.querySelectorAll('svg')).toHaveLength(renderedBrands.length)

		// `getByText(brand)` alone is ambiguous: the rendered social icon itself
		// carries a real `<title>{type}</title>` text node (`Icon.tsx`'s social
		// branch) with the SAME text as this story's own group label — restrict
		// the query to the label `<span>` (see the local `Group` helper) to
		// avoid matching both.
		for (const brand of renderedBrands) {
			const label = canvas.getByText(brand, { selector: 'span' })
			const group = label.parentElement as HTMLElement
			await expect(group.querySelector('svg')).toBeInTheDocument()
		}

		for (const brand of unrenderedBrands) {
			const label = canvas.getByText(brand, { selector: 'span' })
			const group = label.parentElement as HTMLElement
			await expect(group.querySelector('svg')).not.toBeInTheDocument()
		}
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

// `strokeLinecap` is only a real, type-safe prop on the `SocialIconProps`
// branch (`LucideIconProps` types it as `never`) — mapped over a social icon
// (`type="instagram"`) for the enumerable-value coverage. The final group
// demonstrates the registered-default quirk: `DEFAULT_PROPS.strokeLinecap`
// (`Icon.tsx`) is merged in by `useProps` regardless of which union branch is
// active, so a plain Lucide icon (`type="settings"`, no `strokeLinecap` of its
// own) still renders with `stroke-linecap="round"` — even though TS won't let
// you pass that prop explicitly alongside a Lucide `type`.
export const StrokeLinecap: Story = {
	parameters: { layout: 'padded' },
	render: (args) => (
		<div style={ { display: 'flex', flexDirection: 'column', gap: 24 } }>
			<Row>
				{ STROKE_LINECAP_OPTIONS.map(strokeLinecap => (
					<Group key={ strokeLinecap } label={ strokeLinecap }>
						<Icon type="instagram" strokeLinecap={ strokeLinecap } />
					</Group>
				)) }
			</Row>
			<Group label='type="settings" (Lucide) — registered default "round" still applies'>
				<Icon { ...args as IconStoryProps } />
			</Group>
		</div>
	),
	play: async ({ canvasElement }) => {
		const svgs = canvasElement.querySelectorAll('svg')

		await expect(svgs).toHaveLength(STROKE_LINECAP_OPTIONS.length + 1)

		STROKE_LINECAP_OPTIONS.forEach((value, index) => {
			expect(svgs[index]).toHaveAttribute('stroke-linecap', value)
		})

		const lucideSvg = svgs[svgs.length - 1]
		await expect(lucideSvg).toHaveAttribute('stroke-linecap', 'round')
	},
}

// `filled` sets `fill="currentColor"` on the rendered `<svg>` when true. When
// false/unset, `Icon.tsx` still explicitly passes `fill: undefined` (rather
// than omitting the prop entirely), which overrides Lucide's own
// `fill: "none"` default attribute (`defaultAttributes.mjs`, spread first,
// with `...rest` — including this explicit `undefined` — spread last) down
// to `undefined`, and React omits `undefined`-valued attributes from the DOM
// entirely. So the "off" state has NO `fill` attribute at all, not `"none"`.
export const Filled: Story = {
	parameters: { controls: { exclude: ['filled'] } },
	render: (args) => (
		<Row>
			{ BOOLEAN_OPTIONS.map(filled => (
				<Group key={ String(filled) } label={ String(filled) }>
					<Icon { ...args as IconStoryProps } filled={ filled } />
				</Group>
			)) }
		</Row>
	),
	play: async ({ canvasElement }) => {
		const svgs = canvasElement.querySelectorAll('svg')

		await expect(svgs).toHaveLength(BOOLEAN_OPTIONS.length)

		const [filledSvg, unfilledSvg] = svgs

		await expect(filledSvg).toHaveAttribute('fill', 'currentColor')
		await expect(unfilledSvg).not.toHaveAttribute('fill')
	},
}

export const UnrecognizedType: Story = {
	parameters: { layout: 'padded' },
	render: () => (
		<Group label="type=&quot;not-a-real-icon&quot; (absent from ICON_MAP)">
			{ /* `type` is a strict `LucideType` union with no escape hatch for
				invalid values, so force one through with a local cast — same
				fallback the agent guidelines describe for unions that don't fit
				a spread cleanly. */ }
			<Icon type={ 'not-a-real-icon' as unknown as LucideType } />
		</Group>
	),
	play: async ({ canvasElement }) => {
		// `Icon.tsx`: `const component = ICON_MAP[type]; if (!component) return
		// null` — an unrecognized `type` renders nothing at all.
		await expect(canvasElement.querySelector('svg')).not.toBeInTheDocument()
	},
}

// `unstyled` does NOT remove `Icon`'s own semantic base classes — per
// `getClassName.tsx`, the base class is now ALWAYS emitted (`classList =
// [baseClass]` unconditionally) — it only suppresses the CSS-module-hashed
// class normally appended alongside it. `Icon.tsx` calls `styles('root')` on
// the WRAPPING `<div>`/`<a>` (`inkq-icon`) and `styles('glyph')` on the
// rendered `<svg>` glyph itself (`inkq-icon__glyph`) — two different
// elements, not one — see `Icon.module.scss`'s `&`/`&__glyph` rules.
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
		const unstyledWrapper = unstyledSvg.closest('.inkq-icon') as HTMLElement,
			styledWrapper = styledSvg.closest('.inkq-icon') as HTMLElement

		// The hashed CSS-module class is build-generated and churns on every
		// SCSS edit, so assert on the semantic base class surviving as a
		// SUBSTRING rather than pinning an exact hash: any class beyond the
		// semantic base class itself (and Lucide's own `lucide`/`lucide-*`
		// classes) that still CONTAINS the base name means the module class
		// survived.
		const hasModuleClass = (el: Element, base: string) =>
			Array.from(el.classList).some(c => c !== base && !c.startsWith('lucide') && c.includes(base))

		await expect(styledWrapper).toHaveClass('inkq-icon')
		await expect(unstyledWrapper).toHaveClass('inkq-icon')
		expect(hasModuleClass(styledWrapper, 'inkq-icon')).toBe(true)
		expect(hasModuleClass(unstyledWrapper, 'inkq-icon')).toBe(false)

		await expect(styledSvg).toHaveClass('inkq-icon__glyph')
		await expect(unstyledSvg).toHaveClass('inkq-icon__glyph')
		expect(hasModuleClass(styledSvg, 'inkq-icon__glyph')).toBe(true)
		expect(hasModuleClass(unstyledSvg, 'inkq-icon__glyph')).toBe(false)
	},
}

// `href` routes the rendered icon glyph through `Icon.tsx`'s `'href' in
// props` branch — a `next/link` `<Link>` instead of the default `<div>`
// wrapper — with `isExternalLink(href)` (`@/utils/helpers`) additionally
// gating `target="_blank" rel="noopener noreferrer"`. `SITE_URL` is unset in
// this environment, so `isExternalLink`'s own `!SITE_URL` fallback treats any
// absolute URL scheme as external — a relative path like `/discover` is not a
// URL scheme/`//`-prefixed match at all, so it's internal regardless.
export const AsLink: Story = {
	parameters: { layout: 'padded' },
	render: (args) => (
		<Row>
			<Group label="no href (div wrapper)">
				<Icon { ...args as IconStoryProps } />
			</Group>
			<Group label='href="/discover" (internal)'>
				<Icon { ...args as IconStoryProps } href="/discover" />
			</Group>
			<Group label='href="https://example.com" (external)'>
				<Icon { ...args as IconStoryProps } href="https://example.com" />
			</Group>
		</Row>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)

		const svgs = canvasElement.querySelectorAll('svg')
		await expect(svgs).toHaveLength(3)

		const [noHrefIcon, internalIcon, externalIcon] = Array.from(svgs)

		await expect(noHrefIcon.closest('a')).not.toBeInTheDocument()

		const links = canvas.getAllByRole('link')
		await expect(links).toHaveLength(2)

		const [internalLink, externalLink] = links

		await expect(internalLink).toHaveAttribute('href', '/discover')
		await expect(internalLink).not.toHaveAttribute('target')
		await expect(internalLink).not.toHaveAttribute('rel')

		await expect(externalLink).toHaveAttribute('href', 'https://example.com')
		await expect(externalLink).toHaveAttribute('target', '_blank')
		await expect(externalLink).toHaveAttribute('rel', 'noopener noreferrer')

		await expect(internalIcon.closest('a')).toBe(internalLink)
		await expect(externalIcon.closest('a')).toBe(externalLink)
	},
}
