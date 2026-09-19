import { useCallback, useMemo, useRef, useState } from 'react'
import { useProps, useReplayInView, useStyles } from '@/hooks'
import { extractOtherProps, filterChildren } from '@/utils/helpers'
import { renderWithProvider } from '@/lib/component'
import { AccordionGroupProvider } from './AccordionGroup.context'
import { Box, polymorphic } from '@/components/core/Box'
import classes from '../Accordion.module.scss'

import type {
	AccordionGroupContext,
	AccordionGroupLayout,
	AccordionGroupType,
} from './AccordionGroup.context'

const NAME = 'AccordionGroup' as const

interface AccordionGroupProps {
	collapsible?: boolean
	defaultOpen?: number | number[]
	layout?: AccordionGroupLayout
	type?: AccordionGroupType
}

type AccordionGroupSpecs = {
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
		layout,
		type,
		unstyled,
		...rest
	} = props

	const { others } = extractOtherProps(rest)

	const [openItems, setOpenItems] = useState(() => handleOpenItems(defaultOpen))

	const handleItemToggle = useCallback((
		i: number,
		next: boolean
	) => {
		setOpenItems(prev => {
			if (type === 'multiple') return next ? [...prev, i] : prev.filter(h => h !== i)
			if (!next) return collapsible ? [] : prev
			return [i]
		})
	}, [collapsible, type])

	const items = filterChildren(children, 'Accordion'),
		total = items.length

	const root = useRef<HTMLDivElement>(null)
	const withinView = useReplayInView(root)

	const cxtValues = useMemo<AccordionGroup.Context[]>(
		() => Array.from({ length: total }, (_, index) => ({
			index, layout,
			onItemToggle: handleItemToggle,
			open: openItems.includes(index),
			unstyled, withinView,
		})),
		[handleItemToggle, layout, openItems, total, unstyled, withinView]
	)

	return (
		<Box
			{ ...styles('root') }
			{ ...others }
			as="div"
			attributes={ { data: { group: true } } }
			ref={ root }
		>
			{ renderWithProvider(items, AccordionGroupProvider, cxtValues) }
		</Box>
	)
}, classes)

AccordionGroup.displayName = NAME
AccordionGroup.setDefaults({
	props: {
		collapsible: true,
		defaultOpen: 0,
		type: 'single',
	}
})

export declare namespace AccordionGroup {
	export type Context = AccordionGroupContext
	export type Props = AccordionGroupProps
	export type Specs = AccordionGroupSpecs
}
