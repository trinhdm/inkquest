import { createCompoundCtx } from '@/lib/component/context'

// interface TabGroupIds {
// 	control: string
// 	panel: string
// }

export interface TabGroupContext {
	active: number
	// idx: TabGroupIds
	uid: string
	onSelect: (index: number) => void
	unstyled?: boolean
}

export const {
	RootProvider: TabGroupProvider,
	useRootCtx: useTabGroupCtx,
	useRootProps: useTabGroupProps,
} = createCompoundCtx<TabGroupContext>('TabGroup')
