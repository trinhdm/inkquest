import { useAccordionCtx } from '../Accordion.context'
import { defineTokens } from '@/lib/component/tokens'
import { extractOthers } from '@/hooks/useProps'
import { polymorphic } from '@/lib/component/factory'
import { withInlineWrap } from '@/lib/component/children'
import { Box } from '@/components/polymorphic/Box'
import type { ReactNode } from 'react'
import type { Accordion } from '../Accordion'
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
		| '--accordion-content-padding'
		| '--accordion-content-size'
}

const tokens = defineTokens<AccordionContentSpecs>()(({ context, theme }) => {
	if (!context) return {}

	const { layout, size } = context
	let contentIndent, contentSize

	if (layout === 'steps')
		contentIndent = 'calc(var(--accordion-column-width) + var(--accordion-gap))'

	if (!!size) {
		const fontSize = []

		if (layout === 'blockquote') {
			fontSize.push('caption')
		} else {
			fontSize.push('body')
			if (size === 'lg') fontSize.push(size)
		}

		contentSize = theme.fontSize(...fontSize as Parameters<typeof theme.fontSize>)
	}

	return {
		root: {
			'--accordion-content-indent': contentIndent,
			'--accordion-content-padding': theme.space('icon'),
			'--accordion-content-size': contentSize,
		},
	}
})

export const AccordionContent = polymorphic<AccordionContentSpecs>((_props, { useProps, useStyles }) => {
	const context = useAccordionCtx(NAME)
	const props = useProps(_props)
	const styles = useStyles({ context, props, tokens })

	const { idx, isOpen } = useAccordionCtx(NAME)
	const { children, ...rest } = props
	const others = extractOthers(rest)

	const clsx = { global: { prose: true } }

	return (
		<Box
			{ ...styles('root', clsx) }
			{ ...others }
			as="div"
			attributes={ { aria: { labelledby: idx.title } } }
			id={ idx.content }
			role="region"
		>
			<div { ...styles('wrapper') } inert={ !isOpen || undefined }>
				<div { ...styles('inner') }>
					{ withInlineWrap(children) }
				</div>
			</div>
		</Box>
	)
}, { name: NAME, classes })

AccordionContent.set({ displayName: NAME })

export declare namespace AccordionContent {
	export type Props = AccordionContentProps
	export type Specs = AccordionContentSpecs
}
