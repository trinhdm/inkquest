import { createRootCtx } from '@/lib/component'
import type { Group } from '@/components/layout'

type SharedGroupCtx =
	| 'animated'
	| 'duration'
	| 'index'
	| 'revealed'
	| 'stagger'
	| 'unstyled'
	| 'withinView'

export interface StatisticGroupContext
	extends Pick<Group.Context, SharedGroupCtx> {}

export const {
	RootProvider: StatisticGroupProvider,
	useSafeRootCtx: useStatisticGroupCtx,
	useRootProps: useStatisticGroupProps,
} = createRootCtx<StatisticGroupContext>('Statistic.Group')
