// Foundation/Motion.
//
// Same class of gap as Typography's `font.display/title/body/label`: the
// declared semantic accessor `tokens.motion.interactive()`
// (`reference/semantic.ts` -> `--inkq-motion-interactive`) has no backing
// value. `MotionTokens` (`tokens/motion/index.ts` = `TransitionPropertyTokens`
// + `TransitionPresetTokens`) has no `interactive` key at all — the real,
// generated transition vars are `--inkq-motion-background`,
// `--inkq-motion-border`, `--inkq-motion-color`, `--inkq-motion-opacity`,
// `--inkq-motion-transform`, `--inkq-motion-box`, `--inkq-motion-colors`.
// Documented (and demonstrated live, via computed-value readback) rather
// than silently worked around.
import { base } from '@/lib/theme/reference'
import { DURATION_SCALE, EASE_SCALE, tokens } from '@/lib/theme'
import { useEffect, useRef, useState, type CSSProperties } from 'react'
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
	})

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
				background: tokens.color.action(),
				transition: tokens.motion.interactive(),
			} }
		/>
		<div style={ metaStyle }>tokens.motion.interactive()</div>
		<ResolvedVar varName="--inkq-motion-interactive" />
	</div>
)

interface HoverDemoProps {
	label: string
	varName: string
}

/** A real hover-driven animation using an actual internal transition preset var. */
const HoverDemo = ({ label, varName }: HoverDemoProps) => (
	<div>
		<div
			className="foundation-motion-demo"
			style={ {
				width: 80,
				height: 48,
				borderRadius: 8,
				background: tokens.color.action(),
				transition: `var(${ varName })`,
			} }
		/>
		<div style={ metaStyle }>{ label } — <code>var({ varName })</code> (hover the box)</div>
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
			Internal — the transition property/preset tokens actually emitted as CSS
			(<code>tokens/motion/transitions/properties.ts</code>,{ ' ' }
			<code>tokens/motion/presets.ts</code>), referenced by literal CSS variable name since
			there is no typed accessor for them beyond the (unwired) <code>tokens.motion.interactive</code>.
		</p>
		<div style={ { display: 'flex', gap: 32, flexWrap: 'wrap' } }>
			<HoverDemo label="motion.background" varName="--inkq-motion-background" />
			<HoverDemo label="motion.border" varName="--inkq-motion-border" />
			<HoverDemo label="motion.color" varName="--inkq-motion-color" />
			<HoverDemo label="motion.transform" varName="--inkq-motion-transform" />
			<HoverDemo label="motion.box (preset)" varName="--inkq-motion-box" />
			<HoverDemo label="motion.colors (preset)" varName="--inkq-motion-colors" />
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
							background: tokens.color.action(),
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
							background: tokens.color.action(),
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

export const Primitives: Story = {
	name: 'Primitive scale (reference only)',
	render: () => <PrimitiveMotionScale />,
}
