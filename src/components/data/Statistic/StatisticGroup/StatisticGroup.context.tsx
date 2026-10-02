import { createRootCtx } from '@/lib/component/context'
import type { AnimationOptions } from '@/hooks/animation'
import type { Size } from '@/types/shared'

type StatisticGroupOrder =
	'ascend' | 'descend'

export interface StatisticGroupContext
	extends AnimationOptions {
	order?: StatisticGroupOrder
	size?: Exclude<Size, 'md'>
}

export const {
	RootProvider: StatisticGroupProvider,
	useSafeRootCtx: useStatisticGroupCtx,
	useRootProps: useStatisticGroupProps,
} = createRootCtx<StatisticGroupContext>('Statistic.Group')
