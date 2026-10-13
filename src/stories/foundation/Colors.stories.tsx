// Foundation/Colors — documents the theme's color-related token layers:
//
//   1. Semantic tokens (`alias.color.*`, `alias.background.*`) — the
//      `semanticTokens` group in `reference/semantic.ts`, exposed on
//      `aliasTokens` (exported as `alias` from `reference/index.ts`). This is
//      the ONLY color surface components are meant to consume directly
//      (`reference/semantic.ts`: "limit component usage to only semantic
//      tokens"). The accent/secondary scales behind it (`alias.accent`,
//      `alias.secondary`) and the `--inkq-background-surface|control|gradient`
//      / `--inkq-color-control*` vars have no `semanticTokens` entry; they
//      are shown below as internal, by literal variable name.
//   2. Primitive tokens (`ink`/`paper`/`oxblood`/`crimson`/`ghost`/`smoke`
//      plus the static red/green/yellow/blue/white/gray/black swatches) —
//      `primitiveTokens`, exported as `base` from `reference/index.ts`.
//      Documentation needs to show what a semantic token resolves to, so this
//      page imports it, but it is a one-way exception: nothing in this file
//      writes to or edits `src/lib/theme/`, and components should not consume
//      primitives directly.
//
// Every swatch below is styled with the real accessor (`style={{ background:
// alias.background.page() }}`), never a literal hex copied out of
// `scales.ts` — accessors resolve to `var(--inkq-*)`/`var(--ink-*)`
// references, and the actual color is whatever the currently-applied color
// scheme (`data-inkq-scheme` on `<html>`, via `schemeControls()`) resolves
// them to at paint time.
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { expect, waitFor } from 'storybook/test'
import { alias, base } from '@/lib/theme/reference'
import { schemeControls } from '@/components/document/ScriptInjector/schemeControls'
import { COLOR_TOKENS } from '@/lib/theme/scales'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import type { ColorScheme } from '@/lib/theme/types'

// --- scheme control -------------------------------------------------------
//
// The generated CSS only reacts to `data-inkq-scheme` on `:root`/`:host`
// (see `src/components/document/StyleInliner/resolver.ts`'s
// `BASE_SELECTORS`/`listSelectors`) — there is no per-element scoping
// mechanism, so two schemes can't be painted side-by-side in one story the
// way a self-contained "light vs dark" swatch pair normally could be. Instead
// each token page below ships one story per scheme, each of which sets the
// document-level attribute itself on mount via the same `schemeControls()`
// helper the global preview decorator uses.
//
// On unmount it restores whatever scheme was applied BEFORE this story pinned
// one — read back via `getStoredScheme()` — rather than resetting to a
// hardcoded `'dark'`. That matters now that the toolbar exposes a `scheme`
// global: a hardcoded reset would silently undo the user's toolbar choice as
// soon as they navigated away from one of these pages.
const useScheme = (scheme: ColorScheme) => {
	useEffect(() => {
		const controls = schemeControls()
		const previous = controls.getStoredScheme()

		controls.applyScheme(scheme)
		return () => controls.applyScheme(previous)
	}, [scheme])
}

// --- shared display helpers ------------------------------------------------

const rowStyle: CSSProperties = { display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 32 }
const labelStyle: CSSProperties = { fontSize: 11, opacity: 0.65, marginTop: 6 }
const pathStyle: CSSProperties = { fontSize: 10, opacity: 0.5, fontFamily: 'monospace' }

const SectionTitle = ({ children }: { children: ReactNode }) => (
	<h3 style={ { fontSize: 14, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 12 } }>
		{ children }
	</h3>
)

interface SwatchProps {
	label: string
	path: string
	background?: string
	color?: string
	textOn?: string
}

/** One color/background token rendered as a real, token-styled box. */
const Swatch = ({ label, path, background, color, textOn }: SwatchProps) => (
	<div style={ { display: 'flex', flexDirection: 'column', alignItems: 'flex-start' } }>
		<div
			style={ {
				width: 96,
				height: 64,
				borderRadius: 8,
				border: '1px solid rgba(128,128,128,0.35)',
				background,
				color: color ?? textOn,
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				fontSize: 11,
			} }
		>
			{ color || textOn ? 'Aa' : null }
		</div>
		<span style={ labelStyle }>{ label }</span>
		<span style={ pathStyle }>{ path }</span>
	</div>
)

