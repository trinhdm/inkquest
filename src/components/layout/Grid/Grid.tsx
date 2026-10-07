import { defineTokens } from '@/lib/component/tokens'
import { extractOthers } from '@/hooks/useProps'
import { polymorphic } from '@/lib/component/factory'
import { Box } from '@/components/polymorphic/Box'
import { GridItem } from './GridItem'
import type { ReactNode } from 'react'
import type { ConfigOptions } from '@/lib/theme/types/theme.types'
import type { PropsDefaultList } from '@/lib/component/factory/types'
import type { UnpackArray } from '@/types/utils'
import classes from './Grid.module.scss'

const NAME = 'Grid' as const,
	TAG = 'div' as const

const DEFAULT_PROPS = {
	as: TAG,
} as const

const SUBCOMPONENTS = {
	Item: GridItem,
} as const

interface GridProps {
	children: ReactNode
	columns?: number
	gap?: Exclude<UnpackArray<GridGapOptions>, Lowercase<typeof NAME>>
}

type GridGapOptions =
	ConfigOptions<'space', Lowercase<typeof NAME>>

interface GridSpecs {
	defaults: {
		as: typeof TAG
		props: PropsDefaultList<typeof DEFAULT_PROPS>
	}
	props: GridProps
	selectors: GridSelectors
	subcomponents: typeof SUBCOMPONENTS
	tokens: GridTokens
}

type GridSelectors =
	| 'root'

type GridTokens = {
	root:
		| '--grid-cols'
		| '--grid-gap'
}

const tokens = defineTokens<GridSpecs>()(({ props, theme }) => {
	const { columns, gap } = props

	const gridGap = ['grid']
	if (gap) gridGap.push(gap)

	return {
		root: {
			'--grid-cols': !!(columns && columns > 0) ? columns : undefined,
			'--grid-gap': theme.space(...gridGap as GridGapOptions),
		},
	}
})

export const Grid = polymorphic<GridSpecs>((_props, { useProps, useStyles }) => {
	const props = useProps(_props)
	const styles = useStyles({ props, tokens })

	const {
		as, children,
		columns, gap,
		...rest
	} = props

	const others = extractOthers(rest)

	return (
		<Box
			{ ...styles('root') }
			{ ...others }
			as={ as }
		>
			{ children }
		</Box>
	)
}, { name: NAME, classes })

Grid.set({
	defaultProps: DEFAULT_PROPS,
	displayName: NAME,
	subcomponents: SUBCOMPONENTS,
})

export declare namespace Grid {
	export type Props = GridProps
	export type Specs = GridSpecs

	export namespace Item {
		export type Props = GridItem.Props
		export type Specs = GridItem.Specs
	}
}
