import { extractOtherProps } from '@/hooks/useProps'
import { polymorphic } from '@/lib/component'
import { Box } from '@/components/polymorphic/Box'
import { TableCell } from './TableCell'
import { TableRow } from './TableRow'
import type { ReactNode } from 'react'
import type { PropsDefaultList } from '@/lib/component/factory/types'
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
		props: PropsDefaultList<typeof DEFAULT_PROPS>
	}
	props: TableProps
	selectors: TableSelectors
	subcomponents: {
		Cell: typeof TableCell
		Row: typeof TableRow
	}
}

type TableSelectors =
	| 'root'

export const Table = polymorphic<TableSpecs>((_props, { useProps, useStyles }) => {
	const props = useProps(NAME, _props)
	const styles = useStyles(NAME, { props })

	const { children, ...rest } = props
	const others = extractOtherProps(rest)

	return (
		<Box
			{ ...styles('root') }
			{ ...others }
			as={ TAG }
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
