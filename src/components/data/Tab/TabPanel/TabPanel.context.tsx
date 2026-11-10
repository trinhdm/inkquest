import { createCompoundCtx } from '@/lib/component/context'
import type { TabIds } from '../utils'

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
