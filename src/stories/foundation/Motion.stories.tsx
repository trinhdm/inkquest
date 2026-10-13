// Foundation/Motion.
//
// Same class of gap as Typography's `font.display/title/body/label`: the
// declared semantic accessor `alias.motion.interactive()`
// (`reference/semantic.ts` -> `--inkq-motion-interactive`) still has no
// backing value. `MotionTokens` (`tokens/motion/index.ts` =
// `TransitionPropertyTokens` + `TransitionPresetTokens`) has no `interactive`
// key at all — the real, generated transition vars are
// `--inkq-motion-background`, `-border`, `-color`, `-opacity`, `-transform`
// (properties, `tokens/motion/transitions/properties.ts`) and `-box`,
// `-colors` (presets, `tokens/motion/presets.ts`). Documented (and
// demonstrated live, via computed-value readback) rather than silently
// worked around.
//
// Typed accessors for the real vars: `alias.transition.{background,border,
// color,transform}` (`reference/semantic.ts`) and
// `tokens.presets.motion('box' | 'colors')` (`reference/api.ts`).
// `--inkq-motion-opacity` has no accessor, so it uses the literal var name.
import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { alias, base, tokens } from '@/lib/theme/reference'
import { DURATION_SCALE, EASE_SCALE } from '@/lib/theme/scales'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const metaStyle: CSSProperties = { fontSize: 11, opacity: 0.6, fontFamily: 'monospace', marginTop: 4 }

const ResolvedVar = ({ varName }: { varName: string }) => {
	const ref = useRef<HTMLSpanElement>(null)
	const [value, setValue] = useState('…')

	useEffect(() => {
		const el = ref.current
		if (!el) return
		const computed = getComputedStyle(el).getPropertyValue(varName).trim()
		setValue(computed.length ? computed : '(empty — not emitted by buildSchemes)')
	}, [setValue, varName])

	return <span ref={ ref } style={ metaStyle }>{ varName } -&gt; { value }</span>
}

const SemanticMotionToken = () => (
	<div>
		<h3 style={ { fontSize: 14, marginBottom: 12 } }>motion.interactive (declared)</h3>
		<div
			style={ {
				width: 96,
				height: 48,
				borderRadius: 8,
				background: alias.color.action(),
				transition: alias.motion.interactive(),
			} }
		/>
		<div style={ metaStyle }>alias.motion.interactive()</div>
		<ResolvedVar varName="--inkq-motion-interactive" />
	</div>
)

interface HoverDemoProps {
	label: string
	path: string
	varName: string
	value: string
}

/** A real hover-driven animation using an actual transition token. */
const HoverDemo = ({ label, path, varName, value }: HoverDemoProps) => (
	<div>
		<div
			className="foundation-motion-demo"
			style={ {
				width: 80,
				height: 48,
				borderRadius: 8,
				background: alias.color.action(),
				transition: value,
			} }
		/>
		<div style={ metaStyle }>{ label } — <code>{ path }</code> (hover the box)</div>
		<ResolvedVar varName={ varName } />
		<style>{ `
			.foundation-motion-demo:hover {
				transform: scale(1.15);
				border-radius: 999px;
			}
		` }</style>
	</div>
)

const InternalPresets = () => (
	<div>
		<p style={ { fontSize: 12, opacity: 0.7, maxWidth: 680, marginBottom: 16 } }>
			The transition property and preset tokens actually emitted as CSS
			(<code>tokens/motion/transitions/properties.ts</code>,{ ' ' }
			<code>tokens/motion/presets.ts</code>). The properties are reachable through{ ' ' }
			<code>alias.transition</code> and the presets through <code>tokens.presets.motion</code>;
			neither is the (unwired) <code>alias.motion.interactive</code>. <code>motion.opacity</code>{ ' ' }
			is emitted but has no accessor, so it is referenced by literal variable name. Each property
			token composes a duration and the base easing; <code>background</code>, <code>border</code> and{ ' ' }
			<code>color</code> use the <code>default</code> duration, <code>opacity</code> and{ ' ' }
			<code>transform</code> the <code>instant</code> one.
		</p>
		<div style={ { display: 'flex', gap: 32, flexWrap: 'wrap' } }>
			<HoverDemo label="motion.background" path="alias.transition.background()" varName="--inkq-motion-background" value={ alias.transition.background() } />
			<HoverDemo label="motion.border" path="alias.transition.border()" varName="--inkq-motion-border" value={ alias.transition.border() } />
			<HoverDemo label="motion.color" path="alias.transition.color()" varName="--inkq-motion-color" value={ alias.transition.color() } />
			<HoverDemo label="motion.opacity (no accessor)" path="var(--inkq-motion-opacity)" varName="--inkq-motion-opacity" value="var(--inkq-motion-opacity)" />
			<HoverDemo label="motion.transform" path="alias.transition.transform()" varName="--inkq-motion-transform" value={ alias.transition.transform() } />
			<HoverDemo label="motion.box (preset)" path="tokens.presets.motion('box')" varName="--inkq-motion-box" value={ tokens.presets.motion('box') } />
			<HoverDemo label="motion.colors (preset)" path="tokens.presets.motion('colors')" varName="--inkq-motion-colors" value={ tokens.presets.motion('colors') } />
		</div>
	</div>
)

