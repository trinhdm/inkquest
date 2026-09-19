import { useProps, useStyles, extractOtherProps } from '@/hooks'
import { useReducedMotion } from 'framer-motion'
import { useAccordionCxt } from '../Accordion.context'
import { Box, polymorphic } from '@/components/core/Box'
import type { ReactNode } from 'react'
import classes from '../Accordion.module.scss'

const NAME = 'AccordionContent' as const

interface AccordionContentProps {
	children: ReactNode
}

interface AccordionContentSpecs {
	isCompound: true
	props: AccordionContentProps
}

export const AccordionContent = polymorphic<AccordionContentSpecs>(_props => {
	const { idx, isOpen } = useAccordionCxt(NAME)
	const props = useProps(NAME, _props)
	const styles = useStyles(NAME, { classes, props })

	const { children, ...rest } = props
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
			<div { ...styles('inner') } inert={ !isOpen || undefined }>
				<div { ...styles('wrapper') }>
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
