import { isValidElement, useMemo, useRef, Fragment } from 'react'
import { useProps, useStyles } from '@/hooks'
import { useInView } from 'framer-motion'
import { extractOtherProps, flattenChildren } from '@/utils/helpers'
import { AccordionGroupProvider } from './AccordionGroup.context'
import { Box, polymorphic } from '@/components/core/Box'
import { INVIEW_DEFAULTS } from '@/utils/constants'
import classes from '../Accordion.module.scss'

const NAME = 'AccordionGroup' as const

interface AccordionGroupProps {
	collapsible?: boolean
	isOpen?: boolean
	type?: 'single' | 'multiple'
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

export const AccordionGroup = polymorphic<AccordionGroupSpecs>(_props => {
	const props = useProps(NAME, _props)
	const styles = useStyles(NAME, { classes, props })

	const {
		children,
		collapsible,
		type,
		unstyled,
		...rest
	} = props

	const { others } = extractOtherProps(rest)

	const items = flattenChildren(children, 'Accordion'),
		total = items.length

	const root = useRef<HTMLDivElement>(null)
	const withinView = useInView(root, { amount: INVIEW_DEFAULTS, once: true })

	const cxtValue = useMemo(
		() => ({ collapsible, type, unstyled, withinView, }),
		[collapsible, type,  unstyled, withinView]
	)

	// const cxtValues = useMemo(
	// 	() => Array.from({ length: total }, (_, index) => ({
	// 		collapsible, index, type, unstyled, withinView,
	// 	})),
	// 	[collapsible, type, total, unstyled, withinView]
	// )

	return (
		<AccordionGroupProvider
			value={ cxtValue }
			// { ...styles('root') }
			// { ...others }
		>
			{ items.map((child, i) => {
				const key = isValidElement(child) && child.key !== null ? child.key : i

				return <Fragment key={ key }>{ child }</Fragment>
			}) }
		</AccordionGroupProvider>
	)
}, classes)

AccordionGroup.displayName = NAME
AccordionGroup.setDefaults({
	props: {
		collapsible: true,
		type: 'single',
	}
})

export declare namespace AccordionGroup {
	export type Props = AccordionGroupProps
	export type Specs = AccordionGroupSpecs
}
