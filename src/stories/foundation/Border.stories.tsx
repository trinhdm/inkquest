// Foundation/Border, Radius & Opacity.
//
// Border color and border radius have no entry in `semanticTokens`
// (`reference/semantic.ts`), but both have typed accessors on `aliasTokens`
// (exported as `alias` from `reference/index.ts`): `alias.border()` /
// `alias.border('strong')` and `alias.borderRadius(...)`. This page uses those
// accessors rather than literal variable names, and labels the section
// internal because they sit outside the `semanticTokens` group that
// `semantic.ts` says components should be limited to.
//
// `opacity.disabled` IS in `semanticTokens` (`alias.opacity.disabled()`), and
// is shown here with the primitive opacity scale it aliases.
//
// Not documented on purpose: `getBorderPresetTokens`
// (`tokens/border/presets.ts`, a `subtle` border shorthand) is defined but is
// not called from `buildSchemes.ts`, so no `--inkq-border-subtle*` variable is
// emitted.
import { alias, base } from '@/lib/theme/reference'
import { OPACITY_SCALE, RADIUS_SCALE } from '@/lib/theme/scales'
import type { CSSProperties } from 'react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const metaStyle: CSSProperties = { fontSize: 11, opacity: 0.6, fontFamily: 'monospace', marginTop: 4 }

interface RadiusBoxProps {
	label: string
	path: string
	value: string
}

const RadiusBox = ({ label, path, value }: RadiusBoxProps) => (
	<div style={ { textAlign: 'center' } }>
		<div
			style={ {
				width: 64,
				height: 64,
				background: alias.color.action(),
				borderRadius: value,
			} }
		/>
		<div style={ metaStyle }>{ label }</div>
		<div style={ metaStyle }>{ path }</div>
	</div>
)

const InternalRadiusPresets = () => {
	const radii: RadiusBoxProps[] = [
		{ label: 'none', path: "alias.borderRadius('none')", value: alias.borderRadius('none') },
		{ label: 'sm', path: "alias.borderRadius('sm')", value: alias.borderRadius('sm') },
		{ label: 'md', path: "alias.borderRadius('md')", value: alias.borderRadius('md') },
		{ label: 'lg', path: "alias.borderRadius('lg')", value: alias.borderRadius('lg') },
		{ label: 'pill', path: "alias.borderRadius('pill')", value: alias.borderRadius('pill') },
		{ label: 'chip (preset)', path: "alias.borderRadius('chip')", value: alias.borderRadius('chip') },
		{ label: 'control (preset)', path: "alias.borderRadius('control')", value: alias.borderRadius('control') },
	]

	return (
		<div>
			<p style={ { fontSize: 12, opacity: 0.7, maxWidth: 680, marginBottom: 16 } }>
				Internal — <code>BorderRadiusTokens</code> (<code>tokens/border/radius.ts</code>), emitted as{ ' ' }
				<code>--inkq-border-radius-*</code> and reached through <code>alias.borderRadius(...)</code>{ ' ' }
				(<code>reference/semantic.ts</code>&apos;s <code>propertyTokens</code>), which is outside the{ ' ' }
				<code>semanticTokens</code> group. <code>chip</code> aliases <code>sm</code> and{ ' ' }
				<code>control</code> aliases <code>pill</code>. <code>src/styles/_base.scss</code> uses{ ' ' }
				<code>chip</code> for the <code>a</code> / <code>button</code> focus ring and <code>md</code>{ ' ' }
				(with <code>--inkq-border</code>) for <code>.inkq-item--block</code>.
			</p>
			<div style={ { display: 'flex', gap: 24, flexWrap: 'wrap' } }>
				{ radii.map(radius => <RadiusBox key={ radius.label } { ...radius } />) }
			</div>
		</div>
	)
}

interface BorderSwatchProps {
	label: string
	path: string
	value: string
}

const BorderSwatch = ({ label, path, value }: BorderSwatchProps) => (
	<div>
		<div
			style={ {
				width: 120,
				height: 56,
				borderRadius: 8,
				background: alias.background.card(),
				border: `2px solid ${ value }`,
			} }
		/>
		<div style={ metaStyle }>{ label } — { path }</div>
	</div>
)

