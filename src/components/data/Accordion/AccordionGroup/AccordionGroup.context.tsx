import { createRootCxt } from '@/lib/component'

export type AccordionGroupLayout =
	'default' | 'steps'

export type AccordionGroupType =
	'single' | 'multiple'

export interface AccordionGroupContext {
	index?: number
	layout?: AccordionGroupLayout
	onItemToggle?: (index: number, open: boolean) => void
	open?: boolean
	unstyled?: boolean
	withinView?: boolean
}

export const {
	RootCxtProvider: AccordionGroupProvider,
	useSafeRootCxt: useAccordionGroupCxt,
	useRootProps: useAccordionGroupProps,
} = createRootCxt<AccordionGroupContext>('AccordionGroup')
