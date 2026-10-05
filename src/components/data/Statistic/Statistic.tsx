import { useCountUp, type MaybeAnimationProps } from '@/hooks/animation'
import { useStatisticGroupProps } from './StatisticGroup'
import { defineTokens, polymorphic } from '@/lib/component'
import { extractOthers } from '@/hooks/useProps'
import { Box } from '@/components/polymorphic/Box'
import { StatisticGroup } from './StatisticGroup'
import type { ReactNode } from 'react'
import type { PropsDefaultList } from '@/lib/component/factory/types'
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
	order?: StatisticGroup.Props['order']
	size?: StatisticGroup.Props['size']
	value: number | string
}

type StatisticProps =
	& BaseStatisticProps
	& MaybeAnimationProps

interface StatisticSpecs {
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

type StatisticTokens = {
	root:
		| '--statistic-align'
		| '--statistic-direction'
		| '--statistic-font-caption'
		| '--statistic-font-value'
}

const tokens = defineTokens<StatisticSpecs>()(({ props, theme }) => {
	const { order, size } = props
	const isDescend = order === 'descend'

	const align = isDescend ? 'start' : 'end',
		direction = isDescend ? '' : '-reverse',
		titleTag = size === 'lg' ? 'h3' : 'h4'

	const captionFont = size === 'lg'
		? theme.presets.text.caption('item')
		: theme.presets.text.section('eyebrow')

	return {
		root: {
			'--statistic-align': `flex-${align}`,
			'--statistic-direction': `column${direction}`,
			'--statistic-font-caption': !!size ? captionFont : undefined,
			'--statistic-font-value': !!size ? theme.presets.text[titleTag]() : undefined,
		},
	}
})

export const Statistic = polymorphic<StatisticSpecs>((_props, { useProps, useStyles }) => {
	const props = useProps(useStatisticGroupProps(_props))
	const styles = useStyles({ props, tokens })

	const {
		animated,
		as,
		caption,
		duration,
		highlight,
		icon,
		index,
		order,
		size,
		stagger,
		value,
		withinView,
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
