import { useCallback, useId, useMemo, useState, Children, type ReactNode } from 'react'
import { useProps, useStyles } from '@/hooks'
import { useAccordionGroupProps, AccordionGroup } from './AccordionGroup'
import { extractOtherProps, flattenChildren } from '@/utils/helpers'
import { AccordionContent } from './AccordionContent'
import { AccordionProvider } from './Accordion.context'
import { AccordionTitle } from './AccordionTitle'
import { Box, polymorphic } from '@/components/core/Box'
import type { AccordionContext, AccordionIds, AccordionIndicator } from './Accordion.context'
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
	layout?: AccordionGroup.Context['layout']
	onItemToggle?: (index: number, open: boolean) => void
	onToggle?: (open: boolean) => void
	open?: boolean
	type?: AccordionGroup.Props['type']
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

const buildAccordion = (children: AccordionProps['children']) => {
	const [title, ...extraTitles] = flattenChildren(children, AccordionTitle.displayName),
		[content, ...extraContent] = flattenChildren(children, AccordionContent.displayName)

	if (process.env.NODE_ENV !== 'production') {
		const matched = extraTitles.length + extraContent.length
			+ (title ? 1 : 0) + (content ? 1 : 0)

		const ns = {
			title: `${NAME}.Title`,
			content: `${NAME}.Content`,
		}

		if (!title)
			console.warn(`${NAME}: no ${ns.title} found; an ${NAME} needs exactly one.`)
		if (!content)
			console.warn(`${NAME}: no ${ns.content} found; an ${NAME} needs exactly one.`)
		if (extraTitles.length)
			console.warn(`${NAME}: multiple ${ns.title} found; only the first is rendered.`)
		if (extraContent.length)
			console.warn(`${NAME}: multiple ${ns.content} found; only the first is rendered.`)
		if (Children.count(children) > matched)
			console.warn(`${NAME}: valid children include ${ns.title}, ${ns.content} only.`)
	}

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
		layout,
		onItemToggle,
		onToggle,
		open,
		type,
		unstyled,
		...rest
	} = props

	const { as, others } = extractOtherProps(rest)

	const [uncontrolled, setUncontrolled] = useState(() => !!defaultOpen)
	const isControlled = typeof open === 'boolean',
		isOpen = isControlled ? !!open : uncontrolled

	const uid = useId()
	const idx = useMemo(() => {
		const root = `acc-${id ?? uid}`,
			content = `${root}-content`,
			title = `${root}-title`
		return { content, root, title }
	}, [id, uid])

	const step = useMemo(() => {
		if (layout !== 'steps' || typeof index !== 'number') return
		const i = index + 1
		return (i > 9 ? `${i}` : `0${i}`) as `${number}`
	}, [index, layout])

	const handleToggle = useCallback(() => {
		if (disabled) return
		const next = !isOpen
		if (!isControlled) setUncontrolled(next)
		// if (typeof index === 'number')
		onItemToggle?.(index, next)
		onToggle?.(next)
	}, [
		disabled, index,
		isControlled, isOpen,
		onItemToggle, onToggle,
	])

	const cxtValue = useMemo(() => ({
		name: NAME, handleToggle, idx, indicator, isOpen, step, unstyled,
	}), [handleToggle, idx, indicator, isOpen, step, unstyled])

	return (
		<Box
			{ ...styles('root') }
			{ ...others }
			as={ as }
			attributes={ {
				data: { open: isOpen || null, step }
			} }
			id={ idx.root }
		>
			<AccordionProvider value={ cxtValue }>
				<div { ...styles('wrapper') }>
					<span { ...styles('divider') } />
					{ buildAccordion(children) }
				</div>
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
	export type Context = AccordionContext
	export type Props = AccordionProps
	export type Specs = AccordionSpecs

	// export type Idx = AccordionIds
	// export type Indicator = AccordionIndicator

	export namespace Group {
		export type Context = AccordionGroup.Context
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
