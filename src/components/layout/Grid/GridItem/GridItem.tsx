import { defineTokens } from '@/lib/component/tokens'
import { extractOthers } from '@/hooks/useProps'
import { polymorphic } from '@/lib/component/factory'
import { Box } from '@/components/polymorphic/Box'
import type { ReactNode } from 'react'
import type { PropsDefaultList } from '@/lib/component/factory/types'
import classes from '../Grid.module.scss'

const NAME = 'Grid.Item' as const,
	TAG = 'div' as const

const DEFAULT_PROPS = {
	as: TAG,
} as const

interface GridItemProps {
	children: ReactNode
	span?: number
}

interface GridItemSpecs {
	defaults: {
		as: typeof TAG
		props: PropsDefaultList<typeof DEFAULT_PROPS>
	}
	props: GridItemProps
	selectors: GridItemSelectors
	tokens: GridItemTokens
}

type GridItemSelectors =
	| 'root'

type GridItemTokens = {
	root:
		| '--grid-span-col'
}

const tokens = defineTokens<GridItemSpecs>()(({ props }) => {
	const { span } = props

	return {
		root: {
			'--grid-span-col': !!span ? `span ${span}` : undefined,
		},
	}
})

export const GridItem = polymorphic<GridItemSpecs>((_props, { useProps, useStyles }) => {
	const props = useProps(_props)
	const styles = useStyles({ props, tokens })

	const { as, children, span, ...rest } = props
	const others = extractOthers(rest)

	return (
		<Box { ...styles('root') } { ...others } as={ as }>
			{ children }
		</Box>
	)
}, { name: NAME, classes })

GridItem.set({
	defaultProps: DEFAULT_PROPS,
	displayName: NAME,
})

export declare namespace GridItem {
	export type Props = GridItemProps
	export type Specs = GridItemSpecs
}
