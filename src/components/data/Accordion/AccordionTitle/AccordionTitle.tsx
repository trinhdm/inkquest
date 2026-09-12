import { useProps, useStyles } from '@/hooks'
import { useAccordionProps, type AccordionContext } from '../Accordion.context'
import { extractOtherProps } from '@/utils/helpers'
import { Box, polymorphic } from '@/components/core/Box'
import { Icon } from '@/components/core'
import type {  ReactNode } from 'react'
import classes from '../Accordion.module.scss'

const NAME = 'AccordionTitle' as const

interface AccordionTitleProps
	extends Omit<AccordionContext, 'displayName'> {
	children: ReactNode
}

interface AccordionTitleSpecs {
	props: AccordionTitleProps
	specIs: { compound: true }
}

export const AccordionTitle = polymorphic<AccordionTitleSpecs>(_props => {
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
			<span { ...styles('text') }>
				{ children }
			</span>

			{ indicator !== 'none' && (
				<span { ...styles('indicator') }>
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
