import { extractOthers } from '@/hooks/useProps'
import { filterChildren } from '@/lib/component'
import { polymorphic } from '@/lib/component'
import { Box } from '@/components/polymorphic/Box'
import { TimelineItem } from './TimelineItem'
import type { ReactNode } from 'react'
import type { PropsDefaultList } from '@/lib/component/factory/types'
import classes from './Timeline.module.scss'

const NAME = 'Timeline' as const,
	TAG = 'div' as const

const DEFAULT_PROPS = {
	as: TAG,
} as const

interface TimelineProps {
	children: ReactNode
}

interface TimelineSpecs {
	defaults: {
		as: typeof TAG
		props: PropsDefaultList<typeof DEFAULT_PROPS>
	}
	props: TimelineProps
	selectors: TimelineSelectors
	subcomponents: {
		Item: typeof TimelineItem
	}
}

type TimelineSelectors =
	| 'root'

export const Timeline = polymorphic<TimelineSpecs>((_props, { useProps, useStyles }) => {
	const props = useProps(_props)
	const styles = useStyles({ props })

	const { as, children, ...rest } = props
	const others = extractOthers(rest)

	return (
		<Box
			{ ...styles('root') }
			{ ...others }
			as={ as }
			attributes={ { data: { timeline: true } } }
		>
			{ filterChildren(children, TimelineItem.displayName).map(child => child) }
		</Box>
	)
}, { name: NAME, classes })

Timeline.Item = TimelineItem
Timeline.set({
	defaultProps: DEFAULT_PROPS,
	displayName: NAME,
})

export declare namespace Timeline {
	export type Props = TimelineProps
	export type Specs = TimelineSpecs

	export namespace Item {
		export type Props = TimelineItem.Props
		export type Specs = TimelineItem.Specs
	}
}
