import { createCompoundCtx } from '@/lib/component/context'
import type { Accordion } from './Accordion'
import type { AnimationOptions } from '@/hooks/animation'

interface AccordionIds {
	content: string
	root: string
	title: string
}

type SharedAccordionProp =
	| 'collapsible'
	| 'disabled'
	| 'indicator'
	| 'order'
	| 'size'

export interface AccordionContext
	extends
		Pick<Accordion.Props, SharedAccordionProp>,
		Pick<AnimationOptions, 'unstyled'> {
	handleToggle: () => void
	idx: AccordionIds
	isOpen: boolean
	step?: `${number}`
}

export const {
	RootProvider: AccordionProvider,
	useRootCtx: useAccordionCtx,
	useRootProps: useAccordionProps,
} = createCompoundCtx<AccordionContext>('Accordion')
