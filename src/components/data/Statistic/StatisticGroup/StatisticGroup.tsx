import { useProps, useStyles, extractOtherProps } from '@/hooks'
import { polymorphic, Box } from '@/components/polymorphic'
import { Group } from '@/components/layout'
import { StatisticGroupProvider, type StatisticGroupContext } from './StatisticGroup.context'
import classes from '../Statistic.module.scss'

const NAME = 'Statistic.Group' as const

interface StatisticGroupProps
	extends Omit<Group.Props, 'childName' | 'provider'> {}

type StatisticGroupSpecs = {
	isCompound: true
	props: StatisticGroupProps
}

export const StatisticGroup = polymorphic<StatisticGroupSpecs>(_props => {
	const props = useProps(NAME, _props)
	const styles = useStyles(NAME, { classes, props })

	const { children, ...rest } = props
	const { others } = extractOtherProps(rest)

	return (
		<Box
			{ ...styles('root') }
			{ ...others }
			as={ Group }
			childName="Statistic"
			provider={ StatisticGroupProvider }
		>
			{ children }
		</Box>
	)
}, classes)

StatisticGroup.displayName = NAME
StatisticGroup.setDefaults({
	props: {
		animated: true,
		columns: 4,
		duration: 3000,
		once: false,
		stagger: 200,
	}
})

export declare namespace StatisticGroup {
	export type Context = StatisticGroupContext
	export type Props = StatisticGroupProps
	export type Specs = StatisticGroupSpecs
}
