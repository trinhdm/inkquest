// Foundation/Spacing & Layout.
//
// Accessor surfaces used here (all from `@/lib/theme/reference`):
//   - `alias.breakpoint` / `alias.container` / `alias.space`
//     (`reference/semantic.ts`'s `semanticTokens`) — the semantic layer.
//   - `tokens.padding` / `tokens.el.icon.size` / `tokens.el.field.padding`
//     (`reference/api.ts`'s `apiTokens`, exported as `tokens`) — typed
//     accessors for the padding, icon and field-padding composites.
//   - `base.space` / `base.icon` / `base.screen` — primitives, reference only.
// The remaining composites that `tokens/layout/{element,grid}.ts` emit
// (`dot`, `tile`, `gutter`, `hero`, `section`, `stack`, `footer`, `navbar`,
// `subnav`, `field.gap`) have no accessor in either registry, so they are referenced by
// their literal generated `--inkq-*` variable name.
import { alias, base, tokens } from '@/lib/theme/reference'
import { ICON_SCALE, SCREEN_SCALE } from '@/lib/theme/scales'
import type { CSSProperties } from 'react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const metaStyle: CSSProperties = { fontSize: 11, opacity: 0.6, fontFamily: 'monospace', marginTop: 4 }
const noteStyle: CSSProperties = { fontSize: 12, opacity: 0.7, maxWidth: 680, marginBottom: 16 }

interface BarProps {
	label: string
	path: string
	width: string
}

/** A horizontal bar sized to a real breakpoint/container/space token — visible and comparable at a glance. */
const Bar = ({ label, path, width }: BarProps) => (
	<div style={ { marginBottom: 12 } }>
		<div style={ { height: 20, width, maxWidth: '100%', background: alias.color.action(), borderRadius: 4 } } />
		<div style={ metaStyle }>{ label } — <code>{ path }</code></div>
	</div>
)

interface TokenBoxProps {
	label: string
	path: string
	value: string
	/** 'padding' applies the token as padding around text; 'size' draws a square of that size. */
	kind: 'padding' | 'size'
}

/** One layout token applied as its real CSS effect, labeled with its accessor path and the value it resolves through. */
const TokenBox = ({ label, path, value, kind }: TokenBoxProps) => (
	<div style={ { display: 'flex', flexDirection: 'column', alignItems: 'flex-start' } }>
		<div
			style={ {
				display: 'inline-block',
				background: alias.background.card(),
				border: `1px solid ${ alias.color.action() }`,
				borderRadius: 4,
				...(kind === 'padding' ? { padding: value } : { width: value, height: value, background: alias.color.action() }),
			} }
		>
			{ kind === 'padding' ? 'content' : null }
		</div>
		<div style={ metaStyle }>{ label }</div>
		<div style={ metaStyle }><code>{ path }</code></div>
	</div>
)

const boxRow: CSSProperties = { display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'flex-end', marginBottom: 32 }

// --- semantic -----------------------------------------------------------------

const BREAKPOINT_KEYS = ['min', 'xs', 'sm', 'md', 'lg', 'xl', 'max'] as const
const CONTAINER_KEYS = ['block', 'page'] as const

const SemanticLayoutTokens = () => {
	const spaces: TokenBoxProps[] = [
		{ label: 'space.chip', path: "alias.space('chip')", value: alias.space('chip'), kind: 'padding' },
		{ label: 'space.icon', path: "alias.space('icon')", value: alias.space('icon'), kind: 'size' },
		{ label: 'space.menu', path: "alias.space('menu')", value: alias.space('menu'), kind: 'size' },
		{ label: 'space.group', path: "alias.space('group')", value: alias.space('group'), kind: 'padding' },
		{ label: 'space.group.lg', path: "alias.space('group', 'lg')", value: alias.space('group', 'lg'), kind: 'padding' },
		{ label: 'space.grid', path: "alias.space('grid')", value: alias.space('grid'), kind: 'size' },
		{ label: 'space.grid.lg', path: "alias.space('grid', 'lg')", value: alias.space('grid', 'lg'), kind: 'size' },
	]

	return (
		<div>
			<h3 style={ { fontSize: 14, marginBottom: 12 } }>breakpoint</h3>
			<div style={ { marginBottom: 32 } }>
				{ BREAKPOINT_KEYS.map(key => (
					<Bar key={ key } label={ key } path={ `alias.breakpoint('${ key }')` } width={ `min(100%, calc(${ alias.breakpoint(key) } / 4))` } />
				)) }
			</div>

			<h3 style={ { fontSize: 14, marginBottom: 12 } }>container</h3>
			<div style={ { marginBottom: 32 } }>
				{ CONTAINER_KEYS.map(key => (
					<Bar key={ key } label={ key } path={ `alias.container('${ key }')` } width={ `min(100%, calc(${ alias.container(key) } / 4))` } />
				)) }
			</div>

			<h3 style={ { fontSize: 14, marginBottom: 12 } }>space</h3>
			<p style={ noteStyle }>
				<code>SpaceTokens</code> (<code>tokens/layout/space.ts</code>). Two-value tokens
				(<code>chip</code>, <code>group</code>) are vertical / horizontal pairs and are shown as padding;
				single-value tokens are shown as a square of that size.
			</p>
			<div style={ boxRow }>
				{ spaces.map(space => <TokenBox key={ space.path } { ...space } />) }
			</div>
		</div>
	)
}

