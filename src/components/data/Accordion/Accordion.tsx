import {
	isValidElement, Children, type ReactNode,
	useCallback, useId, useMemo, useState,
} from 'react'
import { useProps, useStyles } from '@/hooks'
import { useAccordionGroupProps, AccordionGroup, type AccordionGroupType } from './AccordionGroup'
import { extractOtherProps } from '@/utils/helpers'
import { AccordionContent } from './AccordionContent'
import { AccordionProvider, type AccordionIds, type AccordionIndicator } from './Accordion.context'
import { AccordionTitle } from './AccordionTitle'
import { Box, polymorphic } from '@/components/core/Box'
import classes from './Accordion.module.scss'

const NAME = 'Accordion' as const,
	DEFAULT_TAG = 'div' as const

interface AccordionProps {
	children: ReactNode
	collapsible?: boolean
	defaultOpen?: boolean
	disabled?: boolean
	id?: string
	index?: number
	indicator?: AccordionIndicator
	onToggle?: (open: boolean) => void
	open?: boolean
	type?: AccordionGroupType
}

interface AccordionSpecs {
	default: { component: typeof DEFAULT_TAG }
	props: AccordionProps
	subcomponents: {
		Group: typeof AccordionGroup
		Content: typeof AccordionContent
		Title: typeof AccordionTitle
	}
}

const buildAccordion = (
	children: AccordionProps['children'],
	// styles: ReturnType<typeof useStyles>
) => {
	let content: ReactNode = null,
		title: ReactNode = null

	Children.toArray(children).forEach(child => {
		if (!isValidElement(child)) return

		if (child.type === AccordionTitle) {
			if (!title) title = child
			else if (process.env.NODE_ENV !== 'production')
				console.warn(`${NAME}: multiple ${NAME}.Title found; only the first ${NAME}.Title is rendered.`)
			return
		}

		if (child.type === AccordionContent) {
			if (!content) content = child
			else if (process.env.NODE_ENV !== 'production')
				console.warn(`${NAME}: multiple ${NAME}.Content found; only the first ${NAME}.Content is rendered.`)
			return
		}
	})

	if (!title || !content) return null
	return <>{ title }{ content }</>
}

export const Accordion = polymorphic<AccordionSpecs>(_props => {
	const props = useProps(NAME, useAccordionGroupProps(_props))
	const styles = useStyles(NAME, { classes, props })

	const {
		children,
		collapsible,
		defaultOpen,
		disabled,
		id,
		index,
		indicator,
		onToggle,
		open,
		type,
		unstyled,
		...rest
	} = props

	const { as, others } = extractOtherProps(rest)

	const [uncontrolled, setUncontrolled] = useState(() => !!defaultOpen)
	const isControlled = open !== undefined,
		isOpen = isControlled ? open : uncontrolled

	const uid = useId(),
		rootID = id ?? uid,
		idx = {
			content: `${rootID}-content`,
			title: `${rootID}-title`,
		}

	const handleToggle = useCallback(() => {
		if (typeof disabled === 'boolean' && !disabled) return
		const next = !isOpen
		if (!isControlled) setUncontrolled(next)
		onToggle?.(next)
	}, [disabled, index, isControlled, isOpen, onToggle])

	const cxtValue = useMemo(() => ({
		name: NAME, handleToggle, idx, indicator, isOpen, unstyled,
	}), [unstyled])

	return (
		<Box
			{ ...styles('root') }
			{ ...others }
			as={ as }
			attributes={ { data: { open: isOpen || null } } }
			id={ rootID }
		>
			<AccordionProvider value={ cxtValue }>
				{ buildAccordion(children) }
			</AccordionProvider>
		</Box>
	)
}, classes)

Accordion.displayName = NAME
Accordion.Group = AccordionGroup
Accordion.Title = AccordionTitle
Accordion.Content = AccordionContent

Accordion.setDefaults({
	props: {
		as: DEFAULT_TAG,
		defaultOpen: false,
		index: 0,
		indicator: 'plus',
	}
})

export declare namespace Accordion {
	export type Props = AccordionProps
	export type Specs = AccordionSpecs

	export type Idx = AccordionIds
	export type Indicator = AccordionIndicator

	export namespace Group {
		export type Props = AccordionGroup.Props
		export type Specs = AccordionGroup.Specs
	}

	export namespace Title {
		export type Props = AccordionTitle.Props
		export type Specs = AccordionTitle.Specs
	}

	export namespace Content {
		export type Props = AccordionContent.Props
		export type Specs = AccordionContent.Specs
	}
}
