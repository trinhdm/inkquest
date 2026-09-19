import { createRootCtx } from '@/lib/component'

export type AccordionGroupLayout =
	'default' | 'steps'

export type AccordionGroupType =
	'single' | 'multiple'

export interface AccordionGroupContext {
	disabled?: boolean
	index?: number
	layout?: AccordionGroupLayout
	onItemToggle?: (index: number, open: boolean) => void
	open?: boolean
	unstyled?: boolean
	withinView?: boolean
}

export const {
	RootProvider: AccordionGroupProvider,
	useSafeRootCtx: useAccordionGroupCtx,
	useRootProps: useAccordionGroupProps,
} = createRootCtx<AccordionGroupContext>('Accordion.Group')
