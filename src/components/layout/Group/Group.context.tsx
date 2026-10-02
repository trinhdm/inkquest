import { createRootCtx } from '@/lib/component/context'
import type { AnimateInViewConfig } from '@/hooks/animation'

export interface GroupContext
	extends AnimateInViewConfig {}

export const {
	RootProvider: GroupProvider,
	useRootCtx: useGroupCtx,
	useRootProps: useGroupProps,
} = createRootCtx<GroupContext, 'Group'>('Group')
