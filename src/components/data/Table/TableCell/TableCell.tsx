import { useProps, useStyles, extractOtherProps } from '@/hooks'
import { polymorphic, Box } from '@/components/polymorphic'
import { useRef, type ReactNode } from 'react'
import classes from '../Table.module.scss'

const NAME = 'Table.Cell' as const

interface TableCellProps {
	children: ReactNode
}

interface TableCellSpecs {
	isCompound: true
	props: TableCellProps
}

export const TableCell = polymorphic<TableCellSpecs>(_props => {
	const itemRef = useRef<HTMLDivElement>(null)

	const props = useProps(NAME, _props)
	const styles = useStyles(NAME, { classes, props })

	const { children, ...rest } = props
	const { others } = extractOtherProps(rest)

	return (
		<Box ref={ itemRef } { ...styles('root') } { ...others }>
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
