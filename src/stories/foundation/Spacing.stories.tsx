// Foundation/Spacing & Layout.
//
// Public semantic surface here is narrow: only `tokens.breakpoint` and
// `tokens.container` are exported through `semanticTokens`
// (`reference/semantic.ts`) / the public `tokens` barrel (`@/lib/theme`).
// There is no public `tokens.space.*` — the primitive `space` scale
// (`primitiveTokens.space`, `reference/primitive.ts`) is only consumed
// internally, composed into things like `SpaceTokens`/`PaddingTokens`/
// `ElementTokens`/`GridTokens` (`tokens/layout/*.ts`), none of which are
// re-exported as typed accessors from `@/lib/theme`. This page documents
// the primitive scale as reference, plus a handful of those internal
// composites (referenced by their literal generated CSS variable name, the
// only way to reach them today) to show what the primitive scale is
// actually used for.
import { base } from '@/lib/theme/reference'
import { tokens } from '@/lib/theme'
import type { CSSProperties } from 'react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const metaStyle: CSSProperties = { fontSize: 11, opacity: 0.6, fontFamily: 'monospace', marginTop: 4 }

interface BarProps {
	label: string
	path: string
	width: string
}

/** A horizontal bar sized to a real breakpoint/container/space token — visible and comparable at a glance. */
const Bar = ({ label, path, width }: BarProps) => (
	<div style={ { marginBottom: 12 } }>
		<div style={ { height: 20, width, maxWidth: '100%', background: tokens.color.action(), borderRadius: 4 } } />
		<div style={ metaStyle }>{ label } — <code>{ path }</code> — { width }</div>
	</div>
)

const BREAKPOINT_KEYS = ['min', 'xs', 'sm', 'md', 'lg', 'xl', 'max'] as const
const CONTAINER_KEYS = ['block', 'page'] as const

const SemanticLayoutTokens = () => (
	<div>
		<h3 style={ { fontSize: 14, marginBottom: 12 } }>breakpoint</h3>
		<div style={ { marginBottom: 32 } }>
			{ BREAKPOINT_KEYS.map(key => (
				<Bar key={ key } label={ key } path={ `tokens.breakpoint('${ key }')` } width={ `min(100%, calc(${ tokens.breakpoint(key) } / 4))` } />
			)) }
		</div>

		<h3 style={ { fontSize: 14, marginBottom: 12 } }>container</h3>
		<div>
			{ CONTAINER_KEYS.map(key => (
				<Bar key={ key } label={ key } path={ `tokens.container('${ key }')` } width={ `min(100%, calc(${ tokens.container(key) } / 4))` } />
			)) }
		</div>
	</div>
)

const SPACE_STEPS = Array.from({ length: 16 }, (_, i) => `${ i + 1 }`) as Parameters<typeof base.space>[0][]

const PrimitiveSpaceScale = () => (
	<div>
		<p style={ { fontSize: 12, opacity: 0.7, maxWidth: 680, marginBottom: 16 } }>
			Internal — not for direct use in components. 16-step scale generated from{ ' ' }
			<code>SiteTheme.scale.space</code> (base unit <code>BASE_SCALE = 4</code>,{ ' ' }
			<code>src/lib/theme/scales.ts</code>) via <code>generate/strategies.ts</code>'s{ ' ' }
			<code>scaleStrategy</code>, accessed through <code>primitiveTokens.space</code>{ ' ' }
			(exported as <code>base</code>).
		</p>
		<div style={ { display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap' } }>
			{ SPACE_STEPS.map(step => (
				<div key={ step } style={ { textAlign: 'center' } }>
					<div style={ { width: base.space(step), height: base.space(step), background: tokens.color.action(), borderRadius: 4 } } />
					<div style={ metaStyle }>{ step }</div>
				</div>
			)) }
		</div>
	</div>
)

interface ComposedBoxProps {
	label: string
	varName: string
	dimension?: 'width' | 'padding' | 'gap'
}

const ComposedBox = ({ label, varName, dimension = 'padding' }: ComposedBoxProps) => (
	<div style={ { display: 'flex', flexDirection: 'column', alignItems: 'flex-start' } }>
		<div
			style={ {
				display: 'inline-block',
				background: tokens.background.card(),
				border: `1px solid ${ tokens.color.action() }`,
				borderRadius: 4,
				...(dimension === 'padding' ? { padding: `var(${ varName })` } : {}),
				...(dimension === 'width' ? { width: `var(${ varName })`, height: `var(${ varName })` } : {}),
				...(dimension === 'gap' ? { width: `var(${ varName })`, height: 8, background: tokens.color.action() } : {}),
			} }
		>
			{ dimension === 'padding' ? 'content' : null }
		</div>
		<div style={ metaStyle }>{ label } — <code>var({ varName })</code></div>
	</div>
)

const InternalComposites = () => (
	<div>
		<p style={ { fontSize: 12, opacity: 0.7, maxWidth: 680, marginBottom: 16 } }>
			Internal — a sample of the space-scale composites actually emitted as CSS
			(<code>tokens/layout/{ '{' }space,padding,element,grid{ '}' }.ts</code>), referenced here by
			their literal generated variable name since there is no typed accessor for them.
		</p>
		<h4 style={ { fontSize: 13, marginBottom: 8 } }>padding.block (`pad.block`)</h4>
		<div style={ { marginBottom: 24 } }>
			<ComposedBox label="pad.block" varName="--inkq-pad-block" dimension="padding" />
		</div>

		<h4 style={ { fontSize: 13, marginBottom: 8 } }>space.chip</h4>
		<div style={ { marginBottom: 24 } }>
			<ComposedBox label="space.chip" varName="--inkq-space-chip" dimension="padding" />
		</div>

		<h4 style={ { fontSize: 13, marginBottom: 8 } }>element.icon / element.tile</h4>
		<div style={ { display: 'flex', gap: 24, alignItems: 'flex-end' } }>
			<ComposedBox label="icon.sm" varName="--inkq-icon-sm" dimension="width" />
			<ComposedBox label="icon.md" varName="--inkq-icon-md" dimension="width" />
			<ComposedBox label="icon.lg" varName="--inkq-icon-lg" dimension="width" />
			<ComposedBox label="tile.sm" varName="--inkq-tile-sm" dimension="width" />
			<ComposedBox label="tile.md" varName="--inkq-tile-md" dimension="width" />
			<ComposedBox label="tile.lg" varName="--inkq-tile-lg" dimension="width" />
		</div>

		<h4 style={ { fontSize: 13, marginTop: 24, marginBottom: 8 } }>layout.gutter</h4>
		<ComposedBox label="gutter" varName="--inkq-gutter" dimension="gap" />
	</div>
)

const meta: Meta = {
	title: 'Foundation/Spacing',
	parameters: { layout: 'padded' },
}

export default meta

type Story = StoryObj

export const Semantic: Story = {
	name: 'Semantic — breakpoint & container',
	render: () => <SemanticLayoutTokens />,
}

export const Primitives: Story = {
	name: 'Primitive space scale (reference only)',
	render: () => <PrimitiveSpaceScale />,
}

export const Composites: Story = {
	name: 'Internal composites (reference only)',
	render: () => <InternalComposites />,
}
