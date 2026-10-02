import { extractOtherProps } from '@/hooks/useProps'
import { polymorphic } from '@/lib/component'
import { Box } from '@/components/polymorphic/Box'
import type { ReactNode } from 'react'
import classes from '../Grid.module.scss'

const NAME = 'Grid.Item' as const

interface GridItemProps {
	children: ReactNode
}

interface GridItemSpecs {
	isCompound: true
	props: GridItemProps
	selectors: GridItemSelectors
}

type GridItemSelectors =
	| 'root'

export const GridItem = polymorphic<GridItemSpecs>((_props, { useProps, useStyles }) => {
	const props = useProps(NAME, _props)
	const styles = useStyles(NAME, { props })

	const { children, ...rest } = props
	const others = extractOtherProps(rest)

	return (
		<Box { ...styles('root') } { ...others } as="div">
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
