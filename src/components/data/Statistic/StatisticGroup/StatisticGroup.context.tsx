import { createRootCtx } from '@/lib/component'
import type { Group } from '@/components/layout'

export interface StatisticGroupContext
	extends Group.Context {}

export const {
	RootProvider: StatisticGroupProvider,
	useSafeRootCtx: useStatisticGroupCtx,
	useRootProps: useStatisticGroupProps,
} = createRootCtx<StatisticGroupContext>('Statistic.Group')
