import { extractOthers } from '@/hooks/useProps'
import { polymorphic } from '@/lib/component'
import { Box } from '@/components/polymorphic/Box'
import { TableCell } from './TableCell'
import { TableRow } from './TableRow'
import type { ReactNode } from 'react'
import classes from './Table.module.scss'

const NAME = 'Table' as const,
	TAG = 'table' as const

const SUBCOMPONENTS = {
	Cell: TableCell,
	Row: TableRow,
} as const

interface TableProps {
	children: ReactNode
}

interface TableSpecs {
	props: TableProps
	selectors: TableSelectors
	subcomponents: typeof SUBCOMPONENTS
}

type TableSelectors =
	| 'root'

export const Table = polymorphic<TableSpecs>((_props, { useProps, useStyles }) => {
	const props = useProps(_props)
	const styles = useStyles({ props })

	const { children, ...rest } = props
	const others = extractOthers(rest)

	return (
		<Box
			{ ...styles('root') }
			{ ...others }
			as={ TAG }
		>
			<tbody>{ children }</tbody>
		</Box>
	)
}, { name: NAME, classes })

Table.set({
	displayName: NAME,
	subcomponents: SUBCOMPONENTS,
})

export declare namespace Table {
	export type Props = TableProps
	export type Specs = TableSpecs

	export namespace Cell {
		export type Props = TableCell.Props
		export type Specs = TableCell.Specs
	}

	export namespace Row {
		export type Props = TableRow.Props
		export type Specs = TableRow.Specs
	}
}
