import type { Accordion } from './Accordion'

interface AccordionTokens {
	colWidth: string,
	gap: string,
	indicator: string,
	order: 1 | 2 | 3 | 4 | 5 | 6,
}

const setupAccordionTokens = (size: Accordion.Size): AccordionTokens => {
	switch (size) {
		case 'sm':
			return {
				colWidth: 'var(--space-5)',
				gap: 'var(--space-3)',
				indicator: 'var(--font-size-16)',
				order: 5,
			}
		case 'md':
			return {
				colWidth: 'var(--space-8)',
				gap: 'var(--space-6)',
				indicator: 'var(--font-size-24)',
				order: 4,
			}
		case 'lg':
			return {
				colWidth: 'var(--space-11)',
				gap: 'var(--space-9)',
				indicator: 'var(--font-size-20)',
				order: 3,
			}
	}
}

export const getSharedTokens = ({
	layout,
	size,
}: Pick<Accordion.Props, 'layout' | 'size'>) => {
	if (!size) return {}
	const config = setupAccordionTokens(size),
		hasSteps = layout === 'steps'

	const indents = {
		content: `calc(var(--accordion-column-width) + var(--accordion-gap))`,
		title: 0,
	}

	return {
		root: {
			'--accordion-column-width': config.colWidth,
			'--accordion-gap': config.gap,
			'--accordion-text-size': `var(--inkq-font-size-heading-h${config.order})`,
			// '--accordion-indent': config.indent,
		},
		title: {
			// '--accordion-text-size': `var(--inkq-font-size-heading-h${config.order})`,
			...(hasSteps ? { '--accordion-indent': indents.title } : {}),
		},
		content: {
			...(hasSteps ? { '--accordion-indent': indents.content } : {}),
		},
		indicator: {
			'--icon-size': config.indicator,
		},
	}
}
