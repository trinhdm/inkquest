import { createRootCxt } from '@/lib/component'

export type AccordionIndicator =
	| 'chevron'
	| 'plus'
	| 'none'

export interface AccordionIds {
	content: string
	title: string
}

export interface AccordionContext {
	// collapsible?: boolean
	// displayName: string
	handleToggle: () => void
	idx: AccordionIds
	indicator?: AccordionIndicator
	isOpen: boolean
	step?: number
	unstyled?: boolean
}

export const {
	RootCxtProvider: AccordionProvider,
	useSafeRootCxt: useAccordionCxt,
	useRootName: useAccordionName,
	useRootProps: useAccordionProps,
} = createRootCxt<AccordionContext>('Accordion')
