// Foundation/Typography.
//
// IMPORTANT — a real gap still exists, found by tracing the source rather than
// invented for documentation purposes: `semanticTokens.font`
// (`reference/semantic.ts`) declares four accessors — `alias.font.display()`,
// `.title()`, `.body()`, `.label()` — pointing at `--inkq-font-display`,
// `--inkq-font-title`, `--inkq-font-body`, `--inkq-font-label`. Tracing the
// token-generation pipeline (`buildSchemes.ts` -> `Tokens.typography()` in
// `tokens/typography/index.ts` -> `getFontPropertyTokens` /
// `getFontPresetTokens`, flattened by `generate/strategies.ts`), NONE of those
// four custom properties is produced:
//   - `font.*` (`FontPropertyTokens`, `tokens/typography/properties.ts`) yields
//     `--inkq-font-family-*` / `-size-*` / `-weight-*` / `-leading-*` /
//     `-tracking-*` — property scales, not a display/title/body/label preset.
//   - the composed presets live under `text.*` (`FontPresetTokens`,
//     `tokens/typography/presets.ts`), collapsed to `font` shorthand and
//     emitted as `--inkq-text-*`.
// So `alias.font.display/title/body/label` resolve to custom properties that
// are never declared. This page renders them with the real accessor anyway
// (per the "never hardcode" rule) and displays each one's ACTUAL computed
// value live, so the gap is visible rather than papered over. Fixing it is
// out of scope (it would mean editing `src/lib/theme/`).
//
// Accessor surfaces used here:
//   - `alias.fontFamily|fontSize|fontWeight|lineHeight|letterSpacing`
//     (`reference/semantic.ts` -> `aliasTokens`) for the property scales.
//   - `tokens.presets.text.*` (`reference/api.ts` -> `apiTokens`, exported as
//     `tokens`) for the composed presets. `label.mono` and `numeric` are
//     emitted but have no accessor there, so they use the literal var name.
import { alias, base, tokens } from '@/lib/theme/reference'
import {
	FONT_FAMILY_SCALE, FONT_SIZE_SCALE, FONT_WEIGHT_SCALE,
	LETTER_SPACING_SCALE, LINE_HEIGHT_SCALE,
} from '@/lib/theme/scales'
import { useEffect, useRef, useState, type CSSProperties } from 'react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const rowStyle: CSSProperties = { display: 'flex', flexDirection: 'column', gap: 20, marginBottom: 32 }
const metaStyle: CSSProperties = { fontSize: 11, opacity: 0.6, fontFamily: 'monospace', marginTop: 4 }
const noteStyle: CSSProperties = { fontSize: 12, opacity: 0.7, maxWidth: 680, marginBottom: 16 }
const headingStyle: CSSProperties = { fontSize: 13, marginBottom: 8 }

/** Reads back the ACTUAL computed value of a CSS custom property off a real, mounted element. */
const ResolvedVar = ({ varName }: { varName: string }) => {
	const ref = useRef<HTMLSpanElement>(null)
	const [value, setValue] = useState('…')

	useEffect(() => {
		const el = ref.current
		if (!el) return
		const computed = getComputedStyle(el).getPropertyValue(varName).trim()
		setValue(computed.length ? computed : '(empty — not emitted by buildSchemes)')
	}, [setValue, varName])

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
	style: CSSProperties
	sample?: string
}

/** One typography token applied to real sample text, with its path and live-resolved value. */
const TypeSample = ({ label, path, varName, style, sample = 'The quick brown fox jumps' }: SampleProps) => (
	<div>
		<div style={ style }>{ sample }</div>
		<div style={ metaStyle }>{ label } — <code>{ path }</code></div>
		<ResolvedVar varName={ varName } />
	</div>
)

// --- semantic (declared, per reference/semantic.ts) -------------------------

const SemanticFontTokens = () => (
	<div style={ rowStyle }>
		<TypeSample label="font.display" path="alias.font.display()" varName="--inkq-font-display" style={ { font: alias.font.display() } } />
		<TypeSample label="font.title" path="alias.font.title()" varName="--inkq-font-title" style={ { font: alias.font.title() } } />
		<TypeSample label="font.body" path="alias.font.body()" varName="--inkq-font-body" style={ { font: alias.font.body() } } />
		<TypeSample label="font.label" path="alias.font.label()" varName="--inkq-font-label" style={ { font: alias.font.label() } } />
	</div>
)

// --- font property scales (alias.font*) --------------------------------------

