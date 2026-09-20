import { createRootCtx } from '@/lib/component'
import type { AnimationOptions } from '@/hooks'

export type AccordionIndicator =
	| 'chevron'
	| 'plus'
	| 'none'

export interface AccordionIds {
	content: string
	root: string
	title: string
}

export interface AccordionContext
	extends Pick<AnimationOptions, 'unstyled'> {
	disabled?: boolean
	handleToggle: () => void
	idx: AccordionIds
	indicator?: AccordionIndicator
	isOpen: boolean
	step?: `${number}`
}

export const {
	RootProvider: AccordionProvider,
	useRootCtx: useAccordionCtx,
	useRootProps: useAccordionProps,
} = createRootCtx<AccordionContext>('Accordion')
