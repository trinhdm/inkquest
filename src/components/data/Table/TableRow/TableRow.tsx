import { extractOthers } from '@/hooks/useProps'
import { polymorphic } from '@/lib/component'
import { Box } from '@/components/polymorphic/Box'
import type { ReactNode } from 'react'
import classes from '../Table.module.scss'

const NAME = 'Table.Row' as const

interface TableRowProps {
	children: ReactNode
}

interface TableRowSpecs {
	isCompound: true
	props: TableRowProps
	selectors: TableRowSelectors
}

type TableRowSelectors =
	| 'root'

export const TableRow = polymorphic<TableRowSpecs>((_props, { useProps, useStyles }) => {
	const props = useProps(_props)
	const styles = useStyles({ props })

	const { children, ...rest } = props
	const others = extractOthers(rest)

	return (
		<Box
			{ ...styles('root') }
			{ ...others }
			as="tr"
		>
			{ children }
		</Box>
	)
}, { name: NAME, classes })

TableRow.displayName = NAME
TableRow.setDefaults({})

export declare namespace TableRow {
	export type Props = TableRowProps
	export type Specs = TableRowSpecs
}
