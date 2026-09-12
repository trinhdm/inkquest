import { useCountUp, useProps, useStyles } from '@/hooks'
import { useStatisticGroupProps } from './StatisticGroup'
import { extractOtherProps } from '@/utils/helpers'
import { Box, polymorphic } from '@/components/core/Box'
import { StatisticGroup } from './StatisticGroup'
import type { ReactNode } from 'react'
import classes from './Statistic.module.scss'

const NAME = 'Statistic' as const,
	DEFAULT_TAG = 'div' as const

interface StatisticProps {
	animated?: boolean
	caption?: string
	duration?: number
	highlight?: boolean
	icon?: ReactNode
	index?: number
	revealed?: boolean
	stagger?: number
	value: number | string
	withinView?: boolean
}

interface StatisticSpecs {
	defaults: {
		component: typeof DEFAULT_TAG
		props: 'animated' | 'duration'
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
		index = 0,
		revealed,
		stagger = 0,
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
	const global = { highlight }

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
