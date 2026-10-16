import { createCompoundCtx } from '@/lib/component/context'
import type { AnimationOptions } from '@/hooks/animation'
import type { Sidebar } from './Sidebar'

type SharedSidebarProp =
	| 'active'
	| 'onChange'
	| 'scroll'
	| 'shallow'

export interface SidebarContext
	extends
		Pick<Sidebar.Props, SharedSidebarProp>,
		Pick<AnimationOptions, 'unstyled'> {}

export const {
	RootProvider: SidebarProvider,
	useRootCtx: useSidebarCtx,
	useRootProps: useSidebarProps,
} = createCompoundCtx<SidebarContext, 'Sidebar'>('Sidebar')
