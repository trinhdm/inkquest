import { useCallback, useMemo, useRef, useState } from 'react'
import { useProps, useReplayInView, useStyles, extractOtherProps } from '@/hooks'
import { filterChildren, withProvider } from '@/lib/component'
import { polymorphic, Box, type ListProps } from '@/components/polymorphic'
import { AccordionGroupProvider } from './AccordionGroup.context'
import classes from '../Accordion.module.scss'

import type {
	AccordionGroupContext,
	AccordionGroupLayout,
	AccordionGroupType,
} from './AccordionGroup.context'

const NAME = 'Accordion.Group' as const
const DEFAULT_PROPS = {
	collapsible: true,
	defaultOpen: 0,
	type: 'single',
} as const

interface AccordionGroupProps {
	collapsible?: boolean
	defaultOpen?: number | number[]
	disabled?: boolean
	layout?: AccordionGroupLayout
	type?: AccordionGroupType
}

type AccordionGroupSpecs = {
	defaults: { props: ListProps<typeof DEFAULT_PROPS> }
	isCompound: true
	props: AccordionGroupProps
}

const handleOpenItems = (value?: AccordionGroupProps['defaultOpen']): number[] =>
	typeof value === 'number'
		? [value]
		: Array.isArray(value)
			? value : []

export const AccordionGroup = polymorphic<AccordionGroupSpecs>(_props => {
	const props = useProps(NAME, _props)
	const styles = useStyles(NAME, { classes, props })

	const {
		children,
		collapsible,
		defaultOpen,
		disabled,
		layout,
		type,
		unstyled,
		...rest
	} = props

	const { others } = extractOtherProps(rest)

	const root = useRef<HTMLDivElement>(null)
	const withinView = useReplayInView(root)

	const [openItems, setOpenItems] = useState<number[]>(() => {
		const indices = handleOpenItems(defaultOpen)
		return type === 'multiple' ? indices : indices.slice(0, 1)
	})

	const handleItemToggle = useCallback((
		index: number,
		next: boolean
	) => {
		setOpenItems(prev => {
			if (type === 'multiple')
				return next ? [...prev, index] : prev.filter(i => i !== index)
			else if (!next)
				return collapsible ? [] : prev
			return [index]
		})
	}, [collapsible, type])

	const items = filterChildren(children, 'Accordion'),
		total = items.length

	const ctxValues = useMemo(
		() => Array.from({ length: total }, (_, index): AccordionGroupContext => ({
			disabled, index, layout,
			onItemToggle: handleItemToggle,
			open: openItems.includes(index),
			unstyled, withinView,
		})),
		[disabled, handleItemToggle, layout, openItems, total, unstyled, withinView]
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
}
