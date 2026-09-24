import { useAccordionCtx } from '../Accordion.context'
import { useProps, extractOtherProps } from '@/hooks/useProps'
import { useStyles } from '@/hooks/useStyles'
import { polymorphic } from '@/lib/component'
import { Box } from '@/components/polymorphic/Box'
import { Icon } from '@/components/core'
import type { KeyboardEvent, ReactNode } from 'react'
import classes from '../Accordion.module.scss'

const NAME = 'Accordion.Title' as const

interface AccordionTitleProps {
	children: ReactNode
}

interface AccordionTitleSpecs {
	isCompound: true
	props: AccordionTitleProps
}

export const AccordionTitle = polymorphic<AccordionTitleSpecs>(_props => {
	const {
		collapsible,
		disabled,
		handleToggle,
		idx,
		indicator,
		isOpen,
		step,
	} = useAccordionCtx(NAME)

	const props = useProps(NAME, _props)
	const styles = useStyles(NAME, { classes, props })

	const { children, ...rest } = props
	const { others } = extractOtherProps(rest)

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
		textEl = <span { ...styles('text') }>{ children }</span>,
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
}, classes)

AccordionTitle.displayName = NAME
AccordionTitle.setDefaults({})

export declare namespace AccordionTitle {
	export type Props = AccordionTitleProps
	export type Specs = AccordionTitleSpecs
}
