import { useAccordionCtx } from '../Accordion.context'
import { useProps, extractOtherProps } from '@/hooks/useProps'
import { useStyles } from '@/hooks/useStyles'
import { polymorphic } from '@/lib/component'
import { Box } from '@/components/polymorphic/Box'
import type { ReactNode } from 'react'
import classes from '../Accordion.module.scss'

const NAME = 'Accordion.Content' as const

interface AccordionContentProps {
	children: ReactNode
}

interface AccordionContentSpecs {
	isCompound: true
	props: AccordionContentProps
}

export const AccordionContent = polymorphic<AccordionContentSpecs>(_props => {
	const { idx, isOpen } = useAccordionCtx(NAME)
	const props = useProps(NAME, _props)
	const styles = useStyles(NAME, { classes, props })

	const { children, ...rest } = props
	const { others } = extractOtherProps(rest)

	return (
		<Box
			{ ...styles('root') }
			{ ...others }
			as="div"
			attributes={ { aria: { labelledby: idx.title } } }
			id={ idx.content }
			role="region"
		>
			<div { ...styles('wrapper') } inert={ !isOpen || undefined }>
				<div { ...styles('inner') }>
					{ typeof children === 'string' ? <p>{ children }</p> : children }
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
