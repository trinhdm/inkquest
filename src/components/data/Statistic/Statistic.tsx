import { useCountUp, type MaybeAnimationProps } from '@/hooks/animation'
import { useStatisticGroup } from './StatisticGroup'
import { extractOthers } from '@/hooks/useProps'
import { getSharedTokens, type StatisticTokens } from './utils'
import { polymorphic } from '@/lib/component/factory'
import { Box } from '@/components/polymorphic/Box'
import { StatisticGroup } from './StatisticGroup'
import type { ReactNode } from 'react'
import type { PropsDefaultList } from '@/lib/component/factory/types'
import type { Size } from '@/types/shared'
import classes from './Statistic.module.scss'

const NAME = 'Statistic' as const,
	TAG = 'div' as const

const DEFAULT_PROPS = {
	animated: true,
	as: TAG,
	duration: 3000,
	index: 0,
	order: 'descend',
	size: 'lg',
	stagger: 0,
} as const

const SUBCOMPONENTS = {
	Group: StatisticGroup,
} as const

interface BaseStatisticProps {
	caption?: string
	highlight?: boolean
	icon?: ReactNode
	order?: 'ascend' | 'descend'
	size?: Exclude<Size, 'md'>
	value: number | string
}

type StatisticProps =
	& BaseStatisticProps
	& MaybeAnimationProps

interface StatisticSpecs {
	context: StatisticGroup.Context
	defaults: {
		as: typeof TAG
		props: PropsDefaultList<typeof DEFAULT_PROPS>
	}
	props: StatisticProps
	selectors: StatisticSelectors
	subcomponents: typeof SUBCOMPONENTS
	tokens: StatisticTokens
}

type StatisticSelectors =
	| 'root' | 'inner'
	| 'value' | 'caption'

const tokens = getSharedTokens('root')

export const Statistic = polymorphic<StatisticSpecs>((_props, { useProps, useStyles }) => {
	const { useStatisticGroupCtx, useStatisticGroupProps } = useStatisticGroup()

	const context = useStatisticGroupCtx()
	const props = useProps(useStatisticGroupProps(_props))
	const styles = useStyles({ context, props, tokens })

	const {
		animated, as, caption,
		duration, highlight, icon,
		index, order, size,
		stagger, value, withinView,
		...rest
	} = props

	const others = extractOthers(rest)

	const { display, ref } = useCountUp({
		delay: index * stagger,
		duration,
		enabled: animated,
		value,
		withinView,
	})

	const clsx = {
		global: { accent: !!highlight, item: true },
		module: { [`${size}`]: !!size || null },
	}

	return (
		<Box
			{ ...styles('root', clsx) }
			{ ...others }
			as={ as }
			ref={ ref }
		>
			<div { ...styles('inner') }>
				{ icon }
				<span { ...styles('value') }>{ display }</span>
			</div>

			<span { ...styles('caption', true) }>{ caption }</span>
		</Box>
	)
}, { name: NAME, classes })

Statistic.set({
	defaultProps: DEFAULT_PROPS,
	displayName: NAME,
	subcomponents: SUBCOMPONENTS,
})

export declare namespace Statistic {
	export type Props = StatisticProps
	export type Specs = StatisticSpecs

	export namespace Group {
		export type Context = StatisticGroup.Context
		export type Props = StatisticGroup.Props
		export type Specs = StatisticGroup.Specs
	}
}
