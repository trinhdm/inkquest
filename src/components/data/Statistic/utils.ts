import { defineSharedTokens, type TokensParams } from '@/lib/component/tokens'
import type { SpecsTokenGroups } from '@/lib/component/factory/types'
import type { Statistic } from './Statistic'

export type StatisticTokens = {
	root:
		| '--stat-align'
		| '--stat-direction'
		| '--stat-row-gap'
	inner:
		| '--stat-font-size'
		| '--stat-icon-margin'
		| '--stat-icon-size'
	caption:
		| '--stat-font-caption'
}

type StatisticSpecsList = {
	group: Statistic.Group.Specs
	root: Statistic.Specs
}

type StatisticName =
	keyof StatisticSpecsList

const listSharedTokens = <
	N extends StatisticName = 'root',
	S extends StatisticSpecsList[N] = StatisticSpecsList[N]
>(
	args: TokensParams<S>,
	name: N = 'root' as N,
): SpecsTokenGroups<S> => {
	const { props: { order, size }, theme } = args
	if (!order && !size) return {} as SpecsTokenGroups<S>

	let captionFont, statFontSize,
		flexAlign, flexDirection,
		iconMargin, iconSize,
		rowGap

	if (order) {
		const isDescend = order === 'descend'
		flexAlign = isDescend ? 'start' : 'end'
		flexDirection = `column${isDescend ? '' : '-reverse'}`
	}

	if (size) {
		const { text } = theme.presets
		const baseIcon = theme.el.icon.size('sm'),
			iconSpacer = theme.space('icon'),
			isLarge = size === 'lg'

		captionFont = isLarge ? text.caption('item') : text.section('eyebrow')
		statFontSize = theme.fontSize(isLarge ? 'h3' : 'h5')

		iconMargin = isLarge ? `calc(2 * ${iconSpacer})` : iconSpacer
		iconSize = isLarge ? `calc(2 * ${baseIcon})` : baseIcon
		rowGap = isLarge ? iconSpacer : theme.padding('menu')
	}

	const tokens: SpecsTokenGroups<StatisticSpecsList['root']> = {
		root: {
			'--stat-align': flexAlign,
			'--stat-direction': flexDirection,
			'--stat-row-gap': rowGap,
		},
		inner: {
			'--stat-font-size': statFontSize,
			'--stat-icon-margin': iconMargin,
			'--stat-icon-size': iconSize,
		},
		caption: {
			'--stat-font-caption': captionFont,
		},
	}

	const group: SpecsTokenGroups<StatisticSpecsList['group']> = {
		root: { ...tokens.root, ...tokens.inner, ...tokens.caption },
	}

	return (name === 'group' ? group : tokens) as SpecsTokenGroups<S>
}

export const getSharedTokens = <N extends StatisticName = 'root'>(name: N = 'root' as N) =>
	defineSharedTokens<StatisticSpecsList, N>(listSharedTokens, name)
