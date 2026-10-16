import { createCompoundCtx } from '@/lib/component/context'
import type { AnimationOptions } from '@/hooks/animation'
import type { Tab } from './Tab'

interface TabIds {
	control: string
	panel: string
}

type SharedTabProp =
	| 'disabled'
	| 'index'

export interface TabContext
	extends
		Pick<Tab.Props, SharedTabProp>,
		Pick<AnimationOptions, 'unstyled'> {
	idx: TabIds
	isActive: boolean
}

export const {
	RootProvider: TabProvider,
	useRootCtx: useTabCtx,
	useRootProps: useTabProps,
} = createCompoundCtx<TabContext>('Tab')
