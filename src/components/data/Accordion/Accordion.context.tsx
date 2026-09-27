import { createRootCtx } from '@/lib/component'
import type { AnimationOptions } from '@/hooks/animation'
import type { HeadingOrder } from '@/types/shared'

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
	collapsible?: boolean
	disabled?: boolean
	handleToggle: () => void
	idx: AccordionIds
	indicator?: AccordionIndicator
	isOpen: boolean
	order: HeadingOrder
	step?: `${number}`
}

export const {
	RootProvider: AccordionProvider,
	useRootCtx: useAccordionCtx,
	useRootProps: useAccordionProps,
} = createRootCtx<AccordionContext>('Accordion')
