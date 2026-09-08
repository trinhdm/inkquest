import { useProps, useStyles } from '@/hooks'
import { Box, polymorphic } from '@/components/core/Box'
import type { ReactNode } from 'react'
import classes from '../Grid.module.scss'

const NAME = 'GridItem' as const

interface GridItemProps {
	children: ReactNode
}

interface GridItemSpecs {
	props: GridItemProps
	specIs: { compound: true }
}

export const GridItem = polymorphic<GridItemSpecs>(_props => {
	const props = useProps(NAME, _props)
	const styles = useStyles(NAME, { classes, props })

	const { as, children, ...rest } = props

	return (
		<Box { ...styles('root') } { ...rest }>
			{ children }
		</Box>
	)
}, classes)

GridItem.displayName = NAME
GridItem.setDefaults({})

export declare namespace GridItem {
	export type Props = GridItemProps
	export type Specs = GridItemSpecs
}
