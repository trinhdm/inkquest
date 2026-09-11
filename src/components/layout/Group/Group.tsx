import { isValidElement, useMemo, Fragment, type CSSProperties, type ReactNode } from 'react'
import { useProps, useStyles } from '@/hooks'
import { extractOtherProps, flattenChildren } from '@/utils/helpers'
import { setThemeCSS } from '@/lib/theme'
import { Box, polymorphic } from '@/components/core/Box'
import type { RootCxtProviderFn } from '@/lib/component'
import classes from './Group.module.scss'

const NAME = 'Group' as const,
	DEFAULT_TAG = 'div' as const

interface BaseGroupProps {
	childName: string
	children: ReactNode
	columns?: number
	divider?: boolean
	fullWidth?: boolean
	justify?: CSSProperties['justifyContent']
	orientation?: 'horizontal' | 'vertical'
	provider?: RootCxtProviderFn<GroupContext>
	revealed?: boolean
}

interface AnimatedGroupProps {
	animated: true
	duration: number
}

interface StaticGroupProps {
	animated?: never
	duration?: never
}

type GroupProps = BaseGroupProps & (
	| AnimatedGroupProps
	| StaticGroupProps
)

type GroupSpecs = {
	props: GroupProps
	specIs: { compound: true }
}

interface GroupContext {
	animated?: boolean
	duration?: number
	revealed?: boolean
	unstyled?: boolean
}

const tokens = setThemeCSS<GroupSpecs>((theme, _props) => {
	return {
		root: {
			'--group-cols': _props.columns,
		},
	}
})

export const Group = polymorphic<GroupSpecs>(_props => {
	const props = useProps(NAME, _props)
	const styles = useStyles(NAME, { classes, props, tokens })

	const {
		animated,
		childName,
		children,
		columns,
		divider,
		duration,
		fullWidth,
		orientation,
		provider: Provider,
		unstyled,
		...rest
	} = props

	const { others } = extractOtherProps(rest)

	const clsx = {
		[`${NAME}--divider`]: divider,
		[`${NAME}--grid`]: !orientation,
	}

	const cxtValue = useMemo(
		() => ({ animated, duration, unstyled }),
		[animated, duration, unstyled]
	)

	return (
		<Box
			{ ...styles('root', { clsx }) }
			as={ DEFAULT_TAG }
			attributes={ {
				aria: { orientation },
				data: {
					block: !!fullWidth || null,
					orientation: orientation === 'vertical' ? 'vertical' : null,
				},
			} }
			role="group"
			{ ...others }
		>
			{ flattenChildren(children, childName).map((child, index) => {
				const key = isValidElement(child) && child.key !== null
					? child.key
					: index

				if (Provider)
					return <Provider key={ key } value={ cxtValue }>{ child }</Provider>

				return <Fragment key={ key }>{ child }</Fragment>
			}) }
		</Box>
	)
}, classes)

Group.displayName = NAME
Group.setDefaults({})

export declare namespace Group {
	export type Context = GroupContext
	export type Props = GroupProps
	export type Specs = GroupSpecs
}
