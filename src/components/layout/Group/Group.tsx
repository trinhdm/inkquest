import { useProps, useStyles } from '@/hooks'
import { extractOtherProps, flattenChildren } from '@/utils/helpers'
import { Box, polymorphic } from '@/components/core/Box'
import type { CSSProperties, ReactNode } from 'react'
import classes from './Group.module.scss'

const NAME = 'Group' as const,
	DEFAULT_TAG = 'div' as const

export interface GroupProps {
	animate?: boolean
	childName: string
	children: ReactNode
	columns?: number
	divider?: boolean
	fullWidth?: boolean
	justify?: CSSProperties['justifyContent']
	orientation?: 'horizontal' | 'vertical'
	reveal?: boolean
}

export type GroupSpecs = {
	props: GroupProps
	specIs: { compound: true }
}

export const Group = polymorphic<GroupSpecs>(_props => {
	const props = useProps(NAME, _props)
	const styles = useStyles(NAME, { classes, props })

	const {
		childName,
		children,
		fullWidth,
		orientation,
		...rest
	} = props

	const { others } = extractOtherProps(rest)

	return (
		<Box
			as={ DEFAULT_TAG }
			attributes={ {
				aria: { orientation },
				data: {
					block: !!fullWidth || null,
					orientation: (orientation === 'vertical' && 'vertical') || null,
				},
			} }
			role="group"
			{ ...styles('root') }
			{ ...others }
		>
			{ flattenChildren(children, childName).map((child, index) => child) }
		</Box>
	)
}, classes)

Group.displayName = NAME
Group.setDefaults({
	props: {
		orientation: 'horizontal',
	}
})

export declare namespace Group {
	export type Props = GroupProps
	export type Specs = GroupSpecs
}
