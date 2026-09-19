// Foundation/Typography.
//
// IMPORTANT — a real gap was found while writing this page, not invented for
// documentation purposes: `semanticTokens.font` (`reference/semantic.ts`)
// declares four public accessors — `tokens.font.display()`, `.title()`,
// `.body()`, `.label()` — pointing at `--inkq-font-display`,
// `--inkq-font-title`, `--inkq-font-body`, `--inkq-font-label`. Tracing the
// actual token-generation pipeline (`buildSchemes.ts` -> `Tokens.typography()`
// in `tokens/typography/index.ts` -> `getFontPropertyTokens` /
// `getFontPresetTokens`, flattened by `generate/strategies.ts`), NONE of
// those four CSS custom properties are ever produced:
//   - `font.*` (top-level, from `FontPropertyTokens`) only yields
//     `--inkq-font-family-*` / `--inkq-font-size-*` / `--inkq-font-weight-*`
//     (family/size/weight SCALES, not a `display`/`title`/`body`/`label`
//     shorthand).
//   - the actual composed presets live under `text.*`
//     (`FontPresetTokens` — h1/h2/h3/h4/body/label/control/navigation/
//     prose/caption/section), emitted as `--inkq-text-*` shorthand vars
//     (confirmed: `Button.stories.tsx` already reads
//     `var(--inkq-text-control)` directly).
// So `tokens.font.display/title/body/label` currently resolve to custom
// properties that were never declared — this page renders them with the
// real accessor anyway (per the "never hardcode" rule) and displays each
// one's ACTUAL computed value live, so the gap is visible rather than
// papered over. This is flagged in the agent report; fixing it is out of
// scope (it would mean editing `src/lib/theme/`).
import { base } from '@/lib/theme/reference'
import {
	FONT_FAMILY_SCALE, FONT_SIZE_SCALE,
	FONT_WEIGHT_SCALE, LETTER_SPACING_SCALE, LINE_HEIGHT_SCALE, tokens,
} from '@/lib/theme'
import { useEffect, useRef, useState, type CSSProperties } from 'react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const rowStyle: CSSProperties = { display: 'flex', flexDirection: 'column', gap: 20, marginBottom: 32 }
const metaStyle: CSSProperties = { fontSize: 11, opacity: 0.6, fontFamily: 'monospace', marginTop: 4 }

/** Reads back the ACTUAL computed value of a CSS custom property off a real, mounted element. */
const ResolvedVar = ({ varName }: { varName: string }) => {
	const ref = useRef<HTMLSpanElement>(null)
	const [value, setValue] = useState('…')

	useEffect(() => {
		const el = ref.current
		if (!el) return
		const computed = getComputedStyle(el).getPropertyValue(varName).trim()
		setValue(computed.length ? computed : '(empty — not emitted by buildSchemes)')
	})

	return (
		<span ref={ ref } style={ metaStyle }>
			{ varName } -&gt; { value }
		</span>
	)
}

interface SampleProps {
	label: string
	path: string
	varName: string
	font: string
	sample?: string
}

const FontSample = ({ label, path, varName, font, sample = 'The quick brown fox jumps' }: SampleProps) => (
	<div>
		<div style={ { font } }>{ sample }</div>
		<div style={ metaStyle }>{ label } — <code>{ path }</code></div>
		<ResolvedVar varName={ varName } />
	</div>
)

// --- semantic (declared, per reference/semantic.ts) -------------------------

const SemanticFontTokens = () => (
	<div style={ rowStyle }>
		<FontSample label="font.display" path="tokens.font.display()" varName="--inkq-font-display" font={ tokens.font.display() } />
		<FontSample label="font.title" path="tokens.font.title()" varName="--inkq-font-title" font={ tokens.font.title() } />
		<FontSample label="font.body" path="tokens.font.body()" varName="--inkq-font-body" font={ tokens.font.body() } />
		<FontSample label="font.label" path="tokens.font.label()" varName="--inkq-font-label" font={ tokens.font.label() } />
	</div>
)

// --- the presets that are actually wired (internal — no typed accessor) ----

const PRESET_VARS: { label: string, varName: string, sample?: string }[] = [
	{ label: 'text.h1 (fluid)', varName: '--inkq-text-h1-fluid', sample: 'Heading one' },
	{ label: 'text.h2 (fluid)', varName: '--inkq-text-h2-fluid', sample: 'Heading two' },
	{ label: 'text.h3', varName: '--inkq-text-h3', sample: 'Heading three' },
	{ label: 'text.h4', varName: '--inkq-text-h4', sample: 'Heading four' },
	{ label: 'text.body', varName: '--inkq-text-body' },
	{ label: 'text.label', varName: '--inkq-text-label', sample: 'LABEL TEXT' },
	{ label: 'text.control', varName: '--inkq-text-control', sample: 'Control text' },
	{ label: 'text.navigation', varName: '--inkq-text-navigation', sample: 'Nav item' },
	{ label: 'text.prose', varName: '--inkq-text-prose' },
	{ label: 'text.caption (base)', varName: '--inkq-text-caption', sample: 'Caption text' },
	{ label: 'text.section.body', varName: '--inkq-text-section-body' },
	{ label: 'text.section.eyebrow', varName: '--inkq-text-section-eyebrow', sample: 'EYEBROW' },
]

