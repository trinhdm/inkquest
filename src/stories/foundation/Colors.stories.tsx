// Foundation/Colors — documents the theme's color-related token layers:
//
//   1. Semantic tokens (`tokens.color.*`, `tokens.background.*`) — imported
//      from the theme's real public barrel, `@/lib/theme` (`export {
//      semanticTokens as tokens } from './reference'` in
//      `src/lib/theme/index.ts`). This is the ONLY color surface components
//      are meant to consume directly (`reference/semantic.ts`: "limit
//      component usage to only semantic tokens").
//   2. Primitive tokens (`ink`/`paper`/`oxblood`/`crimson`/`ghost`/`smoke`
//      plus the static red/green/yellow/blue/white/gray/black swatches) —
//      imported from `@/lib/theme/reference`, NOT the public `@/lib/theme`
//      barrel, because `primitiveTokens` (exported there as `base`) is
//      deliberately not re-exported from `theme/index.ts`. That import is
//      intentional here (documentation needs to show what a semantic token
//      resolves to), but it is a one-way exception: nothing in this file
//      writes to or edits `src/lib/theme/`, and no component should import
//      `reference` directly — only `tokens` from `@/lib/theme`.
//
// Every swatch below is styled with the real accessor (`style={{ background:
// tokens.background.page() }}`), never a literal hex copied out of
// `scales.ts` — accessors resolve to `var(--inkq-*)`/`var(--ink-*)`
// references, and the actual color is whatever the currently-applied color
// scheme (`data-inkq-scheme` on `<html>`, via `schemeControls()`) resolves
// them to at paint time.
import { base } from '@/lib/theme/reference'
import { COLOR_TOKENS } from '@/lib/theme'
import { schemeControls } from '@/components/document/ScriptInjector'
import { tokens } from '@/lib/theme'
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { expect, waitFor } from 'storybook/test'
import type { ColorScheme } from '@/lib/theme'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

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
const parseRgb = (value: string): [number, number, number] => {
	const match = value.match(/rgba?\(([^)]+)\)/)
	if (!match) return [0, 0, 0]
	const [r, g, b] = match[1].split(',').map(part => parseFloat(part.trim()))
	return [r, g, b]
}

const relativeLuminance = ([r, g, b]: [number, number, number]) => {
	const channel = (c: number) => {
		const s = c / 255
		return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
	}
	return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b)
}

