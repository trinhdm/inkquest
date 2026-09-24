import type { Button } from './Button'

// Single source of truth for the option lists shared across
// `Button.stories.tsx`, `ButtonGroup/ButtonGroup.stories.tsx`, and
// `ButtonSection/ButtonSection.stories.tsx` — both their `argTypes.options`
// and the groups they map over to render multi-value stories.
// Not a `.stories.*` file on purpose, so Storybook's story indexer ignores it.

export const VARIANT_OPTIONS: readonly Button.Variant[] = [
	'solid', 'outline', 'ghost', 'light', 'dark', 'success', 'warning', 'danger', 'info',
]

export const PRIORITY_OPTIONS: readonly Button.Priority[] = [
	'primary', 'secondary', 'tertiary',
]

export const SIZE_OPTIONS: readonly Button.Size[] = [
	'sm', 'md', 'lg',
]

export const ORIENTATION_OPTIONS = ['horizontal', 'vertical'] as const

export const BOOLEAN_OPTIONS = [true, false] as const
