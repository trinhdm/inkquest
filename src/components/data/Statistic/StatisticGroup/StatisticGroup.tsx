import { extractOthers } from '@/hooks/useProps'
import { polymorphic } from '@/lib/component/factory'
import { Group, GROUP_CASCADE_PROPS } from '@/components/layout/Group'
import { StatisticGroupProvider, type StatisticGroupContext } from './StatisticGroup.context'
import type { PropsDefaultList } from '@/lib/component/factory/types'
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
	extends Omit<Group.Props, 'childName' | 'provider' | 'valuesCtx'>,
		Pick<StatisticGroupContext, 'order' | 'size'> {}

type StatisticGroupSpecs = {
	defaults: { props: PropsDefaultList<typeof DEFAULT_PROPS> }
	isCompound: true
	props: StatisticGroupProps
	selectors: StatisticGroupSelectors
}

type StatisticGroupSelectors =
	| 'root'

export const StatisticGroup = polymorphic<StatisticGroupSpecs>((_props, { useProps, useStyles }) => {
	const props = useProps(_props)
	const styles = useStyles({ props })

	const { children, order, size, ...rest } = props
	const others = extractOthers(rest, GROUP_CASCADE_PROPS)

	return (
		<Group
			{ ...styles('root') }
			{ ...others }
			childName="Statistic"
			provider={ StatisticGroupProvider }
			valuesCtx={ { order, size } }
		>
			{ children }
		</Group>
	)
}, { name: NAME, classes })

StatisticGroup.set({
	defaultProps: DEFAULT_PROPS,
	displayName: NAME,
})

export declare namespace StatisticGroup {
	export type Context = StatisticGroupContext
	export type Props = StatisticGroupProps
	export type Selectors = StatisticGroupSelectors
	export type Specs = StatisticGroupSpecs
}
