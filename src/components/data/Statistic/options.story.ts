import type { Statistic } from './Statistic'

// Single source of truth for the option lists shared across
// `Statistic.stories.tsx` and `StatisticGroup/StatisticGroup.stories.tsx`.
// Not a `.stories.*` file on purpose (the `../src/**/*.story.*` glob in
// `.storybook/main.ts` is commented out), so Storybook's story indexer
// ignores it entirely.

export const BOOLEAN_OPTIONS = [true, false] as const

// `Statistic.Group.Props` (`Omit<Group.Props, 'childName' | 'provider'>`)
// inherits `orientation` verbatim from `layout/Group`'s own
// `'horizontal' | 'vertical'` literal union — read off the namespace type
// itself rather than re-declared by hand, so this can't drift if `Group`
// ever adds a third orientation.
export const ORIENTATION_OPTIONS: readonly NonNullable<Statistic.Group.Props['orientation']>[] = [
	'horizontal', 'vertical',
]

// `columns` is a free-form `number` (fed straight into the `--group-cols`
// CSS custom property, no validation/clamping in `Group.tsx`) — these are
// just a few representative values to render side-by-side, not an
// exhaustive enum.
export const COLUMNS_OPTIONS = [2, 3, 4] as const
