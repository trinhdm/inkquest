import { createRootCxt } from '@/lib/component'

export type AccordionGroupType =
	'single' | 'multiple'

interface AccordionGroupContext {
	collapsible?: boolean
	isOpen?: boolean
	index?: number
	type?: AccordionGroupType
	unstyled?: boolean
	// animated?: boolean
	// revealed?: boolean
	// stagger?: number
	// withinView?: boolean
}

export const {
	RootCxtProvider: AccordionGroupProvider,
	useSafeRootCxt: useAccordionGroupCxt,
	useRootProps: useAccordionGroupProps,
} = createRootCxt<AccordionGroupContext>('AccordionGroup')
