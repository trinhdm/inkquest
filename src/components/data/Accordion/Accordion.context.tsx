import { createRootCtx } from '@/lib/component'

export type AccordionIndicator =
	| 'chevron'
	| 'plus'
	| 'none'

export interface AccordionIds {
	content: string
	root: string
	title: string
}

export interface AccordionContext {
	disabled?: boolean
	handleToggle: () => void
	idx: AccordionIds
	indicator?: AccordionIndicator
	isOpen: boolean
	step?: `${number}`
	unstyled?: boolean
}

export const {
	RootProvider: AccordionProvider,
	useRootCtx: useAccordionCtx,
	useRootProps: useAccordionProps,
} = createRootCtx<AccordionContext>('Accordion')
