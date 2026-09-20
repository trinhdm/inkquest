import {
	useCountUp,
	useProps,
	useStyles,
	extractOtherProps,
	type MaybeAnimationProps,
} from '@/hooks'

import { useStatisticGroupProps } from './StatisticGroup'
import { polymorphic, Box } from '@/components/polymorphic'
import { StatisticGroup } from './StatisticGroup'
import type { ReactNode } from 'react'
import classes from './Statistic.module.scss'

const NAME = 'Statistic' as const,
	DEFAULT_TAG = 'div' as const

interface BaseStatisticProps {
	caption?: string
	highlight?: boolean
	icon?: ReactNode
	value: number | string
}

type StatisticProps =
	& BaseStatisticProps
	& MaybeAnimationProps

interface StatisticSpecs {
	defaults: {
		as: typeof DEFAULT_TAG
		props: 'animated' | 'duration' | 'index' | 'stagger'
	}
	props: StatisticProps
	subcomponents: {
		Group: typeof StatisticGroup
	}
}

export const Statistic = polymorphic<StatisticSpecs>(_props => {
	const props = useProps(NAME, useStatisticGroupProps(_props))
	const styles = useStyles(NAME, { classes, props })

	const {
		animated,
		caption,
		duration,
		highlight,
		icon,
		index,
		stagger,
		value,
		withinView,
		...rest
	} = props

	const { display, ref } = useCountUp({
		delay: index * stagger,
		duration,
		enabled: animated,
		value,
		withinView,
	})

	const { as, others } = extractOtherProps(rest)
	const global = { highlight, item: true }

	return (
		<Box
			{ ...styles('root', { global }) }
			{ ...others }
			as={ as }
			ref={ ref }
		>
			<div { ...styles('stat') }>
				{ icon }
				<span { ...styles('value') }>
					{ display }
				</span>
			</div>
			<span { ...styles('caption', true) }>
				{ caption }
			</span>
		</Box>
	)
}, classes)

Statistic.displayName = NAME
Statistic.Group = StatisticGroup
Statistic.setDefaults({
	props: {
		animated: true,
		as: DEFAULT_TAG,
		duration: 3000,
		index: 0,
		stagger: 0,
	}
})

export declare namespace Statistic {
	export type Props = StatisticProps
	export type Specs = StatisticSpecs

	export namespace Group {
		export type Props = StatisticGroup.Props
		export type Specs = StatisticGroup.Specs
	}
}
