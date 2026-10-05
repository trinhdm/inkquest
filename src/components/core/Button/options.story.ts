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

export const TRACKING_BY_SIZE: Record<Button.Size, string> = {
	sm: tokens.letterSpacing('heading'),
	md: tokens.letterSpacing('display'),
	lg: tokens.letterSpacing('stat'),
}