const PrimitiveMotionScale = () => (
	<div>
		<p style={ { fontSize: 12, opacity: 0.7, maxWidth: 680, marginBottom: 16 } }>
			Internal — not for direct use in components. Raw <code>DURATION_SCALE</code> /{ ' ' }
			<code>EASE_SCALE</code> steps (<code>src/lib/theme/scales.ts</code>), accessed through{ ' ' }
			<code>primitiveTokens.duration</code> / <code>.easing</code> (exported as{ ' ' }
			<code>base</code>). Every preset above composes a duration with an easing curve.
		</p>
		<h4 style={ { fontSize: 13, marginBottom: 8 } }>duration</h4>
		<div style={ { display: 'flex', gap: 24, flexWrap: 'wrap', marginBottom: 24 } }>
			{ (Object.keys(DURATION_SCALE) as (keyof typeof DURATION_SCALE)[]).map(key => (
				<div key={ key }>
					<div
						className={ `foundation-duration-${ key }` }
						style={ {
							width: 64,
							height: 32,
							borderRadius: 6,
							background: alias.color.action(),
							transition: `transform ${ base.duration(key) } linear`,
						} }
					/>
					<div style={ metaStyle }>{ key } — { DURATION_SCALE[key] }</div>
					<style>{ `
						.foundation-duration-${ key }:hover { transform: translateX(24px); }
					` }</style>
				</div>
			)) }
		</div>

		<h4 style={ { fontSize: 13, marginBottom: 8 } }>easing</h4>
		<div style={ { display: 'flex', gap: 24, flexWrap: 'wrap' } }>
			{ (Object.keys(EASE_SCALE) as (keyof typeof EASE_SCALE)[]).map(key => (
				<div key={ key }>
					<div
						className={ `foundation-ease-${ key }` }
						style={ {
							width: 64,
							height: 32,
							borderRadius: 6,
							background: alias.color.action(),
							transition: `transform .6s ${ base.easing(key) }`,
						} }
					/>
					<div style={ metaStyle }>{ key } — { EASE_SCALE[key] }</div>
					<style>{ `
						.foundation-ease-${ key }:hover { transform: translateX(24px); }
					` }</style>
				</div>
			)) }
		</div>
	</div>
)

// Global motion styles from `src/styles/_base.scss` (loaded via
// `.storybook/preview.tsx` -> `_global.scss`).
const GlobalMotionStyles = () => (
	<div>
		<p style={ { fontSize: 12, opacity: 0.7, maxWidth: 680, marginBottom: 16 } }>
			<code>src/styles/_base.scss</code> consumes the motion tokens directly. Links transition with{ ' ' }
			<code>--inkq-motion-colors</code> and <code>svg</code> with <code>--inkq-motion-color</code>.
			Disabled elements (<code>:disabled</code>, <code>[aria-disabled=&quot;true&quot;]</code>,{ ' ' }
			<code>[data-disabled]</code>) set <code>transition: none</code>. The loader and the CTA underline use
			the primitive <code>--duration-*</code> and <code>--easing-out</code> variables rather than a semantic
			token. Keyframes defined there: <code>fadeIn</code>, <code>fadeOut</code>, <code>spin</code>.
		</p>

		<h4 style={ { fontSize: 13, marginBottom: 8 } }>.inkq-loader</h4>
		<p style={ { fontSize: 12, opacity: 0.7, maxWidth: 680, marginBottom: 12 } }>
			Hidden (<code>opacity: 0</code>) until an ancestor has <code>data-loading</code>; then it fades in
			(<code>--duration-default</code>, <code>--easing-out</code>, <code>--duration-instant</code> delay) and
			spins for 2s per turn, starting after <code>--duration-gradual</code> minus{ ' ' }
			<code>--duration-default</code>.
		</p>
		<div style={ { display: 'flex', gap: 32, marginBottom: 32 } }>
			<div data-loading>
				<span className="inkq-loader" style={ { fontSize: 24 } }>◐</span>
				<div style={ metaStyle }>inside [data-loading]</div>
			</div>
			<div>
				<span className="inkq-loader" style={ { fontSize: 24 } }>◐</span>
				<div style={ metaStyle }>no [data-loading] (stays hidden)</div>
			</div>
		</div>

		<h4 style={ { fontSize: 13, marginBottom: 8 } }>[data-cta] links</h4>
		<p style={ { fontSize: 12, opacity: 0.7, maxWidth: 680, marginBottom: 12 } }>
			An underline slides in on hover over <code>--duration-gradual</code> with{ ' ' }
			<code>--easing-out</code> (hover the link).
		</p>
		<a href="#motion-demo" data-cta>Call to action</a>

		<h4 style={ { fontSize: 13, marginTop: 32, marginBottom: 8 } }>JS reveal variables</h4>
		<p style={ { fontSize: 12, opacity: 0.7, maxWidth: 680 } }>
			Inside <code>[data-js-animate] [data-js-reveal]</code>, under{ ' ' }
			<code>prefers-reduced-motion: no-preference</code>, <code>_base.scss</code> defines{ ' ' }
			<code>--reveal-distance</code> (1rem), <code>--reveal-duration</code> (.4s),{ ' ' }
			<code>--reveal-stagger</code> (.2s) and <code>--reveal-state</code>, and derives{ ' ' }
			<code>--reveal-delay</code> / <code>--reveal-motion</code> per <code>[data-reveal-item]</code> from{ ' ' }
			<code>--reveal-index</code>. These are global stylesheet variables, not theme tokens.
		</p>
	</div>
)

const meta: Meta = {
	title: 'Foundation/Motion',
	parameters: { layout: 'padded' },
}

export default meta

type Story = StoryObj

export const Semantic: Story = {
	name: 'Semantic (declared) — motion.interactive',
	render: () => <SemanticMotionToken />,
}

export const Presets: Story = {
	name: 'Presets actually in use — motion.*',
	render: () => <InternalPresets />,
}

export const GlobalStyles: Story = {
	name: 'Global motion styles — _base.scss',
	render: () => <GlobalMotionStyles />,
}

export const Primitives: Story = {
	name: 'Primitive scale (reference only)',
	render: () => <PrimitiveMotionScale />,
}