const HeadingSizes = () => {
	const headings = [
		{ key: 'h1', base: alias.fontSize('h1'), fluid: alias.fontSize('h1', 'fluid') },
		{ key: 'h2', base: alias.fontSize('h2'), fluid: alias.fontSize('h2', 'fluid') },
		{ key: 'h3', base: alias.fontSize('h3'), fluid: alias.fontSize('h3', 'fluid') },
		{ key: 'h4', base: alias.fontSize('h4'), fluid: alias.fontSize('h4', 'fluid') },
		{ key: 'h5', base: alias.fontSize('h5'), fluid: alias.fontSize('h5', 'fluid') },
	] as const

	return (
		<div style={ rowStyle }>
			{ headings.map(({ key, base: baseSize, fluid }) => (
				<div key={ key } style={ { display: 'flex', flexDirection: 'column', gap: 12 } }>
					<TypeSample
						label={ `font.size.${ key }` }
						path={ `alias.fontSize('${ key }')` }
						varName={ `--inkq-font-size-${ key }` }
						style={ { fontFamily: alias.fontFamily('heading'), fontWeight: alias.fontWeight('semibold'), fontSize: baseSize } }
						sample={ `Heading ${ key.slice(1) }` }
					/>
					<TypeSample
						label={ `font.size.${ key } (fluid)` }
						path={ `alias.fontSize('${ key }', 'fluid')` }
						varName={ `--inkq-font-size-${ key }-fluid` }
						style={ { fontFamily: alias.fontFamily('heading'), fontWeight: alias.fontWeight('semibold'), fontSize: fluid } }
						sample={ `Heading ${ key.slice(1) }` }
					/>
				</div>
			)) }
		</div>
	)
}

const OtherSizes = () => {
	const sizes = [
		{ label: 'display.sm', path: "alias.fontSize('display', 'sm')", varName: '--inkq-font-size-display-sm', value: alias.fontSize('display', 'sm') },
		{ label: 'display.md', path: "alias.fontSize('display', 'md')", varName: '--inkq-font-size-display-md', value: alias.fontSize('display', 'md') },
		{ label: 'display.lg', path: "alias.fontSize('display', 'lg')", varName: '--inkq-font-size-display-lg', value: alias.fontSize('display', 'lg') },
		{ label: 'body', path: "alias.fontSize('body')", varName: '--inkq-font-size-body', value: alias.fontSize('body') },
		{ label: 'body.lg', path: "alias.fontSize('body', 'lg')", varName: '--inkq-font-size-body-lg', value: alias.fontSize('body', 'lg') },
		{ label: 'label', path: "alias.fontSize('label')", varName: '--inkq-font-size-label', value: alias.fontSize('label') },
		{ label: 'label.sm', path: "alias.fontSize('label', 'sm')", varName: '--inkq-font-size-label-sm', value: alias.fontSize('label', 'sm') },
		{ label: 'caption', path: "alias.fontSize('caption')", varName: '--inkq-font-size-caption', value: alias.fontSize('caption') },
		{ label: 'control', path: "alias.fontSize('control')", varName: '--inkq-font-size-control', value: alias.fontSize('control') },
	]

	return (
		<div style={ rowStyle }>
			{ sizes.map(({ label, path, varName, value }) => (
				<TypeSample
					key={ varName }
					label={ `font.size.${ label }` }
					path={ path }
					varName={ varName }
					style={ { fontFamily: alias.fontFamily('body'), fontSize: value } }
					sample="Aa — The quick brown fox"
				/>
			)) }
		</div>
	)
}

