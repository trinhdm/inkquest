import { useMemo, type KeyboardEvent, type ReactNode } from 'react'
import { ChevronDown, Plus } from 'lucide-react'
import { useAccordionCtx } from '../Accordion.context'
import { defineTokens } from '@/lib/component/tokens'
import { extractOthers } from '@/hooks/useProps'
import { polymorphic } from '@/lib/component/factory'
import { Box } from '@/components/polymorphic/Box'
import type { Accordion } from '../Accordion'
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
		| '--accordion-title-direction'
	text:
		| '--accordion-title-indent'
}

const tokens = defineTokens<AccordionTitleSpecs>()(({ context }) => {
	if (!context) return {}

	const { indicatorPosition, layout } = context
	let titleIndent

	if (!!layout && layout !== 'default')
		titleIndent = 0

	return {
		root: {
			'--accordion-title-direction': indicatorPosition === 'left' ? 'row-reverse' : undefined,
		},
		text: {
			'--accordion-title-indent': titleIndent,
		},
	}
})

export const AccordionTitle = polymorphic<AccordionTitleSpecs>((_props, { useProps, useStyles }) => {
	const context = useAccordionCtx(NAME)
	const props = useProps(_props)
	const styles = useStyles({ context, props, tokens })

	const {
		collapsible, disabled, handleToggle,
		idx, index, indicator,
		isOpen, layout, order,
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

		const titles = [...group.children]
				.map(item => document.getElementById(`${item.id}-title`))
				.filter((title): title is HTMLButtonElement =>
					title instanceof HTMLButtonElement && !title.disabled),
			current = titles.indexOf(event.currentTarget)

		if (current < 0) return

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

	const step = useMemo(() => {
		if (layout !== 'steps') return
		const i = index + 1
		return (i > 9 ? `${i}` : `0${i}`) as `${number}`
	}, [index, layout])

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

AccordionTitle.set({ displayName: NAME })

export declare namespace AccordionTitle {
	export type Props = AccordionTitleProps
	export type Specs = AccordionTitleSpecs
}
