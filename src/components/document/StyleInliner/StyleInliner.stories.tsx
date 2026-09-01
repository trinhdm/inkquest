import { StyleInliner } from './StyleInliner'
import { resolveStyles } from './resolver'
import { serializeStyles } from './serializer'
import { DEFAULT_THEME } from '@/providers/ThemeProvider/constants'
import { PREFIX_CSS_SELECTOR } from '@/utils/constants'
import { expect, within } from 'storybook/test'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import type { SiteTheme } from '@/lib/theme'

// `StyleInliner` is a non-visual, DOM-injection component: it renders either
// `null` or an invisible `<style>` tag carrying serialized CSS custom
// properties. There is nothing meaningful to look at in the preview canvas,
// so coverage comes entirely from `play` functions inspecting the rendered
// `<style>` element's attributes and `innerHTML`.
//
// A story-scoped `data-testid` wrapper is used (rather than querying
// `document` globally) because `.storybook/preview.tsx`'s global decorator
// renders its OWN `<StyleInliner />` (and `<VariantStyleInliner />`) ahead of
// every story via `AppProvider` — a bare
// `document.querySelector('style[data-scheme-style]')` would just as likely
// match that ambient instance as the one this file's own stories render.
const TEST_ID = 'style-inliner-story'

// Unlike `VariantStyleInliner`, there is no reachable `theme` value — valid
// or otherwise — that makes `StyleInliner` render `null`. `resolveStyles`'s
// `base` scheme always includes `buildStaticTokens()`'s output (font/space/
// breakpoint/container/opacity/pad/border-radius/motion tokens), which is
// generated from module-level constants entirely independent of the `theme`
// prop passed in (see `buildSchemes.ts`), so `serializeStyles(tokens)` can
// never come back empty. The `if (!styles) return null` branch in
// `StyleInliner.tsx` is therefore not exercisable through this component's
// public prop surface, and no story here attempts to force it.

// Distinct from `DEFAULT_THEME` only in `scale.size`, so the resulting CSS
// custom properties are verifiably different while still being a fully
// valid `SiteTheme`.
const CUSTOM_THEME: SiteTheme = {
	...DEFAULT_THEME,
	scale: { size: DEFAULT_THEME.scale.size * 2 },
}

const meta: Meta<typeof StyleInliner> = {
	component: StyleInliner,
	title: 'Document/StyleInliner',
	render: (args) => (
		<div data-testid={ TEST_ID }>
			<StyleInliner { ...args } />
		</div>
	),
	argTypes: {
		theme: {
			control: false,
			description: 'Site theme tokens resolved into CSS custom properties via `resolveStyles`. Required — `StyleInliner`\'s `theme ?? DEFAULT_THEME` fallback is currently commented out in source, so an omitted `theme` reaches `resolveStyles` as `undefined` rather than falling back to `DEFAULT_THEME`.',
		},
		id: {
			control: 'text',
			description: 'Native `id` attribute, passed through via the rest-spread onto the rendered `<style>` element.',
		},
		media: {
			control: 'text',
			description: 'Native `media` attribute, passed through via the rest-spread onto the rendered `<style>` element.',
		},
		nonce: {
			control: 'text',
			description: 'Native CSP `nonce` attribute, passed through via the rest-spread onto the rendered `<style>` element.',
		},
	},
	args: {
		theme: DEFAULT_THEME,
	},
}

export default meta
type Story = StoryObj<typeof StyleInliner>

export const Default: Story = {
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			container = canvas.getByTestId(TEST_ID),
			styleEl = container.querySelector('style[data-scheme-style]') as HTMLStyleElement

		await expect(styleEl).toBeInTheDocument()
		await expect(styleEl.tagName).toBe('STYLE')

		const expectedStyles = serializeStyles(
			resolveStyles({ current: DEFAULT_THEME, prefix: PREFIX_CSS_SELECTOR })
		)

		await expect(styleEl.innerHTML).toBe(expectedStyles)
		// `resolveStyles`'s `base` scheme always resolves to the `:root, :host`
		// selector list (see `resolver.ts`'s `BASE_SELECTORS`).
		await expect(styleEl.textContent).toContain(':root')
	},
}

export const CustomTheme: Story = {
	args: { theme: CUSTOM_THEME },
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			container = canvas.getByTestId(TEST_ID),
			styleEl = container.querySelector('style[data-scheme-style]') as HTMLStyleElement

		await expect(styleEl).toBeInTheDocument()

		const expectedCustomStyles = serializeStyles(
				resolveStyles({ current: CUSTOM_THEME, prefix: PREFIX_CSS_SELECTOR })
			),
			expectedDefaultStyles = serializeStyles(
				resolveStyles({ current: DEFAULT_THEME, prefix: PREFIX_CSS_SELECTOR })
			)

		await expect(styleEl.innerHTML).toBe(expectedCustomStyles)
		// Proves the `theme` prop actually changes the resolved output, rather
		// than the component silently falling back to `DEFAULT_THEME`.
		await expect(expectedCustomStyles).not.toBe(expectedDefaultStyles)
	},
}

export const NativeAttributes: Story = {
	args: {
		id: 'style-inliner-native-example',
		media: 'print',
		nonce: 'test-nonce-123',
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement),
			container = canvas.getByTestId(TEST_ID),
			styleEl = container.querySelector('style[data-scheme-style]') as HTMLStyleElement

		await expect(styleEl).toBeInTheDocument()
		await expect(styleEl).toHaveAttribute('id', 'style-inliner-native-example')
		await expect(styleEl).toHaveAttribute('media', 'print')

		// The CSP `nonce` attribute is intentionally hidden from
		// `getAttribute`/`outerHTML` by browsers once an element is mounted (to
		// prevent it leaking to injected scripts) — read it back via the
		// `nonce` DOM property instead, per platform (and React) behavior.
		await expect(styleEl.nonce).toBe('test-nonce-123')
	},
}
