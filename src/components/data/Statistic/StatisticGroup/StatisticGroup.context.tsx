import { createRootCxt } from '@/lib/component'
import type { Group } from '@/components/layout'

interface StatisticGroupContext
	extends Pick<Group.Context, 'animated' | 'duration' | 'revealed' | 'unstyled'> {}

export const {
	RootCxtProvider: StatisticGroupProvider,
	useSafeRootCxt: useStatisticGroupCxt,
	useRootProps: useStatisticGroupProps,
} = createRootCxt<StatisticGroupContext>('StatisticGroup')
