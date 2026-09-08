import { useProps, useStyles } from '@/hooks'
import { extractOtherProps, flattenChildren } from '@/utils/helpers'
import { Box, polymorphic } from '@/components/core/Box'
import { GridItem } from './GridItem'
import type { ReactNode } from 'react'
import classes from './Grid.module.scss'

const NAME = 'Grid' as const,
	DEFAULT_TAG = 'div' as const

interface GridProps {
	children: ReactNode
}

interface GridSpecs {
	default: { component: typeof DEFAULT_TAG }
	props: GridProps
	subcomponents: {
		Item: typeof GridItem
	}
}

export const Grid = polymorphic<GridSpecs>(_props => {
	const props = useProps(NAME, _props)
	const styles = useStyles(NAME, { classes, props })

	const { children, ...rest } = props
	const { as, others } = extractOtherProps(rest)

	return (
		<Box as={ as } { ...styles('root') } { ...others }>
			<div { ...styles('wrapper') }>
				{ flattenChildren(children, 'GridItem').map(child => child) }
			</div>
		</Box>
	)
}, classes)

Grid.displayName = NAME
Grid.Item = GridItem
Grid.setDefaults({ props: { as: DEFAULT_TAG } })

export declare namespace Grid {
	export type Props = GridProps
	export type Specs = GridSpecs

	export namespace Item {
		export type Props = GridItem.Props
		export type Specs = GridItem.Specs
	}
}
