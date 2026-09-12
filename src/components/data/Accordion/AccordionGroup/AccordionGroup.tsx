import { useCallback, useMemo, useRef, useState } from 'react'
import { useInView } from 'framer-motion'
import { useProps, useStyles } from '@/hooks'
import { extractOtherProps, flattenChildren } from '@/utils/helpers'
import { renderWithProvider } from '@/lib/component'
import { AccordionGroupProvider } from './AccordionGroup.context'
import { Box, polymorphic } from '@/components/core/Box'
import { INVIEW_DEFAULTS } from '@/utils/constants'
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
	// animated?: boolean
	// duration?: number
	// index?: number
	// revealed?: boolean
	// stagger?: number
}

type AccordionGroupSpecs = {
	props: AccordionGroupProps
	specIs: { compound: true }
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

	const items = flattenChildren(children, 'Accordion'),
		total = items.length

	const root = useRef<HTMLDivElement>(null)
	const withinView = useInView(root, { amount: INVIEW_DEFAULTS, once: true })

	const cxtValues = useMemo(
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

	// export type Layout = AccordionGroupLayout
	// export type Type = AccordionGroupType
}
