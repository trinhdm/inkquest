import { useGroupCtx } from '../Group.context'
import { extractOthers } from '@/hooks/useProps'
import { polymorphic } from '@/lib/component'
import { Box } from '@/components/polymorphic/Box'
import type { ReactNode } from 'react'
import classes from '../Group.module.scss'

const NAME = 'Group.Item' as const

interface GroupItemProps {
	children: ReactNode
}

interface GroupItemSpecs {
	isCompound: true
	props: GroupItemProps
	selectors: GroupItemSelectors
}

type GroupItemSelectors =
	| 'item'

export const GroupItem = polymorphic<GroupItemSpecs>((_props, { useProps, useStyles }) => {
	const { baseName, rootName } = useGroupCtx(NAME)
	const props = useProps(_props)
	const styles = useStyles({ name: rootName, props })

	const { children, ...rest } = props
	const others = extractOthers(rest)

	return (
		<Box { ...styles(baseName, true) } { ...others } as="div">
			{ children }
		</Box>
	)
}, { name: NAME, classes })

GroupItem.set({ displayName: NAME })

export declare namespace GroupItem {
	export type Props = GroupItemProps
	export type Specs = GroupItemSpecs
}