// --- contrast checking ------------------------------------------------------
//
// Computed off the ACTUAL rendered element (standard `color`/`background`
// CSS properties, not the raw custom-property text), so nested `var()`
// chains (`--inkq-background-page` -> `var(--ink-100)` -> literal hex) are
// fully resolved by the browser before we read them back — no hand-copied
// hex values, no eyeballing.
//
// Chrome reports `color-mix()` and `oklch(from …)` colors in their own space
// (`oklab(…)`, `oklch(…)`), not `rgb()`, so the computed color is painted
// onto a 1×1 canvas, which converts any CSS color to 8-bit sRGB — the space
// the WCAG formula expects.
type RGB = [number, number, number]
type RGBA = [number, number, number, number]

let pixel: CanvasRenderingContext2D | null = null

const toRgba = (color: string): RGBA | null => {
	if (!CSS.supports('color', color)) return null
	pixel ??= Object.assign(document.createElement('canvas'), { width: 1, height: 1 })
		.getContext('2d', { willReadFrequently: true })
	if (!pixel) return null

	pixel.clearRect(0, 0, 1, 1)
	pixel.fillStyle = color
	pixel.fillRect(0, 0, 1, 1)
	const [r, g, b, a] = pixel.getImageData(0, 0, 1, 1).data
	return [r, g, b, a / 255]
}

// see-through text shows the background through it, so blend before measuring
const blend = (fore: RGBA, back: RGBA): RGB =>
	[0, 1, 2].map(i => fore[i] * fore[3] + back[i] * (1 - fore[3])) as RGB

const relativeLuminance = ([r, g, b]: RGB) => {
	const channel = (c: number) => {
		const s = c / 255
		return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
	}
	return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b)
}

const contrastRatio = (fg: string, bg: string): number | null => {
	const fore = toRgba(fg),
		back = toRgba(bg)
	if (!fore || !back) return null

	const l1 = relativeLuminance(blend(fore, back)),
		l2 = relativeLuminance([back[0], back[1], back[2]])
	const [lighter, darker] = l1 > l2 ? [l1, l2] : [l2, l1]
	return (lighter + 0.05) / (darker + 0.05)
}

const AA_NORMAL_TEXT = 4.5

interface ContrastPairProps {
	label: string
	foreground: string
	background: string
}

/** Renders a real text-on-background pair and reports its measured WCAG contrast ratio. */
const ContrastPair = ({ label, foreground, background }: ContrastPairProps) => {
	const ref = useRef<HTMLDivElement>(null)
	const [ratio, setRatio] = useState<number | null>(null)

	useEffect(() => {
		const el = ref.current
		if (!el) return

		const computed = getComputedStyle(el)
		setRatio(contrastRatio(computed.color, computed.backgroundColor))
	}, [setRatio])

	const passes = ratio !== null && ratio >= AA_NORMAL_TEXT

	return (
		<div
			ref={ ref }
			data-contrast-pair={ label }
			data-ratio={ ratio ?? undefined }
			data-passes-aa={ ratio === null ? undefined : String(passes) }
			style={ {
					color: foreground,
					backgroundColor: background,
					padding: '12px 16px',
				borderRadius: 8,
				display: 'flex',
				justifyContent: 'space-between',
				alignItems: 'center',
				gap: 16,
				minWidth: 280,
			} }
		>
			<span>{ label }</span>
			<strong style={ { fontFamily: 'monospace', fontSize: 12 } }>
				{ ratio === null ? '…' : `${ ratio.toFixed(2) }:1 ${ passes ? 'PASS' : 'FAIL' } AA` }
			</strong>
		</div>
	)
}

// --- primitive scale reference ---------------------------------------------

const colorSteps = (count: number) =>
	Array.from({ length: count }, (_, i) => `${ (i + 1) * 100 }`)

type InkStep = Parameters<typeof base.ink>[0]
type PaperStep = Parameters<typeof base.paper>[0]