const InternalBorderColors = () => (
	<div>
		<p style={ { fontSize: 12, opacity: 0.7, maxWidth: 680, marginBottom: 16 } }>
			Internal — <code>BorderColorTokens</code> (<code>tokens/border/color.ts</code>), themed
			per-scheme (<code>colors.theme(&apos;500&apos;)</code> / <code>(&apos;600&apos;)</code>), emitted as{ ' ' }
			<code>--inkq-border</code> / <code>--inkq-border-strong</code>. Reached through{ ' ' }
			<code>alias.border()</code>.
		</p>
		<div style={ { display: 'flex', gap: 24 } }>
			<BorderSwatch label="border (base)" path="alias.border()" value={ alias.border() } />
			<BorderSwatch label="border.strong" path="alias.border('strong')" value={ alias.border('strong') } />
		</div>
	</div>
)

const RADIUS_STEPS = ['01', '02', '03', '04', '05'] as const satisfies readonly Parameters<typeof base.radius>[0][]

const PrimitiveRadiusScale = () => (
	<div>
		<p style={ { fontSize: 12, opacity: 0.7, maxWidth: 680, marginBottom: 16 } }>
			Internal — not for direct use in components. { RADIUS_SCALE.length }-step scale{ ' ' }
			(<code>RADIUS_SCALE = [{ RADIUS_SCALE.join(', ') }]</code>, <code>src/lib/theme/scales.ts</code>),
			accessed through <code>primitiveTokens.radius</code> (exported as <code>base</code>). The
			presets above alias these steps 1:1 (<code>none</code>→01, <code>sm</code>→02, <code>md</code>→03,{ ' ' }
			<code>lg</code>→04, <code>pill</code>→05).
		</p>
		<div style={ { display: 'flex', gap: 24, flexWrap: 'wrap' } }>
			{ RADIUS_STEPS.map((step, i) => (
				<div key={ step } style={ { textAlign: 'center' } }>
					<div
						style={ {
							width: 64,
							height: 64,
							background: alias.color.action(),
							borderRadius: base.radius(step),
						} }
					/>
					<div style={ metaStyle }>{ step } ({ RADIUS_SCALE[i] }px)</div>
				</div>
			)) }
		</div>
	</div>
)

const OpacityTokens = () => (
	<div>
		<h3 style={ { fontSize: 14, marginBottom: 12 } }>opacity.disabled</h3>
		<div style={ { display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 } }>
			<div
				style={ {
					width: 96,
					height: 64,
					borderRadius: 8,
					background: alias.color.action(),
					opacity: alias.opacity.disabled(),
				} }
			/>
			<span style={ metaStyle }>alias.opacity.disabled() — aliases base.opacity(&apos;0.65&apos;)</span>
		</div>

		<h4 style={ { fontSize: 13, marginBottom: 8 } }>primitive opacity scale (reference only)</h4>
		<p style={ { fontSize: 12, opacity: 0.7, maxWidth: 680, marginBottom: 16 } }>
			Internal — not for direct use in components. <code>OPACITY_SCALE</code> (
			<code>src/lib/theme/scales.ts</code>) through <code>primitiveTokens.opacity</code> (exported as{ ' ' }
			<code>base</code>), keyed by the step value as a string (<code>base.opacity(&apos;0.2&apos;)</code> →{ ' ' }
			<code>--opacity-20</code>, <code>base.opacity(&apos;0&apos;)</code> → <code>--opacity-0</code>).
		</p>
		<div style={ { display: 'flex', gap: 24, flexWrap: 'wrap' } }>
			{ OPACITY_SCALE.map(step => (
				<div key={ step } style={ { textAlign: 'center' } }>
					<div
						style={ {
							width: 64,
							height: 64,
							borderRadius: 8,
							background: alias.color.action(),
							opacity: base.opacity(`${ step }`),
						} }
					/>
					<div style={ metaStyle }>{ step }</div>
				</div>
			)) }
		</div>
	</div>
)

const meta: Meta = {
	title: 'Foundation/Border',
	parameters: { layout: 'padded' },
}

export default meta

type Story = StoryObj

export const RadiusPresets: Story = {
	name: 'Radius presets (internal)',
	render: () => <InternalRadiusPresets />,
}

export const BorderColors: Story = {
	name: 'Border colors (internal)',
	render: () => <InternalBorderColors />,
}

export const RadiusPrimitives: Story = {
	name: 'Primitive radius scale (reference only)',
	render: () => <PrimitiveRadiusScale />,
}

export const Opacity: Story = {
	name: 'Opacity',
	render: () => <OpacityTokens />,
}
