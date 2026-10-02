import { createRootCtx } from '@/lib/component'
import type { AnimateInViewConfig } from '@/hooks/animation'

export interface GroupContext
	extends AnimateInViewConfig {}

export const {
	RootProvider: GroupProvider,
	useRootCtx: useGroupCtx,
	useRootProps: useGroupProps,
} = createRootCtx<GroupContext, 'Group'>('Group')
