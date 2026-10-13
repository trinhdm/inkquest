import { tokens } from '@/lib/theme/reference'
import type { Button } from './Button'

// Single source of truth for the option lists shared across
// `Button.stories.tsx`, `ButtonGroup/ButtonGroup.stories.tsx`, and
// `ButtonSection/ButtonSection.stories.tsx` — both their `argTypes.options`
// and the groups they map over to render multi-value stories.
// Not a `.stories.*` file on purpose, so Storybook's story indexer ignores it.

// `Variant` is shape only. The semantic colours ('success' | 'warning' |
// 'danger' | 'info') are `Tone` values and belong in `TONE_OPTIONS` below —
// they were previously commented out here, which is the same conflation that
// had `Button.test.tsx` passing `variant="danger"`. The two props are
// orthogonal: `Button.tsx` reflects both, as `data-variant` and `data-tone`.
export const VARIANT_OPTIONS: readonly Button.Variant[] = [
	'solid', 'outline', 'ghost', 'light', 'dark', 'text',
]

export const TONE_OPTIONS: readonly Button.Tone[] = [
	'neutral', 'action',
	'success', 'warning', 'danger', 'info',
]

export const PRIORITY_OPTIONS: readonly Button.Priority[] = [
	'primary', 'secondary', 'tertiary',
]

export const SIZE_OPTIONS: readonly Button.Size[] = [
	'sm', 'md', 'lg',
]

export const ORIENTATION_OPTIONS = ['horizontal', 'vertical'] as const

export const BOOLEAN_OPTIONS = [true, false] as const

// Expected values for the size tokens `Button.tsx` sets inline per `size`:
// `--button-font-size`, `--button-icon-size`, `--button-tracking` on the root
// and `--button-padding` on the inner element. Mirrors the lookup tables in
// `Button.tsx`'s `tokens` function; if one drifts, the `Sizes` stories fail.
// Note `sm` is the only size with its own font size (`md` and `lg` share one).
export const FONT_SIZE_BY_SIZE: Record<Button.Size, string> = {
	sm: tokens.fontSize('label'),
	md: tokens.fontSize('body'),
	lg: tokens.fontSize('body'),
}

export const ICON_SIZE_BY_SIZE: Record<Button.Size, string> = {
	sm: tokens.el.icon.size('sm'),
	md: tokens.el.icon.size('md'),
	lg: tokens.el.icon.size('lg'),
}

export const PADDING_BY_SIZE: Record<Button.Size, string> = {
	sm: tokens.padding('chip'),
	md: tokens.padding('item'),
	lg: tokens.padding('block'),
}

export const TRACKING_BY_SIZE: Record<Button.Size, string> = {
	sm: tokens.letterSpacing('heading'),
	md: tokens.letterSpacing('display'),
	lg: tokens.letterSpacing('stat'),
}

// `Button.Group`'s own `tokens` function sets `--button-group-gap` on the
// group root from its `size` prop (`sm` and `md` share a gap).
export const GROUP_GAP_BY_SIZE: Record<Button.Size, string> = {
	sm: tokens.space('group'),
	md: tokens.space('group'),
	lg: tokens.space('group', 'lg'),
}
