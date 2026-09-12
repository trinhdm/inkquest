import { createRootCxt } from '@/lib/component'

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
	handleToggle: () => void
	idx: AccordionIds
	indicator?: AccordionIndicator
	isOpen: boolean
	step?: `${number}`
}

export const {
	RootCxtProvider: AccordionProvider,
	useRootCxt: useAccordionCxt,
	useRootProps: useAccordionProps,
} = createRootCxt<AccordionContext>('Accordion')