// --- api (typed shorthand accessors) --------------------------------------------

const ApiLayoutTokens = () => {
	const padding: TokenBoxProps[] = [
		{ label: 'pad.block', path: "tokens.padding('block')", value: tokens.padding('block'), kind: 'padding' },
		{ label: 'pad.chip', path: "tokens.padding('chip')", value: tokens.padding('chip'), kind: 'padding' },
		{ label: 'pad.item', path: "tokens.padding('item')", value: tokens.padding('item'), kind: 'padding' },
		{ label: 'pad.menu', path: "tokens.padding('menu')", value: tokens.padding('menu'), kind: 'padding' },
	]

	const icons: TokenBoxProps[] = [
		{ label: 'icon.sm', path: "tokens.el.icon.size('sm')", value: tokens.el.icon.size('sm'), kind: 'size' },
		{ label: 'icon.md', path: "tokens.el.icon.size('md')", value: tokens.el.icon.size('md'), kind: 'size' },
		{ label: 'icon.lg', path: "tokens.el.icon.size('lg')", value: tokens.el.icon.size('lg'), kind: 'size' },
	]

	const fieldPadding: TokenBoxProps[] = [
		{ label: 'field.padding.sm', path: "tokens.el.field.padding('sm')", value: tokens.el.field.padding('sm'), kind: 'padding' },
		{ label: 'field.padding.md', path: "tokens.el.field.padding('md')", value: tokens.el.field.padding('md'), kind: 'padding' },
		{ label: 'field.padding.lg', path: "tokens.el.field.padding('lg')", value: tokens.el.field.padding('lg'), kind: 'padding' },
	]

	return (
		<div>
			<p style={ noteStyle }>
				Typed accessors on <code>tokens</code> (<code>reference/api.ts</code>, &quot;limit component usage
				to only shorthand tokens&quot;). <code>tokens.space</code> is the same accessor as{ ' ' }
				<code>alias.space</code> above.
			</p>

			<h4 style={ { fontSize: 13, marginBottom: 8 } }>padding (<code>PaddingTokens</code>)</h4>
			<div style={ boxRow }>
				{ padding.map(item => <TokenBox key={ item.path } { ...item } />) }
			</div>

			<h4 style={ { fontSize: 13, marginBottom: 8 } }>icon size (<code>ElementTokens.icon</code>)</h4>
			<div style={ boxRow }>
				{ icons.map(item => <TokenBox key={ item.path } { ...item } />) }
			</div>

			<h4 style={ { fontSize: 13, marginBottom: 8 } }>field padding (<code>GridTokens.field.padding</code>)</h4>
			<div style={ boxRow }>
				{ fieldPadding.map(item => <TokenBox key={ item.path } { ...item } />) }
			</div>
		</div>
	)
}

// --- primitives ----------------------------------------------------------------

const SPACE_STEPS = Array.from({ length: 16 }, (_, i) => `${ i + 1 }`) as Parameters<typeof base.space>[0][]