const InternalPresets = () => (
	<div>
		<p style={ { fontSize: 12, opacity: 0.7, maxWidth: 680, marginBottom: 16 } }>
			Internal — these are the presets that are actually composed and emitted as CSS
			(<code>src/lib/theme/tokens/typography/presets.ts</code>'s <code>FontPresetTokens</code>,
			flattened into shorthand <code>--inkq-text-*</code> variables). There is currently no
			typed accessor for them in the public <code>tokens</code> object — components reference
			them by literal CSS variable name today (e.g. <code>Button.stories.tsx</code>'s{ ' ' }
			<code>font: &apos;var(--inkq-text-control)&apos;</code>).
		</p>
		<div style={ rowStyle }>
			{ PRESET_VARS.map(({ label, varName, sample }) => (
				<FontSample
					key={ varName }
					label={ label }
					path={ `var(${ varName })` }
					varName={ varName }
					font={ `var(${ varName })` }
					sample={ sample }
				/>
			)) }
		</div>
	</div>
)

// --- primitive scale reference -----------------------------------------------

const PrimitiveTypeScale = () => (
	<div>
		<p style={ { fontSize: 12, opacity: 0.7, maxWidth: 680, marginBottom: 16 } }>
			Internal — not for direct use in components. Raw scale steps from{ ' ' }
			<code>FONT_FAMILY_SCALE</code> / <code>FONT_SIZE_SCALE</code> / <code>FONT_WEIGHT_SCALE</code>{ ' ' }
			/ <code>LINE_HEIGHT_SCALE</code> / <code>LETTER_SPACING_SCALE</code>{ ' ' }
			(<code>src/lib/theme/scales.ts</code>), accessed through <code>primitiveTokens</code>{ ' ' }
			(exported as <code>base</code>). Every preset above is composed from these.
		</p>

		<h4 style={ { fontSize: 13, marginBottom: 8 } }>font family</h4>
		<div style={ rowStyle }>
			{ (Object.keys(FONT_FAMILY_SCALE) as (keyof typeof FONT_FAMILY_SCALE)[]).map(key => (
				<div key={ key } style={ { fontFamily: base.fontFamily(key) } }>
					{ key } — The quick brown fox
					<div style={ metaStyle }>base.fontFamily(&apos;{ key }&apos;)</div>
				</div>
			)) }
		</div>

		<h4 style={ { fontSize: 13, marginBottom: 8 } }>font size ({ FONT_SIZE_SCALE.length } steps)</h4>
		<div style={ { display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-end', marginBottom: 32 } }>
			{ FONT_SIZE_SCALE.map(size => (
				<div key={ size } style={ { textAlign: 'center' } }>
					<div style={ { fontSize: base.fontSize(`${ size }`) } }>Aa</div>
					<div style={ metaStyle }>{ size }</div>
				</div>
			)) }
		</div>

		<h4 style={ { fontSize: 13, marginBottom: 8 } }>font weight</h4>
		<div style={ { display: 'flex', gap: 24, marginBottom: 32 } }>
			{ FONT_WEIGHT_SCALE.map(weight => (
				<div key={ weight } style={ { fontWeight: base.fontWeight(`${ weight }`) } }>
					{ weight } — Aa
				</div>
			)) }
		</div>

		<h4 style={ { fontSize: 13, marginBottom: 8 } }>line height</h4>
		<div style={ { display: 'flex', gap: 24, flexWrap: 'wrap', marginBottom: 32 } }>
			{ (Object.keys(LINE_HEIGHT_SCALE) as (keyof typeof LINE_HEIGHT_SCALE)[]).map(key => (
				<div key={ key } style={ { width: 160, lineHeight: base.lineHeight(key), border: '1px solid rgba(128,128,128,.35)', padding: 8 } }>
					{ key }: Two lines of sample paragraph text to show the leading.
				</div>
			)) }
		</div>

		<h4 style={ { fontSize: 13, marginBottom: 8 } }>letter spacing ({ LETTER_SPACING_SCALE.length } steps)</h4>
		<div style={ { display: 'flex', flexDirection: 'column', gap: 8 } }>
			{ LETTER_SPACING_SCALE.map((value, i) => {
				const step = `0${ i + 1 }` as Parameters<typeof base.letterSpacing>[0]
				return (
					<div key={ step } style={ { letterSpacing: base.letterSpacing(step) } }>
						{ step } ({ value }) — TRACKING SAMPLE
					</div>
				)
			}) }
		</div>
	</div>
)

// --- stories ------------------------------------------------------------------

const meta: Meta = {
	title: 'Foundation/Typography',
	parameters: { layout: 'padded' },
}

export default meta

type Story = StoryObj

export const Semantic: Story = {
	name: 'Semantic (declared) — font.*',
	render: () => <SemanticFontTokens />,
}

export const Presets: Story = {
	name: 'Presets actually in use — text.*',
	render: () => <InternalPresets />,
}

export const Primitives: Story = {
	name: 'Primitive scale (reference only)',
	render: () => <PrimitiveTypeScale />,
}
