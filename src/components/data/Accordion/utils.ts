import { rem } from '@/lib/general'
import type { Accordion } from './Accordion'
import type { HeadingOrder } from '@/types/shared'
import type { TokensList } from '@/lib/component/factory/types'

export type AccordionTokens = {
	root:
		| '--accordion-column-width'
		| '--accordion-gap'
		| '--accordion-indicator-size'
		| '--accordion-padding'
		| '--accordion-step-size'
		| '--accordion-text-size'
}

interface AccordionTokenConfig {
	colWidth: number
	gap: number
	indicator: number
	order: HeadingOrder
	padding: number
	step?: string
}

type AccordionPropsList =
	Accordion.Props | Accordion.Group.Props

const getTokenGroup = (
	step: number,
	base: AccordionTokenConfig,
): AccordionTokenConfig => ({
	colWidth: base.colWidth - (3 * step),
	gap: base.gap - (3 * step),
	indicator: base.indicator - (4 * step),
	order: base.order + step as AccordionTokenConfig['order'],
	padding: base.padding - step,
	step: `calc((var(--accordion-text-size) - var(--accordion-indicator-size)) + (${base.step} * ${step + 1}) )`,
})

const tokensBySize = (
	size: NonNullable<AccordionPropsList['size']>,
	order: AccordionPropsList['order'],
): AccordionTokenConfig => {
	const step = { sm: 2, md: 1, lg: 0 }[size]
	const base: AccordionTokenConfig = {
		colWidth: 11,
		gap: 9,
		indicator: 24,
		order: order ?? 3,
		padding: 6,
		step: size === 'sm' ? rem(3) : rem(6),
	}

	return getTokenGroup(step, base)
}

export const getSharedTokens = ({
	order,
	size,
}: AccordionPropsList): TokensList<AccordionTokens> => {
	if (!size) return {}
	const config = tokensBySize(size, order)

	return {
		root: {
			'--accordion-column-width': `var(--space-${config.colWidth})`,
			'--accordion-gap': `var(--space-${config.gap})`,
			'--accordion-padding': `var(--space-${config.padding})`,
			'--accordion-indicator-size': `var(--font-size-${config.indicator})`,
			'--accordion-step-size': config.step,
			'--accordion-text-size': `var(--inkq-font-size-heading-h${config.order})`,
		},
	}
}
