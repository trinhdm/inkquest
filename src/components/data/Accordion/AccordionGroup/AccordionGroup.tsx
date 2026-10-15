import { useCallback, useMemo, useRef, useState } from 'react'
import { useReplayInView } from '@/hooks/animation'
import { extractOthers } from '@/hooks/useProps'
import { filterChildren } from '@/lib/component/children'
import { getSharedTokens, type AccordionTokens as AccordionGroupTokens } from '../utils'
import { polymorphic } from '@/lib/component/factory'
import { withProvider } from '@/lib/component/context'
import { AccordionGroupProvider } from './AccordionGroup.context'
import { Box } from '@/components/polymorphic/Box'
import type { Accordion } from '../Accordion'
import type { AccordionGroupContext, AccordionGroupType } from './AccordionGroup.context'
import type { PropsDefaultList } from '@/lib/component/factory/types'
import classes from '../Accordion.module.scss'

const NAME = 'Accordion.Group' as const

const DEFAULT_PROPS = {
	collapsible: 'single',
	defaultOpen: 0,
	order: 3,
	size: 'md',
} as const

interface AccordionGroupProps {
	collapsible?: AccordionGroupType | false
	defaultOpen?: number | number[]
	disabled?: Accordion.Props['disabled']
	layout?: Accordion.Props['layout']
	order?: Accordion.Props['order']
	size?: Accordion.Props['size']
}

type AccordionGroupSpecs = {
	defaults: { props: PropsDefaultList<typeof DEFAULT_PROPS> }
	isCompound: true
	props: AccordionGroupProps
	selectors: AccordionGroupSelectors
	tokens: AccordionGroupTokens
}

type AccordionGroupSelectors =
	| 'root'

const handleOpenItems = (value?: AccordionGroupProps['defaultOpen']): number[] =>
	typeof value === 'number'
		? [value]
		: Array.isArray(value)
			? value : []

const tokens = getSharedTokens('group')

export const AccordionGroup = polymorphic<AccordionGroupSpecs>((_props, { useProps, useStyles }) => {
	const props = useProps(_props)
	const styles = useStyles({ props, tokens })

	const {
		children, collapsible, defaultOpen,
		disabled, layout, order,
		size, unstyled,
		...rest
	} = props

	const others = extractOthers(rest)

	const root = useRef<HTMLDivElement>(null)
	const withinView = useReplayInView(root)

	const [openItems, setOpenItems] = useState<number[]>(() => {
		const indices = handleOpenItems(defaultOpen)
		return collapsible === 'single' ? indices.slice(0, 1) : indices
	})

	const handleItemToggle = useCallback((
		index: number,
		next: boolean
	) => {
		setOpenItems(prev => {
			if (!collapsible) return [...prev]
			else if (collapsible === 'single') return next ? [index] : []
			return next ? [...prev, index] : prev.filter(i => i !== index)
		})
	}, [collapsible])

	const items = filterChildren(children, 'Accordion', { name: NAME }),
		total = items.length

	const ctxValues = useMemo(
		() => Array.from({ length: total }, (_, index): AccordionGroupContext => ({
			collapsible: typeof collapsible === 'string',
			disabled, index, layout,
			onItemToggle: handleItemToggle,
			open: openItems.includes(index),
			order, size, unstyled, withinView,
		})),
		[
			collapsible, disabled, handleItemToggle,
			layout, openItems, order, size,
			total, unstyled, withinView,
		]
	)

	return (
		<Box
			{ ...styles('root') }
			{ ...others }
			as="div"
			attributes={ { data: { group: true } } }
			ref={ root }
		>
			{ withProvider(items, AccordionGroupProvider, ctxValues) }
		</Box>
	)
}, { name: NAME, classes })

AccordionGroup.set({
	defaultProps: DEFAULT_PROPS,
	displayName: NAME,
})

export declare namespace AccordionGroup {
	export type Context = AccordionGroupContext
	export type Props = AccordionGroupProps
	export type Specs = AccordionGroupSpecs
	export type Type = AccordionGroupType
}