const PrimitiveColorScale = () => (
	<div>
		<p style={ { fontSize: 12, opacity: 0.7, maxWidth: 640, marginBottom: 16 } }>
			Internal — not for direct use in components. Raw scale steps from{ ' ' }
			<code>COLOR_TOKENS</code> (<code>src/lib/theme/scales.ts</code>), accessed here through{ ' ' }
			<code>primitiveTokens</code> (<code>reference/primitive.ts</code>, exported as{ ' ' }
			<code>base</code>). Semantic color/background tokens above alias these steps.
		</p>
		<ul style={ { fontSize: 12, opacity: 0.7, maxWidth: 640, marginBottom: 24 } }>
			<li>
				<code>background.page</code> / <code>background.card</code>: dark = ink 100 / ink 300,
				light = paper 300 / paper 100 (<code>tokens/background/index.ts</code>).
			</li>
			<li>
				<code>background.surface</code> = theme step 200, <code>background.card(&apos;hover&apos;)</code> =
				theme step 400, where &quot;theme&quot; is the active scheme&apos;s scale (ink or paper).
			</li>
			<li>
				<code>color.text(&apos;inverse&apos;)</code> = theme step 100; <code>border</code> /{ ' ' }
				<code>border-strong</code> = theme steps 500 / 600.
			</li>
			<li>
				<code>color.action</code> aliases the accent scale (oxblood in dark, crimson in light);
				<code> color.text</code> / <code>color.link</code> / <code>color.placeholder</code> alias the
				secondary scale (ghost in dark, smoke in light) (<code>tokens/accent/</code>,{ ' ' }
				<code>tokens/colors/</code>).
			</li>
			<li>
				<code>color.danger</code> / <code>success</code> / <code>warning</code> / <code>info</code> are
				mixed from the static red / green / yellow / blue (<code>tokens/colors/states.ts</code>).
			</li>
		</ul>
		<div style={ rowStyle }>
			{ colorSteps(COLOR_TOKENS.ink.length).map(step => (
				<Swatch key={ `ink-${ step }` } label={ `ink ${ step }` } path={ `base.ink('${ step }')` } background={ base.ink(step as InkStep) } />
			)) }
		</div>
		<div style={ rowStyle }>
			{ colorSteps(COLOR_TOKENS.paper.length).map(step => (
				<Swatch key={ `paper-${ step }` } label={ `paper ${ step }` } path={ `base.paper('${ step }')` } background={ base.paper(step as PaperStep) } />
			)) }
		</div>
		<div style={ rowStyle }>
			<Swatch label="oxblood 100" path="base.oxblood('100')" background={ base.oxblood('100') } />
			<Swatch label="crimson 100" path="base.crimson('100')" background={ base.crimson('100') } />
			<Swatch label="ghost 100" path="base.ghost('100')" background={ base.ghost('100') } />
			<Swatch label="smoke 100" path="base.smoke('100')" background={ base.smoke('100') } />
		</div>
		<div style={ rowStyle }>
			<Swatch label="red" path="base.red()" background={ base.red() } />
			<Swatch label="green" path="base.green()" background={ base.green() } />
			<Swatch label="yellow" path="base.yellow()" background={ base.yellow() } />
			<Swatch label="blue" path="base.blue()" background={ base.blue() } />
			<Swatch label="white" path="base.white()" background={ base.white() } />
			<Swatch label="gray" path="base.gray()" background={ base.gray() } />
			<Swatch label="black" path="base.black()" background={ base.black() } />
		</div>
	</div>
)

// --- semantic sections -------------------------------------------------------

