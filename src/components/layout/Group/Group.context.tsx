import { createRootCtx } from '@/lib/component'
import type { AnimationOptions } from '@/hooks'

type BaseGroupContext = {
	index?: number
	unstyled?: boolean
	withinView?: boolean
}

export type GroupContext =
	& BaseGroupContext
	& Pick<AnimationOptions, 'animated' | 'duration' | 'stagger'>

export const {
	RootProvider: GroupProvider,
	useRootCtx: useGroupCtx,
	useRootProps: useGroupProps,
} = createRootCtx<GroupContext>('Group')
