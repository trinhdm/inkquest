import { useProps, useStyles, extractOtherProps } from '@/hooks'
import { polymorphic, Box } from '@/components/polymorphic'
import type { ReactNode } from 'react'
import classes from '../Table.module.scss'

const NAME = 'Table.Row' as const

interface TableRowProps {
	children: ReactNode
}

interface TableRowSpecs {
	isCompound: true
	props: TableRowProps
}

export const TableRow = polymorphic<TableRowSpecs>(_props => {
	const props = useProps(NAME, _props)
	const styles = useStyles(NAME, { classes, props })

	const { children, ...rest } = props
	const { others } = extractOtherProps(rest)

	return (
		<Box
			{ ...styles('root') }
			{ ...others }
			as="tr"
		>
			{ children }
		</Box>
	)
}, classes)

TableRow.displayName = NAME
TableRow.setDefaults({})

export declare namespace TableRow {
	export type Props = TableRowProps
	export type Specs = TableRowSpecs
}
