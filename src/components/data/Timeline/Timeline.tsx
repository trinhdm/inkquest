import { useProps, useStyles } from '@/hooks'
import { extractOtherProps, flattenChildren } from '@/utils/helpers'
import { Box, polymorphic } from '@/components/core/Box'
import { TimelineItem } from './TimelineItem'
import type { ReactNode } from 'react'
import classes from './Timeline.module.scss'

const NAME = 'Timeline' as const,
	DEFAULT_TAG = 'div' as const

interface TimelineProps {
	children: ReactNode
}

interface TimelineSpecs {
	default: { component: typeof DEFAULT_TAG }
	props: TimelineProps
	subcomponents: {
		Item: typeof TimelineItem
	}
}

export const Timeline = polymorphic<TimelineSpecs>(_props => {
	const props = useProps(NAME, _props)
	const styles = useStyles(NAME, { classes, props })

	const { children, ...rest } = props
	const { as, others } = extractOtherProps(rest)

	return (
		<Box as={ as } { ...styles('root') } { ...others }>
			{ flattenChildren(children, TimelineItem.displayName).map(child => child) }
		</Box>
	)
}, classes)

Timeline.displayName = NAME
Timeline.Item = TimelineItem
Timeline.setDefaults({ props: { as: DEFAULT_TAG } })

export declare namespace Timeline {
	export type Props = TimelineProps
	export type Specs = TimelineSpecs

	export namespace Item {
		export type Props = TimelineItem.Props
		export type Specs = TimelineItem.Specs
	}
}
