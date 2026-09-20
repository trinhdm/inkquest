import { useProps, useStyles, extractOtherProps } from '@/hooks'
import { polymorphic, Box, type ListProps } from '@/components/polymorphic'
import { TableCell } from './TableCell'
import { TableRow } from './TableRow'
import type { ReactNode } from 'react'
import classes from './Table.module.scss'

const NAME = 'Table' as const,
	TAG = 'table' as const

const DEFAULT_PROPS = {
	as: TAG,
} as const

interface TableProps {
	children: ReactNode
}

interface TableSpecs {
	defaults: {
		as: typeof TAG
		props: ListProps<typeof DEFAULT_PROPS>
	}
	props: TableProps
	subcomponents: {
		Cell: typeof TableCell
		Row: typeof TableRow
	}
}

export const Table = polymorphic<TableSpecs>(_props => {
	const props = useProps(NAME, _props)
	const styles = useStyles(NAME, { classes, props })

	const { children, ...rest } = props
	const { as, others } = extractOtherProps(rest)

	return (
		<Box
			as={ as }
			{ ...styles('root') }
			{ ...others }
		>
			<tbody>{ children }</tbody>
		</Box>
	)
}, classes)

Table.displayName = NAME
Table.Cell = TableCell
Table.Row = TableRow
Table.setDefaults({ props: DEFAULT_PROPS })

export declare namespace Table {
	export type Props = TableProps
	export type Specs = TableSpecs
}
