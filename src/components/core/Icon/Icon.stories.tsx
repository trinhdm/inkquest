import { expect, within } from 'storybook/test'
import { getDefaultProps } from '@/hooks/useProps'
import { SOCIAL_BRANDS } from '@/utils/constants'
import { Icon } from './Icon'
import { ICON_MAP } from './IconMap'
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
	'add', 'close', 'check', 'remove',
	'alert-tooltip', 'info-tooltip', 'warn-tooltip',
]

const ACTION_TYPES: readonly LucideType[] = [
	'attach', 'block', 'comment', 'copy', 'delete', 'download', 'drag',
	'edit', 'email', 'invite', 'like', 'notify', 'paste', 'print',
	'phone', 'refresh', 'report', 'save', 'send', 'share',
]

const CONTROL_TYPES: readonly LucideType[] = [
	'calendar', 'color', 'file', 'filter', 'grid', 'hidden', 'list',
	'number', 'price', 'row', 'search', 'sort', 'visible',
]

const USER_SETTING_TYPES: readonly LucideType[] = [
	'group', 'you', 'follow', 'handle',
	'link-internal', 'link-external', 'settings',
	'dark-theme', 'light-theme', 'menu', 'unverified', 'verified', 'website',
]

const MISC_TYPES: readonly LucideType[] = [
	'camera', 'media', 'loading', 'location',
	'private', 'rating', 'ruler', 'time', 'wand-sparkles', 'wrench',
]

const ICON_GROUPS: Record<string, readonly LucideType[]> = {
	'arrow / navigation': ARROW_NAV_TYPES,
	'action': ACTION_TYPES,
	'control': CONTROL_TYPES,
	'user / settings': USER_SETTING_TYPES,
	'misc': MISC_TYPES,
}

// Full `LucideType` union (every key of `ICON_MAP`), used for
// `argTypes.type`'s combined options and as the exhaustive list the
// `AllIcons` story maps over. The groups above are hand-sorted, so the
// `AllIcons` play function checks this list against the live `ICON_MAP` keys
// and fails when an icon is added or removed without updating a group.
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
// off the component itself. It fills `C` with its constraint (`ElementType`),
// not the default `'svg'`, so `as` is any `ElementType` here.
type IconStoryProps = Parameters<typeof Icon>[0]
type Story = StoryObj<IconStoryProps>

