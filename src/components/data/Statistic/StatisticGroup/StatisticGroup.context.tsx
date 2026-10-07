import { createCompoundCtx } from '@/lib/component/context'
import type { AnimationOptions } from '@/hooks/animation'
import type { Statistic } from '../Statistic'

export interface StatisticGroupContext
	extends AnimationOptions {
	order?: Statistic.Props['order']
	size?: Statistic.Props['size']
}

export const {
	RootProvider: StatisticGroupProvider,
	useSafeRootCtx: useStatisticGroupCtx,
	useRootProps: useStatisticGroupProps,
} = createCompoundCtx<StatisticGroupContext>('Statistic.Group')