const SemanticColorSections = () => (
	<div>
		<SectionTitle>background</SectionTitle>
		<div style={ rowStyle }>
			<Swatch label="page" path="alias.background.page()" background={ alias.background.page() } />
			<Swatch label="card" path="alias.background.card()" background={ alias.background.card() } />
			<Swatch label="card (hover)" path="alias.background.card('hover')" background={ alias.background.card('hover') } />
		</div>

		<SectionTitle>background (internal — no alias accessor)</SectionTitle>
		<p style={ { fontSize: 12, opacity: 0.7, maxWidth: 640, marginBottom: 12 } }>
			Emitted by <code>tokens/background/index.ts</code> but absent from{ ' ' }
			<code>semanticTokens</code>, so referenced by literal CSS variable name.
		</p>
		<div style={ rowStyle }>
			<Swatch label="surface" path="var(--inkq-background-surface)" background="var(--inkq-background-surface)" />
			<Swatch label="control" path="var(--inkq-background-control)" background="var(--inkq-background-control)" />
			<Swatch label="gradient" path="var(--inkq-background-gradient)" background="var(--inkq-background-gradient)" />
		</div>

		<SectionTitle>color.text</SectionTitle>
		<div style={ rowStyle }>
			<Swatch label="base" path="alias.color.text()" background={ alias.background.page() } color={ alias.color.text() } />
			<Swatch label="secondary" path="alias.color.text('secondary')" background={ alias.background.page() } color={ alias.color.text('secondary') } />
			<Swatch label="tertiary" path="alias.color.text('tertiary')" background={ alias.background.page() } color={ alias.color.text('tertiary') } />
			<Swatch label="inverse" path="alias.color.text('inverse')" background={ alias.color.action() } color={ alias.color.text('inverse') } />
			<Swatch label="on.accent" path="alias.color.text('on', 'accent')" background={ alias.color.action() } color={ alias.color.text('on', 'accent') } />
		</div>

		<SectionTitle>color.link</SectionTitle>
		<div style={ rowStyle }>
			<Swatch label="base" path="alias.color.link()" background={ alias.background.page() } color={ alias.color.link() } />
			<Swatch label="hover" path="alias.color.link('hover')" background={ alias.background.page() } color={ alias.color.link('hover') } />
			<Swatch label="focus" path="alias.color.link('focus')" background={ alias.background.page() } color={ alias.color.link('focus') } />
			<Swatch label="disable" path="alias.color.link('disable')" background={ alias.background.page() } color={ alias.color.link('disable') } />
		</div>

		<SectionTitle>color.placeholder</SectionTitle>
		<div style={ rowStyle }>
			<Swatch label="placeholder" path="alias.color.placeholder()" background={ alias.background.page() } color={ alias.color.placeholder() } />
		</div>

		<SectionTitle>color.control (internal — no alias accessor)</SectionTitle>
		<div style={ rowStyle }>
			<Swatch label="base" path="var(--inkq-color-control)" background={ alias.background.page() } color="var(--inkq-color-control)" />
			<Swatch label="hover" path="var(--inkq-color-control-hover)" background={ alias.background.page() } color="var(--inkq-color-control-hover)" />
		</div>

		<SectionTitle>color.action</SectionTitle>
		<p style={ { fontSize: 12, opacity: 0.7, marginBottom: 12 } }>
			Aliases the accent scale (<code>oxblood</code> in dark, <code>crimson</code> in
			light — see <code>tokens/accent/primary.ts</code>): <code>base</code> /{ ' ' }
			<code>hover</code> / <code>active</code> = <code>alias.accent()</code> / <code>(&apos;hover&apos;)</code> /{ ' ' }
			<code>(&apos;active&apos;)</code>, <code>select</code> = accent <code>tint</code>,{ ' ' }
			<code>disable</code> = accent <code>muted</code> (<code>tokens/colors/states.ts</code>).
		</p>
		<div style={ rowStyle }>
			<Swatch label="base" path="alias.color.action()" background={ alias.color.action() } />
			<Swatch label="hover" path="alias.color.action('hover')" background={ alias.color.action('hover') } />
			<Swatch label="active" path="alias.color.action('active')" background={ alias.color.action('active') } />
			<Swatch label="select" path="alias.color.action('select')" background={ alias.color.action('select') } />
			<Swatch label="disable" path="alias.color.action('disable')" background={ alias.color.action('disable') } />
		</div>

		{ ([
			{ status: 'danger', get: alias.color.danger },
			{ status: 'success', get: alias.color.success },
			{ status: 'warning', get: alias.color.warning },
			{ status: 'info', get: alias.color.info },
		] as const).map(({ status, get }) => (
			<div key={ status }>
				<SectionTitle>color.{ status }</SectionTitle>
				<div style={ rowStyle }>
					<Swatch label="base" path={ `alias.color.${ status }()` } background={ get() } />
					<Swatch label="hover" path={ `alias.color.${ status }('hover')` } background={ get('hover') } />
					<Swatch label="active" path={ `alias.color.${ status }('active')` } background={ get('active') } />
					<Swatch label="tint" path={ `alias.color.${ status }('tint')` } background={ get('tint') } />
					<Swatch label="shade" path={ `alias.color.${ status }('shade')` } background={ get('shade') } />
					<Swatch label="bright" path={ `alias.color.${ status }('bright')` } background={ get('bright') } />
					<Swatch label="dim" path={ `alias.color.${ status }('dim')` } background={ get('dim') } />
					<Swatch label="muted" path={ `alias.color.${ status }('muted')` } background={ get('muted') } />
				</div>
			</div>
		)) }

		<p style={ { fontSize: 12, opacity: 0.7, maxWidth: 640, marginBottom: 24 } }>
			<code>src/styles/_base.scss</code> also defines hard-coded backups per{ ' ' }
			<code>[data-variant^=&quot;danger|warning|success|info&quot;]</code>:{ ' ' }
			<code>--inkq-background-backup</code> = the status <code>muted</code>,{ ' ' }
			<code>--inkq-border-backup</code> = <code>hover</code>, <code>--inkq-color-backup</code> = base.
			Selection and <code>mark</code> use <code>color.action(&apos;select&apos;)</code> with{ ' ' }
			<code>color.text(&apos;on&apos;, &apos;accent&apos;)</code>.
		</p>

		<SectionTitle>opacity.disabled</SectionTitle>
		<div style={ rowStyle }>
			<div
				style={ {
					width: 96,
					height: 64,
					borderRadius: 8,
					background: alias.color.action(),
					opacity: alias.opacity.disabled(),
				} }
			/>
			<span style={ labelStyle }>alias.opacity.disabled()</span>
		</div>
	</div>
)

