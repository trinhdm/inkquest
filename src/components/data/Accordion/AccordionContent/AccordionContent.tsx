import { useAccordionCtx } from '../Accordion.context'
import { useProps, extractOtherProps } from '@/hooks/useProps'
import { defineTokens, polymorphic } from '@/lib/component'
import { keyHasValue } from '@/utils/helpers'
import { Box } from '@/components/polymorphic/Box'
import type { Accordion } from '../Accordion'
import type { ReactNode } from 'react'
import classes from '../Accordion.module.scss'

const NAME = 'Accordion.Content' as const

interface AccordionContentProps {
	children: ReactNode
}

interface AccordionContentSpecs {
	context: Accordion.Context
	isCompound: true
	props: AccordionContentProps
	selectors: AccordionContentSelectors
	tokens: AccordionContentTokens
}

type AccordionContentSelectors =
	| 'root' | 'wrapper' | 'inner'

type AccordionContentTokens = {
	root:
		| '--accordion-content-indent'
}

const tokens = defineTokens<AccordionContentSpecs>(({ context }) => ({
	root: { '--accordion-content-indent': keyHasValue(context, 'step')
		? 'calc(var(--accordion-column-width) + var(--accordion-gap))'
		: undefined
	},
}))

export const AccordionContent = polymorphic<AccordionContentSpecs>((_props, { useStyles }) => {
	const context = useAccordionCtx(NAME)
	const props = useProps(NAME, _props)
	const styles = useStyles(NAME, { context, props, tokens })

	const { idx, isOpen } = useAccordionCtx(NAME)
	const { children, ...rest } = props
	const others = extractOtherProps(rest)

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
