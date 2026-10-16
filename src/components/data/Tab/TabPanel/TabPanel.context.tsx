import { createCompoundCtx } from '@/lib/component/context'
// import type { TabIds } from '../utils'

export interface TabIds {
	control: string
	panel: string
}

export const getTabIds = (uid: string, index: number): TabIds => ({
	control: `${uid}-${index}`,
	panel: `${uid}-${index}-panel`,
})

export interface TabPanelContext {
	idx: TabIds
	isActive: boolean
	unstyled?: boolean
}

export const {
	RootProvider: TabPanelProvider,
	useRootCtx: useTabPanelCtx,
	useRootProps: useTabPanelProps,
} = createCompoundCtx<TabPanelContext>('Tab.Group')
