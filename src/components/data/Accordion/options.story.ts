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

export const BOOLEAN_OPTIONS = [true, false] as const

// `Accordion.Group.Props['collapsible']` is `AccordionGroupType | false` —
// `'single'`/`'multiple'` pick the disclosure mode, `false` makes every item
// in the group permanently open and non-interactive.
export const COLLAPSIBLE_OPTIONS: readonly NonNullable<Accordion.Group.Props['collapsible']>[] = [
	'single', 'multiple', false,
]

// Shared between `Accordion.Props['size']` and `Accordion.Group.Props['size']`
// — read off the namespace type itself rather than re-declared by hand.
export const SIZE_OPTIONS: readonly NonNullable<Accordion.Group.Props['size']>[] = [
	'sm', 'md', 'lg',
]

// Shared between `Accordion.Props['order']` and `Accordion.Group.Props['order']`
// (`HeadingOrder`) — read off the namespace type itself rather than
// re-declared by hand.
export const ORDER_OPTIONS: readonly NonNullable<Accordion.Group.Props['order']>[] = [
	1, 2, 3, 4, 5,
]

// `--accordion-title-size` resolves to `var(--inkq-font-size-h<order + step>)`
// (see `getSharedTokens` in `utils.ts`), but the typography properties only
// define heading sizes h1-h5. A resolved level above this value points at a
// token that does not exist, so stories must not assert on it.
export const MAX_TITLE_SIZE_LEVEL = 5
