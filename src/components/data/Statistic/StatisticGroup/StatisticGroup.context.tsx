import { createRootCxt } from '@/lib/component'
import type { Group } from '@/components/layout'

type SharedGroupCxt =
	| 'animated'
	| 'duration'
	| 'index'
	| 'revealed'
	| 'stagger'
	| 'unstyled'
	| 'withinView'

export interface StatisticGroupContext
	extends Pick<Group.Context, SharedGroupCxt> {}

export const {
	RootCxtProvider: StatisticGroupProvider,
	useSafeRootCxt: useStatisticGroupCxt,
	useRootProps: useStatisticGroupProps,
} = createRootCxt<StatisticGroupContext>('Statistic.Group')
