import type { Group } from './Group'

// Single source of truth for `Group`'s enumerable prop values, shared by
// every stories file in this family (`Group.stories.tsx`, `Group.Item`'s own
// stories file). Types only, literal arrays only — no component behavior —
// and deliberately named `options.story.ts` (singular `.story`), which is
// NOT matched by `.storybook/main.ts`'s `stories` glob
// (`*.stories.@(js|jsx|mjs|ts|tsx)`; the `*.story.*` line is commented out),
// so Storybook's indexer never tries to load it as a CSF module.
export const ORIENTATION_OPTIONS: readonly NonNullable<Group.Props['orientation']>[] =
	['horizontal', 'vertical']

export const BOOLEAN_OPTIONS = [true, false] as const
