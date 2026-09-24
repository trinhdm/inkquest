import { VariantStyleInliner } from './VariantStyleInliner'
import { buildVariantSchemes } from '@/lib/theme/buildVariantSchemes'
import { serializeStyles } from './serializer'
import { PREFIX_CSS_SELECTOR } from '@/utils/constants'
import { expect } from 'storybook/test'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

// `VariantStyleInliner` now renders its `<style>` with `href`/`precedence`
// (`VariantStyleInliner.tsx`) — React 19's stylesheet-hoisting resource API.
// React physically moves that element into `document.head` instead of
// leaving it at its JSX location, so this component's own render container
// is always empty (confirmed empirically: `canvasElement` renders nothing
// for it). Queries below go straight to `document.head`, not a scoped
// wrapper.
//
// Bigger consequence, confirmed empirically: `href="css-variant-base"` is
// HARDCODED in `VariantStyleInliner.tsx`, written AFTER the `{...props}`
// spread — so no caller can ever override it. Every `VariantStyleInliner`
// instance in the page shares that exact href, and React dedupes hoisted
// stylesheet resources by href, using only the FIRST instance encountered
// during render (subsequent instances with the same href are no-ops).
// `.storybook/preview.tsx`'s global decorator wraps every story in
// `<AppProvider>`, which renders its OWN
// `<VariantStyleInliner prefix={PREFIX_CSS_SELECTOR} />` (no `names`, so it
// takes the `buildVariantSchemes('', prefix)` branch) BEFORE `{children}`
// (i.e. before the story itself) — so AppProvider's instance always wins
// the dedup. A story's own `names`/`prefix` args can never reach the DOM
// here, no matter what's passed — confirmed by instrumented runs showing
// exactly ONE `style[data-variant-vars]` element in `document.head`,
// carrying AppProvider's own content, across every story in this file.
//
// This is flagged to the team as a likely oversight in
// `VariantStyleInliner.tsx`: the non-overridable `href` makes every
// `VariantStyleInliner` instance in an app that uses `AppProvider`
// indistinguishable from AppProvider's own default, which defeats the point
// of `names`/`prefix` being props at all outside of SSR (where there's no
// prior instance to dedupe against).
//
// `SingleName`/`Empty` are kept below for Controls/documentation purposes
// (you can still see what args a real, non-deduped `VariantStyleInliner`
// accepts), but their play functions assert the ACTUAL (deduped,
// AppProvider-owned) DOM state — not what their own args would imply in
// isolation. Do not read a passing assertion here as proof those args work;
// the comments say plainly what's actually observable.
const EXPECTED_STYLES = serializeStyles(buildVariantSchemes('', PREFIX_CSS_SELECTOR))

const meta: Meta<typeof VariantStyleInliner> = {
	component: VariantStyleInliner,
	title: 'Document/VariantStyleInliner',
	argTypes: {
		names: {
			control: 'object',
			description: 'Component family names to build variant CSS custom-property schemes for, via `buildVariantSchemes`. NOTE: due to React 19 stylesheet hoisting with a hardcoded, non-overridable `href`, this prop currently has NO observable effect in this Storybook environment — every instance is deduped against `AppProvider`\'s own instance, which always wins. See the file-level comment above.',
		},
		prefix: {
			control: 'text',
			description: 'Forwarded to `buildVariantSchemes` as its selector/custom-property prefix. Same dedup caveat as `names` — see the file-level comment above.',
		},
	},
	args: {
		names: ['button', 'badge'],
	},
}

export default meta
type Story = StoryObj<typeof VariantStyleInliner>

const assertDedupedOutput = async () => {
	const styleEls = document.head.querySelectorAll('style[data-variant-vars]')

	await expect(styleEls).toHaveLength(1)

	const [styleEl] = Array.from(styleEls) as HTMLStyleElement[]

	await expect(styleEl.tagName).toBe('STYLE')
	await expect(styleEl).toHaveAttribute('data-href', 'css-variant-base')
	await expect(styleEl.innerHTML).toBe(EXPECTED_STYLES)
}

export const Default: Story = {
	play: async () => {
		await assertDedupedOutput()
	},
}

export const SingleName: Story = {
	args: { names: ['button'] },
	play: async () => {
		// This story's own `names` arg is NOT observable in the DOM — see the
		// file-level comment. `AppProvider`'s own instance (`names` omitted)
		// always wins the href-based dedup.
		await assertDedupedOutput()
	},
}

export const Empty: Story = {
	args: { names: [] },
	play: async () => {
		// `names: []` happens to compute the SAME `buildVariantSchemes('',
		// prefix)` branch as AppProvider's own instance (`names` omitted) —
		// `!!names?.length` is falsy for both — but that's a coincidence of
		// this specific value, not proof this story's own args reach the DOM
		// in general. No story's own args are actually observable here; see
		// the file-level comment.
		await assertDedupedOutput()
	},
}
