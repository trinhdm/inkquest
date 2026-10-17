import type { Field } from './Field'

// Single source of truth for the option lists shared across the Form family's
// stories (`Field`, `Field.Group`, `Field.Choice`, `Field.Input`,
// `Field.Textarea`). Not a `.stories.*` file on purpose (`.storybook/main.ts`
// only indexes `../src/**/*.stories.@(js|jsx|mjs|ts|tsx)`), so Storybook's
// story indexer ignores it entirely.

export const BOOLEAN_OPTIONS = [true, false] as const

// Read off the namespace types themselves rather than re-declared by hand, so
// these can't drift from the components' own unions.
export const SIZE_OPTIONS: readonly NonNullable<Field.Props['size']>[] = [
	'sm', 'md', 'lg',
]

export const LAYOUT_OPTIONS: readonly NonNullable<Field.Props['layout']>[] = [
	'default', 'button',
]

export const LABEL_POSITION_OPTIONS: readonly NonNullable<Field.Props['labelPosition']>[] = [
	'first', 'last',
]

export const CHOICE_TYPE_OPTIONS: readonly Field.Choice.Types[] = [
	'radio', 'checkbox',
]

export const INPUT_TYPE_OPTIONS: readonly Field.Input.Types[] = [
	'text', 'email', 'number', 'password', 'search', 'tel', 'url',
]

export const ICON_POSITION_OPTIONS: readonly NonNullable<Field.Input.Props['iconPosition']>[] = [
	'left', 'right',
]
