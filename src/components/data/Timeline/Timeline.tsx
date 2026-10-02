import { useProps, extractOtherProps } from '@/hooks/useProps'
import { useStyles } from '@/hooks/useStyles'
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
	subcomponents: {
		Item: typeof TimelineItem
	}
}

export const Timeline = polymorphic<TimelineSpecs>(_props => {
	const props = useProps(NAME, _props)
	const styles = useStyles(NAME, { classes, props })

	const { as, children, ...rest } = props
	const others = extractOtherProps(rest)

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
}, classes)

Timeline.displayName = NAME
Timeline.Item = TimelineItem
Timeline.setDefaults({ props: DEFAULT_PROPS })

export declare namespace Timeline {
	export type Props = TimelineProps
	export type Specs = TimelineSpecs

	export namespace Item {
		export type Props = TimelineItem.Props
		export type Specs = TimelineItem.Specs
	}
}
