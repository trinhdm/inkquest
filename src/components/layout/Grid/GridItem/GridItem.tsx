import { useProps, useStyles } from '@/hooks'
import { extractOtherProps } from '@/utils/helpers'
import { Box, polymorphic } from '@/components/core/Box'
import type { ReactNode } from 'react'
import classes from '../Grid.module.scss'

const NAME = 'GridItem' as const

interface GridItemProps {
	children: ReactNode
}

interface GridItemSpecs {
	isCompound: true
	props: GridItemProps
}

export const GridItem = polymorphic<GridItemSpecs>(_props => {
	const props = useProps(NAME, _props)
	const styles = useStyles(NAME, { classes, props })

	const { children, ...rest } = props
	const { others } = extractOtherProps(rest)

	return (
		<Box { ...styles('root') } { ...others }>
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
