import { ChevronDown, Plus } from 'lucide-react'
import { useAccordionCtx } from '../Accordion.context'
import { defineTokens, polymorphic } from '@/lib/component'
import { extractOthers } from '@/hooks/useProps'
import { keyHasValue } from '@/utils/helpers'
import { Box } from '@/components/polymorphic/Box'
import { Icon } from '@/components/core/Icon'
import type { Accordion } from '../Accordion'
import type { KeyboardEvent, ReactNode } from 'react'
import classes from '../Accordion.module.scss'

const NAME = 'Accordion.Title' as const

interface AccordionTitleProps {
	children: ReactNode
}

interface AccordionTitleSpecs {
	context: Accordion.Context
	isCompound: true
	props: AccordionTitleProps
	selectors: AccordionTitleSelectors
	tokens: AccordionTitleTokens
}

type AccordionTitleSelectors =
	| 'root' | 'step' | 'text' | 'indicator'

type AccordionTitleTokens = {
	root:
		| '--accordion-title-indent'
}

const tokens = defineTokens<AccordionTitleSpecs>(({ context }) => ({
	root: { '--accordion-title-indent': keyHasValue(context, 'step') ? 0 : undefined },
}))

export const AccordionTitle = polymorphic<AccordionTitleSpecs>((_props, { useProps, useStyles }) => {
	const context = useAccordionCtx(NAME)
	const props = useProps(_props)
	const styles = useStyles({ context, props, tokens })

	const {
		collapsible,
		disabled,
		handleToggle,
		idx,
		indicator,
		isOpen,
		order,
		step,
	} = context

	const { children, ...rest } = props
	const others = extractOthers(rest)

	const sharedProps = { ...styles('root'), ...others, id: idx.title },
		indicateClass = { [`${indicator}`]: indicator !== 'none' },
		interactive = collapsible !== false

	const aria = { controls: idx.content, expanded: isOpen },
		data = { open: isOpen || null, title: true }

	const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
		const group = event.currentTarget.closest('[data-group]')
		if (!group) return

		const titles = [...group.querySelectorAll<HTMLButtonElement>('button[data-title]')],
			current = titles.indexOf(event.currentTarget)

		let next = -1
		switch (event.key) {
			case 'ArrowDown': next = (current + 1) % titles.length; break
			case 'ArrowUp': next = (current - 1 + titles.length) % titles.length; break
			case 'Home': next = 0; break
			case 'End': next = titles.length - 1; break
			default: return
		}

		event.preventDefault()
		titles[next]?.focus()
	}

	const stepEl = !!step && <span { ...styles('step') }>{ step }</span>,
		textEl = <span { ...styles('text', { global: `inkq-h${order}` }) }>{ children }</span>,
		titleItems = <>{ stepEl }{ textEl }</>

	if (interactive) {
		return (
			<Box
				{ ...sharedProps }
				as="button"
				attributes={ { aria, data } }
				disabled={ disabled }
				onClick={ handleToggle }
				onKeyDown={ handleKeyDown }
			>
				{ titleItems }

				{ (indicator !== 'none') && (
					<span { ...styles('indicator', { selector: indicateClass }) }>
						<Box as={ indicator === 'plus' ? Plus : ChevronDown } />
						<Icon type={ indicator === 'plus' ? 'add' : 'caret-down' } />
					</span>
				) }
			</Box>
		)
	}

	return (
		<Box
			{ ...sharedProps }
			as="div"
			attributes={ { data } }
		>
			{ titleItems }
		</Box>
	)
}, { name: NAME, classes })

AccordionTitle.setDefaults({})

export declare namespace AccordionTitle {
	export type Props = AccordionTitleProps
	export type Specs = AccordionTitleSpecs
}