const PrimitiveSpaceScale = () => (
	<div>
		<p style={ noteStyle }>
			Internal — not for direct use in components. 16-step scale generated from{ ' ' }
			<code>SiteTheme.scale.space</code> (base unit <code>BASE_SCALE = 4</code>,{ ' ' }
			<code>src/lib/theme/scales.ts</code>) via <code>generate/strategies.ts</code>&apos;s{ ' ' }
			<code>scaleStrategy</code>, accessed through <code>primitiveTokens.space</code>{ ' ' }
			(exported as <code>base</code>).
		</p>
		<div style={ { display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap', marginBottom: 32 } }>
			{ SPACE_STEPS.map(step => (
				<div key={ step } style={ { textAlign: 'center' } }>
					<div style={ { width: base.space(step), height: base.space(step), background: alias.color.action(), borderRadius: 4 } } />
					<div style={ metaStyle }>{ step }</div>
				</div>
			)) }
		</div>

		<h4 style={ { fontSize: 13, marginBottom: 8 } }>icon ({ ICON_SCALE.length } steps)</h4>
		<p style={ noteStyle }>
			<code>ICON_SCALE</code> through <code>base.icon</code>; the <code>sm</code> / <code>md</code> /{ ' ' }
			<code>lg</code> icon tokens above alias these 1:1.
		</p>
		<div style={ { display: 'flex', gap: 16, alignItems: 'flex-end', marginBottom: 32 } }>
			{ ICON_SCALE.map(size => (
				<div key={ size } style={ { textAlign: 'center' } }>
					<div style={ { width: base.icon(`${ size }`), height: base.icon(`${ size }`), background: alias.color.action(), borderRadius: 2 } } />
					<div style={ metaStyle }>{ size }</div>
				</div>
			)) }
		</div>

		<h4 style={ { fontSize: 13, marginBottom: 8 } }>screen ({ SCREEN_SCALE.length } steps)</h4>
		<p style={ noteStyle }>
			<code>SCREEN_SCALE</code> through <code>base.screen</code>; the breakpoint and container tokens
			alias these. Bars are drawn at a quarter of the real width.
		</p>
		<div>
			{ SCREEN_SCALE.map(size => (
				<Bar
					key={ size }
					label={ `${ size }` }
					path={ `base.screen('${ size }')` }
					width={ `min(100%, calc(${ base.screen(`${ size }`) } / 4))` }
				/>
			)) }
		</div>
	</div>
)

// --- internal composites (no accessor) -------------------------------------------

const InternalComposites = () => {
	const literal = (label: string, varName: string, kind: TokenBoxProps['kind']): TokenBoxProps =>
		({ label, path: `var(${ varName })`, value: `var(${ varName })`, kind })

	const elements = [
		literal('dot.sm', '--inkq-dot-sm', 'size'),
		literal('dot.md', '--inkq-dot-md', 'size'),
		literal('dot.lg', '--inkq-dot-lg', 'size'),
		literal('tile.sm', '--inkq-tile-sm', 'size'),
		literal('tile.md', '--inkq-tile-md', 'size'),
		literal('tile.lg', '--inkq-tile-lg', 'size'),
	]

	const grid = [
		literal('gutter', '--inkq-gutter', 'size'),
		literal('hero.padding', '--inkq-hero-padding', 'size'),
		literal('section.padding', '--inkq-section-padding', 'size'),
		literal('stack.padding', '--inkq-stack-padding', 'size'),
		literal('stack.gap.kicker', '--inkq-stack-gap-kicker', 'size'),
		literal('stack.gap.head', '--inkq-stack-gap-head', 'size'),
		literal('stack.gap.lede', '--inkq-stack-gap-lede', 'size'),
		literal('stack.gap.cta', '--inkq-stack-gap-cta', 'size'),
		literal('footer.padding', '--inkq-footer-padding', 'padding'),
		literal('navbar.size', '--inkq-navbar-size', 'size'),
		literal('subnav.size', '--inkq-subnav-size', 'size'),
		literal('field.gap', '--inkq-field-gap', 'size'),
	]

	return (
		<div>
			<p style={ noteStyle }>
				Internal — composites actually emitted as CSS
				(<code>tokens/layout/{ '{' }element,grid{ '}' }.ts</code>) that have no typed accessor in{ ' ' }
				<code>alias</code> or <code>tokens</code>, so they are referenced by their literal generated
				variable name. Each is built from the primitive space scale above.{ ' ' }
				<code>src/styles/_base.scss</code> consumes <code>--inkq-gutter</code> and{ ' ' }
				<code>--inkq-container-page</code> in <code>.inkq-wrapper</code> (max width and inline padding),
				and uses the primitive <code>--space-*</code> variables directly in <code>.inkq-item</code>.
			</p>

			<h4 style={ { fontSize: 13, marginBottom: 8 } }>element.dot / element.tile</h4>
			<div style={ boxRow }>
				{ elements.map(item => <TokenBox key={ item.path } { ...item } />) }
			</div>

			<h4 style={ { fontSize: 13, marginBottom: 8 } }>layout.grid</h4>
			<div style={ boxRow }>
				{ grid.map(item => <TokenBox key={ item.path } { ...item } />) }
			</div>
		</div>
	)
}

const meta: Meta = {
	title: 'Foundation/Spacing',
	parameters: { layout: 'padded' },
}

export default meta

type Story = StoryObj

export const Semantic: Story = {
	name: 'Semantic — breakpoint, container & space',
	render: () => <SemanticLayoutTokens />,
}

export const Api: Story = {
	name: 'Shorthand accessors — padding, icon & field',
	render: () => <ApiLayoutTokens />,
}

export const Primitives: Story = {
	name: 'Primitive scales (reference only)',
	render: () => <PrimitiveSpaceScale />,
}

export const Composites: Story = {
	name: 'Internal composites (reference only)',
	render: () => <InternalComposites />,
}
