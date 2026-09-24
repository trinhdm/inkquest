// Foundation/Border, Radius & Opacity.
//
// None of border color, border radius, or the accent scale behind them have
// a public semantic accessor — `semanticTokens` (`reference/semantic.ts`)
// exposes `background`, `breakpoint`, `container`, `color`, `font`,
// `opacity.disabled`, and `motion`, but not `border`/`borderRadius`. Those
// live only in `aliasTokens` (`reference/semantic.ts`'s `propertyTokens`,
// exported as `alias` from `reference/index.ts`), which `@/lib/theme`'s
// public barrel does NOT re-export. So this page documents border/radius
// via their literal, generated CSS variable names (the only way to reach
// them today) rather than a typed `tokens.*` accessor — unlike Colors,
// Typography, Spacing, and Motion's semantic sections, there's no
// `tokens.border...` call to demonstrate here.
//
// `opacity.disabled` IS public (`tokens.opacity.disabled()`) and is
// documented on the Colors page (paired with a disabled-state swatch); it's
// cross-referenced, not repeated, here.
import { base } from '@/lib/theme/reference'
import { RADIUS_SCALE, tokens } from '@/lib/theme'
import type { CSSProperties } from 'react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const metaStyle: CSSProperties = { fontSize: 11, opacity: 0.6, fontFamily: 'monospace', marginTop: 4 }

interface RadiusBoxProps {
	label: string
	varName: string
}

const RadiusBox = ({ label, varName }: RadiusBoxProps) => (
	<div style={ { textAlign: 'center' } }>
		<div
			style={ {
				width: 64,
				height: 64,
				background: tokens.color.action(),
				borderRadius: `var(${ varName })`,
			} }
		/>
		<div style={ metaStyle }>{ label }</div>
		<div style={ metaStyle }>var({ varName })</div>
	</div>
)

const InternalRadiusPresets = () => (
	<div>
		<p style={ { fontSize: 12, opacity: 0.7, maxWidth: 680, marginBottom: 16 } }>
			Internal — <code>BorderRadiusTokens</code> (<code>tokens/border/radius.ts</code>), emitted as
			<code>--inkq-border-radius-*</code>. Referenced by literal CSS variable name; reachable
			internally only via <code>alias.borderRadius(...)</code>
			(<code>reference/semantic.ts</code>'s <code>propertyTokens</code>), which is not part of the
			public <code>tokens</code> barrel.
		</p>
		<div style={ { display: 'flex', gap: 24, flexWrap: 'wrap' } }>
			<RadiusBox label="none" varName="--inkq-border-radius-none" />
			<RadiusBox label="sm" varName="--inkq-border-radius-sm" />
			<RadiusBox label="md" varName="--inkq-border-radius-md" />
			<RadiusBox label="lg" varName="--inkq-border-radius-lg" />
			<RadiusBox label="pill" varName="--inkq-border-radius-pill" />
			<RadiusBox label="chip (preset)" varName="--inkq-border-radius-chip" />
			<RadiusBox label="control (preset)" varName="--inkq-border-radius-control" />
		</div>
	</div>
)

interface BorderSwatchProps {
	label: string
	varName: string
}

const BorderSwatch = ({ label, varName }: BorderSwatchProps) => (
	<div>
		<div
			style={ {
				width: 120,
				height: 56,
				borderRadius: 8,
				background: tokens.background.card(),
				border: `2px solid var(${ varName })`,
			} }
		/>
		<div style={ metaStyle }>{ label } — var({ varName })</div>
	</div>
)

const InternalBorderColors = () => (
	<div>
		<p style={ { fontSize: 12, opacity: 0.7, maxWidth: 680, marginBottom: 16 } }>
			Internal — <code>BorderColorTokens</code> (<code>tokens/border/color.ts</code>), themed
			per-scheme (<code>colors.theme('500')</code> / <code>('600')</code>), emitted as{ ' ' }
			<code>--inkq-border</code> / <code>--inkq-border-strong</code>. Reachable internally via{ ' ' }
			<code>alias.border()</code>.
		</p>
		<div style={ { display: 'flex', gap: 24 } }>
			<BorderSwatch label="border (base)" varName="--inkq-border" />
			<BorderSwatch label="border.strong" varName="--inkq-border-strong" />
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
			presets above alias these steps 1:1 (<code>none</code>→01, <code>sm</code>→02, <code>md</code>→03,
			<code>lg</code>→04, <code>pill</code>→05).
		</p>
		<div style={ { display: 'flex', gap: 24, flexWrap: 'wrap' } }>
			{ RADIUS_STEPS.map((step, i) => (
				<div key={ step } style={ { textAlign: 'center' } }>
					<div
						style={ {
							width: 64,
							height: 64,
							background: tokens.color.action(),
							borderRadius: base.radius(step),
						} }
					/>
					<div style={ metaStyle }>{ step } ({ RADIUS_SCALE[i] }px)</div>
				</div>
			)) }
		</div>
	</div>
)

const OpacityCrossReference = () => (
	<p style={ { fontSize: 13, maxWidth: 640 } }>
		<code>tokens.opacity.disabled()</code> (the one public opacity token) and the full{ ' ' }
		<code>OPACITY_SCALE</code> primitive reference live on{ ' ' }
		<strong>Foundation / Colors</strong> (paired with the disabled action-color swatch, since
		opacity is almost always applied together with a color/background token in this system).
	</p>
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
	name: 'Opacity (see Colors)',
	render: () => <OpacityCrossReference />,
}
