import { createRootCtx } from '@/lib/component'

export interface GroupContext {
	animated?: boolean
	duration?: number
	index?: number
	revealed?: boolean
	stagger?: number
	unstyled?: boolean
	withinView?: boolean
}

export const {
	RootProvider: GroupProvider,
	useRootCtx: useGroupCtx,
	useRootProps: useGroupProps,
} = createRootCtx<GroupContext>('Group')
