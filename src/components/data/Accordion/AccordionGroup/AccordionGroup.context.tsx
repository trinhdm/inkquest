import { createRootCtx } from '@/lib/component/context'
import type { Accordion } from '../Accordion'
import type { AnimateInViewConfig } from '@/hooks/animation'

export type AccordionGroupType =
	'single' | 'multiple'

export interface AccordionGroupContext {
	collapsible?: Accordion.Props['collapsible']
	disabled?: Accordion.Props['disabled']
	index?: Accordion.Props['index']
	layout?: Accordion.Props['layout']
	onItemToggle?: Accordion.Props['onItemToggle']
	open?: Accordion.Props['open']
	order?: Accordion.Props['order']
	size?: Accordion.Props['size']
	unstyled?: AnimateInViewConfig['unstyled']
	withinView?: AnimateInViewConfig['withinView']
}

export const {
	RootProvider: AccordionGroupProvider,
	useSafeRootCtx: useAccordionGroupCtx,
	useRootProps: useAccordionGroupProps,
} = createRootCtx<AccordionGroupContext>('Accordion.Group')