const meta: Meta<IconStoryProps> = {
	component: Icon,
	title: 'Core/Icon',
	argTypes: {
		type: {
			control: 'select',
			options: ALL_TYPE_OPTIONS,
			description: '`Icon.Props` is a union discriminated on this field: a `LucideType` (keyed against `ICON_MAP` in `IconMap.tsx`, see the `AllIcons` story) or a `SocialBrand` (`@/types/shared`, routed through `getBrandProps` in `buildIcon.tsx` instead — see the `SocialIcons` story, including the two brands, `facebook` and `pinterest`, that render nothing at all). Unrecognized values render nothing either way.',
		},
		href: {
			control: 'text',
			description: 'When set, wraps the rendered icon glyph in a `next/link` `<Link>` instead of the default `<span>` wrapper (`Icon.tsx`\'s `keyHasValue(props, \'href\')` branch, so a falsy `href`, such as an empty string, falls back to the `<span>`). `isExternalLink(href)` (`@/utils/helpers`) additionally adds `target="_blank" rel="noopener noreferrer"` whenever the link is external. See the `AsLink` story for both branches.',
		},
		strokeLinecap: {
			control: 'select',
			options: STROKE_LINECAP_OPTIONS,
			description: 'Forwarded straight through `extractOthers`\' `others` onto the rendered `<svg>`\'s `stroke-linecap` attribute — `Icon.tsx` never destructures it explicitly. Typed as `never` on `LucideIconProps` (TS blocks passing it explicitly alongside a Lucide `type`), but the REGISTERED default (`DEFAULT_PROPS.strokeLinecap`, `\'round\'`, merged in by `useProps` regardless of which union branch is active) is also passed along for Lucide icons. That is not observable there, because `lucide-react` already defaults `stroke-linecap` to `round` itself — so the `StrokeLinecap` story proves the registered default on a social icon (`instagram`) instead.',
		},
		size: {
			control: 'number',
			description: 'Sets the `width` and `height` ATTRIBUTES on the rendered `<svg>` (Lucide `size` for Lucide icons; `width`/`height` for social brands). `Icon` itself sets no size token. The global `svg` rule in `src/styles/_base.scss` sizes every `<svg>` with `width: var(--icon-size, auto)` and `height: var(--icon-size, auto)` (plus a `font-size` fallback of `--inkq-icon-md`), and `Icon.module.scss`\'s old `1em` rule is commented out. A parent that sets `--icon-size` (a `Button` does, on its inner element) therefore controls the visible size; the attributes are what you get when nothing sets it. See the `Sizes` story, which asserts the attributes only.',
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
			description: 'Part of the shared `FactoryContract` (`unstyled` on `_PolymorphicContract`), not `Icon`\'s own `IconProps`. `Icon` makes two `styles(...)` calls on two different elements: `styles(\'root\')` on the wrapper (a `<span>`, or the `<Link>` when `href` is set — `inkq-icon`) and `styles(\'glyph\')` on the rendered `<svg>` (`inkq-icon__glyph`). Both semantic base classes are emitted regardless of this prop (an inherited semantic `className` could replace one). `Icon` uses no config classes or tokens, so what `unstyled` drops is the CSS-module-hashed class normally appended alongside each — which is the only thing it changes today (`Icon.module.scss` keeps just the wrapper\'s `display`/`font-size`/`margin` and the glyph\'s `pointer-events`/`user-select` rules; the `1em` sizing is commented out) — see the `Unstyled` story.',
		},
		filled: {
			control: 'boolean',
			description: 'Lucide icons only. Sets `fill="currentColor"` on the rendered `<svg>` when true; when false/unset it sets `fill="none"` explicitly (`buildIcon.tsx`: `fill={ !!filled ? \'currentColor\' : \'none\' }`). `filled` has no registered default. See the `Filled` story.',
		},
		hidden: {
			control: 'boolean',
			description: 'Destructured in `buildIcon.tsx` and mapped to the `aria-hidden` attribute on the rendered `<svg>` (`attributes.aria.hidden`): `true` gives `aria-hidden="true"`, `false` gives `aria-hidden="false"`. Not the HTML `hidden` attribute. Registered default `true` (`DEFAULT_PROPS` in `Icon.tsx`), so icons are decorative unless `hidden={ false }` is passed. The same `aria` bag always sets `aria-label` to `` `${type} icon` `` (no `role="img"` and no `<title>`, for Lucide and brand icons alike). See the `Hidden` story.',
		},
	},
	args: {
		// `type` has no registered default — `getDefaultProps<Icon.Props>('Icon')`
		// only resolves whatever `Icon.tsx`'s own `DEFAULT_PROPS` registers
		// (currently `as`/`color`/`hidden`/`size`/`strokeLinecap`) — supplied
		// explicitly here.
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
				<Section key={ label } label={ label }>
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

		// Guards the hand-sorted groups against drifting from the source map:
		// every `ICON_MAP` key appears in exactly one group.
		await expect([...ICON_TYPE_OPTIONS].sort()).toEqual(Object.keys(ICON_MAP).sort())
	},
}

