import { createCompoundCtx } from '@/lib/component/context'
import type { Button } from '@/components/core/Button'

export interface SectionContext {
	revealFrom?: number
	size?: Button.Size
}

export const {
	RootProvider: SectionProvider,
	useRootCtx: useSectionCtx,
	useRootProps: useSectionProps,
} = createCompoundCtx<SectionContext, 'Section'>('Section')
