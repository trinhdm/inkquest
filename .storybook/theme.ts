import { create } from 'storybook/theming/create'

// Storybook's own chrome (manager sidebar/toolbar + the Docs page) is themed by
// this object, NOT by the app's `--inkq-*` custom properties. The manager runs
// in a separate document from the preview iframe, so it never sees the
// `<style>` that `StyleInliner` emits — these have to be literal values.
//
// Hand-mirrored from the dark scheme, which maps `theme -> ink`,
// `alt -> paper`, and accent primary -> `oxblood` (see `lib/theme/scales.ts`
// and `lib/theme/themeConfig.ts`). Keep in sync if the palette changes:
//
//   appBg / appContentBg  <- --inkq-background-page   ink 100     #0E0E10
//   barBg / appPreviewBg  <-                          ink 200     #17171A
//   appBorderColor        <- --inkq-border            ink 500     #2A2A2E
//   textColor             <- --inkq-color-text        paper 100   #FFFAFA
//   colorPrimary/Secondary<- accent primary           oxblood 100 #E8483F

const ink = {
	100: '#0E0E10',
	200: '#17171A',
	500: '#2A2A2E',
} as const

const paper = { 100: '#FFFAFA' } as const
const oxblood = { 100: '#E8483F' } as const

export const inkqDark = create({
	base: 'dark',
	brandTitle: 'inkquest',

	colorPrimary: oxblood[100],
	colorSecondary: oxblood[100],

	appBg: ink[100],
	appContentBg: ink[100],
	appPreviewBg: ink[200],
	appBorderColor: ink[500],

	barBg: ink[200],
	barTextColor: paper[100],
	barSelectedColor: oxblood[100],

	textColor: paper[100],
	textInverseColor: ink[100],
})
