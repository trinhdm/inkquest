import { createCompoundCtx } from '@/lib/component/context'
import type { Accordion } from '../Accordion'
import type { AnimateInViewConfig } from '@/hooks/animation'

export type AccordionGroupType =
	'single' | 'multiple'

type SharedAccordionProp =
	| 'collapsible'
	| 'disabled'
	| 'index'
	| 'layout'
	| 'onItemToggle'
	| 'open'
	| 'order'
	| 'size'

export interface AccordionGroupContext
	extends
		Pick<Accordion.Props, SharedAccordionProp>,
		Pick<AnimateInViewConfig, 'unstyled' | 'withinView'> {}

export const {
	RootProvider: AccordionGroupProvider,
	useSafeRootCtx: useAccordionGroupCtx,
	useRootProps: useAccordionGroupProps,
} = createCompoundCtx<AccordionGroupContext>('Accordion.Group')

export const useAccordionGroup = () => ({ useAccordionGroupCtx, useAccordionGroupProps })