const contrastRatio = (fg: string, bg: string) => {
	const l1 = relativeLuminance(parseRgb(fg)),
		l2 = relativeLuminance(parseRgb(bg))
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
	})

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
			<Swatch label="page" path="tokens.background.page()" background={ tokens.background.page() } />
			<Swatch label="card" path="tokens.background.card()" background={ tokens.background.card() } />
			<Swatch label="card (hover)" path="tokens.background.card('hover')" background={ tokens.background.card('hover') } />
		</div>

		<SectionTitle>color.text</SectionTitle>
		<div style={ rowStyle }>
			<Swatch label="base" path="tokens.color.text()" background={ tokens.background.page() } color={ tokens.color.text() } />
			<Swatch label="secondary" path="tokens.color.text('secondary')" background={ tokens.background.page() } color={ tokens.color.text('secondary') } />
			<Swatch label="tertiary" path="tokens.color.text('tertiary')" background={ tokens.background.page() } color={ tokens.color.text('tertiary') } />
			<Swatch label="inverse" path="tokens.color.text('inverse')" background={ tokens.color.action() } color={ tokens.color.text('inverse') } />
			<Swatch label="on.accent" path="tokens.color.text('on', 'accent')" background={ tokens.color.action() } color={ tokens.color.text('on', 'accent') } />
		</div>

		<SectionTitle>color.link</SectionTitle>
		<div style={ rowStyle }>
			<Swatch label="base" path="tokens.color.link()" background={ tokens.background.page() } color={ tokens.color.link() } />
			<Swatch label="hover" path="tokens.color.link('hover')" background={ tokens.background.page() } color={ tokens.color.link('hover') } />
		</div>

		<SectionTitle>color.action</SectionTitle>
		<p style={ { fontSize: 12, opacity: 0.7, marginBottom: 12 } }>
			Themed from the internal accent scale (<code>oxblood</code> in dark, <code>crimson</code> in
			light — see <code>tokens/accent/primary.ts</code>); not directly accessible as an
			&quot;accent&quot; token itself, only through <code>tokens.color.action</code>.
		</p>
		<div style={ rowStyle }>
			<Swatch label="base" path="tokens.color.action()" background={ tokens.color.action() } />
			<Swatch label="hover" path="tokens.color.action('hover')" background={ tokens.color.action('hover') } />
			<Swatch label="active" path="tokens.color.action('active')" background={ tokens.color.action('active') } />
			<Swatch label="select" path="tokens.color.action('select')" background={ tokens.color.action('select') } />
			<Swatch label="disable" path="tokens.color.action('disable')" background={ tokens.color.action('disable') } />
		</div>

		{ ([
			{ status: 'danger', get: tokens.color.danger },
			{ status: 'success', get: tokens.color.success },
			{ status: 'warning', get: tokens.color.warning },
			{ status: 'info', get: tokens.color.info },
		] as const).map(({ status, get }) => (
			<div key={ status }>
				<SectionTitle>color.{ status }</SectionTitle>
				<div style={ rowStyle }>
					<Swatch label="base" path={ `tokens.color.${ status }()` } background={ get() } />
					<Swatch label="hover" path={ `tokens.color.${ status }('hover')` } background={ get('hover') } />
					<Swatch label="active" path={ `tokens.color.${ status }('active')` } background={ get('active') } />
					<Swatch label="tint" path={ `tokens.color.${ status }('tint')` } background={ get('tint') } />
					<Swatch label="shade" path={ `tokens.color.${ status }('shade')` } background={ get('shade') } />
					<Swatch label="bright" path={ `tokens.color.${ status }('bright')` } background={ get('bright') } />
					<Swatch label="dim" path={ `tokens.color.${ status }('dim')` } background={ get('dim') } />
					<Swatch label="muted" path={ `tokens.color.${ status }('muted')` } background={ get('muted') } />
				</div>
			</div>
		)) }

		<SectionTitle>opacity.disabled</SectionTitle>
		<div style={ rowStyle }>
			<div
				style={ {
					width: 96,
					height: 64,
					borderRadius: 8,
					background: tokens.color.action(),
					opacity: tokens.opacity.disabled(),
				} }
			/>
			<span style={ labelStyle }>tokens.opacity.disabled()</span>
		</div>
	</div>
)

const ContrastChecks = () => (
	<div style={ { display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 420 } }>
		<ContrastPair label="text on page" foreground={ tokens.color.text() } background={ tokens.background.page() } />
		<ContrastPair label="text.secondary on page" foreground={ tokens.color.text('secondary') } background={ tokens.background.page() } />
		<ContrastPair label="text.tertiary on page" foreground={ tokens.color.text('tertiary') } background={ tokens.background.page() } />
		<ContrastPair label="link on page" foreground={ tokens.color.link() } background={ tokens.background.page() } />
		<ContrastPair label="text.inverse on action" foreground={ tokens.color.text('inverse') } background={ tokens.color.action() } />
		<ContrastPair label="text.on(accent) on action" foreground={ tokens.color.text('on', 'accent') } background={ tokens.color.action() } />
		<ContrastPair label="danger on page" foreground={ tokens.color.danger() } background={ tokens.background.page() } />
		<ContrastPair label="success on page" foreground={ tokens.color.success() } background={ tokens.background.page() } />
		<ContrastPair label="warning on page" foreground={ tokens.color.warning() } background={ tokens.background.page() } />
		<ContrastPair label="info on page" foreground={ tokens.color.info() } background={ tokens.background.page() } />
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
