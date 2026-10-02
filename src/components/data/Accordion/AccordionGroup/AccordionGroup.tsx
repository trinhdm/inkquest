import { useCallback, useMemo, useRef, useState } from 'react'
import { useProps, extractOtherProps } from '@/hooks/useProps'
import { useReplayInView } from '@/hooks/animation'
import { defineTokens, filterChildren, polymorphic, withProvider } from '@/lib/component'
import { getSharedTokens, type AccordionTokens as AccordionGroupTokens } from '../utils'
import { AccordionGroupProvider } from './AccordionGroup.context'
import { Box } from '@/components/polymorphic/Box'
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

interface AccordionGroupProps
	extends Pick<AccordionGroupContext, 'disabled' | 'layout' | 'order' | 'size'> {
	collapsible?: AccordionGroupType | false
	defaultOpen?: number | number[]
	// disabled?: boolean
	// layout?: AccordionGroupContext['layout']
	// size?: AccordionGroupContext['size']
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

const tokens = defineTokens<AccordionGroupSpecs>(({ props }) => getSharedTokens(props))

export const AccordionGroup = polymorphic<AccordionGroupSpecs>((_props, { useStyles }) => {
	const props = useProps(NAME, _props)
	const styles = useStyles(NAME, { props, tokens })

	const {
		children,
		collapsible,
		defaultOpen,
		disabled,
		layout,
		order,
		unstyled,
		...rest
	} = props

	const others = extractOtherProps(rest)

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

	const items = filterChildren(children, 'Accordion'),
		total = items.length

	const ctxValues = useMemo(
		() => Array.from({ length: total }, (_, index): AccordionGroupContext => ({
			collapsible: typeof collapsible === 'string',
			disabled, index, layout,
			onItemToggle: handleItemToggle,
			open: openItems.includes(index),
			order, unstyled, withinView,
		})),
		[
			collapsible, disabled, handleItemToggle,
			layout, openItems, total,
			order, unstyled, withinView,
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
}, classes)

AccordionGroup.displayName = NAME
AccordionGroup.setDefaults({ props: DEFAULT_PROPS })

export declare namespace AccordionGroup {
	export type Context = AccordionGroupContext
	export type Props = AccordionGroupProps
	export type Specs = AccordionGroupSpecs

	export type Size = NonNullable<AccordionGroupContext['size']>
	export type Type = AccordionGroupType
}
