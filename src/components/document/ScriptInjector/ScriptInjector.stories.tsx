import { buildScript } from './buildScript'
import { ScriptInjector } from './ScriptInjector'
import { expect } from 'storybook/test'
import type { ColorScheme } from '@/lib/theme'
import type { ReactNode } from 'react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

// `ScriptInjector` currently has no sibling in `document/` that also needs a
// `ColorScheme` option list, so this stays inlined rather than living in a
// shared `options.story.ts` (see `Core/Button/options.story.ts` for the
// pattern this file would graduate to once a second consumer exists).
const SCHEME_OPTIONS = ['dark', 'light'] as const satisfies readonly ColorScheme[]

// NOTE on what these stories can and can't verify: per the HTML spec, a
// `<script>` whose content is assigned via `innerHTML` (which is exactly
// what React does for `dangerouslySetInnerHTML`, including when it targets
// the script element itself) never executes on the client — confirmed via an
// actual Vitest/browser run of this file, which logged React's own
// "Scripts inside React components are never executed when rendering on the
// client" warning during an earlier draft of this story. `ScriptInjector` is
// only meant to actually run its script via SSR (parsed straight out of
// initial HTML before hydration), which this client-rendered Storybook/
// Vitest environment cannot exercise. So every story below verifies the
// component's OUTPUT (the rendered `<script>` element's attributes and exact
// generated `innerHTML`, compared against the real `buildScript` function)
// rather than any live `document.documentElement` side effect the script
// would only produce in a real SSR+hydration pipeline — a live-DOM-effect
// assertion in this environment can't actually distinguish "component
// works" from "component is broken or absent", since nothing here executes
// the script to begin with.

const Row = ({ children }: { children: ReactNode }) => (
	<div style={ { display: 'flex', gap: 24, flexWrap: 'wrap' } }>
		{ children }
	</div>
)

const Group = ({ label, children }: { label: string, children: ReactNode }) => (
	<div style={ { display: 'flex', flexDirection: 'column', gap: 8 } }>
		<span style={ { font: 'var(--inkq-text-control)', letterSpacing: '.15em', textTransform: 'uppercase', opacity: 0.6 } }>
			{ label }
		</span>
		<div style={ { display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' } }>
			{ children }
		</div>
	</div>
)

const meta: Meta<typeof ScriptInjector> = {
	component: ScriptInjector,
	title: 'Document/ScriptInjector',
	argTypes: {
		scheme: {
			control: 'select',
			options: SCHEME_OPTIONS,
			description:
				'Forwarded to `buildScript` as its `scheme` fallback. When omitted, `buildScript` falls back to its own internal default (`DEFAULT_COLOR_SCHEME`, currently `"dark"`).',
		},
	},
	// `ScriptInjector` is a plain function component (no `factory()`/
	// `polymorphic()` usage, no `.setDefaults`), and `scheme` itself
	// has no default parameter value in the component's own signature — it's
	// left `undefined` and delegated straight to `buildScript`'s internal
	// default. So there's no registered/registry default to read here.
	args: {},
}

export default meta
type Story = StoryObj<typeof ScriptInjector>

export const Default: Story = {
	play: async ({ canvasElement }) => {
		const script = canvasElement.querySelector('script[data-scheme-script]')

		await expect(script).not.toBeNull()
		await expect(script).toHaveAttribute('data-scheme-script')
		await expect(script?.innerHTML).toBe(buildScript({ scheme: undefined }))
	},
}

export const Schemes: Story = {
	render: () => (
		<Row>
			{ SCHEME_OPTIONS.map(scheme => (
				<Group key={ scheme } label={ scheme }>
					<ScriptInjector scheme={ scheme } />
				</Group>
			)) }
		</Row>
	),
	play: async ({ canvasElement }) => {
		const scripts = canvasElement.querySelectorAll('script[data-scheme-script]')

		await expect(scripts).toHaveLength(SCHEME_OPTIONS.length)

		// Each `scheme` produces a genuinely different generated script
		// body (the target scheme and its inverse swap places in the source),
		// verified against the real `buildScript` output rather than a
		// hand-written string, per scheme.
		SCHEME_OPTIONS.forEach((scheme, i) => {
			expect(scripts[i].innerHTML).toBe(buildScript({ scheme }))
		})
		await expect(scripts[0].innerHTML).not.toBe(scripts[1].innerHTML)
	},
}

export const NativeScriptAttributes: Story = {
	args: {
		id: 'theme-scheme-script',
		nonce: 'story-nonce',
	},
	play: async ({ canvasElement }) => {
		const script = canvasElement.querySelector('script[data-scheme-script]')

		await expect(script).toHaveAttribute('id', 'theme-scheme-script')
		await expect(script).toHaveAttribute('nonce', 'story-nonce')
		// Native attributes pass straight through alongside the component's
		// own `data-scheme-script` marker and generated body.
		await expect(script).toHaveAttribute('data-scheme-script')
		await expect(script?.innerHTML).toBe(buildScript({ scheme: undefined }))
	},
}

export const DangerouslySetInnerHTMLOverride: Story = {
	name: 'dangerouslySetInnerHTML override (caller value is ignored)',
	args: {
		// `ScriptInjector` spreads `...props` BEFORE it sets its own
		// `dangerouslySetInnerHTML`, so its generated `script` body always
		// wins over anything a caller passes in here — this story proves the
		// caller-supplied markup never reaches the DOM.
		dangerouslySetInnerHTML: { __html: 'window.__callerScriptRan = true;' },
	},
	play: async ({ canvasElement }) => {
		const script = canvasElement.querySelector('script[data-scheme-script]')

		await expect(script?.innerHTML).toBe(buildScript({ scheme: undefined }))
		await expect(script?.innerHTML).not.toContain('__callerScriptRan')
		await expect((window as unknown as { __callerScriptRan?: boolean }).__callerScriptRan).toBeUndefined()
	},
}
