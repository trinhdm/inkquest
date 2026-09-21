import { createRootCtx } from '@/lib/component'
import type { AnimationOptions } from '@/hooks'

export type AccordionGroupLayout =
	'default' | 'steps'

export type AccordionGroupType =
	'single' | 'multiple'

export interface AccordionGroupContext
	extends Pick<AnimationOptions, 'index' | 'unstyled' | 'withinView'> {
	collapsible?: boolean
	disabled?: boolean
	layout?: AccordionGroupLayout
	onItemToggle?: (index: number, open: boolean) => void
	open?: boolean
}

export const {
	RootProvider: AccordionGroupProvider,
	useSafeRootCtx: useAccordionGroupCtx,
	useRootProps: useAccordionGroupProps,
} = createRootCtx<AccordionGroupContext>('Accordion.Group')
