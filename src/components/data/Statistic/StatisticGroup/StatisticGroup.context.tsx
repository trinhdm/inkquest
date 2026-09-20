import { createRootCtx } from '@/lib/component'
import type { AnimationOptions } from '@/hooks'

export interface StatisticGroupContext
	extends AnimationOptions {}

export const {
	RootProvider: StatisticGroupProvider,
	useSafeRootCtx: useStatisticGroupCtx,
	useRootProps: useStatisticGroupProps,
} = createRootCtx<StatisticGroupContext>('Statistic.Group')
