import { useProps, useStyles, extractOtherProps } from '@/hooks'
import { Box, polymorphic } from '@/components/core/Box'
import { useRef, type ReactNode } from 'react'
import classes from '../Timeline.module.scss'

const NAME = 'TimelineItem' as const

interface TimelineItemProps {
	bullet?: ReactNode
	content: string
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

	const { bullet, children, content, title, ...rest } = props
	const { others } = extractOtherProps(rest)

	return (
		<Box ref={ itemRef } { ...styles('root') } { ...others }>
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
					{ content ?? children }
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
