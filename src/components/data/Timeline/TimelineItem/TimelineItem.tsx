import { useProps, useStyles, extractOtherProps } from '@/hooks'
import { polymorphic, Box } from '@/components/polymorphic'
import { useRef, type ReactNode } from 'react'
import classes from '../Timeline.module.scss'

const NAME = 'Timeline.Item' as const

interface TimelineItemProps {
	bullet?: ReactNode
	content: ReactNode
	title?: string
}

interface TimelineItemSpecs {
	isCompound: true
	props: TimelineItemProps
}

export const TimelineItem = polymorphic<TimelineItemSpecs>(_props => {
	const itemRef = useRef<HTMLDivElement>(null)

	const props = useProps(NAME, _props)
	const styles = useStyles(NAME, { classes, props })

	const { bullet, content, title, ...rest } = props
	const { others } = extractOtherProps(rest)

	return (
		<Box
			{ ...styles('root') }
			{ ...others }
			as="div"
			ref={ itemRef }
		>
			<div { ...styles('marker') }>
				<span { ...styles('bullet') }>{ bullet }</span>
				<span { ...styles('rail') } />
			</div>
			<div { ...styles('body') }>
				{ title && (
					<span { ...styles('title') }>
						{ title }
					</span>
				) }
				<p { ...styles('content') }>
					{ content }
				</p>
			</div>
		</Box>
	)
}, classes)

TimelineItem.displayName = NAME
TimelineItem.setDefaults({})

export declare namespace TimelineItem {
	export type Props = TimelineItemProps
	export type Specs = TimelineItemSpecs
}
