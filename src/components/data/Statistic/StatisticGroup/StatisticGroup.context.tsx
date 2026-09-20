import { createRootCtx } from '@/lib/component'
import type { AnimationOptions } from '@/hooks'

export type StatisticGroupOrder =
	'ascend' | 'descend'

export type StatisticGroupSize =
	'sm' | 'lg'

export interface StatisticGroupContext
	extends AnimationOptions {
	order?: StatisticGroupOrder
	size?: StatisticGroupSize
}

export const {
	RootProvider: StatisticGroupProvider,
	useSafeRootCtx: useStatisticGroupCtx,
	useRootProps: useStatisticGroupProps,
} = createRootCtx<StatisticGroupContext>('Statistic.Group')
