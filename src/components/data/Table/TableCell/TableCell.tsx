import { extractOthers } from '@/hooks/useProps'
import { polymorphic } from '@/lib/component'
import { Box } from '@/components/polymorphic/Box'
import type { ReactNode } from 'react'
import classes from '../Table.module.scss'

const NAME = 'Table.Cell' as const

interface TableCellProps {
	children: ReactNode
}

interface TableCellSpecs {
	isCompound: true
	props: TableCellProps
	selectors: TableCellSelectors
}

type TableCellSelectors =
	| 'root'

export const TableCell = polymorphic<TableCellSpecs>((_props, { useProps, useStyles }) => {
	const props = useProps(NAME, _props)
	const styles = useStyles(NAME, { props })

	const { children, ...rest } = props
	const others = extractOthers(rest)

	return (
		<Box
			{ ...styles('root') }
			{ ...others }
			as="td"
		>
			{ children }
		</Box>
	)
}, classes)

TableCell.displayName = NAME
TableCell.setDefaults({})

export declare namespace TableCell {
	export type Props = TableCellProps
	export type Specs = TableCellSpecs
}