// `IconProps`'s other union branch (`type: SocialBrand`), routed through
// `getBrandProps` (`buildIcon.tsx`) instead of `ICON_MAP` — an entirely
// different code path from `AllIcons`, above. `getBrandProps` has real
// `<svg>` markup for `apple`/`google`/`instagram`/`tiktok`/`x`;
// `facebook`/`pinterest` fall through its `default` branch (`undefined`), so
// `buildIcon` returns `null` for those two brands — no wrapping element,
// nothing rendered at all (verified against `Icon.tsx`'s own
// `if (!iconEl) return null`).
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

		const renderedBrands: SocialBrand[] = ['apple', 'google', 'instagram', 'tiktok', 'x']
		const unrenderedBrands: SocialBrand[] = ['facebook', 'pinterest']

		await expect(canvasElement.querySelectorAll('svg')).toHaveLength(renderedBrands.length)

		// Brand icons no longer render a `<title>` or `role="img"`
		// (`buildIcon.tsx`); like every icon they get `aria-hidden="true"` (the
		// registered `hidden` default) and `aria-label="<brand> icon"`. The
		// query is still restricted to the label `<span>` (see the local
		// `Group` helper) so it only ever matches this story's group label.
		for (const brand of renderedBrands) {
			const label = canvas.getByText(brand, { selector: 'span' })
			const group = label.parentElement as HTMLElement
			const svg = group.querySelector('svg')

			await expect(svg).toBeInTheDocument()
			await expect(svg).toHaveAttribute('aria-label', `${brand} icon`)
			await expect(svg).toHaveAttribute('aria-hidden', 'true')
			await expect(svg!.querySelector('title')).not.toBeInTheDocument()
		}

		for (const brand of unrenderedBrands) {
			const label = canvas.getByText(brand, { selector: 'span' })
			const group = label.parentElement as HTMLElement
			await expect(group.querySelector('svg')).not.toBeInTheDocument()
		}
	},
}

// Asserts the `width`/`height` ATTRIBUTES only. `Icon` sets no `--icon-size`
// itself and the global `svg` rule (`_base.scss`) reads `var(--icon-size, auto)`,
// so how the four groups look on screen is decided by CSS, not by this prop;
// the attributes are what differ per group.
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
// active. It is proven here on a social icon with no `strokeLinecap` of its
// own (`type="instagram"`): `getBrandProps` supplies no `strokeLinecap` for it,
// so `stroke-linecap="round"` can only come from the registered default. A
// Lucide icon would not prove anything — `lucide-react` already defaults
// `strokeLinecap` to `round` itself.
export const StrokeLinecap: Story = {
	parameters: { layout: 'padded' },
	render: () => (
		<div style={ { display: 'flex', flexDirection: 'column', gap: 24 } }>
			<Row>
				{ STROKE_LINECAP_OPTIONS.map(strokeLinecap => (
					<Group key={ strokeLinecap } label={ strokeLinecap }>
						<Icon type="instagram" strokeLinecap={ strokeLinecap } />
					</Group>
				)) }
			</Row>
			<Group label='type="instagram", no strokeLinecap — registered default "round"'>
				<Icon type="instagram" />
			</Group>
		</div>
	),
	play: async ({ canvasElement }) => {
		const svgs = canvasElement.querySelectorAll('svg')

		await expect(svgs).toHaveLength(STROKE_LINECAP_OPTIONS.length + 1)

		STROKE_LINECAP_OPTIONS.forEach((value, index) => {
			expect(svgs[index]).toHaveAttribute('stroke-linecap', value)
		})

		const defaultedSvg = svgs[svgs.length - 1]
		await expect(defaultedSvg).toHaveAttribute('stroke-linecap', 'round')
	},
}

// `filled` sets `fill="currentColor"` on the rendered `<svg>` when true. When
// false/unset, `buildIcon.tsx` passes `fill="none"` explicitly
// (`!!filled ? 'currentColor' : 'none'`), so the "off" state renders
// `fill="none"` rather than omitting the attribute.
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
		await expect(unfilledSvg).toHaveAttribute('fill', 'none')
	},
}