const FontPropertyTokens = () => {
	const families = [
		{ key: 'display', path: "alias.fontFamily('display')", value: alias.fontFamily('display') },
		{ key: 'heading', path: "alias.fontFamily('heading')", value: alias.fontFamily('heading') },
		{ key: 'body', path: "alias.fontFamily('body')", value: alias.fontFamily('body') },
		{ key: 'mono', path: "alias.fontFamily('mono')", value: alias.fontFamily('mono') },
	]

	const weights = [
		{ key: 'normal', path: "alias.fontWeight('normal')", value: alias.fontWeight('normal') },
		{ key: 'semibold', path: "alias.fontWeight('semibold')", value: alias.fontWeight('semibold') },
		{ key: 'bold', path: "alias.fontWeight('bold')", value: alias.fontWeight('bold') },
	]

	const leading = [
		{ key: 'none', path: "alias.lineHeight('none')", value: alias.lineHeight('none') },
		{ key: 'heading', path: "alias.lineHeight('heading')", value: alias.lineHeight('heading') },
		{ key: 'body', path: "alias.lineHeight('body')", value: alias.lineHeight('body') },
		{ key: 'label', path: "alias.lineHeight('label')", value: alias.lineHeight('label') },
		{ key: 'prose', path: "alias.lineHeight('prose')", value: alias.lineHeight('prose') },
	]

	const tracking = [
		{ key: 'display', path: "alias.letterSpacing('display')", value: alias.letterSpacing('display') },
		{ key: 'heading', path: "alias.letterSpacing('heading')", value: alias.letterSpacing('heading') },
		{ key: 'stat', path: "alias.letterSpacing('stat')", value: alias.letterSpacing('stat') },
		{ key: 'meta', path: "alias.letterSpacing('meta')", value: alias.letterSpacing('meta') },
		{ key: 'prefix', path: "alias.letterSpacing('prefix')", value: alias.letterSpacing('prefix') },
		{ key: 'wide', path: "alias.letterSpacing('wide')", value: alias.letterSpacing('wide') },
	]

	return (
		<div>
			<p style={ noteStyle }>
				Property scales from <code>FontPropertyTokens</code> (<code>tokens/typography/properties.ts</code>),
				reached through <code>alias.fontFamily</code> / <code>fontWeight</code> / <code>lineHeight</code> /{ ' ' }
				<code>letterSpacing</code> / <code>fontSize</code> (<code>reference/semantic.ts</code>). Heading font sizes
				(<code>FontSizeTokens</code>) exist for <code>h1</code>–<code>h5</code> only, each with a <code>base</code> and a <code>fluid</code>{ ' ' }
				(<code>clamp()</code>) variant.
			</p>

			<h4 style={ headingStyle }>font family</h4>
			<div style={ rowStyle }>
				{ families.map(({ key, path, value }) => (
					<TypeSample key={ key } label={ `font.family.${ key }` } path={ path } varName={ `--inkq-font-family-${ key }` } style={ { fontFamily: value } } />
				)) }
			</div>

			<h4 style={ headingStyle }>font weight</h4>
			<div style={ rowStyle }>
				{ weights.map(({ key, path, value }) => (
					<TypeSample key={ key } label={ `font.weight.${ key }` } path={ path } varName={ `--inkq-font-weight-${ key }` } style={ { fontWeight: value } } />
				)) }
			</div>

			<h4 style={ headingStyle }>heading sizes (base and fluid)</h4>
			<HeadingSizes />

			<h4 style={ headingStyle }>other sizes</h4>
			<OtherSizes />

			<h4 style={ headingStyle }>line height (font.leading)</h4>
			<div style={ { display: 'flex', gap: 24, flexWrap: 'wrap', marginBottom: 32 } }>
				{ leading.map(({ key, path, value }) => (
					<div key={ key } style={ { width: 200 } }>
						<div style={ { lineHeight: value, border: '1px solid rgba(128,128,128,.35)', padding: 8 } }>
							Two lines of sample paragraph text to show the leading.
						</div>
						<div style={ metaStyle }>font.leading.{ key } — <code>{ path }</code></div>
						<ResolvedVar varName={ `--inkq-font-leading-${ key }` } />
					</div>
				)) }
			</div>

			<h4 style={ headingStyle }>letter spacing (font.tracking)</h4>
			<div style={ rowStyle }>
				{ tracking.map(({ key, path, value }) => (
					<TypeSample key={ key } label={ `font.tracking.${ key }` } path={ path } varName={ `--inkq-font-tracking-${ key }` } style={ { letterSpacing: value } } sample="TRACKING SAMPLE" />
				)) }
			</div>
		</div>
	)
}

// --- composed presets (text.*) ------------------------------------------------

interface PresetEntry {
	label: string
	path: string
	varName: string
	value: string
	sample?: string
}

