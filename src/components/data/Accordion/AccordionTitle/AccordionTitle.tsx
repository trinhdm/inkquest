import { useProps, useStyles } from '@/hooks'
import { useAccordionCxt } from '../Accordion.context'
import { extractOtherProps } from '@/utils/helpers'
import { Box, polymorphic } from '@/components/core/Box'
import { Icon } from '@/components/core'
import type {  ReactNode } from 'react'
import classes from '../Accordion.module.scss'

const NAME = 'AccordionTitle' as const

interface AccordionTitleProps {
	children: ReactNode
}

interface AccordionTitleSpecs {
	props: AccordionTitleProps
	specIs: { compound: true }
}

export const AccordionTitle = polymorphic<AccordionTitleSpecs>(_props => {
	const {
		handleToggle,
		idx,
		indicator,
		isOpen,
		step,
	} = useAccordionCxt(NAME)

	const props = useProps(NAME, _props)
	const styles = useStyles(NAME, { classes, props })

	const { children, ...rest } = props
	const { others } = extractOtherProps(rest)

	const indicatorClasses = {
		[`${indicator}`]: indicator !== 'none',
	}

	return (
		<Box
			{ ...styles('root') }
			{ ...others }
			as="button"
			attributes={ {
				aria: {
					controls: idx.content,
					expanded: isOpen,
				}
			} }
			id={ idx.title }
			onClick={ handleToggle }
			type="button"
		>
			{ !!step && (
				<span { ...styles('step') }>
					{ step }
				</span>
			) }

			<span { ...styles('text') }>
				{ children }
			</span>

			{ indicator !== 'none' && (
				<span { ...styles('indicator', { selector: indicatorClasses }) }>
					<Icon type={ indicator === 'plus' ? 'add' : 'caret-down' } />
				</span>
			) }
		</Box>
	)
}, classes)

AccordionTitle.displayName = NAME
AccordionTitle.setDefaults({})

export declare namespace AccordionTitle {
	export type Props = AccordionTitleProps
	export type Specs = AccordionTitleSpecs
}
