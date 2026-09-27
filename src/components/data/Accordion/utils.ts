import { rem } from '@/lib/general'
import type { Accordion } from './Accordion'
import type { HeadingOrder } from '@/types/shared'

interface AccordionTokens {
	colWidth: number
	gap: number
	indicator: number
	order: HeadingOrder
	padding: number
	step?: string
}

type AccordionComponentProps =
	Accordion.Props | Accordion.Group.Props

type AccordionKeys =
	keyof AccordionComponentProps

type PickAccordionProps<K extends AccordionKeys> =
	Pick<AccordionComponentProps, K | 'size'>

type ListAccordionProps<K extends AccordionKeys, RK extends AccordionKeys | null = null> =
	RK extends string
		? PickAccordionProps<K> & Required<PickAccordionProps<RK>>
		: PickAccordionProps<K>

const getTokenGroup = (
	step: number,
	base: AccordionTokens,
): AccordionTokens => ({
	colWidth: base.colWidth - (3 * step),
	gap: base.gap - (3 * step),
	indicator: base.indicator - (4 * step),
	order: base.order + step as AccordionTokens['order'],
	padding: base.padding - step,
	step: `calc((var(--accordion-text-size) - var(--accordion-indicator-size)) + (${base.step} * ${step + 1}) )`,
})

const setupAccordionTokens = ({
	order,
	size,
}: ListAccordionProps<'order', 'size'>): AccordionTokens => {
	const step = { sm: 2, md: 1, lg: 0 }[size]
	const base: AccordionTokens = {
		colWidth: 11,
		gap: 9,
		indicator: 24,
		order: order ?? 3,
		padding: 6,
		step: size === 'sm' ? rem(3) : rem(6),
	}

	return getTokenGroup(step, base)
}

export const getSharedTokens = (props: ListAccordionProps<'layout' | 'order'>) => {
	const { layout, size } = props
	if (!size) return {}

	const config = setupAccordionTokens({ ...props, size }),
		hasSteps = layout === 'steps'

	const indents = {
		base: 'var(--accordion-indent)',
		content: 'calc(var(--accordion-column-width) + var(--accordion-gap))',
		title: 0,
	}

	return {
		root: {
			'--accordion-column-width': `var(--space-${config.colWidth})`,
			'--accordion-gap': `var(--space-${config.gap})`,
			'--accordion-padding': `var(--space-${config.padding})`,
			'--accordion-indicator-size': `var(--font-size-${config.indicator})`,
			'--accordion-step-size': config.step,
			'--accordion-text-size': `var(--inkq-font-size-heading-h${config.order})`,

			'--accordion-content-indent': hasSteps ? indents.content : indents.base,
			'--accordion-title-indent': hasSteps ? indents.title : indents.base,
		},
		title: {
			...(hasSteps ? { '--accordion-indent': indents.title } : {}),
		},
		content: {
			...(hasSteps ? { '--accordion-indent': indents.content } : {}),
		},
	}
}