const PresetTokens = () => {
	const text = tokens.presets.text

	const presets: PresetEntry[] = [
		{ label: 'text.h1', path: 'tokens.presets.text.h1()', varName: '--inkq-text-h1', value: text.h1(), sample: 'Heading one' },
		{ label: 'text.h2', path: 'tokens.presets.text.h2()', varName: '--inkq-text-h2', value: text.h2(), sample: 'Heading two' },
		{ label: 'text.h3', path: 'tokens.presets.text.h3()', varName: '--inkq-text-h3', value: text.h3(), sample: 'Heading three' },
		{ label: 'text.h4', path: 'tokens.presets.text.h4()', varName: '--inkq-text-h4', value: text.h4(), sample: 'Heading four' },
		{ label: 'text.h5', path: 'tokens.presets.text.h5()', varName: '--inkq-text-h5', value: text.h5(), sample: 'Heading five' },
		{ label: 'text.body', path: 'tokens.presets.text.body()', varName: '--inkq-text-body', value: text.body() },
		{ label: 'text.prose', path: 'tokens.presets.text.prose()', varName: '--inkq-text-prose', value: text.prose() },
		{ label: 'text.label', path: 'tokens.presets.text.label()', varName: '--inkq-text-label', value: text.label(), sample: 'Label text' },
		{ label: 'text.label.mono (no accessor)', path: 'var(--inkq-text-label-mono)', varName: '--inkq-text-label-mono', value: 'var(--inkq-text-label-mono)', sample: 'Label text' },
		{ label: 'text.control', path: 'tokens.presets.text.control()', varName: '--inkq-text-control', value: text.control(), sample: 'Control text' },
		{ label: 'text.navigation', path: 'tokens.presets.text.navigation()', varName: '--inkq-text-navigation', value: text.navigation(), sample: 'Nav item' },
		{ label: 'text.numeric (no accessor)', path: 'var(--inkq-text-numeric)', varName: '--inkq-text-numeric', value: 'var(--inkq-text-numeric)', sample: '0123456789' },
		{ label: 'text.caption', path: 'tokens.presets.text.caption()', varName: '--inkq-text-caption', value: text.caption(), sample: 'Caption text' },
		{ label: 'text.caption.image', path: "tokens.presets.text.caption('image')", varName: '--inkq-text-caption-image', value: text.caption('image'), sample: 'Image caption' },
		{ label: 'text.caption.item', path: "tokens.presets.text.caption('item')", varName: '--inkq-text-caption-item', value: text.caption('item'), sample: 'Item caption' },
		{ label: 'text.section.eyebrow', path: "tokens.presets.text.section('eyebrow')", varName: '--inkq-text-section-eyebrow', value: text.section('eyebrow'), sample: 'EYEBROW' },
	]

	return (
		<div>
			<p style={ noteStyle }>
				The composed presets (<code>src/lib/theme/tokens/typography/presets.ts</code>&apos;s{ ' ' }
				<code>FontPresetTokens</code>), each collapsed to a <code>font</code> shorthand and emitted as{ ' ' }
				<code>--inkq-text-*</code>. They are the shorthand layer — <code>reference/api.ts</code> says
				&quot;limit component usage to only shorthand tokens&quot; — exposed as{ ' ' }
				<code>tokens.presets.text</code>. <code>label.mono</code> and <code>numeric</code> are emitted but
				not wired into that accessor, so they are referenced by literal variable name. Heading presets use the
				base size; the fluid sizes are separate <code>font.size.hN.fluid</code> properties.
			</p>
			<div style={ rowStyle }>
				{ presets.map(({ label, path, varName, value, sample }) => (
					<TypeSample
						key={ varName }
						label={ label }
						path={ path }
						varName={ varName }
						style={ { font: value } }
						sample={ sample }
					/>
				)) }
			</div>
		</div>
	)
}

// --- global text styles (src/styles/_base.scss) ---------------------------------

const GLOBAL_HEADINGS = ['h1', 'h2', 'h3', 'h4', 'h5'] as const

/** Real elements, styled only by the global stylesheet loaded through `.storybook/preview.tsx` (`_global.scss` -> `_base.scss`). */
const GlobalTextStyles = () => (
	<div>
		<p style={ noteStyle }>
			Global element styles from <code>src/styles/_base.scss</code>, applied to unstyled elements below.
			<code> h1</code> / <code>h2</code> use their <code>--inkq-text-*</code> preset, then override the size with
			the <code>fluid</code> font size and set <code>--inkq-font-tracking-display</code>, uppercase and balanced
			wrapping; <code>h3</code> and <code>h5</code> use their preset directly, and <code>h4</code> uses its
			preset plus <code>--inkq-font-tracking-display</code>. <code>.inkq-h1-display</code> /{ ' ' }
			<code>.inkq-h2-display</code> swap the size for <code>--inkq-font-size-display-md</code> /{ ' ' }
			<code>-sm</code>. <code>_base.scss</code> has no <code>h6</code> rule. The readbacks below show the
			resolved <code>--inkq-text-*</code> variable for each styled heading.
		</p>
		<div style={ rowStyle }>
			{ GLOBAL_HEADINGS.map(tag => {
				const Tag = tag
				return (
					<div key={ tag }>
						<Tag style={ { margin: 0 } }>Heading { tag.slice(1) }</Tag>
						<ResolvedVar varName={ `--inkq-text-${ tag }` } />
					</div>
				)
			}) }
		</div>

		<h4 style={ headingStyle }>utility classes</h4>
		<div style={ rowStyle }>
			<div>
				<span className="inkq-eyebrow">Eyebrow</span>
				<div style={ metaStyle }>.inkq-eyebrow — text.section.eyebrow, tertiary color, wide tracking, uppercase</div>
			</div>
			<div>
				<span className="inkq-label">Label</span>
				<div style={ metaStyle }>.inkq-label — text.caption.item, action color, bold, wide tracking, uppercase</div>
			</div>
			<div>
				<span className="inkq-caption">Caption</span>
				<div style={ metaStyle }>.inkq-caption — text.caption.item, tertiary color, wide tracking, uppercase</div>
			</div>
			<div>
				<p className="inkq-prose" style={ { margin: 0, maxWidth: 480 } }>
					Prose copy, set in the prose preset with the secondary text color.
				</p>
				<div style={ metaStyle }>.inkq-prose — text.prose, secondary color</div>
			</div>
		</div>
	</div>
)

