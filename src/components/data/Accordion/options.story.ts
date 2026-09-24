import type { Accordion } from './Accordion'

// Single source of truth for the option lists shared across
// `Accordion.stories.tsx`, `AccordionGroup/AccordionGroup.stories.tsx`,
// `AccordionTitle/AccordionTitle.stories.tsx`, and
// `AccordionContent/AccordionContent.stories.tsx` — both their
// `argTypes.options` and the groups they map over to render multi-value
// stories. Named `.story.ts` (not `.stories.ts`) on purpose: the
// `../src/**/*.story.*` glob in `.storybook/main.ts` is commented out, so
// Storybook's indexer skips this file entirely. Types and literal arrays
// only — zero behavior — typed against the components' own exported types.

export const INDICATOR_OPTIONS: readonly NonNullable<Accordion.Props['indicator']>[] = [
	'chevron', 'plus', 'none',
]

export const LAYOUT_OPTIONS: readonly NonNullable<Accordion.Props['layout']>[] = [
	'default', 'steps',
]

export const TYPE_OPTIONS: readonly NonNullable<Accordion.Group.Props['type']>[] = [
	'single', 'multiple',
]

export const BOOLEAN_OPTIONS = [true, false] as const