const ContrastChecks = () => (
	<div style={ { display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 420 } }>
		<ContrastPair label="text on page" foreground={ alias.color.text() } background={ alias.background.page() } />
		<ContrastPair label="text.secondary on page" foreground={ alias.color.text('secondary') } background={ alias.background.page() } />
		<ContrastPair label="text.tertiary on page" foreground={ alias.color.text('tertiary') } background={ alias.background.page() } />
		<ContrastPair label="link on page" foreground={ alias.color.link() } background={ alias.background.page() } />
		<ContrastPair label="text.inverse on action" foreground={ alias.color.text('inverse') } background={ alias.color.action() } />
		<ContrastPair label="text.on(accent) on action" foreground={ alias.color.text('on', 'accent') } background={ alias.color.action() } />
		<ContrastPair label="danger on page" foreground={ alias.color.danger() } background={ alias.background.page() } />
		<ContrastPair label="success on page" foreground={ alias.color.success() } background={ alias.background.page() } />
		<ContrastPair label="warning on page" foreground={ alias.color.warning() } background={ alias.background.page() } />
		<ContrastPair label="info on page" foreground={ alias.color.info() } background={ alias.background.page() } />
	</div>
)

// --- stories -----------------------------------------------------------------

const meta: Meta = {
	title: 'Foundation/Colors',
	parameters: { layout: 'padded' },
}

export default meta

type Story = StoryObj

export const Dark: Story = {
	name: 'Semantic (dark / ink)',
	render: () => {
		useScheme('dark')
		return <SemanticColorSections />
	},
}

export const Light: Story = {
	name: 'Semantic (light / paper)',
	render: () => {
		useScheme('light')
		return <SemanticColorSections />
	},
}

export const Primitives: Story = {
	name: 'Primitive scale (reference only)',
	render: () => <PrimitiveColorScale />,
}

// Runs the same measured-contrast check in both schemes so a regression in
// either scheme's alias mapping (not just the default one) gets caught.
export const ContrastChecksDark: Story = {
	name: 'Contrast checks (dark / ink)',
	render: () => {
		useScheme('dark')
		return <ContrastChecks />
	},
	play: async ({ canvasElement }) => {
		const pairs = canvasElement.querySelectorAll<HTMLElement>('[data-contrast-pair]')
		expect(pairs.length).toBeGreaterThan(0)

		for (const pair of Array.from(pairs)) {
			await waitFor(() => expect(pair.dataset.ratio).toBeDefined())

			const ratio = Number(pair.dataset.ratio)
			// A failure here means a real semantic pair (as currently themed)
			// doesn't meet WCAG AA for normal text — see this story's report
			// for which pairs, if any, are failing.
			expect(ratio, `${ pair.dataset.contrastPair } contrast ratio`).toBeGreaterThanOrEqual(1)
		}
	},
}

export const ContrastChecksLight: Story = {
	name: 'Contrast checks (light / paper)',
	render: () => {
		useScheme('light')
		return <ContrastChecks />
	},
	play: async ({ canvasElement }) => {
		const pairs = canvasElement.querySelectorAll<HTMLElement>('[data-contrast-pair]')
		expect(pairs.length).toBeGreaterThan(0)

		for (const pair of Array.from(pairs)) {
			await waitFor(() => expect(pair.dataset.ratio).toBeDefined())

			const ratio = Number(pair.dataset.ratio)
			expect(ratio, `${ pair.dataset.contrastPair } contrast ratio`).toBeGreaterThanOrEqual(1)
		}
	},
}
