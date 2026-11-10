import { createCompoundCtx } from '@/lib/component/context'

export interface TabGroupContext {
	active: number
	onSelect: (index: number) => void
	uid: string
	unstyled?: boolean
}

export const {
	RootProvider: TabGroupProvider,
	useRootCtx: useTabGroupCtx,
	useRootProps: useTabGroupProps,
} = createCompoundCtx<TabGroupContext>('Tab.Group')
