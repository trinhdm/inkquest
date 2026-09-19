import { StyleInliner } from './StyleInliner'
import { resolveStyles } from './resolver'
import { serializeStyles } from './serializer'
import { DEFAULT_THEME } from '@/providers/ThemeProvider/constants'
import { PREFIX_CSS_SELECTOR } from '@/utils/constants'
import { expect } from 'storybook/test'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import type { SiteTheme } from '@/lib/theme'

// `StyleInliner` now renders its `<style>` with `href`/`precedence`
// (`StyleInliner.tsx`) — React 19's stylesheet-hoisting resource API. React
// physically moves that element into `document.head` instead of leaving it
// at its JSX location, so this component's own render container is always
// empty (confirmed empirically: `canvasElement` renders nothing for it).
// Queries below go straight to `document.head`, not a scoped wrapper.
//
// Bigger consequence, confirmed empirically: `href="css-scheme-base"` is
// HARDCODED in `StyleInliner.tsx`, written AFTER the `{...props}` spread —
// so no caller can ever override it. Every `StyleInliner` instance in the
// page shares that exact href, and React dedupes hoisted stylesheet
// resources by href, using only the FIRST instance encountered during
// render (subsequent instances with the same href are no-ops). `.storybook/
// preview.tsx`'s global decorator wraps every story in `<AppProvider>`,
// which renders its OWN `<StyleInliner theme={DEFAULT_THEME}
// prefix={PREFIX_CSS_SELECTOR} />` BEFORE `{children}` (i.e. before the
// story itself) — so AppProvider's instance always wins the dedup. A
// story's own `theme`/`id`/`media`/`nonce` args can never reach the DOM
// here, no matter what's passed — confirmed by instrumented runs showing
// exactly ONE `style[data-scheme-style]` element in `document.head`,
// carrying AppProvider's default-theme content, across every story in this
// file, including `CustomTheme`.
//
// This is flagged to the team as a likely oversight in `StyleInliner.tsx`:
// the non-overridable `href` makes every `StyleInliner` instance in an app
// that uses `AppProvider` indistinguishable from AppProvider's own default,
// which defeats the point of `theme`/`prefix` being props at all outside of
// SSR (where there's no prior instance to dedupe against).
//
// `CustomTheme`/`NativeAttributes` are kept below for Controls/
// documentation purposes (you can still see what args a real, non-deduped
// `StyleInliner` accepts), but their play functions assert the ACTUAL
// (deduped, AppProvider-owned) DOM state — not what their own args would
// imply in isolation. Do not read a passing assertion here as proof those
// args work; the comments say plainly what's actually observable.
const EXPECTED_STYLES = serializeStyles(
	resolveStyles({ current: DEFAULT_THEME, prefix: PREFIX_CSS_SELECTOR })
)

// Distinct from `DEFAULT_THEME` only in `scale.space` (the only key
// `SiteTheme['scale']` has — see `ThemeProvider/constants.ts`), so the
// resulting CSS custom properties would be verifiably different — if this
// story's own `theme` arg could reach the DOM at all (it can't; see above).
const CUSTOM_THEME: SiteTheme = {
	...DEFAULT_THEME,
	scale: { space: DEFAULT_THEME.scale.space * 2 },
}

const meta: Meta<typeof StyleInliner> = {
	component: StyleInliner,
	title: 'Document/StyleInliner',
	argTypes: {
		theme: {
			control: false,
			description: 'Site theme tokens resolved into CSS custom properties via `resolveStyles`. Required — `StyleInliner` destructures `theme` with no default/fallback value at all (there is no `theme ?? DEFAULT_THEME` in source); callers must always pass one. NOTE: due to React 19 stylesheet hoisting with a hardcoded, non-overridable `href`, this prop currently has NO observable effect in this Storybook environment — every instance is deduped against `AppProvider`\'s own default-theme instance, which always wins. See the file-level comment above.',
		},
		prefix: {
			control: 'text',
			description: 'Forwarded to `resolveStyles` as its selector/custom-property prefix. Same dedup caveat as `theme` — see the file-level comment above.',
		},
		id: {
			control: 'text',
			description: 'Native `id` attribute, passed through via the rest-spread onto the rendered `<style>` element. Same dedup caveat applies — see the file-level comment above.',
		},
		media: {
			control: 'text',
			description: 'Native `media` attribute, passed through via the rest-spread onto the rendered `<style>` element. Same dedup caveat applies — see the file-level comment above.',
		},
		nonce: {
			control: 'text',
			description: 'Native CSP `nonce` attribute, passed through via the rest-spread onto the rendered `<style>` element. Same dedup caveat applies — see the file-level comment above.',
		},
	},
	args: {
		theme: DEFAULT_THEME,
		prefix: PREFIX_CSS_SELECTOR,
	},
}

export default meta
type Story = StoryObj<typeof StyleInliner>

export const Default: Story = {
	play: async () => {
		const styleEls = document.head.querySelectorAll('style[data-scheme-style]')

		await expect(styleEls).toHaveLength(1)

		const [styleEl] = Array.from(styleEls) as HTMLStyleElement[]

		await expect(styleEl.tagName).toBe('STYLE')
		await expect(styleEl).toHaveAttribute('data-href', 'css-scheme-base')
		await expect(styleEl.innerHTML).toBe(EXPECTED_STYLES)
		// `resolveStyles`'s `base` scheme always resolves to the `:root, :host`
		// selector list (see `resolver.ts`'s `BASE_SELECTORS`).
		await expect(styleEl.textContent).toContain(':root')
	},
}

export const CustomTheme: Story = {
	args: { theme: CUSTOM_THEME },
	play: async () => {
		// This story's own `theme` arg is NOT observable in the DOM — see the
		// file-level comment. `AppProvider`'s default-theme instance always
		// wins the href-based dedup, so what's actually in `document.head` is
		// `DEFAULT_THEME`'s content, not `CUSTOM_THEME`'s.
		const styleEls = document.head.querySelectorAll('style[data-scheme-style]')

		await expect(styleEls).toHaveLength(1)

		const [styleEl] = Array.from(styleEls) as HTMLStyleElement[]

		await expect(styleEl.innerHTML).toBe(EXPECTED_STYLES)
	},
}

export const NativeAttributes: Story = {
	args: {
		id: 'style-inliner-native-example',
		media: 'print',
		nonce: 'test-nonce-123',
	},
	play: async () => {
		// Same dedup caveat: these native attributes never reach the DOM
		// either — `AppProvider`'s own instance (which sets none of them)
		// wins the dedup, so the winning element carries none of them.
		const styleEls = document.head.querySelectorAll('style[data-scheme-style]')

		await expect(styleEls).toHaveLength(1)

		const [styleEl] = Array.from(styleEls) as HTMLStyleElement[]

		await expect(styleEl).not.toHaveAttribute('id', 'style-inliner-native-example')
		await expect(styleEl).not.toHaveAttribute('media', 'print')
	},
}