// `hidden` maps to `aria-hidden` (`attributes.aria.hidden` in `buildIcon.tsx`).
// It has a registered default of `true`, so an Icon with no `hidden` prop at
// all is `aria-hidden="true"` too (the last group). `aria-label` is set to
// `` `${type} icon` `` regardless of `hidden`.
export const Hidden: Story = {
	parameters: { controls: { exclude: ['hidden'] } },
	render: (args) => (
		<Row>
			{ BOOLEAN_OPTIONS.map(hidden => (
				<Group key={ String(hidden) } label={ String(hidden) }>
					<Icon { ...args as IconStoryProps } hidden={ hidden } />
				</Group>
			)) }
			<Group label="not passed (registered default)">
				<Icon type="settings" />
			</Group>
		</Row>
	),
	play: async ({ args, canvasElement }) => {
		const svgs = canvasElement.querySelectorAll('svg')

		await expect(svgs).toHaveLength(BOOLEAN_OPTIONS.length + 1)

		// `BOOLEAN_OPTIONS` is `[true, false]`, matching the render order above.
		const [hiddenSvg, visibleSvg, defaultSvg] = svgs

		await expect(hiddenSvg).toHaveAttribute('aria-hidden', 'true')
		await expect(visibleSvg).toHaveAttribute('aria-hidden', 'false')
		await expect(defaultSvg).toHaveAttribute('aria-hidden', 'true')

		// The accessible name is independent of `hidden`. The first two groups
		// use the story's `type` arg, the last one is a literal `settings`.
		await expect(hiddenSvg).toHaveAttribute('aria-label', `${args.type} icon`)
		await expect(visibleSvg).toHaveAttribute('aria-label', `${args.type} icon`)
		await expect(defaultSvg).toHaveAttribute('aria-label', 'settings icon')
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
		// An unrecognized `type` is not a key of `ICON_MAP`, so `buildIcon`
		// (`Icon.tsx`) routes it down the social-brand branch: `getBrandProps`
		// returns `undefined` for it, `buildIcon` returns `null`, and `Icon`
		// returns `null` — nothing is rendered, not even the wrapper.
		await expect(canvasElement.querySelector('svg')).not.toBeInTheDocument()
	},
}

// `unstyled` does NOT remove `Icon`'s own semantic base classes — per
// `getClassName.tsx`, the first `classList` entry (`namespace ?? baseName`)
// is not gated on `check.isUnstyled` (an inherited semantic `className` could
// replace it; none is passed here). `Icon` uses no config classes or tokens, so
// the effect is the CSS-module-hashed class (`styleName`) normally appended
// alongside it being suppressed. `Icon.tsx` calls `styles('root')` on
// the WRAPPING `<span>`/`<a>` (`inkq-icon`) and `styles('glyph')` on the
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

// `href` routes the rendered icon glyph through `Icon.tsx`'s
// `keyHasValue(props, 'href')` branch — a `next/link` `<Link>` instead of the default `<span>`
// wrapper — with `isExternalLink(href)` (`@/utils/helpers`) additionally
// gating `target="_blank" rel="noopener noreferrer"`. `SITE_URL` comes from
// `NEXT_PUBLIC_SITE_URL` (`.env.local` sets it to `http://localhost:3000`), so
// `https://example.com` is external because its hostname differs; were
// `SITE_URL` empty, `isExternalLink`'s `!SITE_URL` fallback would also return
// `true`. A relative path like `/discover` matches neither a URL scheme nor
// `//`, so `isExternalLink` returns `false` for it up front. Non-http schemes
// (`mailto:`, `tel:`) also return `false` (`checks.ts`), but are not rendered here.
export const AsLink: Story = {
	parameters: { layout: 'padded' },
	render: (args) => (
		<Row>
			<Group label="no href (span wrapper)">
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
		await expect(noHrefIcon.parentElement?.tagName).toBe('SPAN')
		await expect(noHrefIcon.parentElement).toHaveClass('inkq-icon')

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
