import { useCallback, useId, useMemo, useState, type ReactNode } from 'react'
import { useAccordionGroup, AccordionGroup } from './AccordionGroup'
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
	indicatorPosition: 'right',
	order: 3,
	size: 'md',
} as const

const SUBCOMPONENTS = {
	Group: AccordionGroup,
	Content: AccordionContent,
	Title: AccordionTitle,
} as const

interface BaseAccordionProps {
	children: ReactNode
	collapsible?: boolean
	defaultOpen?: boolean
	disabled?: boolean
	id?: string
	index?: number
	layout?: 'default' | 'blockquote' | 'steps'
	onItemToggle?: (index: number, open: boolean) => void
	onToggle?: (open: boolean) => void
	open?: boolean
	order?: HeadingOrder
	size?: Size
}

interface WithIndicatorProps {
	indicator?: 'chevron' | 'plus'
	indicatorPosition?: 'left' | 'right'
}

interface WithoutIndicatorProps {
	indicator: 'none'
	indicatorPosition?: never
}

type AccordionIndicatorProps =
	| WithIndicatorProps
	| WithoutIndicatorProps

type AccordionProps =
	& BaseAccordionProps
	& AccordionIndicatorProps

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

const tokens = getSharedTokens('root')

export const Accordion = polymorphic<AccordionSpecs>((_props, { useProps, useStyles }) => {
	const { useAccordionGroupCtx, useAccordionGroupProps } = useAccordionGroup()

	const context = useAccordionGroupCtx()
	const props = useProps(useAccordionGroupProps(_props))
	const styles = useStyles({ context, props, tokens })

	const {
		as, children, collapsible,
		defaultOpen, disabled,
		id, index, indicator, indicatorPosition,
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
		collapsible, disabled, idx, index,
		indicator, indicatorPosition, isOpen,
		layout, order, size, unstyled,
	}), [
		handleToggle,
		collapsible, disabled, idx, index,
		indicator, indicatorPosition, isOpen,
		layout, order, size, unstyled,
	])

	const layoutClass = { [`${layout}`]: layout !== 'default' }

	return (
		<Box
			{ ...styles('root', { selector: layoutClass }) }
			{ ...others }
			as={ as }
			attributes={ { data: {
				index,
				open: isOpen || null,
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

	export type Size = Accordion.Props['size']

	export namespace Group {
		export type Context = AccordionGroup.Context
		export type Props = AccordionGroup.Props
		export type Specs = AccordionGroup.Specs
		export type Type = AccordionGroup.Type
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
