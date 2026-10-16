import { createCompoundCtx } from '@/lib/component/context'
import type { Tab } from '../Tab'

type SharedTabProp =
	| 'active'
	| 'disabled'
	| 'index'
	| 'onToggle'
	| 'railWidth'

export interface TabListContext
	extends Pick<Tab.Props, SharedTabProp> {
	unstyled?: boolean
}

export const {
	RootProvider: TabListProvider,
	useRootCtx: useTabListCtx,
	useRootProps: useTabListProps,
} = createCompoundCtx<TabListContext>('Tab.Group')
