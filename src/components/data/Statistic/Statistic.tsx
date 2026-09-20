import {
	useCountUp,
	useProps,
	useStyles,
	extractOtherProps,
	type MaybeAnimationProps,
} from '@/hooks'

import { useStatisticGroupProps } from './StatisticGroup'
import { polymorphic, Box, type ListProps } from '@/components/polymorphic'
import { setThemeCSS } from '@/lib/theme'
import { StatisticGroup } from './StatisticGroup'
import type { ReactNode } from 'react'
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
		props: ListProps<typeof DEFAULT_PROPS>
	}
	props: StatisticProps
	subcomponents: {
		Group: typeof StatisticGroup
	}
}

const tokens = setThemeCSS<StatisticSpecs>((theme, props) => {
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

export const Statistic = polymorphic<StatisticSpecs>(_props => {
	const props = useProps(NAME, useStatisticGroupProps(_props))
	const styles = useStyles(NAME, { classes, props, tokens })

	const {
		animated,
		caption,
		duration,
		highlight,
		icon,
		index,
		size,
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
	const clsx = {
		global: { highlight, item: true },
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
}, classes)

Statistic.displayName = NAME
Statistic.Group = StatisticGroup
Statistic.setDefaults({ props: DEFAULT_PROPS })

export declare namespace Statistic {
	export type Props = StatisticProps
	export type Specs = StatisticSpecs

	export namespace Group {
		export type Props = StatisticGroup.Props
		export type Specs = StatisticGroup.Specs
	}
}
