import { defineSharedTokens, type TokensParams } from '@/lib/component/tokens'
import { rem } from '@/lib/general'
import type { Accordion } from './Accordion'
import type { HeadingOrder } from '@/types/shared'
import type { SpecsTokenGroups } from '@/lib/component/factory/types'

export type AccordionTokens = {
	root:
		| '--accordion-column-width'
		| '--accordion-indicator-size'
		| '--accordion-padding'
		| '--accordion-step-size'
		| '--accordion-title-gap'
		| '--accordion-title-size'
}

interface AccordionTokenConfig {
	colWidth: number
	gap: number
	indicator: number
	order: HeadingOrder
	padding: number
	step?: string
}

type AccordionSpecsList = {
	group: Accordion.Group.Specs
	root: Accordion.Specs
}

type AccordionName =
	keyof AccordionSpecsList

type AccordionPropsList<N extends AccordionName> =
	Partial<AccordionSpecsList[N]['props']>

const getTokenGroup = (
	step: number,
	base: AccordionTokenConfig,
): AccordionTokenConfig => ({
	colWidth: base.colWidth - (3 * step),
	gap: base.gap - (3 * step),
	indicator: base.indicator - (4 * step),
	order: base.order + step as AccordionTokenConfig['order'],
	padding: base.padding - step,
	step: `calc((var(--accordion-title-size) - var(--accordion-indicator-size)) + (${base.step} * ${step + 1}) )`,
})

const tokensBySize = <N extends AccordionName = 'root'>({
	layout,
	order,
	size,
}: AccordionPropsList<N>): AccordionTokenConfig | undefined => {
	if (!size) return

	const isBlockquote = layout === 'blockquote',
		step = { sm: 2, md: 1, lg: 0 }[size]

	const base: AccordionTokenConfig = {
		colWidth: 11,
		gap: 9,
		indicator: isBlockquote ? 20 : 24,
		order: order ?? 3,
		padding: isBlockquote ? 4 : 6,
		step: size === 'sm' ? rem(3) : rem(6),
	}

	return getTokenGroup(step, base)
}

/* eslint-disable @typescript-eslint/no-unused-vars */
const listSharedTokens = <
	N extends AccordionName = 'root',
	S extends AccordionSpecsList[N] = AccordionSpecsList[N]
>(
	args: TokensParams<S>,
	name: N = 'root' as N,
): SpecsTokenGroups<S> => {
	const { props, theme } = args

	const config = tokensBySize<N>(props)
	if (!config) return {} as SpecsTokenGroups<S>

	let stepSize,
		titleGap = `var(--space-${config.gap})`,
		titleSize = `var(--inkq-font-size-h${config.order})`

	switch (props.layout) {
		case 'blockquote':
			titleGap = `${0}`
			titleSize = theme.fontSize('caption')
			break
		case 'steps':
			stepSize = config.step
			break
		default: break
	}

	const tokens: SpecsTokenGroups<AccordionSpecsList['root']> = {
		root: {
			'--accordion-column-width': `var(--space-${config.colWidth})`,
			'--accordion-indicator-size': `var(--font-size-${config.indicator})`,
			'--accordion-padding': `var(--space-${config.padding})`,
			'--accordion-step-size': stepSize,
			'--accordion-title-gap': titleGap,
			'--accordion-title-size': titleSize,
		},
	}

	return tokens as SpecsTokenGroups<S>
}

export const getSharedTokens = <N extends AccordionName = 'root'>(name: N = 'root' as N) =>
	defineSharedTokens<AccordionSpecsList, N>(listSharedTokens, name)
