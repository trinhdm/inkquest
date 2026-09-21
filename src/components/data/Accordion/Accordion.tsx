import { useCallback, useId, useMemo, useState, Children, type ReactNode } from 'react'
import { useProps, useStyles, extractOtherProps } from '@/hooks'
import { useAccordionGroupProps, AccordionGroup } from './AccordionGroup'
import { filterChildren } from '@/lib/component'
import { polymorphic, Box, type ListProps } from '@/components/polymorphic'
import { toKebabCase } from '@/utils/helpers'
import { AccordionContent } from './AccordionContent'
import { AccordionProvider } from './Accordion.context'
import { AccordionTitle } from './AccordionTitle'
import type { AccordionContext, AccordionIndicator } from './Accordion.context'
import classes from './Accordion.module.scss'

const NAME = 'Accordion' as const,
	TAG = 'div' as const

const DEFAULT_PROPS = {
	as: TAG,
	collapsible: true,
	defaultOpen: false,
	index: 0,
	indicator: 'plus',
} as const

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
	defaults: {
		as: typeof TAG
		props: ListProps<typeof DEFAULT_PROPS>
	}
	props: AccordionProps
	subcomponents: {
		Group: typeof AccordionGroup
		Content: typeof AccordionContent
		Title: typeof AccordionTitle
	}
}

const buildAccordion = (children: AccordionProps['children']) => {
	const childNames = [AccordionTitle.displayName, AccordionContent.displayName]
	const [title, content, ...extras] = filterChildren(children, childNames)

	if (process.env.NODE_ENV !== 'production') {
		const ns = { title: `${NAME}.Title`, content: `${NAME}.Content` },
			subcomponents = `${ns.title}, ${ns.content}`,
			warning = `an ${NAME} needs exactly one`

		const matched = extras.length
			+ (title ? 1 : 0) + (content ? 1 : 0)

		if (!title)
			console.warn(`${NAME}: no ${ns.title} found; ${warning}.`)
		if (!content)
			console.warn(`${NAME}: no ${ns.content} found; ${warning}.`)
		if (extras.length)
			console.warn(`${NAME}: multiple ${subcomponents} found; ${warning} of each.`)
		if (Children.count(children) > matched)
			console.warn(`${NAME}: children outside of ${subcomponents} detected.`)
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
		isOpen = collapsible
			? isControlled ? !!open : uncontrolled
			: true

	const uid = useId()
	const idx = useMemo(() => {
		const root = toKebabCase(`acc-${id ?? uid}`),
			content = `${root}-content`,
			title = `${root}-title`
		return { content, root, title }
	}, [id, uid])

	const step = useMemo(() => {
		if (layout !== 'steps') return
		const i = index + 1
		return (i > 9 ? `${i}` : `0${i}`) as `${number}`
	}, [index, layout])

	const handleToggle = useCallback(() => {
		if (disabled || !collapsible) return
		const next = !isOpen
		if (!isControlled) setUncontrolled(next)
		onItemToggle?.(index, next)
		onToggle?.(next)
	}, [
		collapsible, disabled, index,
		isControlled, isOpen,
		onItemToggle, onToggle,
	])

	const ctxValues = useMemo(() => ({
		collapsible, disabled,
		handleToggle,
		idx, indicator,
		isOpen, step, unstyled,
	}), [
		collapsible, disabled,
		handleToggle, idx, indicator,
		isOpen, step, unstyled,
	])

	return (
		<Box
			{ ...styles('root') }
			{ ...others }
			as={ as }
			attributes={ { data: { open: isOpen || null, step } } }
			id={ idx.root }
		>
			<AccordionProvider value={ ctxValues }>
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
Accordion.setDefaults({ props: DEFAULT_PROPS })

export declare namespace Accordion {
	export type Context = AccordionContext
	export type Props = AccordionProps
	export type Specs = AccordionSpecs

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
