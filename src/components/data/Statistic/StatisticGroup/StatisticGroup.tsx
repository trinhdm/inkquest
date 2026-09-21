import { useProps, extractOtherProps } from '@/hooks/useProps'
import { useStyles } from '@/hooks/useStyles'
import { polymorphic } from '@/lib/component'
import { Box } from '@/components/polymorphic/Box'
import { Group } from '@/components/layout'
import { StatisticGroupProvider, type StatisticGroupContext } from './StatisticGroup.context'
import type { ListProps } from '@/lib/component/factory/types'
import classes from '../Statistic.module.scss'

const NAME = 'Statistic.Group' as const
const DEFAULT_PROPS = {
	animated: true,
	columns: 4,
	divider: true,
	duration: 3000,
	once: false,
	stagger: 200,
} as const

interface StatisticGroupProps
	extends Omit<Group.Props, 'childName' | 'provider'>,
		Pick<StatisticGroupContext, 'order' | 'size'> {}

type StatisticGroupSpecs = {
	defaults: { props: ListProps<typeof DEFAULT_PROPS> }
	isCompound: true
	props: StatisticGroupProps
}

export const StatisticGroup = polymorphic<StatisticGroupSpecs>(_props => {
	const props = useProps(NAME, _props)
	const styles = useStyles(NAME, { classes, props })

	const { children, order, size, ...rest } = props
	const { others } = extractOtherProps(rest)

	return (
		<Box
			{ ...styles('root') }
			{ ...others }
			as={ Group }
			childName="Statistic"
			provider={ StatisticGroupProvider }
			valuesCtx={ { order, size } }
		>
			{ children }
		</Box>
	)
}, classes)

StatisticGroup.displayName = NAME
StatisticGroup.setDefaults({ props: DEFAULT_PROPS })

export declare namespace StatisticGroup {
	export type Context = StatisticGroupContext
	export type Props = StatisticGroupProps
	export type Specs = StatisticGroupSpecs
}
