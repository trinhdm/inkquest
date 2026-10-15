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
	equalWidth: true,
} as const

const SUBCOMPONENTS = {
	Item: GridItem,
} as const

interface BaseGridProps {
	children: ReactNode
	gap?: Exclude<UnpackArray<GridGapOptions>, Lowercase<typeof NAME>>
}

interface ColumnsGridProps {
	columns?: number
	equalWidth?: boolean
	layout?: 'default'
}

interface SidebarGridProps {
	columns?: never
	equalWidth?: never
	layout: 'sidebar'
}

type GridLayoutOptions =
	| ColumnsGridProps
	| SidebarGridProps

type GridProps =
	& BaseGridProps
	& GridLayoutOptions

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
	const { columns, equalWidth, gap, layout } = props

	const gridCols = [], gridWidth = 'minmax(0, 1fr)',
		gridGap = ['grid'],
		isLayoutSidebar = layout === 'sidebar'

	if (gap) gridGap.push(gap)

	if (!!(columns && columns > 0))
		gridCols.push(columns)
	else if (isLayoutSidebar)
		gridCols.push('minmax(auto, 15rem)')
	else
		gridCols.push('auto-fit')

	gridCols.push(gridWidth)

	const gridTemplate = (typeof equalWidth === 'boolean' && !!equalWidth) && !isLayoutSidebar
		? `repeat(${gridCols.join(', ')})`
		: gridCols.join(' ')

	return {
		root: {
			'--grid-cols': gridTemplate,
			'--grid-gap': theme.space(...gridGap as GridGapOptions),
		},
	}
})

export const Grid = polymorphic<GridSpecs>((_props, { useProps, useStyles }) => {
	const props = useProps(_props)
	const styles = useStyles({ props, tokens })

	const {
		as, children, columns,
		equalWidth, gap, layout,
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
