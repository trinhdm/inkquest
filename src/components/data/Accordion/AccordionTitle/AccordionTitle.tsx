import { useProps, useStyles, extractOtherProps } from '@/hooks'
import { useAccordionCtx } from '../Accordion.context'
import { polymorphic, Box } from '@/components/polymorphic'
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

	const indicatorClasses = {
		[`${indicator}`]: indicator !== 'none',
	}

	const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
		const group = event.currentTarget.closest('[data-group]')
		if (!group) return

		const titles = [...group.querySelectorAll<HTMLButtonElement>('[data-title]')],
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

	return (
		<Box
			{ ...styles('root') }
			{ ...others }
			as="button"
			attributes={ {
				aria: {
					controls: idx.content,
					expanded: isOpen,
				},
				data: {
					open: isOpen || null,
					title: true,
				},
			} }
			disabled={ disabled }
			id={ idx.title }
			onClick={ handleToggle }
			onKeyDown={ handleKeyDown }
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
