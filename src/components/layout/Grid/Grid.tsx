import { useProps, extractOtherProps } from '@/hooks/useProps'
import { useStyles } from '@/hooks/useStyles'
import { polymorphic } from '@/lib/component'
import { setThemeCSS } from '@/lib/theme'
import { Box } from '@/components/polymorphic/Box'
import { GridItem } from './GridItem'
import type { ReactNode } from 'react'
import type { ListProps } from '@/lib/component/factory/types'
import classes from './Grid.module.scss'

const NAME = 'Grid' as const,
	TAG = 'div' as const

const DEFAULT_PROPS = {
	as: TAG,
} as const

interface GridProps {
	children: ReactNode
	columns?: number
}

interface GridSpecs {
	defaults: {
		as: typeof TAG
		props: ListProps<typeof DEFAULT_PROPS>
	}
	props: GridProps
	subcomponents: {
		Item: typeof GridItem
	}
}

const tokens = setThemeCSS<GridSpecs>((theme, props) => {
	const { columns } = props

	return {
		root: {
			'--grid-cols': !!(columns && columns > 0) ? columns : undefined,
		},
	}
})

export const Grid = polymorphic<GridSpecs>(_props => {
	const props = useProps(NAME, _props)
	const styles = useStyles(NAME, { classes, props, tokens })

	const { children, columns, ...rest } = props
	const { as, others } = extractOtherProps(rest)

	return (
		<Box
			{ ...styles('root') }
			{ ...others }
			as={ as }
		>
			{ children }
			{/* { filterChildren(children, 'GridItem').map(child => child) } */}
		</Box>
	)
}, classes)

Grid.displayName = NAME
Grid.Item = GridItem
Grid.setDefaults({ props: DEFAULT_PROPS })

export declare namespace Grid {
	export type Props = GridProps
	export type Specs = GridSpecs

	export namespace Item {
		export type Props = GridItem.Props
		export type Specs = GridItem.Specs
	}
}
