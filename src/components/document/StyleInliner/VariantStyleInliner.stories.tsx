import { VariantStyleInliner } from './VariantStyleInliner'
import { buildVariantSchemes } from '@/lib/theme/buildVariantSchemes'
import { serializeStyles } from './serializer'
import { expect, within } from 'storybook/test'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

// `VariantStyleInliner` is a non-visual, DOM-injection component: it renders
// either `null` or an invisible `<style>` tag carrying serialized CSS custom
// properties per variant scheme. There is nothing meaningful to look at in
// the preview canvas, so coverage comes entirely from `play` functions
// inspecting the rendered `<style>` element's attributes and `innerHTML`.
//
// A story-scoped `data-testid` wrapper is used (rather than querying
// `document` globally) because `.storybook/preview.tsx`'s global decorator
// renders its OWN `<VariantStyleInliner names={['Button', 'Badge', 'Icon']} />`
// (and `<StyleInliner />`) ahead of every story via `AppProvider` — that
// ambient instance always renders a `style[data-variant-vars]` element, so a
// bare `document.querySelector('style[data-variant-vars]')` could never
// reliably prove THIS component's own output, even scoped to a single story.
const TEST_ID = 'variant-style-inliner-story'

// `VariantStyleInliner` isn't built via the `polymorphic()`/`factory()`
// helpers, so it doesn't export a `VariantStyleInliner.Props` namespace type
// to cast against (unlike `Badge.Props`/`Button.Props` elsewhere in this
// repo). Deriving the real (non-partial) prop type straight from the
// component's own declared signature keeps the spread below exact without
// hand-typing/duplicating `names: string[]`.
type VariantStyleInlinerArgs = Parameters<typeof VariantStyleInliner>[0]

const meta: Meta<typeof VariantStyleInliner> = {
	component: VariantStyleInliner,
	title: 'Document/VariantStyleInliner',
	render: (args) => (
		<div data-testid={ TEST_ID }>
			<VariantStyleInliner { ...args as VariantStyleInlinerArgs } />
		</div>
	),
	argTypes: {
		names: {
			control: 'object',
			description: 'Component family names to build variant CSS custom-property schemes for, via `buildVariantSchemes`. Required — no default.',
		},
	},
	args: {
		names: ['button', 'badge'],
	},
}

export default meta
type Story = StoryObj<typeof VariantStyleInliner>

export const Default: Story = {
	play: async ({ args, canvasElement }) => {
		const canvas = within(canvasElement),
			container = canvas.getByTestId(TEST_ID),
			styleEl = container.querySelector('style[data-variant-vars]') as HTMLStyleElement

		await expect(styleEl).toBeInTheDocument()
		await expect(styleEl.tagName).toBe('STYLE')

		// Mirrors `VariantStyleInliner.tsx`'s own `names.flatMap(name =>
		// buildVariantSchemes(name, prefix))` exactly — passing
		// `buildVariantSchemes` directly to `flatMap` would leak the array
		// INDEX into its second `prefix?: string` parameter (e.g. index `1`
		// for `'badge'` here), producing a selector like
		// `.1-badge[data-variant=…]` instead of the real `.badge[…]`.
		const expectedStyles = serializeStyles(
			(args.names ?? []).flatMap(name => buildVariantSchemes(name, args.prefix))
		)

		await expect(styleEl.innerHTML).toBe(expectedStyles)
	},
}

export const SingleName: Story = {
	args: { names: ['button'] },
	play: async ({ args, canvasElement }) => {
		const canvas = within(canvasElement),
			container = canvas.getByTestId(TEST_ID),
			styleEl = container.querySelector('style[data-variant-vars]') as HTMLStyleElement

		await expect(styleEl).toBeInTheDocument()

		const expectedStyles = serializeStyles(
			(args.names ?? []).flatMap(name => buildVariantSchemes(name, args.prefix))
		)

		await expect(styleEl.innerHTML).toBe(expectedStyles)
	},
}

export const Empty: Story = {
	args: { names: [] },
	play: async ({ args, canvasElement }) => {
		const canvas = within(canvasElement),
			container = canvas.getByTestId(TEST_ID),
			styleEl = container.querySelector('style[data-variant-vars]') as HTMLStyleElement

		// `names={[]}` does NOT produce an empty-render branch here:
		// `VariantStyleInliner.tsx` guards with `!!names?.length`, and `[].length`
		// is `0` (falsy), so it takes the `else` branch — `buildVariantSchemes('',
		// prefix)` — rather than `[].flatMap(...)`. `buildVariantSchemes` always
		// returns a non-empty `CssRule[]` (`enumerateVariantPalettes()` is
		// independent of the `name` argument), so `serializeStyles(...)` is never
		// empty and the component still renders its `<style>` tag.
		await expect(styleEl).toBeInTheDocument()

		const expectedStyles = serializeStyles(buildVariantSchemes('', args.prefix))

		await expect(styleEl.innerHTML).toBe(expectedStyles)
	},
}
