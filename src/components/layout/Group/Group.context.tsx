import { createRootCtx } from '@/lib/component'
import type { AnimationOptions } from '@/hooks/animation'

export interface GroupContext
	extends AnimationOptions {}

export const {
	RootProvider: GroupProvider,
	useRootCtx: useGroupCtx,
	useRootProps: useGroupProps,
} = createRootCtx<GroupContext>('Group')