// --- primitive scale reference -----------------------------------------------

const PrimitiveTypeScale = () => (
	<div>
		<p style={ noteStyle }>
			Internal — not for direct use in components. Raw scale steps from{ ' ' }
			<code>FONT_FAMILY_SCALE</code> / <code>FONT_SIZE_SCALE</code> / <code>FONT_WEIGHT_SCALE</code>{ ' ' }
			/ <code>LINE_HEIGHT_SCALE</code> / <code>LETTER_SPACING_SCALE</code>{ ' ' }
			(<code>src/lib/theme/scales.ts</code>), accessed through <code>primitiveTokens</code>{ ' ' }
			(exported as <code>base</code>). The font property tokens above are composed from these
			(e.g. <code>font.size.h1</code> = <code>base.fontSize(&apos;48&apos;)</code>,{ ' ' }
			<code>font.family.display</code> = <code>base.fontFamily(&apos;black&apos;)</code>).
		</p>

		<h4 style={ headingStyle }>font family</h4>
		<div style={ rowStyle }>
			{ (Object.keys(FONT_FAMILY_SCALE) as (keyof typeof FONT_FAMILY_SCALE)[]).map(key => (
				<div key={ key } style={ { fontFamily: base.fontFamily(key) } }>
					{ key } — The quick brown fox
					<div style={ metaStyle }>base.fontFamily(&apos;{ key }&apos;)</div>
				</div>
			)) }
		</div>

		<h4 style={ headingStyle }>font size ({ FONT_SIZE_SCALE.length } steps)</h4>
		<div style={ { display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-end', marginBottom: 32 } }>
			{ FONT_SIZE_SCALE.map(size => (
				<div key={ size } style={ { textAlign: 'center' } }>
					<div style={ { fontSize: base.fontSize(`${ size }`) } }>Aa</div>
					<div style={ metaStyle }>{ size }</div>
				</div>
			)) }
		</div>

		<h4 style={ headingStyle }>font weight</h4>
		<div style={ { display: 'flex', gap: 24, marginBottom: 32 } }>
			{ FONT_WEIGHT_SCALE.map(weight => (
				<div key={ weight } style={ { fontWeight: base.fontWeight(`${ weight }`) } }>
					{ weight } — Aa
				</div>
			)) }
		</div>

		<h4 style={ headingStyle }>line height</h4>
		<div style={ { display: 'flex', gap: 24, flexWrap: 'wrap', marginBottom: 32 } }>
			{ (Object.keys(LINE_HEIGHT_SCALE) as (keyof typeof LINE_HEIGHT_SCALE)[]).map(key => (
				<div key={ key } style={ { width: 160, lineHeight: base.lineHeight(key), border: '1px solid rgba(128,128,128,.35)', padding: 8 } }>
					{ key }: Two lines of sample paragraph text to show the leading.
				</div>
			)) }
		</div>

		<h4 style={ headingStyle }>letter spacing ({ LETTER_SPACING_SCALE.length } steps)</h4>
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

export const Properties: Story = {
	name: 'Font property scales — alias.font*',
	render: () => <FontPropertyTokens />,
}

export const Presets: Story = {
	name: 'Presets actually in use — text.*',
	render: () => <PresetTokens />,
}

export const GlobalStyles: Story = {
	name: 'Global text styles — _base.scss',
	render: () => <GlobalTextStyles />,
}

export const Primitives: Story = {
	name: 'Primitive scale (reference only)',
	render: () => <PrimitiveTypeScale />,
}
