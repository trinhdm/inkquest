import { createCompoundCtx } from '@/lib/component/context'
import type { Accordion } from './Accordion'
import type { AnimationOptions } from '@/hooks/animation'

interface AccordionIds {
	content: string
	root: string
	title: string
}

export interface AccordionContext {
	collapsible?: Accordion.Props['collapsible']
	disabled?: Accordion.Props['disabled']
	handleToggle: () => void
	idx: AccordionIds
	indicator?: Accordion.Props['indicator']
	isOpen: boolean
	order: Accordion.Props['order']
	size?: Accordion.Props['size']
	step?: `${number}`
	unstyled?: AnimationOptions['unstyled']
}

export const {
	RootProvider: AccordionProvider,
	useRootCtx: useAccordionCtx,
	useRootProps: useAccordionProps,
} = createCompoundCtx<AccordionContext>('Accordion')
