import { useCallback, useId, useMemo, useState, type ReactNode } from 'react'
import { useAccordionGroupProps, AccordionGroup } from './AccordionGroup'
import { defineTokens } from '@/lib/component/tokens'
import { extractOthers } from '@/hooks/useProps'
import { filterChildren } from '@/lib/component/children'
import { getSharedTokens, type AccordionTokens } from './utils'
import { polymorphic } from '@/lib/component/factory'
import { toKebabCase } from '@/utils/helpers'
import { AccordionContent } from './AccordionContent'
import { AccordionProvider } from './Accordion.context'
import { AccordionTitle } from './AccordionTitle'
import { Box } from '@/components/polymorphic/Box'
import type { AccordionContext } from './Accordion.context'
import type { HeadingOrder, Size } from '@/types/shared'
import type { PropsDefaultList } from '@/lib/component/factory/types'
import classes from './Accordion.module.scss'

const NAME = 'Accordion' as const,
	TAG = 'div' as const

const DEFAULT_PROPS = {
	as: TAG,
	collapsible: true,
	defaultOpen: false,
	index: 0,
	indicator: 'plus',
	order: 3,
	size: 'md',
} as const

const SUBCOMPONENTS = {
	Group: AccordionGroup,
	Content: AccordionContent,
	Title: AccordionTitle,
} as const

interface AccordionProps {
	children: ReactNode
	collapsible?: boolean
	defaultOpen?: boolean
	disabled?: boolean
	id?: string
	index?: number
	indicator?: 'chevron' | 'plus' | 'none'
	layout?: 'default' | 'steps'
	onItemToggle?: (index: number, open: boolean) => void
	onToggle?: (open: boolean) => void
	open?: boolean
	order?: HeadingOrder
	size?: Size
}

interface AccordionSpecs {
	context: AccordionGroup.Context
	defaults: {
		as: typeof TAG
		props: PropsDefaultList<typeof DEFAULT_PROPS>
	}
	props: AccordionProps
	selectors: AccordionSelectors
	subcomponents: typeof SUBCOMPONENTS
	tokens: AccordionTokens
}

type AccordionSelectors =
	| 'root' | 'wrapper' | 'divider'

const buildAccordion = (children: AccordionProps['children']) => {
	const displayNames = [AccordionTitle.displayName, AccordionContent.displayName],
		verifyArgs = { name: NAME, total: 2 },
		[title, content] = filterChildren(children, displayNames, verifyArgs)

	if (!title || !content) return null
	return <>{ title }{ content }</>
}

const tokens = defineTokens<AccordionSpecs>()(({ props }) => {
	if (typeof props.onItemToggle === 'function') return {}
	return getSharedTokens(props)
})

export const Accordion = polymorphic<AccordionSpecs>((_props, { useProps, useStyles }) => {
	const props = useProps(useAccordionGroupProps(_props))
	const styles = useStyles({ props, tokens })

	const {
		as, children, collapsible,
		defaultOpen, disabled,
		id, index, indicator,
		layout, onItemToggle, onToggle,
		open, order, size, unstyled,
		...rest
	} = props

	const others = extractOthers(rest)

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
		handleToggle,
		collapsible, disabled,
		idx, indicator, isOpen,
		order, size, step, unstyled,
	}), [
		handleToggle,
		collapsible, disabled,
		idx, indicator, isOpen,
		order, size, step, unstyled,
	])

	return (
		<Box
			{ ...styles('root') }
			{ ...others }
			as={ as }
			attributes={ { data: {
				open: isOpen || null,
				step,
			} } }
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
}, { name: NAME, classes })

Accordion.set({
	defaultProps: DEFAULT_PROPS,
	displayName: NAME,
	subcomponents: SUBCOMPONENTS,
})

export declare namespace Accordion {
	export type Context = AccordionContext
	export type Props = AccordionProps
	export type Specs = AccordionSpecs

	export type Size = AccordionGroup.Size
	export type Type = AccordionGroup.Type

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
