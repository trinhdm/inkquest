import { useGroupCtx } from '../Group.context'
import { useProps, useStyles, extractOtherProps } from '@/hooks'
import { polymorphic, Box } from '@/components/polymorphic'
import type { ReactNode } from 'react'
import classes from '../Group.module.scss'

const NAME = 'Group.Item' as const

interface GroupItemProps {
	children: ReactNode
}

interface GroupItemSpecs {
	isCompound: true
	props: GroupItemProps
}

export const GroupItem = polymorphic<GroupItemSpecs>(_props => {
	const { baseName, rootName } = useGroupCtx(NAME)
	const props = useProps(NAME, _props)
	const styles = useStyles(rootName, { classes, props })

	const { children, ...rest } = props
	const { others } = extractOtherProps(rest)

	return (
		<Box { ...styles(baseName, true) } { ...others } as="div">
			{ children }
		</Box>
	)
}, classes)

GroupItem.displayName = NAME
GroupItem.setDefaults({})

export declare namespace GroupItem {
	export type Props = GroupItemProps
	export type Specs = GroupItemSpecs
}
