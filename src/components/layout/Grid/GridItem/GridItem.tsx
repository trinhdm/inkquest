import { extractOthers } from '@/hooks/useProps'
import { defineTokens, polymorphic } from '@/lib/component'
import { Box } from '@/components/polymorphic/Box'
import type { ReactNode } from 'react'
import classes from '../Grid.module.scss'

const NAME = 'Grid.Item' as const

interface GridItemProps {
	children: ReactNode
	span?: number
}

interface GridItemSpecs {
	isCompound: true
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

	const { children, ...rest } = props
	const others = extractOthers(rest)

	return (
		<Box { ...styles('root') } { ...others } as="div">
			{ children }
		</Box>
	)
}, { name: NAME, classes })

GridItem.set({ displayName: NAME })

export declare namespace GridItem {
	export type Props = GridItemProps
	export type Specs = GridItemSpecs
}
