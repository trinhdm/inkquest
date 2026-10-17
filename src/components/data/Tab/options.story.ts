// Single source of truth for the option lists shared across
// `Tab.stories.tsx` and `TabList/TabList.stories.tsx`. Named `.story.ts`
// (not `.stories.ts`) on purpose: `.storybook/main.ts` only indexes
// `../src/**/*.stories.@(js|jsx|mjs|ts|tsx)`, so Storybook skips this file.
// Literal arrays only — zero behavior.

export const BOOLEAN_OPTIONS = [true, false] as const
