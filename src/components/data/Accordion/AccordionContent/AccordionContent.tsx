import { useProps, useStyles } from '@/hooks'
import { useReducedMotion } from 'framer-motion'
import { useAccordionProps, type AccordionContext } from '../Accordion.context'
import { extractOtherProps } from '@/utils/helpers'
import { Box, polymorphic } from '@/components/core/Box'
import type { ReactNode } from 'react'
import classes from '../Accordion.module.scss'

const NAME = 'AccordionContent' as const

interface AccordionContentProps
	extends Omit<AccordionContext, 'displayName'> {
	children: ReactNode
}

interface AccordionContentSpecs {
	props: AccordionContentProps
	specIs: { compound: true }
}

export const AccordionContent = polymorphic<AccordionContentSpecs>(_props => {
	const props = useProps(NAME, useAccordionProps(_props))
	const styles = useStyles(NAME, { classes, props })

	const {
		children,
		handleToggle,
		idx,
		indicator,
		isOpen,
		...rest
	} = props

	const { others } = extractOtherProps(rest)
	const reduced = useReducedMotion()

	return (
		<Box
			{ ...styles('root') }
			{ ...others }
			as="div"
			attributes={ { aria: { labelledby: idx.title } } }
			id={ idx.content }
			role="region"
		>
			<div { ...styles('inner') }>
				<div { ...styles('body') }>
					{ children }
				</div>
			</div>
		</Box>
	)
}, classes)

AccordionContent.displayName = NAME
AccordionContent.setDefaults({})

export declare namespace AccordionContent {
	export type Props = AccordionContentProps
	export type Specs = AccordionContentSpecs
}
